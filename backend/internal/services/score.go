package services

import (
	"github.com/flocksense/backend/internal/models"
	"github.com/flocksense/backend/internal/recommendations"
	"time"
)

type ScoreStore interface{ Save(*models.Score) error }
type ScoreResult struct {
	Score          models.Score
	Recommendation recommendations.Recommendation
}
type ScoreService struct {
	entries EntryStore
	scores  ScoreStore
}

func NewScoreService(entries EntryStore, scores ScoreStore) *ScoreService {
	return &ScoreService{entries: entries, scores: scores}
}
func (s *ScoreService) ForFarmer(farmerID string) (ScoreResult, error) {
	entries, err := s.entries.ListByFarmer(farmerID)
	if err != nil {
		return ScoreResult{}, err
	}
	var total float64
	for _, entry := range entries {
		if entry.Status == "verified" {
			total += entry.EstimatedCO2e
		}
	}
	grade := "A"
	if total > 100 {
		grade = "B"
	}
	if total > 250 {
		grade = "C"
	}
	if total > 500 {
		grade = "D"
	}
	if total > 1000 {
		grade = "E"
	}
	score := models.Score{FarmerID: farmerID, Grade: grade, CO2ePerAnimal: total, ScoreActive: true, ComputedAt: time.Now()}
	if err := s.scores.Save(&score); err != nil {
		return ScoreResult{}, err
	}
	return ScoreResult{Score: score, Recommendation: recommendations.For("feed", total)}, nil
}
