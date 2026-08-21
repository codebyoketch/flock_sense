import type { CreateEntryRequest } from "../types";
import { api } from "./api";

const QUEUE_KEY = "flocksense:pending-entries";

type SyncResponse = {
  results: Array<{ client_id: string; status: "created" | "duplicate" | "rejected" }>;
};

function readQueue(): CreateEntryRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    const queue: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(queue) ? queue as CreateEntryRequest[] : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: CreateEntryRequest[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
}

export function pendingEntryCount() {
  return readQueue().length;
}

/** Save an idempotent entry locally so it can be sent through /entries/sync later. */
export function queueEntry(entry: CreateEntryRequest) {
  try {
    const queue = readQueue().filter(({ client_id }) => client_id !== entry.client_id);
    writeQueue([...queue, entry]);
    return true;
  } catch {
    return false;
  }
}

export async function syncQueuedEntries() {
  const queue = readQueue();
  if (queue.length === 0 || !navigator.onLine) return { synced: 0, remaining: queue.length };

  try {
    const response = await api.post<SyncResponse>("/entries/sync", { entries: queue });
    const completed = new Set(
      response.results
        .filter(({ status }) => status === "created" || status === "duplicate")
        .map(({ client_id }) => client_id),
    );
    const remaining = queue.filter(({ client_id }) => !completed.has(client_id));
    writeQueue(remaining);
    return { synced: queue.length - remaining.length, remaining: remaining.length };
  } catch {
    return { synced: 0, remaining: queue.length };
  }
}
