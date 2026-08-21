import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingVerifications } from "./verification";
import type { PendingVerification } from "@/types";

const SEEN_IDS_KEY = "flocksense:seenPendingVerificationIds";
const POLL_INTERVAL_MS = 60_000; // 1 minute — reasonable for foreground polling against the mock backend

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

/**
 * Asks for notification permission. Safe to call repeatedly — the OS only
 * prompts the first time. Returns whether we're allowed to notify.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function getSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_IDS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

async function saveSeenIds(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Non-critical — worst case we re-notify for an entry next poll.
  }
}

/**
 * Fetches the current pending-verification list, compares it against what
 * we've already surfaced a notification for, and fires a local notification
 * for anything genuinely new. Returns the newly-seen items, if any.
 */
export async function checkForNewPendingVerifications(): Promise<PendingVerification[]> {
  let pending: PendingVerification[];
  try {
    pending = await getPendingVerifications();
  } catch {
    return []; // offline or backend unreachable — try again next poll
  }

  const seen = await getSeenIds();
  const currentIds = new Set(pending.map((p) => p.entryId));
  const newItems = pending.filter((p) => !seen.has(p.entryId));

  await saveSeenIds(currentIds);

  if (newItems.length > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: newItems.length === 1 ? "New entry to verify" : `${newItems.length} entries to verify`,
        body:
          newItems.length === 1
            ? `${newItems[0].farmerName}'s ${newItems[0].holdingType} entry is waiting for your verification.`
            : "Multiple entries from your cooperative are waiting for your verification.",
        data: { type: "pending_verification" },
      },
      trigger: null, // fire immediately — this is a local notification, not scheduled ahead
    });
  }

  return newItems;
}

/**
 * Call once at app startup (while the app is foregrounded). Polls for new
 * pending verifications on an interval and fires a local notification when
 * new ones show up. Returns an unsubscribe function.
 *
 * Note: this only runs while the app is open/foregrounded. True background
 * push would require a real backend sending to Expo's push service — out of
 * scope while we're running against the mock backend.
 */
export function watchPendingVerifications(onNewPending?: (items: PendingVerification[]) => void): () => void {
  let cancelled = false;
  let interval: ReturnType<typeof setInterval> | null = null;

  requestNotificationPermission().then((granted) => {
    if (!granted || cancelled) return;

    const poll = () => {
      checkForNewPendingVerifications().then((newItems) => {
        if (!cancelled && newItems.length > 0) onNewPending?.(newItems);
      });
    };

    poll(); // check immediately on startup, then on the interval
    interval = setInterval(poll, POLL_INTERVAL_MS);
  });

  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
  };
}

/**
 * Convenience hook form of watchPendingVerifications, for use directly in a
 * component if preferred over wiring it into the root layout.
 */
export function usePendingVerificationNotifications() {
  const [lastNotified, setLastNotified] = useState<PendingVerification[]>([]);

  useEffect(() => {
    const unsubscribe = watchPendingVerifications(setLastNotified);
    return unsubscribe;
  }, []);

  return lastNotified;
}
