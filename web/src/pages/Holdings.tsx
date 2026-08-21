import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Boxes, Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../services/api";
import { useToast } from "../components/Toast";
import { PageTitle } from "../components/ProductPrimitives";
import type { Holding, LivestockType, CreateHoldingRequest, PaginatedResponse } from "../types";

const HOLDING_META: Record<LivestockType, { label: string; icon: string; color: string; background: string }> = {
  poultry: { label: "Poultry", icon: "🐔", color: "#8A4A1E", background: "#FFF2E8" },
  dairy: { label: "Dairy", icon: "🐄", color: "#294A68", background: "#EAF4FB" },
  goats: { label: "Goats", icon: "🐐", color: "#3A6E30", background: "#EEF6E9" },
  other: { label: "Other livestock", icon: "🐾", color: "#6B4D7D", background: "#F5EFF9" },
};

export default function Holdings() {
  const { showToast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<LivestockType>("poultry");
  const [newCount, setNewCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const totalAnimals = holdings.reduce((total, holding) => total + holding.count, 0);
  const activeTypes = new Set(holdings.map((holding) => holding.type)).size;

  useEffect(() => {
    loadHoldings();
  }, []);

  async function loadHoldings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse<Holding>>("/holdings");
      setHoldings(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load your holdings. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHolding(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const count = Number(newCount);
    if (!newCount || count <= 0) {
      setFormError("Enter a count greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateHoldingRequest = { type: newType, count };
      const created = await api.post<Holding>("/holdings", payload);
      setHoldings((prev) => [...prev, created]);
      setShowForm(false);
      setNewCount("");
      setNewType("poultry");
      showToast("Holding added");
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Couldn't add this holding. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(holdingId: string) {
    if (!window.confirm("Remove this holding? Its entry history stays on record.")) return;
    setDeletingId(holdingId);
    try {
      await api.delete(`/holdings/${holdingId}`);
      setHoldings((prev) => prev.filter((h) => h.holding_id !== holdingId));
      showToast("Holding removed");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't remove this holding. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="Farm inventory"
        title="Your livestock holdings"
        description="Keep every flock and herd in one place, then log a clear sustainability record for each one."
        actions={<button className="ws-btn ws-btn-primary" onClick={() => setShowForm((shown) => !shown)}><Plus size={15} /> {showForm ? "Close form" : "Add holding"}</button>}
      />

      {!loading && !error && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Active holdings", value: String(holdings.length), note: holdings.length === 1 ? "One farm unit tracked" : "Farm units being tracked" },
            { label: "Animals recorded", value: totalAnimals.toLocaleString(), note: "Across all active holdings" },
            { label: "Livestock types", value: String(activeTypes), note: activeTypes ? "Types in your farm record" : "Add your first farm unit" },
          ].map(({ label, value, note }) => (
            <article key={label} className="card-surface" style={{ padding: "19px 20px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>{label}</p>
              <strong style={{ display: "block", marginTop: 8, fontSize: 29, lineHeight: 1, letterSpacing: "-0.05em", color: "var(--color-text-primary)" }}>{value}</strong>
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>{note}</p>
            </article>
          ))}
        </section>
      )}

      {showForm && (
        <form className="card-surface" onSubmit={handleAddHolding} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", alignItems: "end", gap: 16, padding: 22, marginBottom: 24 }}>
          <div>
            <label htmlFor="type" style={{ display: "block", marginBottom: 7, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-secondary)" }}>Livestock type</label>
            <select id="type" value={newType} onChange={(e) => setNewType(e.target.value as LivestockType)} style={{ width: "100%", border: "1.5px solid rgba(156,175,136,0.35)", borderRadius: 12, padding: "11px 13px", fontSize: 14, background: "#fff" }}>
              {Object.entries(HOLDING_META).map(([value, meta]) => <option key={value} value={value}>{meta.icon} {meta.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="count" style={{ display: "block", marginBottom: 7, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-secondary)" }}>Animals in this holding</label>
            <input id="count" type="number" min={1} value={newCount} onChange={(e) => setNewCount(e.target.value)} placeholder="e.g. 120" style={{ width: "100%", border: "1.5px solid rgba(156,175,136,0.35)", borderRadius: 12, padding: "11px 13px", fontSize: 14 }} />
          </div>
          <button className="ws-btn ws-btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save holding"}</button>
          {formError && <p style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--color-error)" }}>{formError}</p>}
        </form>
      )}

      {loading && <div className="card-surface" style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Loading your holdings…</div>}

      {error && !loading && <div className="card-surface" style={{ padding: 24, color: "var(--color-error)" }}>{error} <button className="ws-btn ws-btn-outline" style={{ marginLeft: 8 }} onClick={loadHoldings}>Retry</button></div>}

      {!loading && !error && holdings.length === 0 && (
        <div className="card-surface" style={{ padding: "48px 32px", textAlign: "center" }}>
          <span style={{ width: 58, height: 58, display: "inline-grid", placeItems: "center", borderRadius: 18, background: "rgba(128,0,32,0.08)", color: "var(--color-primary)" }}><Boxes size={28} /></span>
          <h2 style={{ marginTop: 18, fontSize: 20 }}>Start with your first holding</h2>
          <p style={{ maxWidth: 430, margin: "8px auto 0", fontSize: 14, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>Add a flock, herd, or other farm unit to unlock activity logging, footprint estimates, and peer verification.</p>
          <button className="ws-btn ws-btn-primary" style={{ marginTop: 22 }} onClick={() => setShowForm(true)}><Plus size={15} /> Add a holding</button>
        </div>
      )}

      {!loading && !error && holdings.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {holdings.map((h) => {
            const meta = HOLDING_META[h.type];
            return (
              <article key={h.holding_id} className="card-surface" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 20px 16px" }}>
                  <span style={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: 15, background: meta.background, fontSize: 25 }}>{meta.icon}</span>
                  <span style={{ borderRadius: 999, padding: "6px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: meta.color, background: meta.background }}>{meta.label}</span>
                </div>
                <div style={{ padding: "0 20px 20px" }}>
                  <strong style={{ display: "block", fontSize: 36, lineHeight: 1, letterSpacing: "-0.06em" }}>{h.count.toLocaleString()}</strong>
                  <p style={{ marginTop: 7, fontSize: 13, color: "var(--color-text-secondary)" }}>animals in this holding</p>
                  <p style={{ marginTop: 18, fontSize: 11, color: "var(--color-text-secondary)" }}>Added {new Date(h.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(156,175,136,0.18)", padding: "12px 14px 12px 20px", background: "rgba(253,246,236,0.55)" }}>
                  <Link to={`/holding/${h.holding_id}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>Open holding <ArrowUpRight size={15} /></Link>
                  <button aria-label={`Remove ${meta.label} holding`} onClick={() => handleDelete(h.holding_id)} disabled={deletingId === h.holding_id} style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: "none", borderRadius: 10, background: "transparent", color: "var(--color-error)", cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
