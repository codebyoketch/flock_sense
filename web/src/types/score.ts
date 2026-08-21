// types/score.ts — matches Go handler JSON responses for scores, benchmarks, reciprocity.

/** Response from GET /scores/me */
export interface Score {
  farmer_id: string;
  overall_score: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  computed_at: string;
  recommendation: {
    title: string;
    body: string;
    category: string;
  };
}

/** Response from GET /scores/benchmark?type=<livestock_type> */
export interface BenchmarkResult {
  type: string;
  farmer_co2e_per_animal_kg: number;
  regional_avg_co2e_per_animal_kg: number;
  percentile: number;
}
