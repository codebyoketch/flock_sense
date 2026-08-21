package handlers

import (
	"net/http"

	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type HoldingHandler struct{ service *services.HoldingService }

func NewHoldingHandler(service *services.HoldingService) *HoldingHandler {
	return &HoldingHandler{service: service}
}

func (h *HoldingHandler) List(c *gin.Context) {
	holdings, err := h.service.List(c.GetString("farmer_id"))
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not load holdings"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": holdings, "page": 1, "page_size": len(holdings), "total": len(holdings)})
}

func (h *HoldingHandler) Create(c *gin.Context) {
	var input struct {
		Type  string `json:"type"`
		Count int    `json:"count"`
	}
	if c.ShouldBindJSON(&input) != nil || input.Count <= 0 {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "valid type and positive count required"}})
		return
	}
	holding, err := h.service.Create(c.GetString("farmer_id"), input.Type, input.Count)
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not create holding"}})
		return
	}
	c.JSON(http.StatusCreated, holding)
}

func (h *HoldingHandler) Update(c *gin.Context) {
	var input struct {
		Count int `json:"count"`
	}
	if c.ShouldBindJSON(&input) != nil || input.Count <= 0 {
		c.Status(400)
		return
	}
	holding, err := h.service.Update(c.GetString("farmer_id"), c.Param("id"), input.Count)
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, holding)
}
func (h *HoldingHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.GetString("farmer_id"), c.Param("id")); err != nil {
		c.Status(404)
		return
	}
	c.Status(204)
}
