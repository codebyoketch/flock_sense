package services

import "github.com/flocksense/backend/internal/models"

type BadgeService struct {
	farmers FarmerProfileStore
	ledger  LedgerStore
}

func NewBadgeService(farmers FarmerProfileStore, ledger LedgerStore) *BadgeService {
	return &BadgeService{farmers: farmers, ledger: ledger}
}
func (s *BadgeService) ForFarmer(id string) (models.Farmer, models.LedgerAnchor, error) {
	farmer, err := s.farmers.FindByID(id)
	if err != nil {
		return models.Farmer{}, models.LedgerAnchor{}, err
	}
	anchor, err := s.ledger.FindByFarmer(id)
	return farmer, anchor, err
}
