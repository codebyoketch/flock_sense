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

1. Live: a business owner logs a week's activity data
2. A neighboring business verifies the entry from their own phone
3. Score computes and displays on the dashboard
4. "Verified" badge with QR code generated
5. Scan the QR to show the on-chain proof
6. Close: *"This is loan-readiness in one click for an SME that's never had a credit file."*

## Roadmap (post-hackathon)

- Shared-meter splitting for businesses sharing a single KPLC connection
- Reputation decay for verifiers with a pattern of inaccurate attestations
- Direct integration with SACCO loan officer dashboards
- Random physical spot-checks for high-value loan applicants
- Reconciliation against formal utility data if/when a business formalizes

## Team

_Add team member names and roles here._

## License

_Add license here._
