package services

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/flocksense/backend/internal/blockchain"
	"github.com/flocksense/backend/internal/models"
)

type LedgerStore interface {
	FindByFarmer(farmerID string) (models.LedgerAnchor, error)
	FindByTxID(txID string) (models.LedgerAnchor, error)
	Create(*models.LedgerAnchor) error
}
type LedgerService struct {
	store  LedgerStore
	client blockchain.Client
}

func NewLedgerService(store LedgerStore, client blockchain.Client) *LedgerService {
	return &LedgerService{store: store, client: client}
}
func (s *LedgerService) AnchorScore(farmerID, grade string, total float64, trail []map[string]any) error {
	if _, err := s.store.FindByFarmer(farmerID); err == nil {
		return nil
	}
	digest := sha256.Sum256([]byte(fmt.Sprintf("%s:%s:%.4f", farmerID, grade, total)))
	scoreHash := "sha256:" + hex.EncodeToString(digest[:])
	anchor, err := s.client.AnchorScore(scoreHash, trail)
	if err != nil {
		return err
	}
	encodedTrail, _ := json.Marshal(trail)
	return s.store.Create(&models.LedgerAnchor{FarmerID: farmerID, TxID: anchor.TxID, ScoreHash: anchor.ScoreHash, Chain: anchor.Chain, AttestationTrail: string(encodedTrail), AnchoredAt: anchor.AnchoredAt})
}

func (s *LedgerService) Proof(txID string) (models.LedgerAnchor, error) {
	return s.store.FindByTxID(txID)
}
