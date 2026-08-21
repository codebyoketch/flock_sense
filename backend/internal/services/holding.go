package services

import "github.com/flocksense/backend/internal/models"

type HoldingStore interface {
	List(farmerID string) ([]models.Holding, error)
	Create(holding *models.Holding) error
}

type HoldingService struct{ store HoldingStore }

func NewHoldingService(store HoldingStore) *HoldingService { return &HoldingService{store: store} }

func (s *HoldingService) List(farmerID string) ([]models.Holding, error) {
	return s.store.List(farmerID)
}

func (s *HoldingService) Create(farmerID, livestockType string, count int) (models.Holding, error) {
	holding := models.Holding{FarmerID: farmerID, Type: livestockType, Count: count}
	err := s.store.Create(&holding)
	return holding, err
}
