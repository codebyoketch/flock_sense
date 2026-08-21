package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/flocksense/backend/internal/models"
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type authTestFarmerStore struct {
	farmer models.Farmer
}

func (s *authTestFarmerStore) Create(farmer *models.Farmer) error {
	farmer.ID = "farmer-1"
	s.farmer = *farmer
	return nil
}

func (s *authTestFarmerStore) FindByPhone(string) (models.Farmer, error) {
	return s.farmer, nil
}

type authTestOTPStore struct {
	challenge models.OTPChallenge
}

func (s *authTestOTPStore) Create(challenge *models.OTPChallenge) error {
	challenge.ID = "challenge-1"
	s.challenge = *challenge
	return nil
}

func (s *authTestOTPStore) FindByID(string) (models.OTPChallenge, error) {
	return s.challenge, nil
}

func (s *authTestOTPStore) CountRecent(string, time.Time) (int64, error) { return 0, nil }

func (s *authTestOTPStore) Save(challenge *models.OTPChallenge) error {
	s.challenge = *challenge
	return nil
}

func newAuthTestHandler() (*AuthHandler, *authTestFarmerStore, *services.OTPService) {
	farmerStore := &authTestFarmerStore{}
	otpService := services.NewOTPService(&authTestOTPStore{})
	return NewAuthHandler(services.NewAuthService(farmerStore, []byte("test-secret")), otpService, nil), farmerStore, otpService
}

func TestRegisterWithOTPReturnsFarmerToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler, _, otpService := newAuthTestHandler()
	challenge, code, err := otpService.Request("+254700000001")
	if err != nil {
		t.Fatal(err)
	}

	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest("POST", "/api/v1/auth/otp/register", jsonBody(map[string]string{
		"challenge_id": challenge.ID,
		"phone":        challenge.Phone,
		"code":         code,
		"name":         "Test Farmer",
	}))
	handler.RegisterWithOTP(context)

	if recorder.Code != 201 {
		t.Fatalf("status = %d, want 201; body=%s", recorder.Code, recorder.Body.String())
	}
	if recorder.Body.String() == "" || !strings.Contains(recorder.Body.String(), "token") {
		t.Fatalf("expected token response, got %s", recorder.Body.String())
	}
}

func TestRequestOTPDoesNotExposeCodeInProduction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("APP_ENV", "production")
	handler, _, _ := newAuthTestHandler()

	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest("POST", "/api/v1/auth/otp/request", jsonBody(map[string]string{"phone": "+254700000001"}))
	handler.RequestOTP(context)

	if recorder.Code != 201 {
		t.Fatalf("status = %d, want 201", recorder.Code)
	}
	if strings.Contains(recorder.Body.String(), "dev_code") {
		t.Fatalf("production response exposed dev_code: %s", recorder.Body.String())
	}
}

func jsonBody(value map[string]string) *bytes.Reader {
	data, _ := json.Marshal(value)
	return bytes.NewReader(data)
}
