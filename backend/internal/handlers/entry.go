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

func (h *EntryHandler) Sync(c *gin.Context) {
	var input struct {
		Entries []services.EntryInput `json:"entries"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "entries are required"}})
		return
	}
	results := h.service.Sync(c.GetString("farmer_id"), input.Entries)
	c.JSON(200, gin.H{"results": results})
}

func (h *EntryHandler) ListByHolding(c *gin.Context) {
	entries, err := h.service.ListByHolding(c.GetString("farmer_id"), c.Param("id"))
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, gin.H{"data": entries, "page": 1, "page_size": len(entries), "total": len(entries)})
}

func (h *EntryHandler) Get(c *gin.Context) {
	entry, err := h.service.Get(c.GetString("farmer_id"), c.Param("entry_id"))
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, entry)
}
