package services

import "github.com/flocksense/backend/internal/models"

type HoldingStore interface {
	List(farmerID string) ([]models.Holding, error)
	Create(holding *models.Holding) error
	FindOwned(id, farmerID string) (models.Holding, error)
	Save(holding *models.Holding) error
	SoftDelete(id, farmerID string) error
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

func (s *HoldingService) Update(farmerID, id string, count int) (models.Holding, error) {
	holding, err := s.store.FindOwned(id, farmerID)
	if err != nil {
		return models.Holding{}, err
	}
	holding.Count = count
	err = s.store.Save(&holding)
	return holding, err
}
func (s *HoldingService) Delete(farmerID, id string) error { return s.store.SoftDelete(id, farmerID) }
