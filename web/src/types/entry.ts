// types/entry.ts — matches Go models.go json tags exactly.

export type EntryStatus = "pending_verification" | "verified" | "flagged";

export type EnergySource = "grid" | "solar" | "diesel" | "other";

export type WasteHandling = "open_pile" | "composted" | "biogas" | "other";

// ── What Go returns for a stored entry (models.Entry json tags) ──
export interface Entry {
  entry_id: string;          // Go: `json:"entry_id"`
  client_id: string;
  farmer_id: string;
  holding_id: string;
  period_start: string;      // serialized as ISO string by Go's time.Time
  period_end: string;
  feed_type: string;         // flat fields — NOT nested objects
  feed_kg: number;
  energy_source: EnergySource;
  energy_kwh: number;
  water_liters: number;
  waste_handling: WasteHandling;
  estimated_co2e_kg: number; // Go: `json:"estimated_co2e_kg"`
  status: EntryStatus;
  created_at: string;
}

// ── What the frontend sends to POST /entries (Go's entryRequest struct) ──
export interface CreateEntryRequest {
  client_id: string;
  holding_id: string;
  period_start: string;
  period_end: string;
  feed_type: string;
  feed_kg: number;
  energy_source: EnergySource;
  energy_kwh: number;
  water_liters: number;
  waste_handling: WasteHandling;
}

// ── What POST /entries returns (same as Entry) ──
export type CreateEntryResponse = Entry;

export interface SyncEntryResult {
  client_id: string;
  status: "created" | "duplicate";
  entry_id: string;
}
