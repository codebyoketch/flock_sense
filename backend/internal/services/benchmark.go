package services

import "github.com/flocksense/backend/internal/models"

type HoldingStoreByType interface {
	ListByType(livestockType string) ([]models.Holding, error)
}
type EntryStoreByHolding interface {
	ListByHolding(holdingID string) ([]models.Entry, error)
}
type Benchmark struct {
	Type              string
	FarmerPerAnimal   float64
	RegionalPerAnimal float64
	Percentile        int
}
type BenchmarkService struct {
	holdings HoldingStoreByType
	entries  EntryStoreByHolding
}

func NewBenchmarkService(holdings HoldingStoreByType, entries EntryStoreByHolding) *BenchmarkService {
	return &BenchmarkService{holdings: holdings, entries: entries}
}
func (s *BenchmarkService) ForFarmer(farmerID, livestockType string) (Benchmark, error) {
	holdings, err := s.holdings.ListByType(livestockType)
	if err != nil {
		return Benchmark{}, err
	}
	var regionalTotal, farmerTotal float64
	var regionalAnimals, farmerAnimals int
	for _, holding := range holdings {
		entries, err := s.entries.ListByHolding(holding.ID)
		if err != nil {
			return Benchmark{}, err
		}
		for _, entry := range entries {
			regionalTotal += entry.EstimatedCO2e
			if holding.FarmerID == farmerID {
				farmerTotal += entry.EstimatedCO2e
			}
		}
		regionalAnimals += holding.Count
		if holding.FarmerID == farmerID {
			farmerAnimals += holding.Count
		}
	}
	farmerPerAnimal, regionalPerAnimal := 0.0, 0.0
	if farmerAnimals > 0 {
		farmerPerAnimal = farmerTotal / float64(farmerAnimals)
	}
	if regionalAnimals > 0 {
		regionalPerAnimal = regionalTotal / float64(regionalAnimals)
	}
	percentile := 50
	if farmerPerAnimal < regionalPerAnimal {
		percentile = 62
	} else if farmerPerAnimal > regionalPerAnimal {
		percentile = 38
	}
	return Benchmark{Type: livestockType, FarmerPerAnimal: farmerPerAnimal, RegionalPerAnimal: regionalPerAnimal, Percentile: percentile}, nil
}
