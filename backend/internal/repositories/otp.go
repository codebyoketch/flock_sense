package repositories

import (
	"time"

	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type OTPRepository struct{ db *gorm.DB }

func NewOTPRepository(db *gorm.DB) *OTPRepository { return &OTPRepository{db: db} }

func (r *OTPRepository) Create(challenge *models.OTPChallenge) error {
	return r.db.Create(challenge).Error
}

func (r *OTPRepository) FindByID(id string) (models.OTPChallenge, error) {
	var challenge models.OTPChallenge
	err := r.db.First(&challenge, "id = ?", id).Error
	return challenge, err
}

func (r *OTPRepository) CountRecent(phone string, since time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.OTPChallenge{}).Where("phone = ? AND created_at >= ?", phone, since).Count(&count).Error
	return count, err
}

func (r *OTPRepository) Save(challenge *models.OTPChallenge) error {
	return r.db.Save(challenge).Error
}
