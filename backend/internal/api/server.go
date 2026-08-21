package api

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/flocksense/backend/internal/blockchain"
	"github.com/flocksense/backend/internal/emissions"
	"github.com/flocksense/backend/internal/handlers"
	"github.com/flocksense/backend/internal/middleware"
	"github.com/flocksense/backend/internal/models"
	"github.com/flocksense/backend/internal/recommendations"
	"github.com/flocksense/backend/internal/repositories"
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type Server struct {
	DB           *gorm.DB
	Secret       []byte
	Chain        blockchain.Client
	Holdings     *handlers.HoldingHandler
	Calculations *handlers.CalculationHandler
	Footprint    *handlers.FootprintHandler
	Reports      *handlers.ReportHandler
	Benchmarks   *handlers.BenchmarkHandler
	Verification *handlers.VerificationHandler
	Auth         *handlers.AuthHandler
	Entries      *handlers.EntryHandler
	Scores       *handlers.ScoreHandler
}

type holdingRequest struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
}

type syncEntriesRequest struct {
	Entries []entryRequest `json:"entries"`
}

type entryRequest struct {
	ClientID      string  `json:"client_id"`
	HoldingID     string  `json:"holding_id"`
	PeriodStart   string  `json:"period_start"`
	PeriodEnd     string  `json:"period_end"`
	FeedType      string  `json:"feed_type"`
	FeedKg        float64 `json:"feed_kg"`
	EnergySource  string  `json:"energy_source"`
	EnergyKwh     float64 `json:"energy_kwh"`
	WaterLiters   float64 `json:"water_liters"`
	WasteHandling string  `json:"waste_handling"`
}

