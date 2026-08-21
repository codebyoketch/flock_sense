package handlers

import (
	"github.com/flocksense/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ReportHandler struct{ service *services.ReportService }

func NewReportHandler(service *services.ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) Me(c *gin.Context) {
	report, err := h.service.ForFarmer(c.GetString("farmer_id"))
	if err != nil {
		c.Status(404)
		return
	}
	c.JSON(200, gin.H{"farmer": report.Farmer, "footprint": gin.H{"total_co2e_kg": report.Total, "verified_entries": report.VerifiedEntries, "entry_count": report.EntryCount}, "format": "json", "generated_at": report.GeneratedAt})
}
