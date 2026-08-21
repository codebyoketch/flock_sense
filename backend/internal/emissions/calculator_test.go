package emissions

import "testing"

func TestCalculateUsesInputFactors(t *testing.T) {
	value := Calculate(Input{HoldingType: "poultry", EnergySource: "solar", WasteHandling: "composted", FeedKg: 10, EnergyKwh: 2, WaterLiters: 100})
	if value <= 0 {
		t.Fatalf("expected a positive footprint, got %v", value)
	}
}

func TestLowerImpactChoicesReduceEstimate(t *testing.T) {
	open := Calculate(Input{HoldingType: "dairy", EnergySource: "diesel", WasteHandling: "open_pile", FeedKg: 10, EnergyKwh: 10, WaterLiters: 100})
	clean := Calculate(Input{HoldingType: "dairy", EnergySource: "solar", WasteHandling: "composted", FeedKg: 10, EnergyKwh: 10, WaterLiters: 100})
	if clean >= open {
		t.Fatalf("expected cleaner choices to reduce estimate: clean=%v open=%v", clean, open)
	}
}
