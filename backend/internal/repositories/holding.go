package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type HoldingRepository struct{ db *gorm.DB }

func NewHoldingRepository(db *gorm.DB) *HoldingRepository { return &HoldingRepository{db: db} }

func (r *HoldingRepository) List(farmerID string) ([]models.Holding, error) {
	var holdings []models.Holding
	err := r.db.Where("farmer_id = ? AND deleted_at IS NULL", farmerID).Find(&holdings).Error
	return holdings, err
}

func (r *HoldingRepository) Create(holding *models.Holding) error { return r.db.Create(holding).Error }

func (r *HoldingRepository) ListByType(livestockType string) ([]models.Holding, error) {
	var holdings []models.Holding
	err := r.db.Where("type = ? AND deleted_at IS NULL", livestockType).Find(&holdings).Error
	return holdings, err
}

func (r *HoldingRepository) FindOwned(id, farmerID string) (models.Holding, error) {
	var holding models.Holding
	err := r.db.First(&holding, "id = ? AND farmer_id = ? AND deleted_at IS NULL", id, farmerID).Error
	return holding, err
}
