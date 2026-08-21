package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type LedgerRepository struct{ db *gorm.DB }

func NewLedgerRepository(db *gorm.DB) *LedgerRepository { return &LedgerRepository{db: db} }
func (r *LedgerRepository) FindByFarmer(farmerID string) (models.LedgerAnchor, error) {
	var anchor models.LedgerAnchor
	err := r.db.Where("farmer_id = ?", farmerID).Last(&anchor).Error
	return anchor, err
}
func (r *LedgerRepository) Create(anchor *models.LedgerAnchor) error {
	return r.db.Create(anchor).Error
}
