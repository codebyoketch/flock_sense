package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type BadgeHandler struct{ service *services.BadgeService }

func NewBadgeHandler(service *services.BadgeService) *BadgeHandler {
	return &BadgeHandler{service: service}
}
func (h *BadgeHandler) Public(c *gin.Context) {
	farmer, anchor, err := h.service.ForFarmer(c.Param("farmer_id"))
	if err != nil {
		c.JSON(404, gin.H{"error": gin.H{"code": "SCORE_NOT_YET_SHAREABLE", "message": "score is not yet shareable"}})
		return
	}
	c.JSON(200, gin.H{"farmer_name": farmer.Name, "overall_score": anchor.ScoreHash, "ledger_tx_id": anchor.TxID, "chain": anchor.Chain, "verified_at": anchor.AnchoredAt})
}
