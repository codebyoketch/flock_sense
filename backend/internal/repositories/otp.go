package repositories

import (
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

func (r *OTPRepository) Save(challenge *models.OTPChallenge) error {
	return r.db.Save(challenge).Error
}
