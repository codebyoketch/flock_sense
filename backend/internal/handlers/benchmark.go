package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type BenchmarkHandler struct{ service *services.BenchmarkService }

func NewBenchmarkHandler(service *services.BenchmarkService) *BenchmarkHandler {
	return &BenchmarkHandler{service: service}
}
func (h *BenchmarkHandler) Me(c *gin.Context) {
	typeParam := c.Query("type")
	if !validLivestockType(typeParam) {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "type is required"}})
		return
	}
	benchmark, err := h.service.ForFarmer(c.GetString("farmer_id"), typeParam)
	if err != nil {
		c.JSON(500, gin.H{"error": gin.H{"code": "DATABASE_ERROR", "message": "could not load benchmark"}})
		return
	}
	c.JSON(200, gin.H{"type": benchmark.Type, "farmer_co2e_per_animal_kg": benchmark.FarmerPerAnimal, "regional_avg_co2e_per_animal_kg": benchmark.RegionalPerAnimal, "percentile": benchmark.Percentile})
}
