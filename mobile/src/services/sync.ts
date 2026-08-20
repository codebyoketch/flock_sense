import NetInfo from "@react-native-community/netinfo";
import { apiRequest } from "./api";
import { getUnsyncedEntries, markEntrySynced } from "@/storage/entryQueue";
import type { Entry, EntryStatus } from "@/types";

interface SyncResultItem {
  clientId: string;
  status: "created" | "duplicate";
  entryId: string;
}

let syncing = false;

/** Pushes all locally-queued entries to the backend in one batch call. Safe to call repeatedly. */
export async function syncQueuedEntries(): Promise<{ synced: number; failed: boolean }> {
  if (syncing) return { synced: 0, failed: false };

  const net = await NetInfo.fetch();
  if (!net.isConnected) return { synced: 0, failed: false };

  const queued = await getUnsyncedEntries();
  if (queued.length === 0) return { synced: 0, failed: false };

  syncing = true;
  try {
    const res = await apiRequest<{ results: SyncResultItem[] }>("/entries/sync", {
      method: "POST",
      body: { entries: queued },
    });

    for (const item of res.results) {
      const status: EntryStatus = "pending_verification";
      await markEntrySynced(item.clientId, item.entryId, status);
    }

    return { synced: res.results.length, failed: false };
  } catch {
    // Leave entries queued — they'll retry on the next connectivity change or app open.
    return { synced: 0, failed: true };
  } finally {
    syncing = false;
  }
}

/** Call once at app startup. Triggers a sync attempt whenever connectivity is (re)gained. */
export function watchConnectivityForSync(onSynced?: (count: number) => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncQueuedEntries().then((result) => {
        if (result.synced > 0) onSynced?.(result.synced);
      });
    }
  });
  return unsubscribe;
}

export type { Entry };
