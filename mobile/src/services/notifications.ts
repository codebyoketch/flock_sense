import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingVerifications } from "./verification";
import type { PendingVerification } from "@/types";

const SEEN_IDS_KEY = "flocksense:seenPendingVerificationIds";
const POLL_INTERVAL_MS = 60_000;

type NotificationsModule = typeof import("expo-notifications");

// expo-notifications logs (via console.error, not a throw) whenever any of
// its Android APIs are called from Expo Go on SDK 53+, since remote/local
// push was removed there. try/catch can't suppress that — it's a direct
// side effect inside the module, not a rejected promise. So we detect this
// environment up front and skip calling the module entirely.
const isExpoGoAndroid =
  Constants.appOwnership === "expo" && Platform.OS === "android";

let notificationsPromise: Promise<NotificationsModule | null> | null = null;

function loadNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGoAndroid) {
    return Promise.resolve(null);
  }

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
          "expo-notifications unavailable in this environment — local verification notifications disabled.",
          e
        );
        return null;
      });
  }
  return notificationsPromise;
}

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

export async function checkForNewPendingVerifications(): Promise<PendingVerification[]> {
  let pending: PendingVerification[];
  try {
    pending = await getPendingVerifications();
  } catch {
    return [];
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
          trigger: null,
        });
      } catch {
        // Non-critical — the badge count on Home still reflects pending items either way.
      }
    }
  }

  return newItems;
}

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

    poll();
    interval = setInterval(poll, POLL_INTERVAL_MS);
  });

  return () => {
    cancelled = true;
    if (interval) clearInterval(interval);
  };
}

export function usePendingVerificationNotifications() {
  const [lastNotified, setLastNotified] = useState<PendingVerification[]>([]);

  useEffect(() => {
    const unsubscribe = watchPendingVerifications(setLastNotified);
    return unsubscribe;
  }, []);

  return lastNotified;
}
