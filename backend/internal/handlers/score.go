package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ScoreHandler struct{ service *services.ScoreService }

func NewScoreHandler(service *services.ScoreService) *ScoreHandler {
	return &ScoreHandler{service: service}
}
func (h *ScoreHandler) Me(c *gin.Context) {
	result, err := h.service.ForFarmer(c.GetString("farmer_id"))
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not compute score"}})
		return
	}
	c.JSON(200, gin.H{"farmer_id": result.Score.FarmerID, "overall_score": result.Score.Grade, "computed_at": result.Score.ComputedAt, "recommendation": result.Recommendation})
}
