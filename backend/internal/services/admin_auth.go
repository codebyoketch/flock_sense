package services

import (
	"github.com/flocksense/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type AdminStore interface {
	FindByEmail(string) (models.Admin, error)
}
type AdminAuthService struct {
	store  AdminStore
	secret []byte
}

func NewAdminAuthService(store AdminStore, secret []byte) *AdminAuthService {
	return &AdminAuthService{store: store, secret: secret}
}
func (s *AdminAuthService) Login(email, password string) (models.Admin, string, error) {
	admin, err := s.store.FindByEmail(email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)) != nil {
		return models.Admin{}, "", bcrypt.ErrMismatchedHashAndPassword
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": admin.ID, "cooperative_id": admin.CooperativeID, "role": admin.Role, "exp": time.Now().Add(24 * time.Hour).Unix()})
	value, _ := token.SignedString(s.secret)
	return admin, value, nil
}
