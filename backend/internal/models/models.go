package models

import "time"

type Farmer struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"farmer_id"`
	Name          string    `json:"name"`
	Phone         string    `gorm:"uniqueIndex" json:"phone"`
	CooperativeID string    `json:"cooperative_id"`
	Location      string    `json:"location"`
	Language      string    `gorm:"default:en" json:"language"`
	CreatedAt     time.Time `json:"created_at"`
	Holdings      []Holding `json:"holdings,omitempty"`
}

type Admin struct {
	ID            string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"user_id"`
	Email         string `gorm:"uniqueIndex" json:"email"`
	PasswordHash  string `json:"-"`
	CooperativeID string `json:"cooperative_id"`
	Role          string `gorm:"default:cooperative_admin" json:"role"`
}

type OTPChallenge struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"challenge_id"`
	Phone     string    `gorm:"index" json:"phone"`
	CodeHash  string    `json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	Attempts  int       `json:"-"`
	Used      bool      `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type Holding struct {
	ID        string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"holding_id"`
	FarmerID  string     `gorm:"index" json:"farmer_id"`
	Type      string     `json:"type"`
	Count     int        `json:"count"`
	DeletedAt *time.Time `json:"-"`
	CreatedAt time.Time  `json:"created_at"`
}

type Entry struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"entry_id"`
	ClientID      string    `gorm:"uniqueIndex" json:"client_id"`
	FarmerID      string    `gorm:"index" json:"farmer_id"`
	HoldingID     string    `gorm:"index" json:"holding_id"`
	PeriodStart   time.Time `json:"period_start"`
	PeriodEnd     time.Time `json:"period_end"`
	FeedType      string    `json:"feed_type"`
	FeedKg        float64   `json:"feed_kg"`
	EnergySource  string    `json:"energy_source"`
	EnergyKwh     float64   `json:"energy_kwh"`
	WaterLiters   float64   `json:"water_liters"`
	WasteHandling string    `json:"waste_handling"`
	EstimatedCO2e float64   `json:"estimated_co2e_kg"`
	Status        string    `gorm:"default:pending_verification" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// PendingVerification is the review-safe view of an entry. It includes the
// submitting farmer's name so a peer can identify whose record they are
// reviewing, without exposing phone or other profile details.
type PendingVerification struct {
	ID            string    `gorm:"column:id" json:"entry_id"`
	FarmerName    string    `gorm:"column:farmer_name" json:"farmer_name"`
	FarmerID      string    `gorm:"column:farmer_id" json:"farmer_id"`
	HoldingID     string    `gorm:"column:holding_id" json:"holding_id"`
	PeriodStart   time.Time `gorm:"column:period_start" json:"period_start"`
	PeriodEnd     time.Time `gorm:"column:period_end" json:"period_end"`
	FeedType      string    `gorm:"column:feed_type" json:"feed_type"`
	FeedKg        float64   `gorm:"column:feed_kg" json:"feed_kg"`
	EnergySource  string    `gorm:"column:energy_source" json:"energy_source"`
	EnergyKwh     float64   `gorm:"column:energy_kwh" json:"energy_kwh"`
	WaterLiters   float64   `gorm:"column:water_liters" json:"water_liters"`
	WasteHandling string    `gorm:"column:waste_handling" json:"waste_handling"`
	EstimatedCO2e float64   `gorm:"column:estimated_co2e_kg" json:"estimated_co2e_kg"`
	Status        string    `gorm:"column:status" json:"status"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
}

type Verification struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"verification_id"`
	EntryID    string    `gorm:"uniqueIndex:entry_verifier" json:"entry_id"`
	VerifierID string    `gorm:"uniqueIndex:entry_verifier" json:"verifier_id"`
	Verdict    string    `json:"verdict"`
	Note       string    `json:"note"`
	CreatedAt  time.Time `json:"created_at"`
}

type Score struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FarmerID      string    `gorm:"uniqueIndex" json:"farmer_id"`
	Grade         string    `json:"overall_score"`
	CO2ePerAnimal float64   `json:"co2e_per_animal_kg"`
	ScoreActive   bool      `json:"score_active"`
	ComputedAt    time.Time `json:"computed_at"`
}

type LedgerAnchor struct {
	ID               string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FarmerID         string    `gorm:"index" json:"farmer_id"`
	TxID             string    `gorm:"uniqueIndex" json:"ledger_tx_id"`
	ScoreHash        string    `json:"score_hash"`
	Chain            string    `json:"chain"`
	AttestationTrail string    `gorm:"type:jsonb" json:"attestation_trail"`
	AnchoredAt       time.Time `json:"anchored_at"`
}
