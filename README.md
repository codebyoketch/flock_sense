# FlockSense

FlockSense helps livestock SMEs record farm activity, estimate their carbon footprint, receive practical reduction recommendations, and build peer-verified sustainability credentials.

The production Docker deployment runs three services together:

| Service | Purpose | Publicly exposed |
| --- | --- | --- |
| `web` | React single-page app served by Nginx | Yes — port `80` by default |
| `api` | Go API and application logic | No — available through `/api` on `web` |
| `postgres` | Persistent PostgreSQL database | No |

Nginx serves the frontend and forwards `/api/*` to the API over the internal Docker network. This keeps browser traffic same-origin and does not expose the API or database host ports.

## Run with Docker

### Prerequisites

- Docker Engine 24+ with Docker Compose v2
- Ports `80` (or your chosen `APP_PORT`) available on the host

### Start the full application

1. Create the deployment environment file and replace both placeholder secrets with long, unique values:

   ```bash
   cp .env.example .env
   ```

   You can generate a secret with `openssl rand -hex 32`. Do not use whitespace in `POSTGRES_PASSWORD`.

2. Build and start every service from the repository root:

   ```bash
   docker compose up --build -d
   ```

3. Open `http://localhost` (or `http://localhost:<APP_PORT>` if changed). The health endpoint is available at `http://localhost/health`.

The first start creates the `flocksense-postgres` named volume and the API applies its database schema automatically. To watch startup logs, run:

```bash
docker compose logs -f
```

Stop the stack without deleting data:

```bash
docker compose down
```

`docker compose down -v` also deletes the PostgreSQL volume and therefore all application data; use it only when intentionally resetting an environment.

## Configuration

Docker Compose reads variables from the root `.env` file. The committed [.env.example](.env.example) documents the supported values:

| Variable | Required | Description |
| --- | --- | --- |
| `POSTGRES_DB` | Yes | PostgreSQL database name |
| `POSTGRES_USER` | Yes | PostgreSQL application user |
| `POSTGRES_PASSWORD` | Yes | Strong database password; never commit it |
| `JWT_SECRET` | Yes | Long random secret used to sign access tokens |
| `APP_PORT` | No | Host port for the web application; defaults to `80` |
| `CHAIN` | No | Ledger adapter name; defaults to `mock-vechain` |

`APP_ENV` is fixed to `production` in Compose. In this mode OTP responses never include a development code.

## Production deployment checklist

- Set unique production secrets in `.env`; use a secrets manager or your platform’s protected environment variables where possible.
- Terminate TLS in a load balancer or reverse proxy in front of the `web` service. The bundled Nginx container intentionally serves HTTP only.
- Restrict inbound traffic to `APP_PORT`; do not publish PostgreSQL or the API ports.
- Back up the `flocksense-postgres` volume and test restoration before relying on the deployment.
- Monitor `GET /health` for process liveness and `GET /ready` from the internal API network for database readiness.
- Pin and regularly update container image versions as part of your release process.
- Configure a real SMS provider before enabling OTP registration in a live environment. The present code deliberately suppresses development OTP codes in production but does not include an SMS delivery integration.
- Replace the mock ledger adapter with a configured production chain adapter before presenting ledger records as externally anchored proof.

## Local development

The web app uses Vite’s development proxy so `/api` requests go to `http://localhost:8080`.

```bash
# Terminal 1: database and API with development host ports
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build postgres api

# Terminal 2: frontend
cd web
npm ci
npm run dev
```

The development override exposes the API and PostgreSQL only on the local machine. The standard root Compose configuration is intentionally production-oriented and keeps both services private.

## Seed test data

Populate the database with realistic Kenyan livestock farm data — 9 farmers across 2 cooperatives, 11 holdings, 20 entries, peer verifications, scores (A–E), and mock ledger anchors.

```bash
# From the repo root, with the dev database running:
cd backend/db
export POSTGRES_PASSWORD=your-dev-password

# Seed data (idempotent — safe to run repeatedly)
./seed.sh

# Full reset: drop all tables, let AutoMigrate recreate, then seed
# (restart the API after reset so AutoMigrate recreates the schema)
./seed.sh reset
docker compose -f docker-compose.yml -f docker-compose.dev.yml up api
```

Test accounts (phone → login with OTP in development mode):

| Phone | Farmer | Cooperative | Grade |
| --- | --- | --- | --- |
| +254712345001 | Jane Wanjiru | LakeHub | A |
| +254712345002 | Peter Odhiambo | LakeHub | D |
| +254712345003 | Grace Akinyi | LakeHub | C |
| +254712345004 | David Kamau | Central | B |
| +254712345005 | Mary Njeri | Central | — (pending) |
| +254712345006 | Samuel Mutua | Central | E |
| +254712345007 | Amina Hassan | LakeHub | — (no holdings) |
| +254712345008 | Joseph Kipchoge | Central | — (no entries) |
| +254712345009 | Lucy Wambui | LakeHub | — (inactive) |

## Verification

Run the backend checks from `backend/`:

```bash
go test ./...
go vet ./...
```

Run frontend checks from `web/`:

```bash
npm ci
npm run lint
npm run build
```

## Project structure

- [`web/`](web/) — React/Vite frontend, production Nginx image, and UI source
- [`backend/`](backend/) — Go API, domain services, persistence, and migrations
- [`docker-compose.yml`](docker-compose.yml) — root deployment for web, API, and PostgreSQL
- [`docker-compose.dev.yml`](docker-compose.dev.yml) — local-only API and PostgreSQL port override
- [`API_CONTRACT.md`](API_CONTRACT.md) — API request and response contract

## License

See [LICENSE](LICENSE).
