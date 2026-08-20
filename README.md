# FlockSense

**Peer-verified carbon & sustainability scoring for Kenya's livestock SMEs.**

Built for the Zone01 Kisumu GreenTech Hackathon 2026 — Track 3: Carbon Footprint & Sustainability Reporting for SMEs.

---

## The Problem

Livestock farming — poultry, dairy, goats, and other small-scale operations — is one of Kenya's fastest-growing agribusiness sectors, but most small and medium livestock SMEs have no visibility into their environmental footprint. Feed sourcing, energy use for lighting, cooling, or milking equipment, water consumption, and manure/waste handling all generate measurable emissions — yet farmers have no accessible way to quantify this or identify where to improve.

This creates two compounding problems:

1. **Farmers can't act on what they can't see.** Without footprint visibility, there's no way to know whether switching manure handling methods, adopting solar power, or changing feed practices would actually reduce impact.
2. **Farmers are locked out of money that's meant for them.** SACCOs and development finance institutions have real, growing green-lending portfolios — the Kenya Development Corporation has mobilised roughly $42 million for green MSME investment and financed over 41,000 businesses through co-ops under its SAFER project, and Stima SACCO alone has Kes 100 million earmarked for green business loans. But this capital can't reach most livestock SMEs because they have no bank statements, formal receipts, or utility accounts to prove sustainable practice with. Every existing carbon tool (Greenly, Seedling, Normative) assumes a level of formal record-keeping this segment simply doesn't have.

The core issue isn't that carbon can't be calculated — it's that the underlying data can't be trusted or verified for a segment with no paper trail.

## How Might We

How might we build an accessible digital tool that helps livestock SMEs measure their carbon footprint, understand where their emissions come from, and take practical, low-cost steps to reduce their environmental impact — while positioning them to participate in emerging sustainability reporting and green financing opportunities?

## Who Is Affected

- Small and medium livestock farms (poultry, dairy, goats, and similar operations) with no formal sustainability reporting or footprint visibility
- Livestock cooperatives and farmer associations that need aggregated data to pursue green financing or buyer partnerships on behalf of members
- Buyers, exporters, and lenders who require basic ESG evidence before offering premium contracts or sustainability-linked financing

## The Solution

FlockSense is a mobile-first sustainability platform built for livestock SMEs. Farmers log simple production data; the app converts it into a footprint estimate, a plain-language A–E sustainability score, and practical reduction tips — and instead of asking farmers for paperwork they don't have, plausibility is confirmed by people who already know the farm well: fellow cooperative or farmer-group members.

**In one line:** we help livestock farmers prove they're sustainable, without needing to keep formal books — so they can access green financing and better markets that already exist but currently can't reach them.

## How It Works

### 1. Self-report (farmer, ~1 minute per entry)
The farmer logs simple production data via the app:
- Herd/flock size and type (poultry, dairy, goats, etc.)
- Feed type and quantity
- Energy source (grid, solar, diesel) and rough usage
- Water consumption
- Waste/manure handling method

### 2. Automated carbon calculation (no human input required)
Reported figures run through a rule-based calculator using published, species-specific emission factors, producing an estimated CO2e per animal and per kg of output. This is standard carbon accounting — explainable and defensible to judges, not a black box.

### 3. Peer verification (the trust layer)
Fellow members of the farmer's cooperative or farmer group — who already see the farm's operations regularly — confirm that reported figures look plausible, the same role a receipt or utility bill would normally play. This replaces paperwork with social accountability:

- **Multiple independent verifiers required** (2–3, not one) before a data point counts as confirmed
- **Reciprocity is structural**: a farmer's own score doesn't activate unless they've also verified others — no free-riding
- **Verifiers have skin in the game**: attesting to fraudulent data affects a verifier's own standing
- **Anomaly flagging**: the fraud incentive here runs toward under-reporting (to look "greener"), so implausibly low reported consumption for a given herd size gets auto-flagged for closer review rather than auto-approved
- Framed honestly as **tamper-resistant, not tamper-proof** — the goal is making dishonesty higher-effort than honest reporting, same principle underlying SACCO group-guarantee lending today

