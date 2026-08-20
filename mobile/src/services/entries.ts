import * as Crypto from "expo-crypto";
import NetInfo from "@react-native-community/netinfo";
import { apiRequest } from "./api";
import { saveEntryLocally, markEntrySynced, getEntriesForHolding as getLocalEntriesForHolding } from "@/storage/entryQueue";
import { syncQueuedEntries } from "./sync";
import { toEntryPayload } from "./entryPayload";
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

interface SingleEntryResponse {
  entryId: string;
  clientId: string;
  holdingId: string;
  status: Entry["status"];
  estimatedCo2eKg: number;
  createdAt: string;
}

/**
 * Logs an entry local-first: always saves to SQLite immediately (works offline).
 * If connectivity is available, attempts an immediate single-entry POST so the
 * caller can show the estimated CO2e figure right away. If that's not possible
 * (offline, or the request fails), the entry stays queued for the background
 * connectivity watcher and syncs later via the batch endpoint — the estimate
 * just won't be available until then.
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

  const net = await NetInfo.fetch();
  if (net.isConnected) {
    try {
      const res = await apiRequest<SingleEntryResponse>("/entries", {
        method: "POST",
        body: toEntryPayload(entry),
      });
      const synced: Entry = {
        ...entry,
        entryId: res.entryId,
        status: res.status,
        estimatedCo2eKg: res.estimatedCo2eKg,
        syncedAt: new Date().toISOString(),
      };
      await markEntrySynced(synced);
      return synced;
    } catch {
      // Network hiccup, timeout, or a transient server error — fall back to the offline
      // queue below. Even a 409 (client_id already used) is safe to treat this way: it
      // just means this entry already made it through on a previous attempt, and the
      // sync endpoint's duplicate handling covers that case cleanly.
    }
  }

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
