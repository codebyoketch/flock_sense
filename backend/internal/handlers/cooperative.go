package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type CooperativeHandler struct{ service *services.CooperativeService }

func NewCooperativeHandler(service *services.CooperativeService) *CooperativeHandler {
	return &CooperativeHandler{service: service}
}
func (h *CooperativeHandler) Scores(c *gin.Context) {
	summary, err := h.service.Scores(c.Param("id"))
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not load cooperative scores"}})
		return
	}
	c.JSON(200, gin.H{"cooperative_id": c.Param("id"), "cooperative_avg_co2e_kg": summary.AverageCO2e, "member_count": summary.MemberCount})
}
