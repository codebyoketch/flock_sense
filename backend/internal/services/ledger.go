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
	Create(*models.LedgerAnchor) error
}
type LedgerService struct {
	store  LedgerStore
	client blockchain.Client
}

func NewLedgerService(store LedgerStore, client blockchain.Client) *LedgerService {
	return &LedgerService{store: store, client: client}
}
func (s *LedgerService) AnchorScore(farmerID, grade string, total float64) error {
	if _, err := s.store.FindByFarmer(farmerID); err == nil {
		return nil
	}
	digest := sha256.Sum256([]byte(fmt.Sprintf("%s:%s:%.4f", farmerID, grade, total)))
	scoreHash := "sha256:" + hex.EncodeToString(digest[:])
	anchor, err := s.client.AnchorScore(scoreHash, []map[string]any{})
	if err != nil {
		return err
	}
	trail, _ := json.Marshal(anchor.AttestationTrail)
	return s.store.Create(&models.LedgerAnchor{FarmerID: farmerID, TxID: anchor.TxID, ScoreHash: anchor.ScoreHash, Chain: anchor.Chain, AttestationTrail: string(trail), AnchoredAt: anchor.AnchoredAt})
}
