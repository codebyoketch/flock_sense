package services

import (
	"testing"
	"time"

	"github.com/flocksense/backend/internal/blockchain"
	"github.com/flocksense/backend/internal/models"
)

type fakeLedgerStore struct{ anchors []models.LedgerAnchor }

func (f *fakeLedgerStore) FindByFarmer(id string) (models.LedgerAnchor, error) {
	for _, a := range f.anchors {
		if a.FarmerID == id {
			return a, nil
		}
	}
	return models.LedgerAnchor{}, errNotFound
}
func (f *fakeLedgerStore) FindByTxID(string) (models.LedgerAnchor, error) {
	return models.LedgerAnchor{}, errNotFound
}
func (f *fakeLedgerStore) Create(anchor *models.LedgerAnchor) error {
	f.anchors = append(f.anchors, *anchor)
	return nil
}

type fakeBlockchain struct{}

func (fakeBlockchain) AnchorScore(hash string, trail []map[string]any) (blockchain.Anchor, error) {
	return blockchain.Anchor{TxID: "0xtest", ScoreHash: hash, Chain: "test", AnchoredAt: time.Now(), AttestationTrail: trail}, nil
}

var errNotFound = &testError{}

type testError struct{}

func (*testError) Error() string { return "not found" }

func TestLedgerServicePersistsAttestationTrail(t *testing.T) {
	store := &fakeLedgerStore{}
	service := NewLedgerService(store, fakeBlockchain{})
	trail := []map[string]any{{"entry_id": "entry-1", "verdict": "confirm"}}
	if err := service.AnchorScore("farmer-1", "B", 12.5, trail); err != nil {
		t.Fatal(err)
	}
	if len(store.anchors) != 1 || store.anchors[0].TxID != "0xtest" {
		t.Fatalf("unexpected anchors: %+v", store.anchors)
	}
	if store.anchors[0].AttestationTrail == "" || store.anchors[0].AttestationTrail == "[]" {
		t.Fatal("expected persisted attestation trail")
	}
}

func TestLedgerServiceDoesNotDuplicateAnchor(t *testing.T) {
	store := &fakeLedgerStore{anchors: []models.LedgerAnchor{{FarmerID: "farmer-1", TxID: "existing"}}}
	service := NewLedgerService(store, fakeBlockchain{})
	if err := service.AnchorScore("farmer-1", "B", 12.5, nil); err != nil {
		t.Fatal(err)
	}
	if len(store.anchors) != 1 {
		t.Fatalf("expected one anchor, got %d", len(store.anchors))
	}
}
