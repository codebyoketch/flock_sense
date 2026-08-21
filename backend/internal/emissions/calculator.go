package emissions

type Request struct {
	HoldingType   string  `json:"holding_type"`
	EnergySource  string  `json:"energy_source"`
	WasteHandling string  `json:"waste_handling"`
	FeedKg        float64 `json:"feed_kg"`
	EnergyKwh     float64 `json:"energy_kwh"`
	WaterLiters   float64 `json:"water_liters"`
}

type Input struct {
	HoldingType, EnergySource, WasteHandling string
	FeedKg, EnergyKwh, WaterLiters           float64
}

// Factors are deliberately explicit and replaceable as local extension officers validate them.
var feedFactors = map[string]float64{"poultry": 0.9, "dairy": 0.7, "goats": 0.6, "other": 0.75}
var wasteFactors = map[string]float64{"open_pile": 0.35, "composted": 0.12, "biogas": 0.05, "other": 0.25}
var energyFactors = map[string]float64{"grid": 0.42, "solar": 0.05, "diesel": 0.75, "other": 0.5}

func Calculate(in Input) float64 {
	feed := feedFactors[in.HoldingType]
	if feed == 0 {
		feed = feedFactors["other"]
	}
	waste := wasteFactors[in.WasteHandling]
	if waste == 0 {
		waste = wasteFactors["other"]
	}
	energy := energyFactors[in.EnergySource]
	if energy == 0 {
		energy = energyFactors["other"]
	}
	return in.FeedKg*feed + in.EnergyKwh*energy + in.WaterLiters*0.0003 + waste
}
