package repositories

import "gorm.io/gorm"

type VerificationRepository struct{ db *gorm.DB }

func NewVerificationRepository(db *gorm.DB) *VerificationRepository {
	return &VerificationRepository{db: db}
}

func (r *VerificationRepository) CountGiven(verifierID string) (int64, error) {
	var count int64
	err := r.db.Table("verifications").Where("verifier_id = ?", verifierID).Count(&count).Error
	return count, err
}
