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
func (h *VerificationHandler) Submit(c *gin.Context) {
	var input struct {
		EntryID string `json:"entry_id"`
		Verdict string `json:"verdict"`
		Note    string `json:"note"`
	}
	if c.ShouldBindJSON(&input) != nil || (input.Verdict != "confirm" && input.Verdict != "flag") {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "entry_id and a valid verdict are required"}})
		return
	}
	verification, err := h.service.Submit(input.EntryID, c.GetString("farmer_id"), input.Verdict, input.Note)
	if err != nil {
		c.JSON(422, gin.H{"error": gin.H{"code": "VERIFICATION_REJECTED", "message": "verification could not be submitted"}})
		return
	}
	c.JSON(201, verification)
}