func New(database *gorm.DB, secret string) *Server {
	if secret == "" {
		secret = "development-secret"
	}
	holdingRepository := repositories.NewHoldingRepository(database)
	holdingService := services.NewHoldingService(holdingRepository)
	calculationService := services.NewCalculationService()
	entryRepository := repositories.NewEntryRepository(database)
	farmerRepository := repositories.NewFarmerRepository(database)
	footprintService := services.NewFootprintService(entryRepository)
	reportService := services.NewReportService(farmerRepository, entryRepository)
	benchmarkService := services.NewBenchmarkService(holdingRepository, entryRepository)
	verificationRepository := repositories.NewVerificationRepository(database)
	verificationService := services.NewVerificationService(verificationRepository, verificationRepository, entryRepository)
	authService := services.NewAuthService(farmerRepository, []byte(secret))
	entryService := services.NewEntryService(holdingRepository, entryRepository)
	scoreRepository := repositories.NewScoreRepository(database)
	ledgerRepository := repositories.NewLedgerRepository(database)
	ledgerService := services.NewLedgerService(ledgerRepository, blockchain.MockClient{Chain: "mock-vechain"})
	scoreService := services.NewScoreService(entryRepository, scoreRepository, ledgerService)
	return &Server{DB: database, Secret: []byte(secret), Chain: blockchain.MockClient{Chain: "mock-vechain"}, Holdings: handlers.NewHoldingHandler(holdingService), Calculations: handlers.NewCalculationHandler(calculationService), Footprint: handlers.NewFootprintHandler(footprintService), Reports: handlers.NewReportHandler(reportService), Benchmarks: handlers.NewBenchmarkHandler(benchmarkService), Verification: handlers.NewVerificationHandler(verificationService), Auth: handlers.NewAuthHandler(authService), Entries: handlers.NewEntryHandler(entryService), Scores: handlers.NewScoreHandler(scoreService)}
}
func (s *Server) Run(addr string) error { return s.router().Run(addr) }
func (s *Server) router() *gin.Engine {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	v := r.Group("/api/v1")
	v.POST("/auth/register", s.Auth.Register)
	v.POST("/auth/login", s.Auth.Login)
	a := v.Group("/")
	a.Use(middleware.Auth(s.Secret))
	a.GET("/farmers/me", s.me)
	a.PATCH("/farmers/me", s.updateMe)
	a.GET("/holdings", s.Holdings.List)
	a.POST("/holdings", s.Holdings.Create)
	a.PATCH("/holdings/:id", s.updateHolding)
	a.DELETE("/holdings/:id", s.deleteHolding)
	a.POST("/entries", s.Entries.Create)
	a.POST("/entries/sync", s.Entries.Sync)
	a.GET("/holdings/:id/entries", s.Entries.ListByHolding)
	a.GET("/verifications/pending", s.Verification.Pending)
	a.POST("/verifications", s.Verification.Submit)
	a.GET("/verifications/reciprocity", s.Verification.Reciprocity)
	a.GET("/scores/me", s.Scores.Me)
	a.POST("/calculations", s.Calculations.Calculate)
	a.GET("/footprint/me", s.Footprint.Me)
	a.GET("/reports/me", s.Reports.Me)
	a.GET("/scores/benchmark", s.Benchmarks.Me)
	r.GET("/api/v1/badge/:id", s.badge)
	r.GET("/api/v1/ledger/:tx", s.ledger)
	return r
}
func (s *Server) auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		h := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		t, err := jwt.Parse(h, func(t *jwt.Token) (any, error) {
			if t.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return s.Secret, nil
		})
		if err != nil || !t.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "valid bearer token required"}})
			return
		}
		claims, ok := t.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatus(401)
			return
		}
		farmerID, ok := claims["farmer_id"].(string)
		if !ok || farmerID == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": gin.H{"code": "UNAUTHORIZED", "message": "token identity is missing"}})
			return
		}
		c.Set("farmer_id", farmerID)
		c.Next()
	}
}
func (s *Server) farmerID(c *gin.Context) string { v, _ := c.Get("farmer_id"); return v.(string) }
func token(id string, secret []byte) string {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"farmer_id": id, "exp": time.Now().Add(24 * time.Hour).Unix()})
	out, _ := t.SignedString(secret)
	return out
}
func (s *Server) register(c *gin.Context) {
	var in struct{ Name, Phone, CooperativeID string }
	if c.ShouldBindJSON(&in) != nil || in.Name == "" || in.Phone == "" {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "name and phone are required"}})
		return
	}
	f := models.Farmer{Name: in.Name, Phone: in.Phone, CooperativeID: in.CooperativeID}
	if err := s.DB.Create(&f).Error; err != nil {
		c.JSON(409, gin.H{"error": gin.H{"code": "PHONE_EXISTS", "message": "phone already registered"}})
		return
	}
	c.JSON(201, gin.H{"farmer_id": f.ID, "token": token(f.ID, s.Secret), "expires_at": time.Now().Add(24 * time.Hour)})
}
func (s *Server) login(c *gin.Context) {
	var in struct{ Phone string }
	c.ShouldBindJSON(&in)
	var f models.Farmer
	if s.DB.Where("phone = ?", in.Phone).First(&f).Error != nil {
		c.JSON(401, gin.H{"error": gin.H{"code": "INVALID_LOGIN", "message": "farmer not found"}})
		return
	}
	c.JSON(200, gin.H{"farmer_id": f.ID, "token": token(f.ID, s.Secret), "expires_at": time.Now().Add(24 * time.Hour)})
}
func (s *Server) me(c *gin.Context) {
	var f models.Farmer
	if s.DB.First(&f, "id = ?", s.farmerID(c)).Error != nil {
		c.Status(404)
		return
	}
	c.JSON(200, f)
}
func (s *Server) updateMe(c *gin.Context) {
	var in struct{ Name, Language string }
	c.ShouldBindJSON(&in)
	var f models.Farmer
	s.DB.First(&f, "id = ?", s.farmerID(c))
	if in.Name != "" {
		f.Name = in.Name
	}
	if in.Language != "" {
		f.Language = in.Language
	}
	s.DB.Save(&f)
	c.JSON(200, f)
}
func (s *Server) listHoldings(c *gin.Context) {
	var h []models.Holding
	s.DB.Where("farmer_id = ? AND deleted_at IS NULL", s.farmerID(c)).Find(&h)
	c.JSON(200, gin.H{"data": h, "page": 1, "page_size": len(h), "total": len(h)})
}
func (s *Server) createHolding(c *gin.Context) {
	var in holdingRequest
	c.ShouldBindJSON(&in)
	if in.Count <= 0 || !validType(in.Type) {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "valid type and positive count required"}})
		return
	}
	h := models.Holding{FarmerID: s.farmerID(c), Type: in.Type, Count: in.Count}
	s.DB.Create(&h)
	c.JSON(201, h)
}
func validType(t string) bool { return t == "poultry" || t == "dairy" || t == "goats" || t == "other" }
func (s *Server) updateHolding(c *gin.Context) {
	var h models.Holding
	if s.DB.First(&h, "id = ? AND farmer_id = ?", c.Param("id"), s.farmerID(c)).Error != nil {
		c.Status(404)
		return
	}
	var in struct{ Count int }
	c.ShouldBindJSON(&in)
	if in.Count <= 0 {
		c.Status(400)
		return
	}
	h.Count = in.Count
	s.DB.Save(&h)
	c.JSON(200, h)
}
func (s *Server) deleteHolding(c *gin.Context) {
	now := time.Now()
	r := s.DB.Model(&models.Holding{}).Where("id = ? AND farmer_id = ?", c.Param("id"), s.farmerID(c)).Update("deleted_at", now)
	if r.RowsAffected == 0 {
		c.Status(404)
		return
	}
	c.Status(204)
}
func (s *Server) createEntry(c *gin.Context) {
	var in entryRequest
	c.ShouldBindJSON(&in)
	var h models.Holding
	if s.DB.First(&h, "id = ? AND farmer_id = ?", in.HoldingID, s.farmerID(c)).Error != nil {
		c.Status(404)
		return
	}
	var old models.Entry
	if s.DB.Where("client_id = ?", in.ClientID).First(&old).Error == nil {
		c.JSON(201, old)
		return
	}
	start, _ := time.Parse("2006-01-02", in.PeriodStart)
	end, _ := time.Parse("2006-01-02", in.PeriodEnd)
	e := models.Entry{ClientID: in.ClientID, FarmerID: s.farmerID(c), HoldingID: h.ID, PeriodStart: start, PeriodEnd: end, FeedType: in.FeedType, FeedKg: in.FeedKg, EnergySource: in.EnergySource, EnergyKwh: in.EnergyKwh, WaterLiters: in.WaterLiters, WasteHandling: in.WasteHandling, EstimatedCO2e: emissions.Calculate(emissions.Input{HoldingType: h.Type, EnergySource: in.EnergySource, WasteHandling: in.WasteHandling, FeedKg: in.FeedKg, EnergyKwh: in.EnergyKwh, WaterLiters: in.WaterLiters})}
	s.DB.Create(&e)
	c.JSON(201, e)
}
func (s *Server) syncEntries(c *gin.Context) {
	var in syncEntriesRequest
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "entries are required"}})
		return
	}
	results := []gin.H{}
	for _, x := range in.Entries {
		var old models.Entry
		if s.DB.Where("client_id = ?", x.ClientID).First(&old).Error == nil {
			results = append(results, gin.H{"client_id": x.ClientID, "status": "duplicate", "entry_id": old.ID})
			continue
		}
		var h models.Holding
		if s.DB.First(&h, "id = ? AND farmer_id = ? AND deleted_at IS NULL", x.HoldingID, s.farmerID(c)).Error != nil {
			results = append(results, gin.H{"client_id": x.ClientID, "status": "rejected", "reason": "holding_not_found"})
			continue
		}
		start, startErr := time.Parse("2006-01-02", x.PeriodStart)
		end, endErr := time.Parse("2006-01-02", x.PeriodEnd)
		if startErr != nil || endErr != nil {
			results = append(results, gin.H{"client_id": x.ClientID, "status": "rejected", "reason": "invalid_period"})
			continue
		}
		e := models.Entry{ClientID: x.ClientID, FarmerID: s.farmerID(c), HoldingID: h.ID, PeriodStart: start, PeriodEnd: end, FeedType: x.FeedType, FeedKg: x.FeedKg, EnergySource: x.EnergySource, EnergyKwh: x.EnergyKwh, WaterLiters: x.WaterLiters, WasteHandling: x.WasteHandling, EstimatedCO2e: emissions.Calculate(emissions.Input{HoldingType: h.Type, EnergySource: x.EnergySource, WasteHandling: x.WasteHandling, FeedKg: x.FeedKg, EnergyKwh: x.EnergyKwh, WaterLiters: x.WaterLiters})}
		if err := s.DB.Create(&e).Error; err != nil {
			results = append(results, gin.H{"client_id": x.ClientID, "status": "rejected", "reason": "database_error"})
			continue
		}
		results = append(results, gin.H{"client_id": x.ClientID, "status": "created", "entry_id": e.ID})
	}
	c.JSON(200, gin.H{"results": results})
}
func (s *Server) listEntries(c *gin.Context) {
	var e []models.Entry
	s.DB.Where("holding_id = ? AND farmer_id = ?", c.Param("id"), s.farmerID(c)).Find(&e)
	c.JSON(200, gin.H{"data": e, "page": 1, "page_size": len(e), "total": len(e)})
}
func (s *Server) pending(c *gin.Context) {
	var e []models.Entry
	s.DB.Where("farmer_id <> ? AND status = ?", s.farmerID(c), "pending_verification").Limit(20).Find(&e)
	c.JSON(200, gin.H{"data": e, "page": 1, "page_size": len(e), "total": len(e)})
}
func (s *Server) verify(c *gin.Context) {
	var in struct{ EntryID, Verdict, Note string }
	c.ShouldBindJSON(&in)
	var e models.Entry
	if s.DB.First(&e, "id = ?", in.EntryID).Error != nil || e.FarmerID == s.farmerID(c) {
		c.Status(422)
		return
	}
	v := models.Verification{EntryID: e.ID, VerifierID: s.farmerID(c), Verdict: in.Verdict, Note: in.Note}
	if s.DB.Create(&v).Error != nil {
		c.Status(409)
		return
	}
	if in.Verdict == "flag" {
		e.Status = "flagged"
	} else {
		var n int64
		s.DB.Model(&models.Verification{}).Where("entry_id = ? AND verdict = ?", e.ID, "confirm").Count(&n)
		if n >= 2 {
			e.Status = "verified"
		}
	}
	s.DB.Save(&e)
	c.JSON(201, v)
}
func (s *Server) reciprocity(c *gin.Context) {
	var given int64
	s.DB.Model(&models.Verification{}).Where("verifier_id = ?", s.farmerID(c)).Count(&given)
	c.JSON(200, gin.H{"given": given, "owed": 0, "score_active": given >= 2})
}
func (s *Server) score(c *gin.Context) {
	var e []models.Entry
	s.DB.Where("farmer_id = ? AND status = ?", s.farmerID(c), "verified").Find(&e)
	var total float64
	for _, x := range e {
		total += x.EstimatedCO2e
	}
	grade := "A"
	if total > 100 {
		grade = "B"
	}
	if total > 250 {
		grade = "C"
	}
	if total > 500 {
		grade = "D"
	}
	if total > 1000 {
		grade = "E"
	}
	sum := models.Score{FarmerID: s.farmerID(c), Grade: grade, CO2ePerAnimal: total, ScoreActive: true, ComputedAt: time.Now()}
	s.DB.Where("farmer_id = ?", sum.FarmerID).Assign(sum).FirstOrCreate(&sum)
	var existing models.LedgerAnchor
	if s.DB.Where("farmer_id = ?", sum.FarmerID).First(&existing).Error != nil && sum.ScoreActive {
		scoreHash := hash(sum.FarmerID + ":" + grade + ":" + fmt.Sprintf("%.4f", total))
		anchor, err := s.Chain.AnchorScore(scoreHash, []map[string]any{})
		if err == nil {
			s.DB.Create(&models.LedgerAnchor{FarmerID: sum.FarmerID, TxID: anchor.TxID, ScoreHash: anchor.ScoreHash, Chain: anchor.Chain, AttestationTrail: "[]", AnchoredAt: anchor.AnchoredAt})
		}
	}
	c.JSON(200, gin.H{"farmer_id": sum.FarmerID, "overall_score": grade, "computed_at": sum.ComputedAt, "recommendation": recommendations.For("feed", total)})
}

