// types/farmer.ts — matches Go models.Farmer json tags exactly.

// Go stores location as a plain string, not a nested object.
// The frontend treats it as a string; display helpers parse it if needed.
export interface Farmer {
  farmer_id: string;        // Go: `json:"farmer_id"`
  name: string;
  phone: string;
  cooperative_id: string;
  cooperative_name?: string; // may not be in Go model — treat as optional
  location: string;          // Go: `json:"location"` — plain string, e.g. "Kisumu County"
  language: string;
  created_at: string;
}

export interface UpdateFarmerRequest {
  name?: string;
  language?: string;
}
