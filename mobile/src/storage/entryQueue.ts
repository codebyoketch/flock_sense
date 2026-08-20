import { getDb } from "./db";
import type { Entry } from "@/types";

/** Saves an entry locally first. This always succeeds even with no connection. */
export async function saveEntryLocally(entry: Entry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO entries
      (client_id, entry_id, holding_id, period_start, period_end, payload_json, estimated_co2e_kg, status, created_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.clientId,
      entry.entryId ?? null,
      entry.holdingId,
      entry.periodStart,
      entry.periodEnd,
      JSON.stringify(entry),
      entry.estimatedCo2eKg ?? null,
      entry.status,
      entry.createdAt,
      entry.syncedAt ?? null,
    ]
  );
}

/** All entries not yet successfully synced to the backend. */
export async function getUnsyncedEntries(): Promise<Entry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload_json: string }>(
    `SELECT payload_json FROM entries WHERE status = 'queued' ORDER BY created_at ASC`
  );
  return rows.map((r) => JSON.parse(r.payload_json) as Entry);
}

/**
 * Marks a locally-queued entry as synced once the server confirms it. Takes the
 * full updated Entry (caller merges the server response into the local record)
 * and rewrites both the flat columns *and* payload_json, since reads like
 * getEntriesForHolding only ever look at payload_json — updating just the
 * columns would leave the UI showing stale "queued" data forever.
 */
export async function markEntrySynced(entry: Entry): Promise<void> {
  const db = await getDb();
  const syncedAt = entry.syncedAt ?? new Date().toISOString();
  const finalEntry: Entry = { ...entry, syncedAt };
  await db.runAsync(
    `UPDATE entries SET entry_id = ?, status = ?, synced_at = ?, estimated_co2e_kg = ?, payload_json = ? WHERE client_id = ?`,
    [
      finalEntry.entryId ?? null,
      finalEntry.status,
      syncedAt,
      finalEntry.estimatedCo2eKg ?? null,
      JSON.stringify(finalEntry),
      finalEntry.clientId,
    ]
  );
}

/** Full local history for a holding — used by the holding detail screen, works offline. */
export async function getEntriesForHolding(holdingId: string): Promise<Entry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload_json: string }>(
    `SELECT payload_json FROM entries WHERE holding_id = ? ORDER BY created_at DESC`,
    [holdingId]
  );
  return rows.map((r) => JSON.parse(r.payload_json) as Entry);
}
