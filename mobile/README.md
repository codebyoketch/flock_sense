# FlockSense — Mobile

The farmer-facing mobile app: register a farm, log livestock data, get verified by other farmers, see your sustainability score, and share a badge/QR proof of it.

Built with [Expo](https://expo.dev) (SDK 57) + [Expo Router](https://docs.expo.dev/router/introduction/) + TypeScript.

This README covers the mobile app only. The web dashboard and Go backend live in their own parts of the monorepo and have their own setup — see the root `README.md` / `STRUCTURE.md`.

---

## Prerequisites

- **Node.js** 20+ and npm
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) — easiest way to run this during development, no native build required
- Optionally, Xcode (iOS Simulator) or Android Studio (Android Emulator) if you'd rather run on a simulator/emulator than a physical device

## Getting started

```bash
cd mobile
npm install
```

### Point the app at a backend

The app talks to an HTTP API implementing the contract in `../API_CONTRACT.md` (snake_case JSON — the app converts to/from camelCase automatically, see `src/services/api.ts`). It does **not** bundle a mock server itself — you need something running that speaks that contract, whether that's the real Go backend, a mock server, or a teammate's instance.

Set the URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://192.168.1.176:4000/api/v1"
    }
  }
}
```

Notes on that value:
- If you're running on a **physical device** via Expo Go, `localhost` won't reach a server running on your laptop — use your machine's LAN IP instead (the checked-in value is an example of this; update it to your own machine's IP).
- If you're running on an **iOS Simulator**, `http://localhost:PORT/api/v1` works fine.
- If you're running on an **Android Emulator**, use `http://10.0.2.2:PORT/api/v1` (the emulator's alias for your host machine).

### Run it

```bash
npm start          # opens the Expo dev tools; scan the QR code with Expo Go
npm run ios        # launch in the iOS Simulator
npm run android    # launch in the Android Emulator
npm run web        # launch in a browser (limited — some native modules won't work)
```

---

## Project structure

```
mobile/
├── app/                      # screens, routed by file path (Expo Router)
│   ├── (auth)/                 # login, register — shown when logged out
│   ├── (tabs)/                 # home, holdings, log-entry, verify, score, profile
│   ├── entry/[id].tsx           # entry detail
│   ├── holding/[id].tsx         # holding detail
│   ├── ledger/[txId].tsx        # on-chain verification proof
│   ├── verification-history.tsx # given/received verifications (from Profile)
│   └── _layout.tsx              # root stack, auth redirect, global watchers
├── src/
│   ├── components/            # shared UI (ScoreBadge, SyncStatusIndicator)
│   ├── constants/
│   │   └── theme.ts             # COLORS, GRADE_COLORS, RADII — see "Theming" below
│   ├── context/                # AuthContext
│   ├── services/               # API calls, one file per resource, + sync/notifications
│   ├── storage/                # local SQLite queue for offline entry logging
│   └── types/                  # shared TS types
└── app.json                   # Expo config, incl. apiBaseUrl
```

## Theming

Every screen pulls its colors and border radii from `src/constants/theme.ts` rather than hardcoding hex values or numbers inline. To re-theme the app — swap the brand color, adjust corner rounding — change values there; no need to touch individual screens.

One exception: `app.json`'s `expo-notifications` plugin config has its own `color` field (used for the Android notification icon tint), since Expo config files can't import from app source. If you change `COLORS.primary` in `theme.ts`, update that value too so they stay in sync.

## Offline entry logging

Log Entry writes to a local SQLite queue first (`src/storage/`) so it works with no connection. `src/services/sync.ts` watches connectivity and flushes the queue to the backend as soon as the device reconnects — see `SyncStatusIndicator` on Home for the current state.

## Notifications

New pending verifications trigger a **local** notification (not remote push — see [Known limitations](#known-limitations) below). `src/services/notifications.ts` polls `/verifications/pending` every 60s while the app is open and foregrounded, diffs against what it's already notified about (persisted in AsyncStorage so you don't get renotified after a restart), and fires a local notification for anything new. Wired up in `app/_layout.tsx` once the farmer is authenticated.

`expo-notifications` is loaded lazily behind a dynamic import rather than a normal top-level import. That's deliberate: **on Android, Expo Go removed even local-notification support in SDK 53+** (not just remote push — a static import throws at module load and crashes the app). Loading it lazily lets us catch that failure and disable just this feature, so the rest of the app keeps working in Expo Go. If you see a console warning about `expo-notifications` being unavailable, that's expected on Android/Expo Go — use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) to actually test this feature there. On iOS Simulator/device via Expo Go, and on Android via a dev build, it works normally.

---

## Known limitations

- **Notifications are local-only, foreground-only, and — on Android — require a dev build.** They fire while the app is open, based on polling. There's no remote push — that would need a real backend capable of sending to Expo's push service, which doesn't exist yet against the mock backend. Separately, Expo Go on Android (SDK 53+) doesn't support `expo-notifications` at all, even for local notifications, so this feature silently no-ops there (see "Notifications" above); it works fine in Expo Go on iOS, or on Android via a development build. If/when the Go backend is live, remote push is the natural next step (register a push token, have the backend call Expo's push API when a new verification request is created).
- **No mock server is bundled here.** You need to point `apiBaseUrl` at something that implements `../API_CONTRACT.md`.
- **Web dashboard and Go backend are out of scope for this folder** — see the root of the monorepo.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Run in the iOS Simulator |
| `npm run android` | Run in the Android Emulator |
| `npm run web` | Run in a browser |
