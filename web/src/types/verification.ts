import type { Entry } from "./entry";

export type VerificationVerdict = "confirm" | "flag";

// The current Go endpoint returns the stored Entry model. It deliberately
// omits the other farmer's identity and prior-attestation counts.
export type PendingVerification = Entry;

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
