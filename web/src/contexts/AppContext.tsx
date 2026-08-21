// src/contexts/AppContext.tsx
// Real API-connected context — fetches farmer profile, holdings, verifications from Go backend.
import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { api } from '../services/api';
import { ApiRequestError } from '../services/api';
import type { Farmer, Holding, PaginatedResponse, PendingVerification, Entry } from '../types';

type AppState = {
  farmer: Farmer | null;
  holdings: Holding[];
  verifications: PendingVerification[];
  latestEntry: Entry | null;
  primaryHolding: Holding | null;
  loading: boolean;
  error: string | null;
};

type AppContextValue = AppState & {
  refresh: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    farmer: null,
    holdings: [],
    verifications: [],
    latestEntry: null,
    primaryHolding: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [farmerRes, holdingsRes, verifyRes] = await Promise.allSettled([
        api.get<Farmer>('/profile'),
        api.get<PaginatedResponse<Holding>>('/holdings'),
        api.get<PaginatedResponse<PendingVerification>>('/verifications'),
      ]);

      const farmer = farmerRes.status === 'fulfilled' ? farmerRes.value : null;
      const holdings = holdingsRes.status === 'fulfilled' ? holdingsRes.value.data : [];
      const verifications = verifyRes.status === 'fulfilled' ? verifyRes.value.data : [];

      // Fetch latest entry for the primary (first) holding
      let latestEntry: Entry | null = null;
      const primaryHolding = holdings[0] ?? null;
      if (primaryHolding) {
        try {
          const entryRes = await api.get<PaginatedResponse<Entry>>(
            `/holdings/${primaryHolding.holding_id}/entries?page=1&page_size=1`
          );
          latestEntry = entryRes.data[0] ?? null;
        } catch {
          // non-fatal — pages handle the null case
        }
      }

      setState({ farmer, holdings, verifications, latestEntry, primaryHolding, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to load data. Check your connection.';
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
