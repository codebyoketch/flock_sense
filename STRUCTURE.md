# FlockSense — Project Structure & Page Features

This document covers the monorepo folder structure and the screen/page-level feature breakdown for both the mobile app and web dashboard.

---

## Project Structure (monorepo)

```
flocksense/
├── backend/                    # Go + Gin API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── handlers/
│   │   │   ├── farmer.go
│   │   │   ├── holding.go        # manage livestock holdings per farmer
│   │   │   ├── entry.go
│   │   │   ├── verification.go
│   │   │   ├── score.go
│   │   │   └── ledger.go
│   │   ├── models/               # farmer, holding, entry, verification, score, cooperative
│   │   ├── emissions/            # emission factor lookup, keyed by livestock type
│   │   ├── recommendations/      # decision-tree, type-aware recommendation engine
│   │   ├── verification/         # multi-verifier + reciprocity gating logic
│   │   ├── blockchain/           # VeChain hash-anchoring client
│   │   ├── db/                   # PostgreSQL connection, migrations
│   │   └── middleware/           # auth, logging
│   ├── go.mod
│   └── go.sum
│
├── mobile/                      # React Native (Expo)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── holdings.tsx      # manage livestock holdings
│   │   │   ├── log-entry.tsx
│   │   │   ├── verify.tsx
│   │   │   ├── score.tsx
│   │   │   └── profile.tsx
│   │   ├── holding/[id].tsx      # per-holding detail/history
│   │   └── entry/[id].tsx
│   ├── src/
│   │   ├── components/
│   │   ├── screens/              # actual screen implementations
│   │   ├── services/             # API client, offline sync
│   │   ├── storage/               # SQLite local-first storage
│   │   └── types/
│   ├── app.json
│   └── package.json
│
├── web/                          # React (Vite) — dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Farmers.tsx
│   │   │   ├── FarmerDetail.tsx  # shows holdings breakdown
│   │   │   ├── Verifications.tsx
│   │   │   ├── Benchmarking.tsx  # filterable by livestock type
│   │   │   └── Badge.tsx
│   │   ├── components/
│   │   ├── services/              # API client
│   │   └── types/
│   ├── index.html
│   └── package.json
│
├── docs/
│   └── emission-factors.md       # per-livestock-type source references
│
└── README.md
```

---

## Data Model Note

Each farmer account can hold **multiple livestock types** (e.g. poultry + dairy + goats on one farm). The account is not locked to a single type — instead:

- **Farmer** (account) — phone number, name, cooperative, location
- **Livestock Holding** — belongs to a farmer, has a `type` (poultry, dairy, goats, etc.) and a `count`; a farmer can have several holdings
- **Entry** — logged periodically, linked to a specific holding, using type-specific emission factors
- **Score** — computed per farmer as an aggregate across all holdings, with a per-holding breakdown available

---

## Mobile App — Screens & Features

### 1. Login / Register
- Phone-number-based auth
- Farm/cooperative name at registration
- (No livestock type locked in here — that's managed under Holdings)

### 2. Home
- Overall sustainability score (A–E), aggregated across all holdings
- Quick per-holding score summary (e.g. "Poultry: B · Dairy: C")
- Shortcut to "Log this week's data"
- Pending verifications badge (entries from neighbors awaiting confirmation)
- Sync status indicator (offline/synced)

### 3. Holdings
- List of the farmer's livestock holdings (type + count), e.g. "120 chickens," "3 dairy cows"
- Add / edit / remove a holding
- Tap into a holding to see its entry history and type-specific score

### 4. Log Entry
- Select which holding the entry is for (dropdown if multiple)
- Form fields relevant to that type: feed, energy, water, waste handling
- Works fully offline — saves to local SQLite, syncs when connection returns
- Immediate estimated CO2e preview before verification

### 5. Verify (peer verification)
- List of nearby/cooperative-linked farmers' pending entries, showing livestock type per entry
- "Looks right" / "flag as implausible" action per entry
- Reciprocity indicator — verifications given vs. owed

### 6. My Score
- Overall A–E scorecard
- Per-holding breakdown (separate score/trend per livestock type)
- Recommendation tips, tagged to the specific holding/category driving the highest emissions
- "Verified" badge + QR code once score is anchored on-chain

### 7. Profile
- Farm and cooperative details
- Verification history (given/received)
- Language toggle (Swahili/English)

---

## Web App — Pages & Features

### 1. Dashboard
- Cooperative-wide average score and trend over time
- Breakdown by livestock type across all members (e.g. average poultry score vs. average dairy score)
- Highlighted alerts (flagged/anomalous entries needing review)

### 2. Farmers (list)
- Table: farmer name, cooperative, holdings summary (e.g. "Poultry, Dairy"), overall score, last entry date

### 3. Farmer Detail
- List of the farmer's holdings, each with its own entry history, score, and trend
- Combined emissions breakdown chart (by holding, and by category within each holding)
- Exportable sustainability report (per-holding and combined)

### 4. Verifications
- Overview of pending/flagged verifications across the cooperative, filterable by livestock type
- Useful for a cooperative admin to spot-check anomalies

### 5. Benchmarking
- Filter by livestock type — compare a farmer's poultry footprint to regional poultry average, separately from dairy, etc.
- Cooperative-level view of which livestock type is driving the most emissions overall

### 6. Badge / Verified Score (public-facing)
- Clean, shareable view of a farmer's overall verified score, with an optional expandable per-holding breakdown
- QR code linking to the on-chain proof — this is the page to scan into during the live demo
