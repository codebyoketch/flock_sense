import type { LivestockType } from "./holding";

export type VerificationVerdict = "confirm" | "flag";

export interface PendingVerification {
  entry_id: string;
  farmer_name: string;
  holding_type: LivestockType;
  period_end: string;
  estimated_co2e_kg: number;
  verifications_so_far: number;
  verifications_required: number;
}

export interface SubmitVerificationRequest {
  entry_id: string;
  verdict: VerificationVerdict;
  note?: string;
}

export interface SubmitVerificationResponse {
  verification_id: string;
  entry_id: string;
  verdict: VerificationVerdict;
  verifications_so_far: number;
  verifications_required: number;
  entry_status: string;
}

export interface ReciprocityStatus {
  given: number;
  owed: number;
  score_active: boolean;
}
