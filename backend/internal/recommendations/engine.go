package recommendations

type Recommendation struct {
	Title    string `json:"title"`
	Body     string `json:"body"`
	Category string `json:"category"`
}

func For(topDriver string, co2e float64) Recommendation {
	if co2e < 1 {
		return Recommendation{"Keep documenting good practice", "Your current footprint is in a low-emission range; maintain these practices.", "maintenance"}
	}
	switch topDriver {
	case "waste_handling":
		return Recommendation{"Switch to composted manure disposal", "Composting can reduce waste-related emissions and create useful soil input.", "waste_handling"}
	case "energy":
		return Recommendation{"Prefer solar energy where practical", "Solar power can reduce energy-related emissions for farm operations.", "energy"}
	default:
		return Recommendation{"Review feed efficiency", "Compare feed quantity with production and avoid unnecessary waste.", "feed"}
	}
}
