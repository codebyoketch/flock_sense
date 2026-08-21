package services

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/flocksense/backend/internal/models"
)

const (
	OTPValidity      = 5 * time.Minute
	OTPMaxAttempts   = 5
	OTPMaxRequests   = 5
	OTPRequestWindow = time.Hour
)

var ErrOTPRateLimited = errors.New("otp request limit exceeded")

type OTPStore interface {
	Create(*models.OTPChallenge) error
	FindByID(string) (models.OTPChallenge, error)
	CountRecent(string, time.Time) (int64, error)
	Save(*models.OTPChallenge) error
}

type OTPService struct {
	store OTPStore
	now   func() time.Time
}

func NewOTPService(store OTPStore) *OTPService {
	return &OTPService{store: store, now: time.Now}
}

func (s *OTPService) Request(phone string) (models.OTPChallenge, string, error) {
	count, err := s.store.CountRecent(phone, s.now().Add(-OTPRequestWindow))
	if err != nil {
		return models.OTPChallenge{}, "", err
	}
	if count >= OTPMaxRequests {
		return models.OTPChallenge{}, "", ErrOTPRateLimited
	}

	value, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return models.OTPChallenge{}, "", err
	}
	code := fmt.Sprintf("%06d", value.Int64())
	hash := sha256.Sum256([]byte(code))
	challenge := models.OTPChallenge{
		Phone:     phone,
		CodeHash:  hex.EncodeToString(hash[:]),
		ExpiresAt: s.now().Add(OTPValidity),
	}
	if err := s.store.Create(&challenge); err != nil {
		return models.OTPChallenge{}, "", err
	}
	return challenge, code, nil
}

func (s *OTPService) Verify(challengeID, phone, code string) error {
	challenge, err := s.store.FindByID(challengeID)
	if err != nil {
		return errors.New("otp challenge not found")
	}
	if challenge.Phone != phone || challenge.Used || !s.now().Before(challenge.ExpiresAt) {
		return errors.New("otp challenge is invalid")
	}
	if challenge.Attempts >= OTPMaxAttempts {
		return errors.New("otp attempt limit exceeded")
	}

	challenge.Attempts++
	hash := sha256.Sum256([]byte(code))
	if hex.EncodeToString(hash[:]) != challenge.CodeHash {
		if err := s.store.Save(&challenge); err != nil {
			return err
		}
		return errors.New("invalid otp")
	}

	challenge.Used = true
	return s.store.Save(&challenge)
}
