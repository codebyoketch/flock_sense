package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type FarmerRepository struct{ db *gorm.DB }

func NewFarmerRepository(db *gorm.DB) *FarmerRepository { return &FarmerRepository{db: db} }

func (r *FarmerRepository) FindByID(id string) (models.Farmer, error) {
	var farmer models.Farmer
	err := r.db.First(&farmer, "id = ?", id).Error
	return farmer, err
}
