import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../services/api";
import type {
  Holding,
  LivestockType,
  EnergySource,
  WasteHandling,
  CreateEntryRequest,
  CreateEntryResponse,
  PaginatedResponse,
} from "../types";

const TYPE_LABELS: Record<LivestockType, string> = {
  poultry: "Poultry",
  dairy: "Dairy",
  goats: "Goats",
  other: "Other",
};

const ENERGY_SOURCES: { value: EnergySource; label: string }[] = [
  { value: "grid", label: "Grid electricity" },
  { value: "solar", label: "Solar" },
  { value: "diesel", label: "Diesel generator" },
  { value: "other", label: "Other" },
];

const WASTE_OPTIONS: { value: WasteHandling; label: string }[] = [
  { value: "open_pile", label: "Open pile" },
  { value: "composted", label: "Composted" },
  { value: "biogas", label: "Biogas digester" },
  { value: "other", label: "Other" },
];

function generateClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function LogEntry() {
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);

  const [holdingId, setHoldingId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [feedType, setFeedType] = useState("");
  const [feedQuantity, setFeedQuantity] = useState("");
  const [energySource, setEnergySource] = useState<EnergySource>("grid");
  const [energyQuantity, setEnergyQuantity] = useState("");
  const [waterQuantity, setWaterQuantity] = useState("");
  const [wasteHandling, setWasteHandling] = useState<WasteHandling>("open_pile");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateEntryResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<Holding>>("/holdings");
        setHoldings(res.data);
        if (res.data.length > 0) setHoldingId(res.data[0].holding_id);
      } catch {
        setError("Couldn't load your holdings. Add a holding before logging an entry.");
      } finally {
        setLoadingHoldings(false);
      }
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!holdingId || !periodStart || !periodEnd || !feedType || !feedQuantity || !energyQuantity || !waterQuantity) {
      setError("Fill in every field before submitting.");
      return;
    }

    const payload: CreateEntryRequest = {
      client_id: generateClientId(),
      holding_id: holdingId,
      period_start: periodStart,
      period_end: periodEnd,
      feed: { type: feedType, quantity_kg: Number(feedQuantity) },
      energy: { source: energySource, quantity_kwh: Number(energyQuantity) },
      water: { quantity_liters: Number(waterQuantity) },
      waste_handling: wasteHandling,
    };

    setSubmitting(true);
    try {
      const res = await api.post<CreateEntryResponse>("/entries", payload);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't submit this entry. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="page">
        <div className="card success-card">
          <h1>Entry logged</h1>
          <p>
            Estimated footprint for this period: <strong>{result.estimated_co2e_kg.toFixed(1)} kg CO2e</strong>
          </p>
          <p className="muted">
            Status: pending verification. Cooperative peers will confirm it before it counts toward your score.
          </p>
          <div className="button-row">
            <button className="btn btn-primary" onClick={() => navigate(`/holding/${result.holding_id}`)}>
              View holding
            </button>
            <button className="btn-link" onClick={() => setResult(null)}>
              Log another entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Log an entry</h1>

      {loadingHoldings && <p className="loading">Loading your holdings…</p>}

      {!loadingHoldings && holdings.length === 0 && (
        <div className="empty-state">
          <p>You need a holding before you can log an entry.</p>
          <button className="btn btn-primary" onClick={() => navigate("/holdings")}>
            Add a holding
          </button>
        </div>
      )}

      {!loadingHoldings && holdings.length > 0 && (
        <form className="card form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="holding">Holding</label>
            <select id="holding" value={holdingId} onChange={(e) => setHoldingId(e.target.value)}>
              {holdings.map((h) => (
                <option key={h.holding_id} value={h.holding_id}>
                  {TYPE_LABELS[h.type]} · {h.count} animals
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="periodStart">Period start</label>
              <input
                id="periodStart"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="periodEnd">Period end</label>
              <input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>

          <h3>Feed</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="feedType">Feed type</label>
              <input
                id="feedType"
                type="text"
                placeholder="e.g. commercial_layer_feed"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="feedQuantity">Quantity (kg)</label>
              <input
                id="feedQuantity"
                type="number"
                min={0}
                value={feedQuantity}
                onChange={(e) => setFeedQuantity(e.target.value)}
              />
            </div>
          </div>

          <h3>Energy</h3>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="energySource">Source</label>
              <select
                id="energySource"
                value={energySource}
                onChange={(e) => setEnergySource(e.target.value as EnergySource)}
              >
                {ENERGY_SOURCES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="energyQuantity">Quantity (kWh)</label>
              <input
                id="energyQuantity"
                type="number"
                min={0}
                value={energyQuantity}
                onChange={(e) => setEnergyQuantity(e.target.value)}
              />
            </div>
          </div>

          <h3>Water</h3>
          <div className="form-field">
            <label htmlFor="waterQuantity">Quantity (liters)</label>
            <input
              id="waterQuantity"
              type="number"
              min={0}
              value={waterQuantity}
              onChange={(e) => setWaterQuantity(e.target.value)}
            />
          </div>

          <h3>Waste handling</h3>
          <div className="form-field">
            <label htmlFor="wasteHandling">Method</label>
            <select
              id="wasteHandling"
              value={wasteHandling}
              onChange={(e) => setWasteHandling(e.target.value as WasteHandling)}
            >
              {WASTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit entry"}
          </button>
        </form>
      )}
    </div>
  );
}
