package services

import "github.com/flocksense/backend/internal/models"

type FarmerProfileStore interface {
	FindByID(id string) (models.Farmer, error)
	Save(*models.Farmer) error
}
type FarmerService struct{ store FarmerProfileStore }

func NewFarmerService(store FarmerProfileStore) *FarmerService { return &FarmerService{store: store} }
func (s *FarmerService) Me(id string) (models.Farmer, error)   { return s.store.FindByID(id) }
func (s *FarmerService) Update(id, name, language string) (models.Farmer, error) {
	farmer, err := s.store.FindByID(id)
	if err != nil {
		return models.Farmer{}, err
	}
	if name != "" {
		farmer.Name = name
	}
	if language != "" {
		farmer.Language = language
	}
	if err := s.store.Save(&farmer); err != nil {
		return models.Farmer{}, err
	}
	return farmer, nil
}
