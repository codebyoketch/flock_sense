package services

import (
	"time"

	"github.com/flocksense/backend/internal/models"
)

type FarmerStore interface {
	FindByID(id string) (models.Farmer, error)
}

type Report struct {
	Farmer          models.Farmer
	Total           float64
	VerifiedEntries int
	EntryCount      int
	GeneratedAt     time.Time
}

type ReportService struct {
	farmers FarmerStore
	entries EntryStore
}

func NewReportService(farmers FarmerStore, entries EntryStore) *ReportService {
	return &ReportService{farmers: farmers, entries: entries}
}

func (s *ReportService) ForFarmer(id string) (Report, error) {
	farmer, err := s.farmers.FindByID(id)
	if err != nil {
		return Report{}, err
	}
	entries, err := s.entries.ListByFarmer(id)
	if err != nil {
		return Report{}, err
	}
	report := Report{Farmer: farmer, EntryCount: len(entries), GeneratedAt: time.Now().UTC()}
	for _, entry := range entries {
		report.Total += entry.EstimatedCO2e
		if entry.Status == "verified" {
			report.VerifiedEntries++
		}
	}
	return report, nil
}
