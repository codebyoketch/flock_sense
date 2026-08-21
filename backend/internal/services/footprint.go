package services

import "github.com/flocksense/backend/internal/models"

type EntryStore interface {
	ListByFarmer(farmerID string) ([]models.Entry, error)
}

type Footprint struct {
	FarmerID string
	Total    float64
	Feed     float64
	Energy   float64
	Water    float64
	Entries  int
}

type FootprintService struct{ entries EntryStore }

func NewFootprintService(entries EntryStore) *FootprintService {
	return &FootprintService{entries: entries}
}

func (s *FootprintService) ForFarmer(farmerID string) (Footprint, error) {
	entries, err := s.entries.ListByFarmer(farmerID)
	if err != nil {
		return Footprint{}, err
	}
	result := Footprint{FarmerID: farmerID, Entries: len(entries)}
	for _, entry := range entries {
		result.Total += entry.EstimatedCO2e
		result.Feed += entry.FeedKg
		result.Energy += entry.EnergyKwh
		result.Water += entry.WaterLiters
	}
	return result, nil
}
