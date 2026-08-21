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