### 4. Score, benchmarking, and recommendations
- **A–E sustainability scorecard** — an at-a-glance rating derived from the footprint calculation
- **Peer/regional benchmarking** — a farm's footprint per animal compared against cooperative and regional averages
- **Rule-based recommendation engine** — when a farmer's calculated CO2e or resulting score falls in a high-emission range, the engine surfaces practical, low-cost suggestions tied to the specific input driving that result (e.g. high waste-related emissions → "switching to composted manure disposal could cut emissions by an estimated X%"; high energy-related emissions → "solar water heating could reduce energy-related emissions by an estimated Y%"). Farmers with an already-low footprint see confirmation/maintenance tips instead, so the engine reinforces good practice rather than only flagging problems.

### 5. Verified, shareable output
Once verified, each period's score and underlying data hash is anchored on a blockchain ledger, and an exportable report/QR-linked badge is generated — a tamper-evident credential the farmer can present to a cooperative, buyer, lender, or grant program.

## Why It Matters — For the Farmer

- **Access to below-market lending rates.** Green loan products are currently reachable only by businesses that can prove sustainable practice — something most livestock SMEs have no way to do today.
- **A credit history proxy where none exists.** A verified score building over time becomes a de facto track record for farmers with no formal credit file.
- **Market access.** A shareable sustainability credential gives small producers something concrete to offer buyers, exporters, or premium-market contracts increasingly requiring ESG proof.
- **Practical, actionable guidance** — not just a score, but specific low-cost steps to actually reduce footprint.
- **Zero new admin burden.** No bookkeeping, no accountant — a one-minute log per entry.

## Why It Matters — For Cooperatives, Lenders & Buyers

Livestock cooperatives get aggregated, verifiable data across their membership — useful for pursuing green financing or buyer partnerships on the members' behalf. SACCOs and lenders get a risk signal for a segment they currently can't assess at all. FlockSense is designed as a **supporting input to lending decisions, not a replacement** for existing KYC and group-guarantee processes SACCOs already use.

## Rubric Alignment

| Criterion | Weight | How FlockSense addresses it |
|---|---|---|
| Problem Relevance & Impact | 20% | Targets an under-served, fast-growing agribusiness segment currently excluded from live, funded green-lending pipelines (KDC ~$42M mobilised, Stima SACCO Kes 100M) due to a data-verification gap, not lack of demand |
| Technical Execution | 20% | End-to-end 48-hour build: self-report → rule-based emissions calculator → multi-verifier attestation → scorecard/benchmarking/recommendations → on-chain anchoring → shareable report |
| Innovation & Creativity | 15% | Reframes carbon accounting as a *trust* problem, not a *math* problem — substitutes cooperative peer verification for paperwork the target segment doesn't have |
| Technology Integration | 15% | Mobile-first app, rule-based emissions engine, decision-tree recommendation logic, blockchain anchoring — see Emerging Tech Bonus below |
| Scalability & Feasibility | 15% | Reuses existing livestock cooperative structures for distribution and verification — no new institution required; extends naturally across poultry, dairy, goats, and other livestock segments using the same architecture |
| Presentation & Demo | 10% | Live demo: farmer logs data → cooperative member verifies → scorecard + benchmarking appear → recommendation shown → on-chain proof scanned |
| Team Collaboration | 5% | Clear role split across frontend, backend/scoring logic, blockchain, and pitch |

### Emerging Tech Bonus Category (required minimum: 1)

**Primary: AI & Data Intelligence.** The recommendation engine and benchmarking logic form a lightweight, explainable rule/decision-tree advisory system — achievable within the hackathon timeframe while still qualifying as data-driven intelligence.

**Secondary: Blockchain for Sustainability.** Verified scores and, ideally, the verifier attestation trail itself are anchored on-chain — a functional trust mechanism, not a decorative one.

**To push for the +2 "exceptional use" bonus**, go beyond simple score hashing: anchor the attestation trail (who verified what, and when) on-chain as well, so the chain of trust is independently auditable, not just the final number.

### Bonus Points Plan

- **+2 Emerging Tech (exceptional use):** on-chain attestation trail, not just score hashing
- **+2 Real pilot/partner conversation:** reach out to a specific livestock cooperative in Kisumu County (or LakeHub, as a natural partner) before the pitch — even a short "we're building this, would you pilot it with your members?" conversation counts
- **+1 Offline/low-bandwidth support:** highly relevant given the target users are often on low-end phones with patchy rural connectivity — build the self-report log offline-first (local storage, sync on reconnect) if the team has capacity

### Technology Integration

