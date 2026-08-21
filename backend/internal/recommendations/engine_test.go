package recommendations

import "testing"

func TestLowEmissionReturnsMaintenanceAdvice(t *testing.T) {
	if got := For("feed", 0.5); got.Category != "maintenance" {
		t.Fatalf("expected maintenance advice, got %q", got.Category)
	}
}

func TestHighWasteReturnsWasteAdvice(t *testing.T) {
	if got := For("waste_handling", 10); got.Category != "waste_handling" {
		t.Fatalf("expected waste advice, got %q", got.Category)
	}
}
