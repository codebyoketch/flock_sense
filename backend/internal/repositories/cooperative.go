package repositories

import "gorm.io/gorm"

type CooperativeScore struct {
	AverageCO2e float64 `json:"average_co2e_kg"`
	MemberCount int64   `json:"member_count"`
}
type CooperativeRepository struct{ db *gorm.DB }

func NewCooperativeRepository(db *gorm.DB) *CooperativeRepository {
	return &CooperativeRepository{db: db}
}
func (r *CooperativeRepository) ScoreSummary(cooperativeID string) (CooperativeScore, error) {
	var summary CooperativeScore
	err := r.db.Table("farmers").Joins("LEFT JOIN entries ON entries.farmer_id = farmers.id AND entries.status = ?", "verified").Where("farmers.cooperative_id = ?", cooperativeID).Select("COALESCE(AVG(entries.estimated_co2e), 0) AS average_co2e, COUNT(DISTINCT farmers.id) AS member_count").Scan(&summary).Error
	return summary, err
}