func (s *Server) calculate(c *gin.Context) {
	var in emissions.Request
	if c.ShouldBindJSON(&in) != nil || !validType(in.HoldingType) {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "valid holding type and measurements are required"}})
		return
	}
	value := emissions.Calculate(emissions.Input{HoldingType: in.HoldingType, EnergySource: in.EnergySource, WasteHandling: in.WasteHandling, FeedKg: in.FeedKg, EnergyKwh: in.EnergyKwh, WaterLiters: in.WaterLiters})
	c.JSON(200, gin.H{"estimated_co2e_kg": value, "recommendation": recommendations.For("feed", value)})
}

func (s *Server) footprint(c *gin.Context) {
	var entries []models.Entry
	s.DB.Where("farmer_id = ?", s.farmerID(c)).Find(&entries)
	var total, feed, energy, water float64
	for _, e := range entries {
		total += e.EstimatedCO2e
		feed += e.FeedKg
		energy += e.EnergyKwh
		water += e.WaterLiters
	}
	c.JSON(200, gin.H{"farmer_id": s.farmerID(c), "total_co2e_kg": total, "breakdown": gin.H{"feed_kg": feed, "energy_kwh": energy, "water_liters": water}, "entries": len(entries)})
}

func (s *Server) report(c *gin.Context) {
	var f models.Farmer
	if s.DB.First(&f, "id = ?", s.farmerID(c)).Error != nil {
		c.Status(404)
		return
	}
	var entries []models.Entry
	s.DB.Where("farmer_id = ?", f.ID).Find(&entries)
	var total float64
	for _, e := range entries {
		total += e.EstimatedCO2e
	}
	c.JSON(200, gin.H{"farmer": f, "footprint": gin.H{"total_co2e_kg": total, "verified_entries": countVerified(entries), "entry_count": len(entries)}, "format": "json", "generated_at": time.Now().UTC()})
}

