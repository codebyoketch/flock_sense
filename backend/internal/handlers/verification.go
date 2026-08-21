package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type VerificationHandler struct{ service *services.VerificationService }

func NewVerificationHandler(service *services.VerificationService) *VerificationHandler {
	return &VerificationHandler{service: service}
}

func (h *VerificationHandler) Reciprocity(c *gin.Context) {
	status, err := h.service.Reciprocity(c.GetString("farmer_id"))
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not load reciprocity"}})
		return
	}
	c.JSON(200, gin.H{"given": status.Given, "owed": status.Owed, "score_active": status.ScoreActive})
}
