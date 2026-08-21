package services

import (
	"github.com/flocksense/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

type AuthStore interface {
	Create(*models.Farmer) error
	FindByPhone(string) (models.Farmer, error)
}
type AuthService struct {
	store  AuthStore
	secret []byte
}

func NewAuthService(store AuthStore, secret []byte) *AuthService {
	return &AuthService{store: store, secret: secret}
}
func (s *AuthService) Register(name, phone, cooperativeID string) (models.Farmer, string, error) {
	farmer := models.Farmer{Name: name, Phone: phone, CooperativeID: cooperativeID}
	if err := s.store.Create(&farmer); err != nil {
		return models.Farmer{}, "", err
	}
	return farmer, s.issueToken(farmer.ID), nil
}
func (s *AuthService) Login(phone string) (models.Farmer, string, error) {
	farmer, err := s.store.FindByPhone(phone)
	if err != nil {
		return models.Farmer{}, "", err
	}
	return farmer, s.issueToken(farmer.ID), nil
}
func (s *AuthService) issueToken(farmerID string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"farmer_id": farmerID, "exp": time.Now().Add(24 * time.Hour).Unix()})
	value, _ := token.SignedString(s.secret)
	return value
}
