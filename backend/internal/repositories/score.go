package repositories

import (
	"github.com/flocksense/backend/internal/models"
	"gorm.io/gorm"
)

type ScoreRepository struct{ db *gorm.DB }

func NewScoreRepository(db *gorm.DB) *ScoreRepository { return &ScoreRepository{db: db} }
func (r *ScoreRepository) Save(score *models.Score) error {
	return r.db.Where("farmer_id = ?", score.FarmerID).Assign(score).FirstOrCreate(score).Error
}

func (r *ScoreRepository) FindByFarmer(farmerID string) (models.Score, error) {
	var score models.Score
	err := r.db.Where("farmer_id = ?", farmerID).First(&score).Error
	return score, err
}
