package services

import "github.com/flocksense/backend/internal/models"

type VerificationStore interface {
	CountGiven(verifierID string) (int64, error)
}
type AttestationStore interface {
	Create(*models.Verification) error
	CountConfirmations(entryID string) (int64, error)
}
type EntryStatusStore interface {
	FindByID(id string) (models.Entry, error)
	Save(*models.Entry) error
}
type Reciprocity struct {
	Given       int64
	Owed        int64
	ScoreActive bool
}
type VerificationService struct {
	store        VerificationStore
	attestations AttestationStore
	entries      EntryStatusStore
}

func NewVerificationService(store VerificationStore, attestations AttestationStore, entries EntryStatusStore) *VerificationService {
	return &VerificationService{store: store, attestations: attestations, entries: entries}
}
func (s *VerificationService) Reciprocity(farmerID string) (Reciprocity, error) {
	given, err := s.store.CountGiven(farmerID)
	if err != nil {
		return Reciprocity{}, err
	}
	return Reciprocity{Given: given, Owed: 0, ScoreActive: given >= 2}, nil
}
func (s *VerificationService) Submit(entryID, verifierID, verdict, note string) (models.Verification, error) {
	entry, err := s.entries.FindByID(entryID)
	if err != nil || entry.FarmerID == verifierID {
		return models.Verification{}, err
	}
	verification := models.Verification{EntryID: entryID, VerifierID: verifierID, Verdict: verdict, Note: note}
	if err := s.attestations.Create(&verification); err != nil {
		return models.Verification{}, err
	}
	if verdict == "flag" {
		entry.Status = "flagged"
	} else {
		confirmations, err := s.attestations.CountConfirmations(entryID)
		if err != nil {
			return models.Verification{}, err
		}
		if confirmations >= 2 {
			entry.Status = "verified"
		}
	}
	if err := s.entries.Save(&entry); err != nil {
		return models.Verification{}, err
	}
	return verification, nil
}
