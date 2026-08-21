import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingVerifications } from "./verification";
import type { PendingVerification } from "@/types";

const SEEN_IDS_KEY = "flocksense:seenPendingVerificationIds";
const POLL_INTERVAL_MS = 60_000; // 1 minute — reasonable for foreground polling against the mock backend

type NotificationsModule = typeof import("expo-notifications");

/**
 * expo-notifications can throw during module init on some environments —
 * notably Expo Go on Android, where even local scheduling was removed
 * alongside remote push in SDK 53+ (a dev build is required there). A plain
 * static `import` at the top of this file would crash on load in exactly
 * that environment, taking the whole app down with it. Loading it lazily
 * behind a dynamic import lets us catch that failure and simply disable
 * this feature instead — everything else (badge counts on Home, etc.)
 * keeps working regardless.
 */
let notificationsPromise: Promise<NotificationsModule | null> | null = null;

function loadNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsPromise) {
    notificationsPromise = import("expo-notifications")
      .then((mod) => {
        mod.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: true,
          }),
        });
        return mod;
      })
      .catch((e) => {
        console.warn(
          "expo-notifications unavailable in this environment (likely Expo Go on Android) — local verification notifications disabled. A development build restores this.",
          e
        );
        return null;
      });
  }
  return notificationsPromise;
}

/**
 * Asks for notification permission. Safe to call repeatedly — the OS only
 * prompts the first time. Returns whether we're allowed to notify.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
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
    const Notifications = await loadNotifications();
    if (Notifications) {
      try {
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
      } catch {
        // Non-critical — the badge count on Home still reflects pending items either way.
      }
    }
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
