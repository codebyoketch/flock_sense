package services

import (
	"github.com/flocksense/backend/internal/emissions"
	"github.com/flocksense/backend/internal/models"
	"time"
)

type OwnedHoldingStore interface {
	FindOwned(id, farmerID string) (models.Holding, error)
}
type EntryWriter interface {
	FindByClientID(clientID string) (models.Entry, error)
	Create(*models.Entry) error
}
type EntryInput struct {
	ClientID      string  `json:"client_id"`
	HoldingID     string  `json:"holding_id"`
	PeriodStart   string  `json:"period_start"`
	PeriodEnd     string  `json:"period_end"`
	FeedType      string  `json:"feed_type"`
	FeedKg        float64 `json:"feed_kg"`
	EnergySource  string  `json:"energy_source"`
	EnergyKwh     float64 `json:"energy_kwh"`
	WaterLiters   float64 `json:"water_liters"`
	WasteHandling string  `json:"waste_handling"`
}
type EntryService struct {
	holdings OwnedHoldingStore
	entries  EntryWriter
}

func NewEntryService(holdings OwnedHoldingStore, entries EntryWriter) *EntryService {
	return &EntryService{holdings: holdings, entries: entries}
}
func (s *EntryService) Create(farmerID string, input EntryInput) (models.Entry, bool, error) {
	if existing, err := s.entries.FindByClientID(input.ClientID); err == nil {
		return existing, true, nil
	}
	holding, err := s.holdings.FindOwned(input.HoldingID, farmerID)
	if err != nil {
		return models.Entry{}, false, err
	}
	start, err := time.Parse("2006-01-02", input.PeriodStart)
	if err != nil {
		return models.Entry{}, false, err
	}
	end, err := time.Parse("2006-01-02", input.PeriodEnd)
	if err != nil {
		return models.Entry{}, false, err
	}
	entry := models.Entry{ClientID: input.ClientID, FarmerID: farmerID, HoldingID: holding.ID, PeriodStart: start, PeriodEnd: end, FeedType: input.FeedType, FeedKg: input.FeedKg, EnergySource: input.EnergySource, EnergyKwh: input.EnergyKwh, WaterLiters: input.WaterLiters, WasteHandling: input.WasteHandling, EstimatedCO2e: emissions.Calculate(emissions.Input{HoldingType: holding.Type, EnergySource: input.EnergySource, WasteHandling: input.WasteHandling, FeedKg: input.FeedKg, EnergyKwh: input.EnergyKwh, WaterLiters: input.WaterLiters})}
	if err := s.entries.Create(&entry); err != nil {
		return models.Entry{}, false, err
	}
	return entry, false, nil
}
