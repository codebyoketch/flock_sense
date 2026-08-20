import * as Crypto from "expo-crypto";
import { apiRequest } from "./api";
import { saveEntryLocally, getEntriesForHolding as getLocalEntriesForHolding } from "@/storage/entryQueue";
import { syncQueuedEntries } from "./sync";
import type { Entry } from "@/types";

interface NewEntryInput {
  holdingId: string;
  periodStart: string;
  periodEnd: string;
  feed: Entry["feed"];
  energy: Entry["energy"];
  water: Entry["water"];
  wasteHandling: string;
}

/**
 * Logs an entry local-first: always saves to SQLite immediately (works offline),
 * then attempts an immediate sync if connectivity is available. If that sync
 * fails, the entry stays queued for the background connectivity watcher.
 */
export async function logEntry(input: NewEntryInput): Promise<Entry> {
  const entry: Entry = {
    clientId: Crypto.randomUUID(),
    holdingId: input.holdingId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    feed: input.feed,
    energy: input.energy,
    water: input.water,
    wasteHandling: input.wasteHandling,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  await saveEntryLocally(entry);
  syncQueuedEntries(); // fire-and-forget; UI doesn't block on network
  return entry;
}

/** Entry history for a holding — local cache first, so it works offline. */
export async function getEntriesForHolding(holdingId: string): Promise<Entry[]> {
  return getLocalEntriesForHolding(holdingId);
}

export async function getEntry(entryId: string): Promise<Entry> {
  return apiRequest<Entry>(`/entries/${entryId}`);
}
