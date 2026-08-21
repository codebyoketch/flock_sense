package services

type VerificationStore interface {
	CountGiven(verifierID string) (int64, error)
}
type Reciprocity struct {
	Given       int64
	Owed        int64
	ScoreActive bool
}
type VerificationService struct{ store VerificationStore }

func NewVerificationService(store VerificationStore) *VerificationService {
	return &VerificationService{store: store}
}

func (s *VerificationService) Reciprocity(farmerID string) (Reciprocity, error) {
	given, err := s.store.CountGiven(farmerID)
	if err != nil {
		return Reciprocity{}, err
	}
	return Reciprocity{Given: given, Owed: 0, ScoreActive: given >= 2}, nil
}
