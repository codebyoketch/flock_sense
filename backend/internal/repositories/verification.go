package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type VerificationRepository struct{ db *gorm.DB }

func NewVerificationRepository(db *gorm.DB) *VerificationRepository {
	return &VerificationRepository{db: db}
}
func (r *VerificationRepository) CountGiven(verifierID string) (int64, error) {
	var count int64
	err := r.db.Table("verifications").Where("verifier_id = ?", verifierID).Count(&count).Error
	return count, err
}
func (r *VerificationRepository) Create(verification *models.Verification) error {
	return r.db.Create(verification).Error
}
func (r *VerificationRepository) CountConfirmations(entryID string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Verification{}).Where("entry_id = ? AND verdict = ?", entryID, "confirm").Count(&count).Error
	return count, err
}
