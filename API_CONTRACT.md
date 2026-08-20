# FlockSense — API Contract

Base URL: `/api/v1`
Format: JSON over HTTPS
Auth: Bearer JWT in `Authorization: Bearer <token>` header, unless marked **Public**

---

## Conventions

**Standard error shape**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "count must be greater than 0",
    "field": "count"
  }
}
```

**Pagination** (list endpoints)
Query params: `?page=1&page_size=20`
Response wrapper:
```json
{
  "data": [ /* items */ ],
  "page": 1,
  "page_size": 20,
  "total": 143
}
```

**Roles**
- `farmer` — mobile app user, scoped to their own farmer_id
- `cooperative_admin` — web dashboard user, scoped to their cooperative_id
- Backend middleware enforces scope on every request; a farmer token cannot read another farmer's data, and a cooperative_admin token cannot read farmers outside their cooperative.

**Livestock type enum**
`poultry | dairy | goats | other` (extensible — matches `docs/emission-factors.md`)

---

## 1. Auth

### POST `/auth/register` — Public
Farmer self-registration (mobile).
```json
// Request
{
  "phone": "+254712345678",
  "name": "Jane Wanjiru",
  "cooperative_id": "coop_001",
  "location": { "lat": -0.0917, "lng": 34.7680, "label": "Kisumu County" }
}
```
```json
// 201 Response
{
  "farmer_id": "frm_8f2a",
  "token": "eyJ...",
  "expires_at": "2026-09-19T00:00:00Z"
}
```

### POST `/auth/login` — Public
Phone-based OTP login (mobile, farmers).
```json
// Request (step 1: request OTP)
{ "phone": "+254712345678" }
// 200 Response
{ "otp_sent": true, "expires_in_seconds": 300 }
```
```json
// Request (step 2: verify OTP)
{ "phone": "+254712345678", "otp": "482913" }
// 200 Response
{ "farmer_id": "frm_8f2a", "token": "eyJ...", "expires_at": "..." }
```

### POST `/auth/admin/login` — Public
Cooperative admin login (web dashboard), email/password.
```json
// Request
{ "email": "admin@lakehub-coop.org", "password": "..." }
// 200 Response
{
  "user_id": "usr_112",
  "cooperative_id": "coop_001",
  "role": "cooperative_admin",
  "token": "eyJ...",
  "expires_at": "..."
}
```

### POST `/auth/refresh`
```json
// Request
{ "refresh_token": "..." }
// 200 Response
{ "token": "eyJ...", "expires_at": "..." }
```

### POST `/auth/logout`
`204 No Content`

---

## 2. Farmers

### GET `/farmers/me`
Role: `farmer`. Returns the caller's own profile.
```json
// 200 Response
{
  "farmer_id": "frm_8f2a",
  "name": "Jane Wanjiru",
  "phone": "+254712345678",
  "cooperative_id": "coop_001",
  "cooperative_name": "LakeHub Farmers Coop",
  "location": { "lat": -0.0917, "lng": 34.7680, "label": "Kisumu County" },
  "language": "sw",
  "created_at": "2026-01-14T09:00:00Z"
}
```

### PATCH `/farmers/me`
Role: `farmer`. Partial update (name, location, language).

### GET `/farmers`
Role: `cooperative_admin`. Web Farmers list page. Scoped to caller's cooperative.
Query params: `?search=&sort=score_desc&page=1`
```json
// 200 Response
{
  "data": [
    {
      "farmer_id": "frm_8f2a",
      "name": "Jane Wanjiru",
      "cooperative_name": "LakeHub Farmers Coop",
      "holdings_summary": ["poultry", "dairy"],
      "overall_score": "B",
      "last_entry_at": "2026-08-14T10:00:00Z"
    }
  ],
  "page": 1, "page_size": 20, "total": 143
}
```

### GET `/farmers/:farmer_id`
Role: `cooperative_admin`. Web Farmer Detail page.
```json
// 200 Response
{
  "farmer_id": "frm_8f2a",
  "name": "Jane Wanjiru",
  "phone": "+254712345678",
  "cooperative_id": "coop_001",
  "overall_score": "B",
  "holdings": [
    { "holding_id": "hld_01", "type": "poultry", "count": 120, "score": "B", "trend": "improving" },
    { "holding_id": "hld_02", "type": "dairy", "count": 3, "score": "C", "trend": "flat" }
  ]
}
```

---

## 3. Holdings

### GET `/holdings`
Role: `farmer`. Caller's own holdings.
```json
// 200 Response
{
  "data": [
    { "holding_id": "hld_01", "type": "poultry", "count": 120, "created_at": "..." },
    { "holding_id": "hld_02", "type": "dairy", "count": 3, "created_at": "..." }
  ]
}
```

### POST `/holdings`
Role: `farmer`.
```json
// Request
{ "type": "goats", "count": 15 }
// 201 Response
{ "holding_id": "hld_03", "type": "goats", "count": 15, "created_at": "..." }
```

### GET `/holdings/:holding_id`
Detail + summary stats (latest score, entry count).

### PATCH `/holdings/:holding_id`
Update `count` (e.g. herd size changed).

### DELETE `/holdings/:holding_id`
`204 No Content`. Soft-deletes; historical entries remain for audit/ledger integrity.

### GET `/farmers/:farmer_id/holdings`
Role: `cooperative_admin`. Same shape as `/holdings`, used by Farmer Detail page.

---

## 4. Entries

### POST `/entries`
Role: `farmer`. Log a single entry. Supports client-generated `client_id` (UUID) for offline-first idempotency — resubmitting the same `client_id` after sync returns the original record instead of duplicating.
```json
// Request
{
  "client_id": "b3b1f6b0-...-uuid",
  "holding_id": "hld_01",
  "period_start": "2026-08-11",
  "period_end": "2026-08-17",
  "feed": { "type": "commercial_layer_feed", "quantity_kg": 240 },
  "energy": { "source": "grid", "quantity_kwh": 18 },
  "water": { "quantity_liters": 600 },
  "waste_handling": "open_pile"
}
```
```json
// 201 Response
{
  "entry_id": "ent_9931",
  "client_id": "b3b1f6b0-...-uuid",
  "holding_id": "hld_01",
  "status": "pending_verification",
  "estimated_co2e_kg": 84.2,
  "created_at": "..."
}
```

### POST `/entries/sync`
Role: `farmer`. Batch upload of offline-queued entries (array of the same shape as above).
```json
// Request
{ "entries": [ { "client_id": "...", "...": "..." }, { "client_id": "...", "...": "..." } ] }
// 200 Response
{
  "results": [
    { "client_id": "b3b1f6b0-...", "status": "created", "entry_id": "ent_9931" },
    { "client_id": "a1c2...", "status": "duplicate", "entry_id": "ent_9920" }
  ]
}
```

### GET `/entries/:entry_id`
Full entry detail including verification status and any recommendation tied to it.

### GET `/holdings/:holding_id/entries`
Entry history for a holding. Query: `?page=1&page_size=20`

### GET `/entries?farmer_id=me&status=pending_verification`
Role: `farmer`. Caller's own entries awaiting verification (for the Home badge count).

---

## 5. Verification

### GET `/verifications/pending`
Role: `farmer`. Entries from cooperative-linked peers awaiting the caller's verification.
```json
// 200 Response
{
  "data": [
    {
      "entry_id": "ent_9931",
      "farmer_name": "Jane Wanjiru",
      "holding_type": "poultry",
      "period_end": "2026-08-17",
      "estimated_co2e_kg": 84.2,
      "verifications_so_far": 1,
      "verifications_required": 3
    }
  ]
}
```

### POST `/verifications`
Role: `farmer`.
```json
// Request
{ "entry_id": "ent_9931", "verdict": "confirm", "note": "" }
// or
{ "entry_id": "ent_9931", "verdict": "flag", "note": "feed quantity looks too low for 120 birds" }
```
```json
// 201 Response
{
  "verification_id": "ver_552",
  "entry_id": "ent_9931",
  "verdict": "confirm",
  "verifications_so_far": 2,
  "verifications_required": 3,
  "entry_status": "pending_verification"
}
```
Note: once `verifications_so_far == verifications_required` with no flags, the backend transitions the entry to `verified`, recomputes the holding/farmer score, and — if reciprocity conditions are met — queues the ledger anchor job.

### GET `/verifications/reciprocity`
Role: `farmer`. Powers the "verifications given vs owed" indicator.
```json
// 200 Response
{ "given": 6, "owed": 4, "score_active": true }
```
`score_active: false` means the farmer's own score is withheld from external views (badge/benchmarking) until reciprocity is met — internal views still show it with a "not yet shareable" flag.

### GET `/cooperatives/:cooperative_id/verifications`
Role: `cooperative_admin`. Web Verifications page.
Query: `?status=flagged&type=poultry&page=1`
```json
// 200 Response
{
  "data": [
    {
      "entry_id": "ent_9931",
      "farmer_name": "Jane Wanjiru",
      "holding_type": "poultry",
      "status": "flagged",
      "flag_reason": "implausibly low reported consumption for herd size",
      "verifications_so_far": 1,
      "verifications_required": 3
    }
  ]
}
```

---

## 6. Scores & Recommendations

### GET `/scores/me`
Role: `farmer`.
```json
// 200 Response
{
  "farmer_id": "frm_8f2a",
  "overall_score": "B",
  "computed_at": "2026-08-18T00:00:00Z",
  "holdings": [
    {
      "holding_id": "hld_01",
      "type": "poultry",
      "score": "B",
      "trend": "improving",
      "co2e_per_animal_kg": 0.70,
      "top_driver": "waste_handling",
      "recommendation": {
        "title": "Switch to composted manure disposal",
        "body": "Could cut waste-related emissions by an estimated 18% for a flock this size.",
        "category": "waste_handling"
      }
    },
    {
      "holding_id": "hld_02",
      "type": "dairy",
      "score": "C",
      "trend": "flat",
      "co2e_per_animal_kg": 210.4,
      "top_driver": "energy",
      "recommendation": {
        "title": "Solar water heating",
        "body": "Could reduce energy-related emissions by an estimated 12%.",
        "category": "energy"
      }
    }
  ]
}
```
For a holding already in the low-emission range, `recommendation.category` is `"maintenance"` with confirmation-style copy instead of a reduction tip.

### GET `/scores/:farmer_id`
Role: `cooperative_admin`. Same shape, used on Farmer Detail.

### GET `/scores/benchmark`
Role: `farmer` or `cooperative_admin`.
Query: `?type=poultry&region=kisumu_county&farmer_id=frm_8f2a` (farmer_id optional for admin cooperative-wide view)
```json
// 200 Response
{
  "type": "poultry",
  "region": "kisumu_county",
  "farmer_co2e_per_animal_kg": 0.70,
  "regional_avg_co2e_per_animal_kg": 0.85,
  "cooperative_avg_co2e_per_animal_kg": 0.79,
  "percentile": 62
}
```

### GET `/cooperatives/:cooperative_id/scores`
Role: `cooperative_admin`. Web Dashboard page — aggregate + trend + by-type breakdown.
```json
// 200 Response
{
  "cooperative_avg_score": "B",
  "trend": [
    { "period": "2026-06", "avg_score_numeric": 3.1 },
    { "period": "2026-07", "avg_score_numeric": 3.4 },
    { "period": "2026-08", "avg_score_numeric": 3.6 }
  ],
  "by_type": [
    { "type": "poultry", "avg_score": "B", "member_count": 58 },
    { "type": "dairy", "avg_score": "C", "member_count": 41 }
  ],
  "alerts": [
    { "entry_id": "ent_9931", "farmer_name": "Jane Wanjiru", "reason": "flagged: implausibly low consumption" }
  ]
}
```

---

## 7. Ledger & Badge

### GET `/badge/:farmer_id` — Public
Data for the shareable Badge page / QR target.
```json
// 200 Response
{
  "farmer_name": "Jane Wanjiru",
  "cooperative_name": "LakeHub Farmers Coop",
  "overall_score": "B",
  "verified_at": "2026-08-18T00:00:00Z",
  "holdings_breakdown": [
    { "type": "poultry", "score": "B" },
    { "type": "dairy", "score": "C" }
  ],
  "ledger_tx_id": "0x7ab...",
  "chain": "vechain"
}
```
Only populated once `reciprocity.score_active == true` for that farmer; otherwise returns `404` with `code: "SCORE_NOT_YET_SHAREABLE"`.

### GET `/ledger/:tx_id` — Public
Raw on-chain proof lookup (what the QR scan resolves to for the "exceptional use" bonus — the attestation trail, not just the score hash).
```json
// 200 Response
{
  "tx_id": "0x7ab...",
  "anchored_at": "2026-08-18T00:05:00Z",
  "score_hash": "sha256:9f2a...",
  "attestation_trail": [
    { "verifier_id_hash": "sha256:aa11...", "entry_id": "ent_9931", "verdict": "confirm", "timestamp": "..." },
    { "verifier_id_hash": "sha256:bb22...", "entry_id": "ent_9931", "verdict": "confirm", "timestamp": "..." }
  ]
}
```
Verifier identities are hashed in the public payload — auditable without exposing individual farmers' identities publicly.

### POST `/ledger/anchor` — Internal
Not called by clients directly; triggered server-side once an entry reaches required verifications and reciprocity is satisfied. Included here for completeness of the backend contract (`internal/blockchain/`).

---

## 8. Cooperatives

### GET `/cooperatives/:cooperative_id`
Role: `cooperative_admin` or `farmer` (own cooperative only).
```json
// 200 Response
{ "cooperative_id": "coop_001", "name": "LakeHub Farmers Coop", "region": "kisumu_county", "member_count": 143 }
```

---

## Status Codes Reference

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete/logout) |
| 400 | Validation error |
| 401 | Missing/invalid/expired token |
| 403 | Valid token, wrong scope (e.g. farmer trying to read another farmer's data) |
| 404 | Not found / not yet shareable (score) |
| 409 | Conflict (e.g. duplicate `client_id` mismatch on sync) |
| 422 | Semantically invalid (e.g. flagging your own entry) |
| 500 | Server error |
