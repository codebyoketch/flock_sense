import type { Entry } from "@/types";

/**
 * Strips local-only bookkeeping fields (status, timestamps, server entryId)
 * before sending — the API contract only wants the reported data plus the
 * client-generated id used for offline idempotency. api.ts handles the
 * camelCase → snake_case conversion at the wire boundary.
 */
export function toEntryPayload(entry: Entry) {
  return {
    clientId: entry.clientId,
    holdingId: entry.holdingId,
    periodStart: entry.periodStart,
    periodEnd: entry.periodEnd,
    feed: entry.feed,
    energy: entry.energy,
    water: entry.water,
    wasteHandling: entry.wasteHandling,
  };
}
