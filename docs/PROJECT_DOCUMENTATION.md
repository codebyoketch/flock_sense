# FlockSense — Complete Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [The Problem We Solve](#2-the-problem-we-solve)
3. [What is Carbon Footprinting?](#3-what-is-carbon-footprinting)
4. [How the Solution Works](#4-how-the-solution-works)
5. [Technologies Used](#5-technologies-used)
6. [Revenue Model](#6-revenue-model)
7. [Impact on Lives](#7-impact-on-lives)
8. [Pitch in Simple Terms](#8-pitch-in-simple-terms)
9. [Judging Criteria Breakdown](#9-judging-criteria-breakdown)
10. [Likely Judge Questions & Answers](#10-likely-judge-questions--answers)
11. [Running the Project with Seed Data](#11-running-the-project-with-seed-data)
12. [Seed Data Overview](#12-seed-data-overview)
13. [Test Accounts](#13-test-accounts)
14. [Architecture Diagram](#14-architecture-diagram)

---

## 1. Project Overview

**FlockSense** is a web + mobile platform for **livestock farmers in Kenya** (poultry, dairy, goats) that helps them:

1. **Log farm activity** — feed usage, energy consumption, water usage, waste handling
2. **Estimate carbon footprint** — CO₂ equivalent emissions in kilograms
3. **Get practical reduction recommendations** — actionable advice like "switch to composting" or "use solar"
4. **Build peer-verified sustainability credentials** — verified by other farmers in their cooperative
5. **Anchor proof on blockchain** — tamper-resistant record on VeChain

**Tagline:** *"Self-reported data is worthless without verification, and verification is worthless without tamper-proof anchoring. FlockSense does both."*

---

## 2. The Problem We Solve

### The Challenge

18 million+ smallholder livestock farmers in Kenya face three connected problems:

| Problem | Description |
|---------|-------------|
| **No measurement** | Industrial farms have consultants and software. Smallholders can't answer "how much CO₂ does my farm produce?" |
| **No proof** | Buyers, SACCOs (savings & credit cooperatives), and carbon credit buyers want proof of sustainable practices. Farmers have nothing to show. |
| **Untrusted data** | Without verification, self-reported numbers can be faked. Buyers and lenders won't act on unverified claims. |

### Why It Matters Now

- Kenya's climate policy (Nationally Determined Contributions) demands grassroots sustainability data
- Global carbon credit market is $2B+ and growing
- Both require exactly what FlockSense provides: verified, grassroots environmental data from smallholders

---

## 3. What is Carbon Footprinting?

**Carbon footprinting** = measuring how much greenhouse gas (CO₂ equivalent) your activities produce.

### Main Emission Sources for Livestock Farms

| Source | What It Means |
|--------|---------------|
| **Feed** | Growing, transporting, and processing animal feed produces emissions (different factors for poultry vs dairy vs goats) |
| **Energy** | Powering lights, pumps, heaters (grid electricity, diesel generators, or solar) |
| **Water** | Pumping and treating water |
| **Waste** | Manure decomposition (open pile releases methane; composting or biogas captures/reduces it) |

### How FlockSense Calculates It

FlockSense uses **emission factors** (simplified multipliers) to convert each input into kg CO₂e:

| Factor | Value | Notes |
|--------|-------|-------|
| Poultry feed | 0.9 kg CO₂e per kg feed | Highest — industrial processing |
| Dairy feed | 0.7 kg CO₂e per kg feed | Medium |
| Goat feed | 0.6 kg CO₂e per kg feed | Lowest |
| Grid energy | 0.42 kg CO₂e per kWh | Kenya's grid mix |
| Solar energy | 0.05 kg CO₂e per kWh | 93% cleaner than diesel |
| Diesel energy | 0.75 kg CO₂e per kWh | Highest — fossil fuel |
| Open pile waste | 0.35 kg CO₂e | Methane release |
| Composted waste | 0.12 kg CO₂e | Captures most methane |
| Biogas waste | 0.05 kg CO₂e | Best — captures and uses methane |
| Water | 0.0003 kg CO₂e per liter | Minimal impact |

**Formula:**
```
CO₂e = feed_kg × feedFactor[type] + energy_kwh × energyFactor[source] + water_liters × 0.0003 + wasteFactor[method]
```

---

## 4. How the Solution Works

### Farmer Flow (Mobile App)

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Register    │───▶│ Add Holdings │───▶│ Log Entries  │───▶│  Get Score   │
│  (OTP)       │    │ (livestock)  │    │ (weekly)     │    │  (A–E grade) │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                │
       ┌────────────────────────────────────────────────────────┘
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Verify     │───▶│  Score       │───▶│  Blockchain  │
│   Peers      │    │  Becomes     │    │  Anchor      │
│   (reciprocity)│   │  Active      │    │  (VeChain)   │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │  Credential   │
                                        │  (QR + PDF)   │
                                        └──────────────┘
```

### Key Flows

1. **Registration** — Phone number + OTP (like M-Pesa flow, familiar in Kenya)
2. **Add Holdings** — "I have 120 chickens" or "3 dairy cows"
3. **Log Entries** — Weekly farm data (feed, energy, water, waste method)
4. **Get Score** — A through E grade based on emission intensity
5. **Peer Verification** — Cooperative members confirm data looks plausible
6. **Credential** — Once verified + anchored on blockchain, get a shareable proof (QR code, PDF)

### Cooperative Admin Flow (Web Dashboard)

1. **Dashboard** — Cooperative-wide average score, trends, alerts
2. **Farmers List** — Member overview with scores
3. **Verifications** — Flagged entries needing review
4. **Benchmarking** — Compare farmers within the cooperative

### Unique Innovation: Reciprocity-Gated Scoring

Your score is **withheld from public view** until you've verified at least 2 peers. This creates a **social accountability protocol** — not just a tool. Farmers must participate in the community to benefit from it. No other farm app does this.

---

## 5. Technologies Used

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React + TypeScript + Vite | Fast, typed, modern SPA |
| **Backend** | Go + Gin | Fast, concurrent, production-grade |
| **Database** | PostgreSQL | Reliable relational DB |
| **Auth** | JWT + OTP via Africa's Talking | Kenyan phone-based auth, familiar UX |
| **Offline** | SQLite + sync queue | Works without internet |
| **Blockchain** | VeChain (hash anchoring) | Tamper-proof proof without storing data on-chain |
| **Deployment** | Docker + Nginx | Containerized, production-ready |
| **Emission Engine** | Custom calculator | Deterministic CO₂e from farm inputs |

### Emerging Tech Bonus Categories Covered

| Category | How We Use It |
|----------|---------------|
| **Blockchain for Sustainability** | VeChain hash anchoring — verified sustainability records anchored on-chain |
| **AI & Data Intelligence** | Emission factor engine, recommendation engine, benchmarking analytics |
| **Cloud & Edge Computing** | Docker containerization, offline-first architecture with sync |

---

## 6. Revenue Model

| Revenue Stream | How It Works |
|----------------|-------------|
| **Carbon Credit Commissions** | Farmers use verified credentials to sell carbon credits. FlockSense takes 5-10% commission on each transaction |
| **Cooperative SaaS** | Cooperatives pay monthly subscription for dashboard, analytics, and member management |
| **Premium Verification** | Advanced verification tiers (third-party audit, international certification) |
| **API Access** | Buyers, lenders, and carbon credit platforms pay for API access to verified farmer data |
| **White-Label** | County governments and NGOs can deploy under their own brand |

---

## 7. Impact on Lives

| Stakeholder | Impact |
|-------------|--------|
| **Farmers** | Unlock carbon credit revenue, loan access, and premium buyer contracts through verified sustainability records |
| **Cooperatives** | Gain collective visibility into member performance, attract partners, make data-driven decisions |
| **Buyers** | Get trustworthy sustainability proof for procurement decisions |
| **Lenders (SACCOs)** | Use verified environmental data for loan risk assessment |
| **Climate** | Incentivizes sustainable practices at scale across 18M+ smallholders |
| **Kenya** | Supports National Determined Contributions with grassroots data |

---

## 8. Pitch in Simple Terms

> "Imagine you're a chicken farmer in Kisumu. You feed your chickens, use water, and your chickens make waste. All of that creates pollution — that's your carbon footprint. But you have no idea how much you're creating, and no way to prove you're doing better than your neighbor.
>
> FlockSense is like a health tracker for your farm. You type in what you fed your chickens this week, how much water you used, and what you did with the waste. It tells you your pollution score — A is great, E needs work. But here's the clever part: before your score becomes public, you have to check two other farmers' data first. This makes sure everyone's honest.
>
> Once your data is checked by other farmers, it gets locked onto a blockchain — a digital record that can never be changed. Now you have proof. You can show this to a buyer who pays more for green farms, or to a bank that gives you a loan, or to a carbon credit company that pays you for reducing pollution.
>
> It works even when there's no internet. It's built for cooperatives — the farmer groups that already exist in Kenya. And it turns climate action from a cost into money in your pocket."

---

## 9. Judging Criteria Breakdown

### Problem Relevance & Impact — 20%

**Score justification:** Directly addresses a real, documented problem affecting 18M+ Kenyan smallholders.

| Criterion | Evidence |
|-----------|----------|
| Real problem | Carbon credit markets, buyer procurement, and SACCO lending all require verified sustainability data |
| Measurable impact | Farmers get actionable advice (e.g., "composting cuts waste emissions 18%") + unlock revenue |
| Scale | Leverages existing cooperative structures across Kenya |
| Timeliness | Aligns with Kenya's NDC commitments and growing carbon credit market |

### Technical Execution — 20%

**Score justification:** Production-quality architecture with clean separation of concerns.

| Component | Implementation |
|-----------|---------------|
| Backend | Go + Gin with service/handler/repository separation, interface-based testability |
| Database | PostgreSQL with UUID support, unique indexes for idempotency |
| Auth | JWT + OTP with rate limiting, token revocation, role-based middleware |
| Offline-first | SQLite local storage with sync queue, duplicate detection via client_id |
| Emissions engine | Deterministic CO₂e calculator with replaceable emission factors |
| Verification | Reciprocity-gated with flag + confirm workflow |
| Blockchain | VeChain hash-anchoring with attestation trail |
| Docker | Full stack: Nginx → API → PostgreSQL, with dev override |

### Innovation & Creativity — 15%

**Score justification:** Three genuinely creative design choices not found in other farm apps.

1. **Reciprocity-gated scoring** — Score withheld until you verify peers. Social accountability protocol.
2. **Anonymized on-chain attestation trail** — Public proof page shows who verified what using SHA-256 hashes. Auditable without exposing identities.
3. **Type-specific emission profiles** — Different factor sets for poultry vs dairy vs goats, not one-size-fits-all.

### Technology Integration — 15%

**Score justification:** Exceeds minimum requirements for Track 6.

| Required Tech | Status | Evidence |
|---------------|--------|----------|
| Mobile | ✅ | React + TypeScript + offline-first PWA |
| Web | ✅ | React/Vite + Go API |
| Cloud | ✅ | Docker containerization, production-ready |
| Edge | ✅ | SQLite offline queue with sync |
| Cybersecurity | ✅ | JWT + OTP, rate limiting, role-based access |
| Blockchain | ✅ | VeChain hash anchoring with attestation trail |

**Emerging Tech Bonus:**
- ✅ Blockchain for Sustainability
- ✅ AI & Data Intelligence (emission engine, recommendations, benchmarks)
- ✅ Cloud & Edge Computing (offline-first + Docker)

### Scalability & Feasibility — 15%

**Score justification:** Designed for growth from day one.

| Aspect | How It Scales |
|--------|---------------|
| Farmer onboarding | Cooperative-based — onboard a coop, get all members |
| Data verification | Peer-to-peer — scales with community size, not auditor count |
| Technical | Stateless API + PostgreSQL = horizontal scaling |
| Revenue | Commission-based = grows with adoption |
| Geographic | Emission factors are configurable — plug in new livestock types or countries |
| Partnership | Cooperatives, SACCOs, county governments as distribution channels |

### Presentation & Demo — 10%

**Demo plan:** Live walkthrough of all pages with seed data showing different farmer profiles (A through E grades, empty states, flagged entries, verified credentials).

### Team Collaboration — 5%

**Evidence:** Clean code organization, documented API contract, Docker setup for all team members.

---

## 10. Likely Judge Questions & Answers

### "Why blockchain? Couldn't you just use a regular database?"

> A regular database can be modified by anyone with admin access. Blockchain anchoring creates an immutable audit trail — once a hash is anchored, it can't be altered without detection. For carbon credits and buyer trust, this tamper-proof guarantee is essential. We use VeChain for low-cost, high-throughput anchoring.

### "How do you prevent farmers from lying about their data?"

> Two layers: **peer verification** (cooperative members confirm data plausibility) and **blockchain anchoring** (verified data gets an immutable record). The reciprocity mechanism ensures everyone participates in verification. For high-stakes use cases, cooperatives can require third-party audits.

### "What's your unfair advantage?"

> The cooperative structure. Kenya already has 22,000+ cooperatives with established trust networks. We don't need to build trust from scratch — we plug into existing social infrastructure. The reciprocity mechanism leverages this: farmers verify people they know.

### "How do you make money?"

> Multiple streams: carbon credit commissions (5-10% per transaction), cooperative SaaS subscriptions, premium verification tiers, and API access for buyers/lenders.

### "Does this work offline?"

> Yes. Farmers can log entries offline — data is stored in SQLite on their device. When connectivity returns, it syncs automatically with duplicate detection. This is critical for rural Kenya where internet is intermittent.

### "Why Kenya specifically?"

> - 18M+ smallholder livestock farmers
> - 22,000+ existing cooperatives (distribution channel)
> - Growing carbon credit market
> - Mobile money (M-Pesa) infrastructure for payments
> - National climate commitments (NDCs) creating demand

### "How accurate are your emission calculations?"

> We use published emission factors from agricultural research, simplified for practicality. The factors are replaceable — as better data becomes available, we can update them. The engine is deterministic: same inputs always produce the same output.

---

## 11. Running the Project with Seed Data

### Prerequisites

- Docker Engine 24+ with Docker Compose v2
- Ports 80 (or your chosen APP_PORT) available

### Step 1: Clone and Configure

```bash
git clone <repository-url>
cd flock_sense

# Create environment file
cp .env.example .env

# Generate secrets (optional — defaults work for dev)
openssl rand -hex 32  # Use for JWT_SECRET
```

### Step 2: Start the Full Stack

```bash
# Production mode (all services)
docker compose up --build -d

# Watch logs
docker compose logs -f
```

### Step 3: Seed the Database

```bash
# Navigate to seed directory
cd backend/db

# Set the PostgreSQL password (must match .env)
export POSTGRES_PASSWORD=postgres

# Run the seed script (idempotent — safe to run multiple times)
./seed.sh
```

You should see output like:
```
[INFO] Seeding FlockSense test data...
[INFO] Inserting cooperatives...
[INFO] Inserting farmers...
[INFO] Inserting holdings...
[INFO] Inserting entries...
[INFO] Inserting verifications...
[INFO] Inserting scores...
[INFO] Inserting ledger anchors...
[INFO] Inserting admin user...
[INFO] Seed complete.
```

### Step 4: Access the Application

| URL | What You See |
|-----|-------------|
| `http://localhost` | Main application |
| `http://localhost/health` | Health check endpoint |
| `http://localhost:8080` (dev mode) | API directly |

### Step 5: Login with Test Accounts

1. Open the app in your browser
2. Enter a phone number from the test accounts table
3. In development mode, the OTP code appears in the API logs:
   ```bash
   docker compose logs api | grep OTP
   ```
4. Enter the code to log in

### Development Mode (with hot reload)

For development with hot reload:

```bash
# Terminal 1: Database and API
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build postgres api

# Terminal 2: Frontend
cd web
npm ci
npm run dev
```

The dev server runs at `http://localhost:5173` with hot reload.

### Reset the Database

To completely reset and re-seed:

```bash
cd backend/db
export POSTGRES_PASSWORD=postgres
./seed.sh reset

# Restart API to recreate schema
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d api
```

---

## 12. Seed Data Overview

### What Gets Seeded

| Entity | Count | Description |
|--------|-------|-------------|
| Cooperatives | 2 | LakeHub (Kisumu), Central Highlands (Nakuru) |
| Farmers | 9 | Various grades, languages, cooperative memberships |
| Holdings | 11 | Poultry, dairy, goats across multiple farmers |
| Entries | 20 | Weekly farm data spanning June–August 2026 |
| Verifications | 17 | Peer confirmations and flags |
| Scores | 5 | Grades A through E |
| Ledger Anchors | 5 | Mock VeChain with attestation trails |
| Admins | 1 | Cooperative admin for LakeHub |

### Edge Cases Covered

| Farmer | Grade | Edge Case |
|--------|-------|-----------|
| Jane Wanjiru | A | Star performer — solar, composted, verified on ledger |
| David Kamau | B | Good performer in different cooperative |
| Grace Akinyi | C | Mid-range — poultry + goats, diesel energy |
| Mary Njeri | C | New farmer — large flock, few entries |
| Peter Odhiambo | D | Needs improvement — grid/diesel, open pile waste |
| Samuel Mutua | E | Worst performer — diesel, open pile, massive feed |
| Amina Hassan | — | Empty state — registered, no holdings |
| Joseph Kipchoge | — | Empty entries — has holdings, hasn't logged |
| Lucy Wambui | — | Score inactive — has entries but hasn't verified peers |

---

## 13. Test Accounts

| Phone | Farmer | Cooperative | Grade | Language | Demo Focus |
|-------|--------|-------------|-------|----------|------------|
| +254712345001 | Jane Wanjiru | LakeHub | A | Swahili | Star performer, credential, public proof |
| +254712345002 | Peter Odhiambo | LakeHub | D | English | Needs improvement, recommendations |
| +254712345003 | Grace Akinyi | LakeHub | C | Swahili | Mid-range, multi-holding (poultry + goats) |
| +254712345004 | David Kamau | Central | B | English | Different coop, solar + biogas |
| +254712345005 | Mary Njeri | Central | — | Swahili | New farmer, pending verification |
| +254712345006 | Samuel Mutua | Central | E | English | Worst performer, needs urgent action |
| +254712345007 | Amina Hassan | LakeHub | — | Swahili | Empty state — no holdings |
| +254712345008 | Joseph Kipchoge | Central | — | English | Has holdings, no entries logged |
| +254712345009 | Lucy Wambui | LakeHub | — | Swahili | Inactive score — hasn't verified peers |

### Admin Account

| Phone | Name | Role | Cooperative |
|-------|------|------|-------------|
| +254700000001 | Admin User | cooperative_admin | LakeHub |

---

## 14. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOCKSENSE ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Mobile     │     │   Web        │     │   Admin      │   │
│  │   App        │     │   Dashboard  │     │   Panel      │   │
│  │  (React +    │     │  (React +    │     │  (React +    │   │
│  │   TypeScript)│     │   TypeScript)│     │   TypeScript)│   │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘   │
│         │                    │                    │            │
│         └────────────────────┼────────────────────┘            │
│                              │                                 │
│                              ▼                                 │
│                    ┌─────────────────┐                         │
│                    │   Nginx         │                         │
│                    │   (Reverse      │                         │
│                    │    Proxy)       │                         │
│                    └────────┬────────┘                         │
│                             │                                  │
│                    ┌────────▼────────┐                         │
│                    │   Go API        │                         │
│                    │   (Gin)         │                         │
│                    │                 │                         │
│                    │  ┌───────────┐  │                         │
│                    │  │ Auth      │  │    ┌──────────────┐    │
│                    │  │ (JWT+OTP) │  │    │  VeChain     │    │
│                    │  └───────────┘  │    │  (Blockchain)│    │
│                    │  ┌───────────┐  │    └──────────────┘    │
│                    │  │ Emissions │  │                         │
│                    │  │ Engine    │  │                         │
│                    │  └───────────┘  │                         │
│                    │  ┌───────────┐  │                         │
│                    │  │ Verifi-   │  │                         │
│                    │  │ cation    │  │                         │
│                    │  └───────────┘  │                         │
│                    │  ┌───────────┐  │                         │
│                    │  │ Recommend-│  │                         │
│                    │  │ ations    │  │                         │
│                    │  └───────────┘  │                         │
│                    └────────┬────────┘                         │
│                             │                                  │
│                    ┌────────▼────────┐                         │
│                    │   PostgreSQL    │                         │
│                    │   (Database)    │                         │
│                    └─────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build -d` | Start full stack |
| `docker compose down` | Stop (keep data) |
| `docker compose down -v` | Stop + delete data |
| `docker compose logs -f` | Watch logs |
| `docker compose logs api \| grep OTP` | Find OTP codes |
| `cd backend/db && ./seed.sh` | Seed test data |
| `cd backend/db && ./seed.sh reset` | Reset + re-seed |

### Useful URLs

| URL | Purpose |
|-----|---------|
| `http://localhost` | Application |
| `http://localhost/health` | Health check |
| `http://localhost:8080` | API (dev mode) |
| `http://localhost:5173` | Frontend (dev mode) |

---

*Document generated for FlockSense — Peer-Verified Sustainability Platform for Kenyan Livestock Farmers*