package db_test

import (
	"os"
	"testing"

	"github.com/flocksense/backend/internal/db"
	"github.com/flocksense/backend/internal/models"
)

func TestPostgresConnectionAndSchema(t *testing.T) {
	if os.Getenv("FLOCKSENSE_INTEGRATION") != "1" {
		t.Skip("set FLOCKSENSE_INTEGRATION=1 to run PostgreSQL integration tests")
	}

	database, err := db.Open(os.Getenv("DATABASE_URL"))
	if err != nil {
		t.Fatal(err)
	}

	sqlDB, err := database.DB()
	if err != nil {
		t.Fatal(err)
	}
	defer sqlDB.Close()

	if err := sqlDB.Ping(); err != nil {
		t.Fatal(err)
	}

	var extension string
	if err := database.Raw("SELECT extname FROM pg_extension WHERE extname = 'pgcrypto'").Scan(&extension).Error; err != nil {
		t.Fatal(err)
	}
	if extension != "pgcrypto" {
		t.Fatalf("pgcrypto extension is not enabled: %q", extension)
	}

	if err := database.AutoMigrate(
		&models.Farmer{},
		&models.Admin{},
		&models.OTPChallenge{},
		&models.Holding{},
		&models.Entry{},
		&models.Verification{},
		&models.Score{},
		&models.LedgerAnchor{},
	); err != nil {
		t.Fatal(err)
	}

	for _, table := range []string{"farmers", "admins", "otp_challenges", "holdings", "entries", "verifications", "scores", "ledger_anchors"} {
		var exists bool
		if err := database.Raw("SELECT to_regclass(?) IS NOT NULL", table).Scan(&exists).Error; err != nil {
			t.Fatalf("check table %s: %v", table, err)
		}
		if !exists {
			t.Fatalf("expected table %s to exist", table)
		}
	}

	farmer := models.Farmer{
		Name:  "Integration Test Farmer",
		Phone: "+254700000001",
	}
	if err := database.Create(&farmer).Error; err != nil {
		t.Fatal(err)
	}
	defer database.Delete(&models.Farmer{}, "id = ?", farmer.ID)

	var persisted models.Farmer
	if err := database.First(&persisted, "id = ?", farmer.ID).Error; err != nil {
		t.Fatal(err)
	}
	if persisted.Phone != farmer.Phone {
		t.Fatalf("persisted phone = %q, want %q", persisted.Phone, farmer.Phone)
	}
}
