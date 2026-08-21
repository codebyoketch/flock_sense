package api

import (
	"github.com/flocksense/backend/internal/blockchain"
	"github.com/flocksense/backend/internal/handlers"
	"github.com/flocksense/backend/internal/middleware"
	"github.com/flocksense/backend/internal/repositories"
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
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
	AdminAuth    *handlers.AdminAuthHandler
	Entries      *handlers.EntryHandler
	Scores       *handlers.ScoreHandler
	Farmer       *handlers.FarmerHandler
	Cooperative  *handlers.CooperativeHandler
	Ledger       *handlers.LedgerHandler
	Badge        *handlers.BadgeHandler
	Revocations  *middleware.Revocations
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
	verificationService := services.NewVerificationService(verificationRepository, verificationRepository, entryRepository, entryRepository)
	authService := services.NewAuthService(farmerRepository, []byte(secret))
	otpRepository := repositories.NewOTPRepository(database)
	otpService := services.NewOTPService(otpRepository)
	farmerService := services.NewFarmerService(farmerRepository)
	cooperativeRepository := repositories.NewCooperativeRepository(database)
	cooperativeService := services.NewCooperativeService(cooperativeRepository)
	adminRepository := repositories.NewAdminRepository(database)
	adminAuthService := services.NewAdminAuthService(adminRepository, []byte(secret))
	revocations := middleware.NewRevocations()
	entryService := services.NewEntryService(holdingRepository, entryRepository)
	scoreRepository := repositories.NewScoreRepository(database)
	ledgerRepository := repositories.NewLedgerRepository(database)
	ledgerService := services.NewLedgerService(ledgerRepository, blockchain.MockClient{Chain: "mock-vechain"})
	ledgerHandler := handlers.NewLedgerHandler(ledgerService)
	badgeService := services.NewBadgeService(farmerRepository, ledgerRepository, scoreRepository)
	badgeHandler := handlers.NewBadgeHandler(badgeService)
	scoreService := services.NewScoreService(entryRepository, scoreRepository, ledgerService, verificationRepository)
	return &Server{DB: database, Secret: []byte(secret), Chain: blockchain.MockClient{Chain: "mock-vechain"}, Holdings: handlers.NewHoldingHandler(holdingService), Calculations: handlers.NewCalculationHandler(calculationService), Footprint: handlers.NewFootprintHandler(footprintService), Reports: handlers.NewReportHandler(reportService), Benchmarks: handlers.NewBenchmarkHandler(benchmarkService), Verification: handlers.NewVerificationHandler(verificationService), Auth: handlers.NewAuthHandler(authService, otpService, revocations), AdminAuth: handlers.NewAdminAuthHandler(adminAuthService), Entries: handlers.NewEntryHandler(entryService), Scores: handlers.NewScoreHandler(scoreService), Farmer: handlers.NewFarmerHandler(farmerService), Cooperative: handlers.NewCooperativeHandler(cooperativeService), Ledger: ledgerHandler, Badge: badgeHandler, Revocations: revocations}
}
func (s *Server) Run(addr string) error { return s.router().Run(addr) }
func (s *Server) router() *gin.Engine {
	r := gin.Default()
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	r.GET("/ready", func(c *gin.Context) {
		sqlDB, err := s.DB.DB()
		if err != nil || sqlDB.Ping() != nil {
			c.JSON(503, gin.H{"status": "not_ready", "database": "unavailable"})
			return
		}
		c.JSON(200, gin.H{"status": "ready", "database": "ok"})
	})
	v := r.Group("/api/v1")
	v.POST("/auth/register", s.Auth.Register)
	v.POST("/auth/login", s.Auth.Login)
	v.POST("/auth/otp/request", s.Auth.RequestOTP)
	v.POST("/auth/otp/register", s.Auth.RegisterWithOTP)
	v.POST("/auth/otp/verify", s.Auth.VerifyOTP)
	v.POST("/auth/admin/login", s.AdminAuth.Login)
	v.POST("/auth/refresh", s.Auth.Refresh)
	a := v.Group("/")
	a.Use(middleware.Auth(s.Secret, s.Revocations))
	a.Use(middleware.RequireRole("farmer"))
	admin := v.Group("/")
	admin.Use(middleware.Auth(s.Secret, s.Revocations))
	admin.Use(middleware.RequireRole("cooperative_admin"))
	admin.GET("/cooperatives/:id/scores", s.Cooperative.Scores)
	a.POST("/auth/logout", s.Auth.Logout)
	a.GET("/farmers/me", s.Farmer.Me)
	a.PATCH("/farmers/me", s.Farmer.Update)
	a.GET("/holdings", s.Holdings.List)
	a.POST("/holdings", s.Holdings.Create)
	a.PATCH("/holdings/:id", s.Holdings.Update)
	a.DELETE("/holdings/:id", s.Holdings.Delete)
	a.POST("/entries", s.Entries.Create)
	a.GET("/entries", s.Entries.List)
	a.POST("/entries/sync", s.Entries.Sync)
	a.GET("/entries/:entry_id", s.Entries.Get)
	a.GET("/holdings/:id/entries", s.Entries.ListByHolding)
	a.GET("/verifications/pending", s.Verification.Pending)
	a.POST("/verifications", s.Verification.Submit)
	a.GET("/verifications/reciprocity", s.Verification.Reciprocity)
	a.GET("/scores/me", s.Scores.Me)
	a.POST("/calculations", s.Calculations.Calculate)
	a.GET("/footprint/me", s.Footprint.Me)
	a.GET("/reports/me", s.Reports.Me)
	a.GET("/scores/benchmark", s.Benchmarks.Me)
	r.GET("/api/v1/badge/:farmer_id", s.Badge.Public)
	r.GET("/api/v1/ledger/:tx", s.Ledger.Proof)
	return r
}
