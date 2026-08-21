package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type EntryRepository struct{ db *gorm.DB }

func NewEntryRepository(db *gorm.DB) *EntryRepository { return &EntryRepository{db: db} }

func (r *EntryRepository) ListByFarmer(farmerID string) ([]models.Entry, error) {
	var entries []models.Entry
	err := r.db.Where("farmer_id = ?", farmerID).Find(&entries).Error
	return entries, err
}
