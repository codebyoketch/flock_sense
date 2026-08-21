package services

import (
	"github.com/flocksense/backend/internal/emissions"
	"github.com/flocksense/backend/internal/recommendations"
)

type CalculationService struct{}

func NewCalculationService() *CalculationService { return &CalculationService{} }

func (s *CalculationService) Calculate(request emissions.Request) (float64, recommendations.Recommendation) {
	value := emissions.Calculate(emissions.Input{HoldingType: request.HoldingType, EnergySource: request.EnergySource, WasteHandling: request.WasteHandling, FeedKg: request.FeedKg, EnergyKwh: request.EnergyKwh, WaterLiters: request.WaterLiters})
	return value, recommendations.For("feed", value)
}
