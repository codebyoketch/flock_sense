package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type LedgerHandler struct{ service *services.LedgerService }

func NewLedgerHandler(service *services.LedgerService) *LedgerHandler {
	return &LedgerHandler{service: service}
}
func (h *LedgerHandler) Proof(c *gin.Context) {
	anchor, err := h.service.Proof(c.Param("tx"))
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, gin.H{"tx_id": anchor.TxID, "score_hash": anchor.ScoreHash, "chain": anchor.Chain, "attestation_trail": anchor.AttestationTrail, "anchored_at": anchor.AnchoredAt})
}
