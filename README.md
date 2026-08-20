# Jirani Score

**Peer-verified sustainability scoring for Kenya's informal SMEs.**

Built for the Zone01 Kisumu GreenTech Hackathon 2026 — Track 3: Carbon Footprint & Sustainability Reporting for SMEs.

---

## The Problem

Kenyan SACCOs and development finance institutions are actively rolling out green lending products for MSMEs. The Kenya Development Corporation has mobilised roughly $42 million for green investment and is positioning SACCOs as the delivery channel, with over 41,000 MSMEs already financed through co-ops under its SAFER project. Stima SACCO alone has earmarked Kes 100 million for green business loans.

That capital exists — but it can't reach most of the market it's meant for. Roughly 83% of Kenya's workforce operates in the informal sector: businesses with no bank statements, no ERP systems, no individual utility accounts, no bookkeeping. Every existing carbon accounting tool (Greenly, Seedling, Normative, Msitu Africa) assumes a level of financial formality these businesses don't have. So the informal SME sector — the majority of the market — is invisible to green finance, not because it isn't sustainable or unsustainable in some measurable way, but because there's no way to measure it at all.

## The Idea

Jirani Score ("jirani" = neighbor, Swahili) lets any SME build a verifiable sustainability score using data it already has access to, verified by the people who already know the business best: nearby businesses, market associations, or existing informal groups — instead of documents the business doesn't have.

**The core insight:** carbon accounting for the informal sector has a data *trust* problem, not a data *math* problem. Solve trust with social verification instead of paperwork, and the math (emissions calculation) is the easy, well-understood part.

## How It Works

### 1. Self-report (SME owner, ~1 minute/week)
The business owner logs simple activity data through the app:
- Amount spent on fuel/charcoal (KES or litres)
- Electricity tokens purchased (KES or units)
- Waste handling method (burned / collected / recycled)
- Any process changes (e.g. switched fuel source)

### 2. Automated carbon conversion (no human input required)
Self-reported figures run through a fixed emission-factor lookup:
- KES of fuel → estimated litres (avg. pump price) → litres × fuel emission factor → kgCO2e
- KES of electricity tokens → estimated kWh → kWh × Kenya grid emission factor → kgCO2e

This step is standard carbon accounting — the same fundamental method used by any commercial carbon calculator, just built for proxy/estimated inputs rather than exact bills.

### 3. Peer verification (trust layer)
Nearby businesses — a next-door stall, a market association, a landlord's other tenants, or an existing chama/group — confirm that a submitted figure is *plausible* for that type of business. This replaces the role a bank statement or utility bill would normally play. Verifiers are not checking the carbon math; they're confirming the raw input wasn't fabricated.

**Anti-gaming design:**
- Requires 2–3 independent verifiers per data point, not one
- Verifiers must themselves be scored users with something to lose if they vouch for fraudulent data
- Reciprocity is structurally required: a business's own score doesn't activate unless it has also verified others — no free-riding
- Anomaly detection flags implausibly low reported consumption (the actual fraud incentive here is under-reporting to look "greener," not over-reporting)
- Sudden unexplained drops in reported consumption just before likely loan application timing are flagged for review

### 4. Verified score, anchored on-chain
Each scoring period, the computed score plus a hash of the underlying data is written to a blockchain ledger — producing a tamper-evident, shareable credential (QR code) the SME can present to a lender, buyer, or grant program without anyone needing to trust a self-reported spreadsheet.

## Why It Matters — For the SME

- **Access to below-market lending rates.** Green loan products (e.g. SACCO green financing at ~11–12% vs. standard informal lending rates) are currently reachable only by businesses that can prove sustainable practice — something most informal SMEs have no way to do.
- **A credit history proxy where none exists.** A verified score accumulating over months becomes a de facto track record for businesses with no formal credit file.
- **Market access.** A shareable sustainability credential gives small suppliers something to offer buyers who increasingly require ESG proof before contracting.
- **Zero new admin burden.** No bookkeeping, no accountant, no ERP — just a one-minute weekly log.

## Why It Matters — For Lenders & Programs

SACCOs, banks, and green-financing programs currently have green capital earmarked for MSMEs but no mechanism to verify environmental practice at the informal-sector level. Jirani Score is a supporting risk signal — not a replacement for KYC or existing group-guarantee mechanisms — that closes this specific data gap.

## Rubric Alignment

