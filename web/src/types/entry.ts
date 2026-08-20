export type EntryStatus = "pending_verification" | "verified" | "flagged";

export type EnergySource = "grid" | "solar" | "diesel" | "other";

export type WasteHandling = "open_pile" | "composted" | "biogas" | "other";

export interface FeedInfo {
  type: string;
  quantity_kg: number;
}

export interface EnergyInfo {
  source: EnergySource;
  quantity_kwh: number;
}

export interface WaterInfo {
  quantity_liters: number;
}

export interface Entry {
  entry_id: string;
  client_id: string;
  holding_id: string;
  period_start: string;
  period_end: string;
  feed: FeedInfo;
  energy: EnergyInfo;
  water: WaterInfo;
  waste_handling: WasteHandling;
  status: EntryStatus;
  estimated_co2e_kg: number;
  created_at: string;
}

export interface CreateEntryRequest {
  client_id: string;
  holding_id: string;
  period_start: string;
  period_end: string;
  feed: FeedInfo;
  energy: EnergyInfo;
  water: WaterInfo;
  waste_handling: WasteHandling;
}

export interface CreateEntryResponse {
  entry_id: string;
  client_id: string;
  holding_id: string;
  status: EntryStatus;
  estimated_co2e_kg: number;
  created_at: string;
}

export interface SyncEntryResult {
  client_id: string;
  status: "created" | "duplicate";
  entry_id: string;
}
