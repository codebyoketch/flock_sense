import type { Farmer } from "./farmer";

export interface FootprintResponse {
  farmer_id: string;
  total_co2e_kg: number;
  breakdown: {
    feed_kg: number;
    energy_kwh: number;
    water_liters: number;
  };
  entries: number;
}

export interface ReportResponse {
  farmer: Farmer;
  footprint: {
    total_co2e_kg: number;
    verified_entries: number;
    entry_count: number;
  };
  format: "json";
  generated_at: string;
}

export interface BadgeResponse {
  farmer_name: string;
  overall_score: string;
  ledger_tx_id: string;
  chain: string;
  verified_at: string;
}

export interface LedgerProofResponse {
  tx_id: string;
  score_hash: string;
  chain: string;
  attestation_trail: string;
  anchored_at: string;
}
