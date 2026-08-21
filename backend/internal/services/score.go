package services

import (
	"crypto/sha256"
	"encoding/hex"
	"github.com/flocksense/backend/internal/models"
	"github.com/flocksense/backend/internal/recommendations"
	"time"
)

type ScoreStore interface{ Save(*models.Score) error }
type VerificationHistory interface {
	ListByEntry(entryID string) ([]models.Verification, error)
}
type ScoreResult struct {
	Score          models.Score
	Recommendation recommendations.Recommendation
}
type ScoreService struct {
	entries       EntryStore
	scores        ScoreStore
	ledger        *LedgerService
	verifications VerificationHistory
}

func NewScoreService(entries EntryStore, scores ScoreStore, ledger *LedgerService, verifications VerificationHistory) *ScoreService {
	return &ScoreService{entries: entries, scores: scores, ledger: ledger, verifications: verifications}
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
	if score.ScoreActive {
		trail := make([]map[string]any, 0)
		for _, entry := range entries {
			if entry.Status != "verified" {
				continue
			}
			attestations, err := s.verifications.ListByEntry(entry.ID)
			if err != nil {
				return ScoreResult{}, err
			}
			for _, attestation := range attestations {
				trail = append(trail, map[string]any{"verifier_id_hash": hashIdentity(attestation.VerifierID), "entry_id": entry.ID, "verdict": attestation.Verdict, "timestamp": attestation.CreatedAt})
			}
		}
		if err := s.ledger.AnchorScore(farmerID, grade, total, trail); err != nil {
			return ScoreResult{}, err
		}
	}
	return ScoreResult{Score: score, Recommendation: recommendations.For("feed", total)}, nil
}

func hashIdentity(value string) string {
	digest := sha256.Sum256([]byte(value))
	return "sha256:" + hex.EncodeToString(digest[:])
}
