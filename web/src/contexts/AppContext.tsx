// src/contexts/AppContext.tsx
// Real API-connected context — fetches farmer profile, holdings, entries, verifications from Go backend.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { api, ApiRequestError } from '../services/api';
import type { Farmer, Holding, PaginatedResponse, PendingVerification, Entry } from '../types';

export type TrendPoint = { month: string; farm: number };

type AppState = {
  farmer: Farmer | null;
  holdings: Holding[];
  verifications: PendingVerification[];
  latestEntry: Entry | null;
  primaryHolding: Holding | null;
  trendData: TrendPoint[];
  loading: boolean;
  error: string | null;
};

type AppContextValue = AppState & {
  refresh: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

/** Build a monthly trend array from a list of entries (newest-last). */
function buildTrend(entries: Entry[]): TrendPoint[] {
  if (entries.length === 0) return [];
  // Group entries by "Mon YYYY" label, accumulate tCO₂e per group
  const byMonth = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.period_end);
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    byMonth.set(label, (byMonth.get(label) ?? 0) + e.estimated_co2e_kg / 1000);
  }
  // Sort chronologically (the map preserves insertion order by period_end asc)
  return Array.from(byMonth.entries()).map(([month, farm]) => ({
    month,
    farm: parseFloat(farm.toFixed(2)),
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    farmer: null,
    holdings: [],
    verifications: [],
    latestEntry: null,
    primaryHolding: null,
    trendData: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // ── Correct endpoints from Go server.go ──
      // GET /farmers/me            — farmer profile
      // GET /holdings              — all holdings for this farmer
      // GET /verifications/pending — entries awaiting this farmer's verification
      const [farmerRes, holdingsRes, verifyRes, entriesRes] = await Promise.allSettled([
        api.get<Farmer>('/farmers/me'),
        api.get<PaginatedResponse<Holding>>('/holdings'),
        api.get<PaginatedResponse<PendingVerification>>('/verifications/pending'),
        api.get<PaginatedResponse<Entry>>('/entries'),
      ]);

      const farmer        = farmerRes.status    === 'fulfilled' ? farmerRes.value      : null;
      const holdings      = holdingsRes.status  === 'fulfilled' ? holdingsRes.value.data : [];
      const verifications = verifyRes.status    === 'fulfilled' ? verifyRes.value.data  : [];
      const entries       = entriesRes.status   === 'fulfilled' ? entriesRes.value.data : [];

      const sortedEntries = [...entries].sort(
        (a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime(),
      );
      const latestEntry = sortedEntries.at(-1) ?? null;
      const primaryHolding = latestEntry
        ? holdings.find((holding) => holding.holding_id === latestEntry.holding_id) ?? holdings[0] ?? null
        : holdings[0] ?? null;
      const trendData = buildTrend(sortedEntries);

      setState({ farmer, holdings, verifications, latestEntry, primaryHolding, trendData, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiRequestError
        ? err.message
        : 'Failed to load data. Check your connection and make sure the backend is running.';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo<AppContextValue>(() => ({ ...state, refresh: load }), [state, load]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
