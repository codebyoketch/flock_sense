package handlers

import (
	"github.com/flocksense/backend/internal/middleware"
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
	"time"
)

type AuthHandler struct{ service *services.AuthService }

func NewAuthHandler(service *services.AuthService, revocations *middleware.Revocations) *AuthHandler {
	return &AuthHandler{service: service, revocations: revocations}
}
func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Name          string `json:"name"`
		Phone         string `json:"phone"`
		CooperativeID string `json:"cooperative_id"`
	}
	if c.ShouldBindJSON(&input) != nil || input.Name == "" || input.Phone == "" {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "name and phone are required"}})
		return
	}
	farmer, token, err := h.service.Register(input.Name, input.Phone, input.CooperativeID)
	if err != nil {
		c.JSON(409, gin.H{"error": gin.H{"code": "PHONE_EXISTS", "message": "phone already registered"}})
		return
	}
	c.JSON(201, gin.H{"farmer_id": farmer.ID, "token": token, "expires_at": time.Now().Add(24 * time.Hour)})
}
func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Phone string `json:"phone"`
	}
	if c.ShouldBindJSON(&input) != nil || input.Phone == "" {
		c.Status(400)
		return
	}
	farmer, token, err := h.service.Login(input.Phone)
	if err != nil {
		c.JSON(401, gin.H{"error": gin.H{"code": "INVALID_LOGIN", "message": "farmer not found"}})
		return
	}
	c.JSON(200, gin.H{"farmer_id": farmer.ID, "token": token, "expires_at": time.Now().Add(24 * time.Hour)})
}

type AdminAuthHandler struct{ service *services.AdminAuthService }

func NewAdminAuthHandler(service *services.AdminAuthService) *AdminAuthHandler {
	return &AdminAuthHandler{service: service}
}
func (h *AdminAuthHandler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&input) != nil || input.Email == "" || input.Password == "" {
		c.Status(400)
		return
	}
	admin, token, err := h.service.Login(input.Email, input.Password)
	if err != nil {
		c.JSON(401, gin.H{"error": gin.H{"code": "INVALID_LOGIN", "message": "invalid admin credentials"}})
		return
	}
	c.JSON(200, gin.H{"user_id": admin.ID, "cooperative_id": admin.CooperativeID, "role": admin.Role, "token": token, "expires_at": time.Now().Add(24 * time.Hour)})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
		Token        string `json:"token"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.Status(400)
		return
	}
	value := input.RefreshToken
	if value == "" {
		value = input.Token
	}
	token, err := h.service.Refresh(value)
	if err != nil {
		c.JSON(401, gin.H{"error": gin.H{"code": "INVALID_TOKEN", "message": "refresh token is invalid"}})
		return
	}
	c.JSON(200, gin.H{"token": token, "expires_at": time.Now().Add(24 * time.Hour)})
}
func (h *AuthHandler) Logout(c *gin.Context) {
	if h.revocations != nil {
		h.revocations.Revoke(strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer "))
	}
	c.Status(204)
}
