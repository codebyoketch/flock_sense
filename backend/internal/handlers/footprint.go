package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type FootprintHandler struct{ service *services.FootprintService }

func NewFootprintHandler(service *services.FootprintService) *FootprintHandler {
	return &FootprintHandler{service: service}
}

func (h *FootprintHandler) Me(c *gin.Context) {
	footprint, err := h.service.ForFarmer(c.GetString("farmer_id"))
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not load footprint"}})
		return
	}
	c.JSON(200, gin.H{"farmer_id": footprint.FarmerID, "total_co2e_kg": footprint.Total, "breakdown": gin.H{"feed_kg": footprint.Feed, "energy_kwh": footprint.Energy, "water_liters": footprint.Water}, "entries": footprint.Entries})
}
