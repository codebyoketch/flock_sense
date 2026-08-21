package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type FarmerHandler struct{ service *services.FarmerService }

func NewFarmerHandler(service *services.FarmerService) *FarmerHandler {
	return &FarmerHandler{service: service}
}
func (h *FarmerHandler) Me(c *gin.Context) {
	farmer, err := h.service.Me(c.GetString("farmer_id"))
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, farmer)
}
func (h *FarmerHandler) Update(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		Language string `json:"language"`
	}
	if c.ShouldBindJSON(&input) != nil {
		c.Status(400)
		return
	}
	farmer, err := h.service.Update(c.GetString("farmer_id"), input.Name, input.Language)
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, farmer)
}