func countVerified(entries []models.Entry) int {
	n := 0
	for _, e := range entries {
		if e.Status == "verified" {
			n++
		}
	}
	return n
}

func (s *Server) benchmark(c *gin.Context) {
	typeParam := c.Query("type")
	if !validType(typeParam) {
		c.JSON(400, gin.H{"error": gin.H{"code": "VALIDATION_ERROR", "message": "type is required"}})
		return
	}
	var holdings []models.Holding
	s.DB.Where("type = ? AND deleted_at IS NULL", typeParam).Find(&holdings)
	var regionalTotal, farmerTotal float64
	var regionalAnimals, farmerAnimals int
	for _, h := range holdings {
		var entries []models.Entry
		s.DB.Where("holding_id = ?", h.ID).Find(&entries)
		for _, e := range entries {
			regionalTotal += e.EstimatedCO2e
			if h.FarmerID == s.farmerID(c) {
				farmerTotal += e.EstimatedCO2e
			}
		}
		regionalAnimals += h.Count
		if h.FarmerID == s.farmerID(c) {
			farmerAnimals += h.Count
		}
	}
	farmerPerAnimal, regionalAverage := 0.0, 0.0
	if farmerAnimals > 0 {
		farmerPerAnimal = farmerTotal / float64(farmerAnimals)
	}
	if regionalAnimals > 0 {
		regionalAverage = regionalTotal / float64(regionalAnimals)
	}
	percentile := 50
	if farmerPerAnimal < regionalAverage {
		percentile = 62
	} else if farmerPerAnimal > regionalAverage {
		percentile = 38
	}
	c.JSON(200, gin.H{"type": typeParam, "farmer_co2e_per_animal_kg": farmerPerAnimal, "regional_avg_co2e_per_animal_kg": regionalAverage, "percentile": percentile})
}

func (s *Server) badge(c *gin.Context) {
	var a models.LedgerAnchor
	if s.DB.Where("farmer_id = ?", c.Param("id")).Last(&a).Error != nil {
		c.JSON(404, gin.H{"error": gin.H{"code": "SCORE_NOT_YET_SHAREABLE", "message": "score is not yet shareable"}})
		return
	}
	c.JSON(200, a)
}
func (s *Server) ledger(c *gin.Context) {
	var a models.LedgerAnchor
	if s.DB.Where("tx_id = ?", c.Param("tx")).First(&a).Error != nil {
		c.Status(http.StatusNotFound)
		return
	}
	c.JSON(200, gin.H{"tx_id": a.TxID, "score_hash": a.ScoreHash, "chain": a.Chain, "attestation_trail": a.AttestationTrail, "anchored_at": a.AnchoredAt})
}
func hash(v string) string {
	h := sha256.Sum256([]byte(v))
	return "sha256:" + hex.EncodeToString(h[:])
}

var _ = hash
