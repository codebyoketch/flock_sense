import type { Entry } from "./entry";

export type VerificationVerdict = "confirm" | "flag";

// The current Go endpoint returns the stored Entry model. It deliberately
// The farmer name identifies whose entry a cooperative peer is reviewing.
export type PendingVerification = Entry & {
  farmer_name: string;
};

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
