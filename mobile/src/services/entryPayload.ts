import type { Entry } from "@/types";

/**
 * Strips local-only bookkeeping fields (status, timestamps, server entryId)
 * before sending, and flattens the nested feed/energy/water groups into the
 * flat field names the backend's entries table actually expects
 * (feed_type, feed_kg, energy_source, energy_kwh, water_liters).
 * api.ts handles the remaining camelCase → snake_case key conversion at the
 * wire boundary.
 */
export function toEntryPayload(entry: Entry) {
  return {
    clientId: entry.clientId,
    holdingId: entry.holdingId,
    periodStart: entry.periodStart,
    periodEnd: entry.periodEnd,
    feedType: entry.feed.type,
    feedKg: entry.feed.quantityKg,
    energySource: entry.energy.source,
    energyKwh: entry.energy.quantityKwh,
    waterLiters: entry.water.quantityLiters,
    wasteHandling: entry.wasteHandling,
  };
}