| Criterion | Weight | How Jirani Score addresses it |
|---|---|---|
| Problem Relevance & Impact | 20% | Targets the 83% of Kenya's workforce in the informal sector, currently excluded from live, funded green-lending pipelines (KDC ~$42M mobilised, Stima SACCO Kes 100M) purely due to a data-verification gap, not a lack of demand or capital |
| Technical Execution | 20% | Working end-to-end flow in 48 hrs: self-report → automated emission-factor calculation → multi-verifier attestation → on-chain score anchoring → shareable badge |
| Innovation & Creativity | 15% | Reframes carbon accounting as a *trust* problem rather than a *math* problem — substitutes social/peer verification for documents the target segment doesn't have, instead of building yet another calculator |
| Technology Integration | 15% | Mobile-first app (React Native/Expo), backend + emission-factor engine, blockchain anchoring — see Emerging Tech Bonus below for how this exceeds the minimum |
| Scalability & Feasibility | 15% | Reuses existing social infrastructure (market clusters, chamas, tenant groups) as free distribution and verification — no new institution needs to be built; scales cluster by cluster |
| Presentation & Demo | 10% | Live demo: real-time log → live peer verification → score + QR badge → on-chain proof scan (see Demo Script below) |
| Team Collaboration | 5% | Clear role split across frontend, backend/scoring logic, blockchain, and pitch — see Team section |

### Emerging Tech Bonus Category (required minimum: 1)

**Primary: Blockchain for Sustainability.** Every scoring period's score and underlying data hash is anchored on-chain, giving lenders and buyers a tamper-evident record instead of a trust-based self-report — this is a functional use of blockchain (verification/trust), not a decorative one.

**To push for the +2 "exceptional use" bonus**, go beyond simple hash-anchoring:
- Store verifier attestations themselves on-chain (not just the final score), so the *chain of trust* — who verified what, and when — is independently auditable, not just the output number
- Optionally explore a lightweight on-chain reputation trail for verifiers, so a lender or auditor could later see how reliable a given cluster's verification history is

### Bonus Points Plan

- **+2 Emerging Tech (exceptional use):** on-chain attestation trail described above, not just score hashing
- **+2 Real pilot/partner conversation:** approach a specific market association, SACCO (e.g. Stima SACCO given its active green loan pilot), or county trade office *before* the pitch and be able to say "we've spoken with X and they're interested in piloting this with Y cluster" — this is worth actively pursuing in the 48 hours, even a short call or message thread counts as a credible starting conversation
- **+1 Offline/low-bandwidth support:** this is highly relevant for the target users (market traders, often on low-end phones/patchy data). Build the self-report log to work offline-first (local storage, sync when connectivity returns) — this is a natural fit since informal SME zones (markets, jua kali sheds) often have unreliable connectivity. If your team has Expo/SQLite experience, this is a realistic 48-hour add given the offline-first patterns used in Saniflow Field.

### Technology Integration — meeting and exceeding the bar

Since Track 3 has no hard minimum tech-count requirement (unlike Track 7), the goal here is depth and coherence rather than checking boxes:
- **Mobile app** — primary interface for self-report and verification
- **Cloud backend** — hosts scoring logic, emission-factor engine, verifier reciprocity checks
- **Blockchain** — trust anchor for the score (satisfies the Emerging Tech requirement)
- **Offline-first local storage** — if built, doubles as both a feasibility strength and the +1 bonus

## Tech Stack (proposed)

| Layer | Approach |
|---|---|
| Frontend | React Native / Expo — mobile-first log + verification flow |
| Backend | Django or NestJS |
| Emission logic | Static JSON lookup table (Kenya grid factor, fuel factors, category-based plausibility ranges) |
| Verification | Multi-verifier attestation flow with reciprocity gating |
| Ledger | Hash-anchoring transaction per scoring period (e.g. VeChain or similar lightweight chain) |
| Output | Score dashboard + shareable QR-linked verified badge |

## Hackathon Track Fit

- **Track 3** — Carbon Footprint & Sustainability Reporting for SMEs (primary)
- **Blockchain for Sustainability** bonus category — immutable score verification
- **AI & Data Intelligence** bonus (stretch) — anomaly detection on reported consumption

## Demo Script

1. Live: a business owner logs a week's activity data (ideally shown working offline, then syncing — hits both Technical Execution and the offline bonus)
2. A neighboring business verifies the entry from their own phone
3. Score computes and displays on the dashboard
4. "Verified" badge with QR code generated
5. Scan the QR to show the on-chain proof — including the attestation trail, not just the final score
6. If a pilot conversation has been secured: mention it explicitly here — "we've already spoken with [SACCO/market association/county office] about piloting this with [cluster]"
7. Close: *"This is loan-readiness in one click for an SME that's never had a credit file."*

## Roadmap (post-hackathon)

- Shared-meter splitting for businesses sharing a single KPLC connection
- Reputation decay for verifiers with a pattern of inaccurate attestations
- Direct integration with SACCO loan officer dashboards
- Random physical spot-checks for high-value loan applicants
- Reconciliation against formal utility data if/when a business formalizes

## Team

_Add team member names and roles here._

## License

LICENSE
