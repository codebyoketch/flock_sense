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

func (r *EntryRepository) ListByHolding(holdingID string) ([]models.Entry, error) {
	var entries []models.Entry
	err := r.db.Where("holding_id = ?", holdingID).Find(&entries).Error
	return entries, err
}

func (r *EntryRepository) FindByClientID(clientID string) (models.Entry, error) {
	var entry models.Entry
	err := r.db.Where("client_id = ?", clientID).First(&entry).Error
	return entry, err
}
func (r *EntryRepository) Create(entry *models.Entry) error { return r.db.Create(entry).Error }

func (r *EntryRepository) FindByID(id string) (models.Entry, error) {
	var entry models.Entry
	err := r.db.First(&entry, "id = ?", id).Error
	return entry, err
}
func (r *EntryRepository) Save(entry *models.Entry) error { return r.db.Save(entry).Error }

func (r *EntryRepository) ListPendingExcept(farmerID string) ([]models.PendingVerification, error) {
	var entries []models.PendingVerification
	err := r.db.Table("entries").
		Select("entries.*, farmers.name AS farmer_name").
		// Farmer IDs are UUIDs while entry foreign-key values are currently
		// stored as text. Cast the UUID for the join so pending reviews work
		// with the existing schema as well as new installations.
		Joins("JOIN farmers ON farmers.id::text = entries.farmer_id").
		Where("entries.farmer_id <> ? AND entries.status = ?", farmerID, "pending_verification").
		Order("entries.created_at DESC").
		Limit(20).
		Scan(&entries).Error
	return entries, err
}

func (r *EntryRepository) ListByFarmerStatus(farmerID, status string) ([]models.Entry, error) {
	var entries []models.Entry
	query := r.db.Where("farmer_id = ?", farmerID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Find(&entries).Error
	return entries, err
}
