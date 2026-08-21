import { apiRequest } from "./api";
import type { PendingVerification, Reciprocity, VerificationHistoryItem } from "@/types";

export async function getPendingVerifications(): Promise<PendingVerification[]> {
  const res = await apiRequest<{ data: PendingVerification[] }>("/verifications/pending");
  return res.data;
}

export async function submitVerification(
  entryId: string,
  verdict: "confirm" | "flag",
  note?: string
): Promise<{ verificationsSoFar: number; verificationsRequired: number }> {
  return apiRequest(`/verifications`, {
    method: "POST",
    body: { entryId, verdict, note: note ?? "" },
  });
}

export async function getReciprocity(): Promise<Reciprocity> {
  return apiRequest<Reciprocity>("/verifications/reciprocity");
}

/** Full history of verifications the farmer has given and received, newest first. */
export async function getVerificationHistory(): Promise<VerificationHistoryItem[]> {
  const res = await apiRequest<{ data: VerificationHistoryItem[] }>("/verifications/history");
  return res.data;
}
