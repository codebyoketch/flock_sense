#!/usr/bin/env bash
# ============================================================================
# FlockSense — Seed test data into PostgreSQL
# ============================================================================
# Usage:
#   ./seed.sh              Seed data (idempotent — deletes then re-inserts)
#   ./seed.sh reset        Drop all tables, let AutoMigrate recreate, then seed
#
# Environment variables (with defaults):
#   DB_HOST       localhost
#   DB_PORT       5432
#   DB_NAME       flocksense
#   DB_USER       flocksense
#   POSTGRES_PASSWORD  (required for psql auth)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_SQL="$SCRIPT_DIR/seed.sql"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-flocksense}"
DB_USER="${DB_USER:-flocksense}"

PSQL_OPTS=(-h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME")

if [ ! -f "$SEED_SQL" ]; then
  echo "Error: seed.sql not found at $SEED_SQL" >&2
  exit 1
fi

run_psql() {
  if [ -n "${POSTGRES_PASSWORD:-}" ]; then
    PGPASSWORD="$POSTGRES_PASSWORD" psql "${PSQL_OPTS[@]}" "$@"
  else
    psql "${PSQL_OPTS[@]}" "$@"
  fi
}

if [ "${1:-}" = "reset" ]; then
  echo "==> Resetting database (dropping all data)..."
  run_psql -c "
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO \"$DB_USER\";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"$DB_USER\";
  "
  echo "    Schema cleared. Start the API to let AutoMigrate recreate tables:"
  echo "      docker compose -f docker-compose.yml -f docker-compose.dev.yml up api"
  echo ""
  echo "    Then re-run this script to seed:"
  echo "      ./seed.sh"
  echo ""
  exit 0
fi

echo "==> Seeding test data from seed.sql..."
run_psql -f "$SEED_SQL"
echo "    Done. Test data loaded."
echo ""
echo "    Summary:"
echo "      9 farmers  (5 coop_lakehub, 4 coop_central)"
echo "      11 holdings (poultry, dairy, goats)"
echo "      20 entries  (verified, pending, flagged, anomalous)"
echo "      17 verifications"
echo "      5 scores   (grades A through E)"
echo "      5 ledger anchors (mock-vechain)"
