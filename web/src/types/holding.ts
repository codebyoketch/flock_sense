// Matches docs/emission-factors.md — extend both together if a new type is added.
export type LivestockType = "poultry" | "dairy" | "goats" | "other";

export type ScoreGrade = "A" | "B" | "C" | "D" | "E";

export type HoldingTrend = "improving" | "flat" | "worsening";

export interface Holding {
  holding_id: string;
  type: LivestockType;
  count: number;
  created_at: string;
}

// Returned by GET /holdings/:holding_id — base holding fields plus summary stats.
export interface HoldingDetailSummary extends Holding {
  score?: ScoreGrade;
  trend?: HoldingTrend;
  entry_count?: number;
  latest_entry_at?: string;
}

export interface CreateHoldingRequest {
  type: LivestockType;
  count: number;
}

export interface UpdateHoldingRequest {
  count: number;
}
