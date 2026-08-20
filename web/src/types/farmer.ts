export interface FarmerLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface Farmer {
  farmer_id: string;
  name: string;
  phone: string;
  cooperative_id: string;
  cooperative_name: string;
  location: FarmerLocation;
  language: string;
  created_at: string;
}

export interface UpdateFarmerRequest {
  name?: string;
  location?: FarmerLocation;
  language?: string;
}