- **Mobile-first frontend (PWA or React Native/Expo)** — quick, low-friction data entry for farmers
- **Backend (Node.js/Express or Python/FastAPI)** — scoring logic, rules engine, verifier reciprocity checks
- **Rule-based emissions calculator** — explainable, defensible, built on published, species-specific emission factors
- **Decision-tree recommendation engine** — satisfies AI & Data Intelligence bonus
- **Blockchain anchoring** — satisfies Blockchain for Sustainability bonus
- **Offline-first local storage** — if built, doubles as a feasibility strength and the +1 bonus

## Track 3 Expected Output Alignment

| Track 3 expected output | FlockSense feature |
|---|---|
| Carbon footprint calculators | Feed / energy / waste-based CO2e calculator |
| Sustainability scorecards | A–E sustainability rating |
| ESG reporting dashboards | Exportable, shareable sustainability report |
| Emissions reduction recommendation engines | Rule-based recommendation engine |
| Carbon credit tracking systems | Historical, on-chain-anchored footprint log (foundation for future credit tracking) |
| Sustainability benchmarking tools | Peer/regional benchmarking view |

## Tech Stack (48-hour build)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Mobile-first web app (PWA) or React Native/Expo | Farmers need quick, low-friction data entry |
| Backend | Node.js/Express or Python/FastAPI | Fast to stand up, easy to integrate with a rules engine |
| Emissions logic | Rule-based calculator using published, species-specific emission factors (feed, energy, waste) | Explainable and defensible to judges; achievable in 48 hours |
| Verification | Multi-verifier attestation flow with reciprocity gating | Solves the data-trust problem without requiring paperwork |
| Recommendation engine | Decision-tree logic mapped to score thresholds — triggers targeted tips when a category's CO2e is high, confirmation tips when it's already low | Fast to build, qualifies as AI & Data Intelligence bonus |
| Ledger | Hash-anchoring transaction per scoring period | Tamper-evident record; satisfies Blockchain for Sustainability bonus |
| Database | PostgreSQL or Firebase | Stores farmer input history for benchmarking and trend tracking |
| Reporting output | Client-side generated PDF/HTML summary + QR-linked badge | Gives farmers something tangible to share with cooperatives, buyers, or lenders |

## Monetization Potential

- **Freemium subscription** — free basic calculator, paid tier for detailed reporting, trend tracking, and personalized recommendations
- **Cooperative/agrovet licensing** — cooperatives pay for aggregated dashboards covering their member farms
- **Data and insights partnerships** — anonymized regional emissions trends sold to insurers, NGOs, or agriculture agencies
- **Green financing referral** — commission for connecting qualifying farms to sustainability-linked loans or carbon credit programs

## Demo Script

1. Live: a farmer logs a week's herd/feed/energy data (ideally shown working offline, then syncing — hits both Technical Execution and the offline bonus)
2. A fellow cooperative member verifies the entry from their own phone
3. Scorecard (A–E), footprint estimate, and benchmarking view appear
4. Recommendation engine surfaces a concrete reduction tip
5. "Verified" badge with QR code generated
6. Scan the QR to show the on-chain proof, including the attestation trail
7. If a pilot conversation has been secured: mention it explicitly — "we've already spoken with [cooperative/LakeHub] about piloting this with [group]"
8. Close: *"This is loan-readiness in one click for a farmer who's never had a credit file."*

## Impact & Scalability

- Gives livestock SMEs — a fast-growing, currently under-served segment — their first accessible entry point into sustainability reporting
- Creates a pathway to green financing and premium markets previously out of reach
- Works across poultry, dairy, goats, and other livestock segments using the same calculator/scorecard/verification architecture, and extends naturally to other agri-SMEs beyond livestock
- Clear pilot path with LakeHub and livestock cooperatives in Kisumu County

## Next Steps If Incubated

- Validate emission factors with agricultural extension officers and existing research on livestock-sector emissions in Kenya
- Pilot with a livestock cooperative to test the calculator, scorecard, and verification flow against real farm data
- Explore partnerships with green financing providers or carbon credit aggregators to give the sustainability report real financial value
- Extend the verification and scoring architecture to other agri-SME segments

## Roadmap (post-hackathon)

- Reputation decay for verifiers with a pattern of inaccurate attestations
- Direct integration with SACCO/cooperative loan officer dashboards
- Random physical spot-checks for high-value loan applicants
- Reconciliation against formal data sources if/when a farm formalizes

## Team

_Add team member names and roles here._

## License

_Add license here._
