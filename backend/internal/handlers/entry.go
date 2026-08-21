package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type EntryHandler struct{ service *services.EntryService }

func NewEntryHandler(service *services.EntryService) *EntryHandler {
	return &EntryHandler{service: service}
}
func (h *EntryHandler) Create(c *gin.Context) {
	var input services.EntryInput
	if c.ShouldBindJSON(&input) != nil || input.ClientID == "" || input.HoldingID == "" {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "client_id and holding_id are required"}})
		return
	}
	entry, _, err := h.service.Create(c.GetString("farmer_id"), input)
	if err != nil {
		c.JSON(404, gin.H{"error": gin.H{"code": "ENTRY_INVALID", "message": "holding or entry period is invalid"}})
		return
	}
	c.JSON(201, entry)
}
