package services

import "github.com/flocksense/backend/internal/models"

type BadgeScoreStore interface {
	FindByFarmer(farmerID string) (models.Score, error)
}
type BadgeService struct {
	farmers FarmerProfileStore
	ledger  LedgerStore
	scores  BadgeScoreStore
}

func NewBadgeService(farmers FarmerProfileStore, ledger LedgerStore, scores BadgeScoreStore) *BadgeService {
	return &BadgeService{farmers: farmers, ledger: ledger, scores: scores}
}
func (s *BadgeService) ForFarmer(id string) (models.Farmer, models.Score, models.LedgerAnchor, error) {
	farmer, err := s.farmers.FindByID(id)
	if err != nil {
		return models.Farmer{}, models.Score{}, models.LedgerAnchor{}, err
	}
	score, err := s.scores.FindByFarmer(id)
	if err != nil {
		return models.Farmer{}, models.Score{}, models.LedgerAnchor{}, err
	}
	anchor, err := s.ledger.FindByFarmer(id)
	return farmer, score, anchor, err
}
