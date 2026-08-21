package services

import (
	"errors"
	"testing"

	"github.com/flocksense/backend/internal/models"
)

type fakeHoldingStore struct {
	holding models.Holding
	err     error
}

func (f fakeHoldingStore) FindOwned(string, string) (models.Holding, error) { return f.holding, f.err }

type fakeEntryStore struct{ entries []models.Entry }

func (f *fakeEntryStore) FindByClientID(clientID string) (models.Entry, error) {
	for _, e := range f.entries {
		if e.ClientID == clientID {
			return e, nil
		}
	}
	return models.Entry{}, errors.New("not found")
}
func (f *fakeEntryStore) Create(entry *models.Entry) error {
	entry.ID = "entry-1"
	f.entries = append(f.entries, *entry)
	return nil
}
func (f *fakeEntryStore) ListByHolding(string) ([]models.Entry, error) { return f.entries, nil }

func TestEntryServiceCreateIsIdempotent(t *testing.T) {
	store := &fakeEntryStore{}
	service := NewEntryService(fakeHoldingStore{holding: models.Holding{ID: "holding-1", FarmerID: "farmer-1", Type: "poultry"}}, store)
	input := EntryInput{ClientID: "client-1", HoldingID: "holding-1", PeriodStart: "2026-08-01", PeriodEnd: "2026-08-07", FeedKg: 10, EnergyKwh: 2, WaterLiters: 50, EnergySource: "solar", WasteHandling: "composted"}
	first, duplicate, err := service.Create("farmer-1", input)
	if err != nil || duplicate || first.ID != "entry-1" {
		t.Fatalf("unexpected first create: %+v duplicate=%v err=%v", first, duplicate, err)
	}
	second, duplicate, err := service.Create("farmer-1", input)
	if err != nil || !duplicate || second.ID != first.ID {
		t.Fatalf("expected duplicate response: %+v duplicate=%v err=%v", second, duplicate, err)
	}
}

func TestEntryServiceRejectsInvalidOwner(t *testing.T) {
	service := NewEntryService(fakeHoldingStore{err: errors.New("not found")}, &fakeEntryStore{})
	_, _, err := service.Create("farmer-1", EntryInput{ClientID: "client-1", HoldingID: "other-holding", PeriodStart: "2026-08-01", PeriodEnd: "2026-08-07"})
	if err == nil {
		t.Fatal("expected ownership validation error")
	}
}

func (f *fakeEntryStore) FindByID(id string) (models.Entry, error) {
	for _, e := range f.entries {
		if e.ID == id {
			return e, nil
		}
	}
	return models.Entry{}, errors.New("not found")
}
func (f *fakeEntryStore) ListByFarmerStatus(string, string) ([]models.Entry, error) {
	return f.entries, nil
}
