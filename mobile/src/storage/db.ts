import * as SQLite from "expo-sqlite";

// Single shared connection. expo-sqlite (v14+) uses the async API.
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("flocksense.db");
    await migrate(dbInstance);
  }
  return dbInstance;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS holdings_cache (
      holding_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      count INTEGER NOT NULL,
      score TEXT,
      trend TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entries (
      client_id TEXT PRIMARY KEY,
      entry_id TEXT,
      holding_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      estimated_co2e_kg REAL,
      status TEXT NOT NULL DEFAULT 'queued',
      created_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_entries_status ON entries (status);
    CREATE INDEX IF NOT EXISTS idx_entries_holding ON entries (holding_id);
  `);
}

/** Wipes all local tables. Used on logout so the next farmer doesn't inherit cached data. */
export async function resetLocalDb() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM entries;
    DELETE FROM holdings_cache;
  `);
}
