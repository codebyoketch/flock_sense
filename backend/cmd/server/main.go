package main

import (
	"log"
	"os"

	"github.com/flocksense/backend/internal/api"
	"github.com/flocksense/backend/internal/db"
	"github.com/flocksense/backend/internal/models"
)

func main() {
	database, err := db.Open(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	if err := database.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto").Error; err != nil {
		log.Fatal(err)
	}
	if err := database.AutoMigrate(&models.Farmer{}, &models.Holding{}, &models.Entry{}, &models.Verification{}, &models.Score{}, &models.LedgerAnchor{}); err != nil {
		log.Fatal(err)
	}

	server := api.New(database, os.Getenv("JWT_SECRET"))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("FlockSense API listening on :%s", port)
	log.Fatal(server.Run(":" + port))
}
