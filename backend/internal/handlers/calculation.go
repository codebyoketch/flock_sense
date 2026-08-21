package handlers

import (
	"github.com/flocksense/backend/internal/emissions"
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type CalculationHandler struct{ service *services.CalculationService }

func NewCalculationHandler(service *services.CalculationService) *CalculationHandler {
	return &CalculationHandler{service: service}
}

func (h *CalculationHandler) Calculate(c *gin.Context) {
	var input emissions.Request
	if c.ShouldBindJSON(&input) != nil || !validLivestockType(input.HoldingType) {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "valid holding type and measurements are required"}})
		return
	}
	value, recommendation := h.service.Calculate(input)
	c.JSON(200, gin.H{"estimated_co2e_kg": value, "recommendation": recommendation})
}

func validLivestockType(value string) bool {
	return value == "poultry" || value == "dairy" || value == "goats" || value == "other"
}
