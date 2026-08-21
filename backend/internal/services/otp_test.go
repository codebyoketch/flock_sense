package services

import (
	"errors"
	"testing"
	"time"

	"github.com/flocksense/backend/internal/models"
)

type fakeOTPStore struct {
	challenge models.OTPChallenge
}

func (f *fakeOTPStore) Create(challenge *models.OTPChallenge) error {
	challenge.ID = "challenge-1"
	f.challenge = *challenge
	return nil
}

func (f *fakeOTPStore) FindByID(id string) (models.OTPChallenge, error) {
	if id != f.challenge.ID {
		return models.OTPChallenge{}, errors.New("not found")
	}
	return f.challenge, nil
}

func (f *fakeOTPStore) Save(challenge *models.OTPChallenge) error {
	f.challenge = *challenge
	return nil
}

func TestOTPServiceVerifiesOnceAndRejectsReplay(t *testing.T) {
	store := &fakeOTPStore{}
	service := NewOTPService(store)
	service.now = func() time.Time { return time.Date(2026, 8, 21, 12, 0, 0, 0, time.UTC) }

	challenge, code, err := service.Request("+254700000001")
	if err != nil {
		t.Fatal(err)
	}
	if challenge.ID == "" || code == "" || len(code) != 6 {
		t.Fatalf("unexpected challenge response: %+v code=%q", challenge, code)
	}

	if err := service.Verify(challenge.ID, challenge.Phone, code); err != nil {
		t.Fatal(err)
	}
	if err := service.Verify(challenge.ID, challenge.Phone, code); err == nil {
		t.Fatal("expected replay to be rejected")
	}
}

func TestOTPServiceLimitsInvalidAttempts(t *testing.T) {
	store := &fakeOTPStore{}
	service := NewOTPService(store)
	service.now = func() time.Time { return time.Date(2026, 8, 21, 12, 0, 0, 0, time.UTC) }

	challenge, _, err := service.Request("+254700000001")
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < OTPMaxAttempts; i++ {
		if err := service.Verify(challenge.ID, challenge.Phone, "000000"); err == nil {
			t.Fatal("expected invalid code to be rejected")
		}
	}
	if err := service.Verify(challenge.ID, challenge.Phone, "000000"); err == nil {
		t.Fatal("expected attempt limit to be enforced")
	}
}
