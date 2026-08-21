package services

import "github.com/flocksense/backend/internal/repositories"

type CooperativeStore interface {
	ScoreSummary(cooperativeID string) (repositories.CooperativeScore, error)
}
type CooperativeService struct{ store CooperativeStore }

func NewCooperativeService(store CooperativeStore) *CooperativeService {
	return &CooperativeService{store: store}
}
func (s *CooperativeService) Scores(id string) (repositories.CooperativeScore, error) {
	return s.store.ScoreSummary(id)
}
