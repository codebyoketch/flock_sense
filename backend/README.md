# FlockSense Backend

Go monolith for the FlockSense sustainability platform. The application is one deployable service with layered packages under `internal/`:

- `handlers`: HTTP input/output
- `services`: business rules and workflows
- `repositories`: PostgreSQL persistence
- `models`: GORM entities
- `middleware`: JWT authorization and token revocation
- `emissions` and `recommendations`: scoring intelligence
- `blockchain`: ledger client interface and development mock

## Run locally

Start PostgreSQL and the API with Docker Compose:

```bash
docker compose up --build
```

The API listens on `http://localhost:8080`.

- `GET /health` checks that the process is running.
- `GET /ready` checks PostgreSQL connectivity.

For local development, `APP_ENV=development` enables a `dev_code` in the OTP request response. Never enable this in production; production requires an SMS provider integration.

## Main API routes

Base path: `/api/v1`

Public authentication:

- `POST /auth/register`
- `POST /auth/login` (legacy phone login)
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/otp/register`
- `POST /auth/refresh`
- `POST /auth/admin/login` (optional cooperative-admin flow)

Farmer JWT routes:

- `POST /auth/logout`
- `GET/PATCH /farmers/me`
- Holding CRUD: `GET/POST /holdings`, `PATCH/DELETE /holdings/:id`
- Entries: `POST/GET /entries`, `POST /entries/sync`, `GET /entries/:entry_id`
- `GET /holdings/:id/entries`
- Verification: `GET /verifications/pending`, `POST /verifications`, `GET /verifications/reciprocity`
- `GET /scores/me`
- `POST /calculations`
- `GET /footprint/me`
- `GET /reports/me`
- `GET /scores/benchmark`

Public sharing:

- `GET /api/v1/badge/:farmer_id`
- `GET /api/v1/ledger/:tx`

All protected routes require `Authorization: Bearer <token>`.

## OTP flow

1. Request a challenge with `{ "phone": "..." }`.
2. Verify with `{ "challenge_id": "...", "phone": "...", "code": "..." }`.
3. Existing farmers receive a JWT from verification.
4. New farmers can use `/auth/otp/register` with `name`, `phone`, `code`, and `challenge_id`.

Challenges are hashed, expire after five minutes, allow five verification attempts, and are limited to five requests per phone per hour.

## Verification

From `backend/`:

```bash
go test ./...
go vet ./...
```

The PostgreSQL integration test is opt-in:

```bash
FLOCKSENSE_INTEGRATION=1 DATABASE_URL="host=localhost user=postgres password=postgres dbname=flocksense port=5432 sslmode=disable" go test ./internal/db
```

The blockchain client is currently a mock VeChain-compatible client for development/demo use. A production chain adapter and SMS provider remain deployment-specific integrations.
