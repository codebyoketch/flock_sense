import Constants from "expo-constants";
import { apiRequest } from "./api";
import type { BadgeData, LedgerProof } from "@/types";

const WEB_BASE_URL = (Constants.expoConfig?.extra?.webBaseUrl as string) ?? "https://flocksense.app";

/**
 * Public endpoint — no auth required, but calling with the farmer's own token
 * (if present) is harmless since the backend ignores it for this route.
 * Returns null (rather than throwing) when the score isn't shareable yet,
 * so the UI can show a "not yet" state instead of a hard error.
 */
export async function getBadge(farmerId: string): Promise<BadgeData | null> {
  try {
    return await apiRequest<BadgeData>(`/badge/${farmerId}`, { auth: false });
  } catch (e: any) {
    if (e?.code === "SCORE_NOT_YET_SHAREABLE" || e?.status === 404) return null;
    throw e;
  }
}

export async function getLedgerProof(txId: string): Promise<LedgerProof> {
  return apiRequest<LedgerProof>(`/ledger/${txId}`, { auth: false });
}

/** The public web URL a QR code should point to for a given farmer's badge. */
export function getBadgeShareUrl(farmerId: string): string {
  return `${WEB_BASE_URL}/badge/${farmerId}`;
}

/** Renders a QR code as an image via a public QR-generation API — no native QR lib/rebuild needed. */
export function getQrImageUrl(data: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
