package services

import (
	"github.com/flocksense/backend/internal/models"
	"testing"
)

type fakeVerificationStore struct {
	confirmations int
	saved         []models.Verification
}

func (f *fakeVerificationStore) CountGiven(string) (int64, error) { return 2, nil }
func (f *fakeVerificationStore) Create(v *models.Verification) error {
	f.saved = append(f.saved, *v)
	return nil
}
func (f *fakeVerificationStore) CountConfirmations(string) (int64, error) {
	return int64(f.confirmations), nil
}

type fakeEntryStatusStore struct{ entry models.Entry }

func (f *fakeEntryStatusStore) FindByID(string) (models.Entry, error) { return f.entry, nil }
func (f *fakeEntryStatusStore) Save(entry *models.Entry) error        { f.entry = *entry; return nil }

func TestVerificationServiceMarksEntryVerifiedAfterTwoConfirms(t *testing.T) {
	verifications := &fakeVerificationStore{confirmations: 2}
	entries := &fakeEntryStatusStore{entry: models.Entry{ID: "entry-1", FarmerID: "farmer-1", Status: "pending_verification"}}
	service := NewVerificationService(verifications, verifications, entries, nil, nil)
	if _, err := service.Submit("entry-1", "farmer-2", "confirm", ""); err != nil {
		t.Fatal(err)
	}
	if entries.entry.Status != "verified" {
		t.Fatalf("expected verified, got %q", entries.entry.Status)
	}
}

func TestVerificationServiceFlagsEntry(t *testing.T) {
	verifications := &fakeVerificationStore{}
	entries := &fakeEntryStatusStore{entry: models.Entry{ID: "entry-1", FarmerID: "farmer-1", Status: "pending_verification"}}
	service := NewVerificationService(verifications, verifications, entries, nil, nil)
	if _, err := service.Submit("entry-1", "farmer-2", "flag", "looks implausible"); err != nil {
		t.Fatal(err)
	}
	if entries.entry.Status != "flagged" {
		t.Fatalf("expected flagged, got %q", entries.entry.Status)
	}
}
