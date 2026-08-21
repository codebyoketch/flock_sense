import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, ClipboardList, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { api, ApiRequestError } from "../services/api";
import { useToast } from "../components/Toast";
import { PageTitle } from "../components/ProductPrimitives";
import type { Holding, HoldingDetailSummary, Entry, PaginatedResponse, LivestockType } from "../types";

const PAGE_SIZE = 20;

const HOLDING_META: Record<LivestockType, { label: string; icon: string; color: string; background: string }> = {
  poultry: { label: "Poultry", icon: "🐔", color: "#8A4A1E", background: "#FFF2E8" },
  dairy: { label: "Dairy", icon: "🐄", color: "#294A68", background: "#EAF4FB" },
  goats: { label: "Goats", icon: "🐐", color: "#3A6E30", background: "#EEF6E9" },
  other: { label: "Other livestock", icon: "🐾", color: "#6B4D7D", background: "#F5EFF9" },
};

const STATUS_LABELS: Record<Entry["status"], string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  flagged: "Flagged",
};

const STATUS_STYLES: Record<Entry["status"], { color: string; background: string }> = {
  pending_verification: { color: "#7A4200", background: "rgba(255,140,66,0.12)" },
  verified: { color: "#3A6E30", background: "rgba(156,175,136,0.18)" },
  flagged: { color: "#800020", background: "rgba(176,0,32,0.08)" },
};

const TREND_COPY = {
  improving: { label: "Improving", icon: TrendingDown, color: "#3A6E30", background: "rgba(156,175,136,0.15)" },
  flat: { label: "Stable", icon: TrendingUp, color: "#6B5B5B", background: "rgba(107,91,91,0.1)" },
  worsening: { label: "Needs attention", icon: TrendingUp, color: "#7A4200", background: "rgba(255,140,66,0.12)" },
};

export default function HoldingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [holding, setHolding] = useState<HoldingDetailSummary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCount, setEditingCount] = useState(false);
  const [countInput, setCountInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  async function load(holdingId: string) {
    setLoading(true);
    setError(null);
    try {
      const [holdingsRes, entryRes] = await Promise.all([
        api.get<PaginatedResponse<Holding>>("/holdings"),
        api.get<PaginatedResponse<Entry>>(`/holdings/${holdingId}/entries?page=1&page_size=${PAGE_SIZE}`),
      ]);
      const detail = holdingsRes.data.find((item) => item.holding_id === holdingId);
      if (!detail) throw new Error("Holding not found");
      setHolding(detail);
      setCountInput(String(detail.count));
      setEntries(entryRes.data);
      setEntriesPage(entryRes.page);
      setEntriesTotal(entryRes.total);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this holding.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreEntries() {
    if (!id) return;
    setLoadingMore(true);
    try {
      const nextPage = entriesPage + 1;
      const res = await api.get<PaginatedResponse<Entry>>(
        `/holdings/${id}/entries?page=${nextPage}&page_size=${PAGE_SIZE}`
      );
      setEntries((prev) => [...prev, ...res.data]);
      setEntriesPage(res.page);
      setEntriesTotal(res.total);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't load more entries.", "error");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleUpdateCount(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const count = Number(countInput);
    if (!countInput || count <= 0) return;

    setSaving(true);
    try {
      const updated = await api.patch<HoldingDetailSummary>(`/holdings/${id}`, { count });
      setHolding((prev) => (prev ? { ...prev, count: updated.count } : updated));
      setEditingCount(false);
      showToast("Count updated");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't update the count.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Remove this holding? Its entry history stays on record for audit purposes.")) return;
    try {
      await api.delete(`/holdings/${id}`);
      showToast("Holding removed");
      navigate("/holdings");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't remove this holding.");
    }
  }

  if (loading) return <div className="card-surface" style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>Loading holding…</div>;
  if (error) return <div className="card-surface" style={{ padding: 24, color: "var(--color-error)" }}>{error}</div>;
  if (!holding) return null;

  const meta = HOLDING_META[holding.type];
  const trend = holding.trend ? TREND_COPY[holding.trend] : null;
  const TrendIcon = trend?.icon;
  const latestEntryDate = holding.latest_entry_at
    ? new Date(holding.latest_entry_at).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
    : "No entries yet";

  return (
    <>
      <Link to="/holdings" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>
        <ArrowLeft size={15} /> Back to holdings
      </Link>

      <PageTitle
        eyebrow="Holding record"
        title={`${meta.label} holding`}
        description="Track this farm unit’s size, reporting activity, and verification progress in one place."
        actions={<Link to="/log-entry" className="ws-btn ws-btn-primary"><Plus size={15} /> Log an entry</Link>}
      />

      <article className="card-surface" style={{ overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "20px 24px", borderBottom: "1px solid rgba(156,175,136,0.2)", background: "var(--color-background)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 16, background: meta.background, fontSize: 27 }}>{meta.icon}</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>Farm unit</p>
              <h2 style={{ marginTop: 3, fontSize: 20, letterSpacing: "-0.035em" }}>{meta.label}</h2>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {holding.score && <span style={{ borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: "var(--color-primary)", background: "rgba(128,0,32,0.08)" }}>Score {holding.score}</span>}
            {trend && TrendIcon && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: trend.color, background: trend.background }}><TrendIcon size={14} /> {trend.label}</span>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 0 }}>
          <div style={{ padding: "22px 24px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>Animals recorded</p>
            {editingCount ? (
              <form onSubmit={handleUpdateCount} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <input aria-label="Animal count" type="number" min={1} value={countInput} onChange={(e) => setCountInput(e.target.value)} style={{ width: 100, border: "1.5px solid rgba(156,175,136,0.4)", borderRadius: 10, padding: "9px 10px", fontSize: 16, fontWeight: 700, outline: "none" }} />
                <button className="ws-btn ws-btn-primary" style={{ padding: "9px 12px", fontSize: 13 }} type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                <button className="ws-btn ws-btn-outline" style={{ padding: "9px 12px", fontSize: 13 }} type="button" onClick={() => setEditingCount(false)}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 8 }}>
                <strong style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.05em" }}>{holding.count.toLocaleString()}</strong>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>animals</span>
                <button aria-label="Edit animal count" onClick={() => setEditingCount(true)} style={{ width: 30, height: 30, display: "grid", placeItems: "center", border: "none", borderRadius: 9, background: "rgba(128,0,32,0.08)", color: "var(--color-primary)", cursor: "pointer" }}><Pencil size={14} /></button>
              </div>
            )}
          </div>
          {[
            { label: "Entries logged", value: String(holding.entry_count ?? entriesTotal ?? entries.length), icon: ClipboardList },
            { label: "Latest entry", value: latestEntryDate, icon: CalendarDays },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ padding: "22px 24px", borderLeft: "1px solid rgba(156,175,136,0.2)" }}>
              <Icon size={16} style={{ color: "var(--color-secondary)" }} />
              <p style={{ marginTop: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>{label}</p>
              <strong style={{ display: "block", marginTop: 7, fontSize: 15, lineHeight: 1.35 }}>{value}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="card-surface" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "20px 24px", borderBottom: "1px solid rgba(156,175,136,0.2)" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>Activity log</p>
            <h2 style={{ marginTop: 4, fontSize: 18, letterSpacing: "-0.03em" }}>Entry history</h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)" }}>{entriesTotal} total {entriesTotal === 1 ? "entry" : "entries"}</span>
        </div>

        {entries.length === 0 ? (
          <div style={{ padding: "42px 28px", textAlign: "center" }}>
            <ClipboardList size={30} style={{ color: "var(--color-secondary)" }} />
            <h3 style={{ marginTop: 12, fontSize: 16 }}>No entries logged yet</h3>
            <p style={{ maxWidth: 390, margin: "8px auto 0", fontSize: 13, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>Log the first reporting period to build this holding’s sustainability record.</p>
            <Link to="/log-entry" className="ws-btn ws-btn-primary" style={{ marginTop: 18 }}><Plus size={15} /> Log first entry</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(253,246,236,0.65)" }}>
                  {["Reporting period", "Estimated CO₂e", "Verification"].map((heading) => <th key={heading} style={{ padding: "12px 24px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-secondary)" }}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const status = STATUS_STYLES[entry.status];
                  return (
                    <tr key={entry.entry_id} style={{ borderTop: "1px solid rgba(156,175,136,0.16)" }}>
                      <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600 }}>{new Date(entry.period_start).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })} <span style={{ color: "var(--color-text-secondary)" }}>to</span> {new Date(entry.period_end).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700 }}>{entry.estimated_co2e_kg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>kg</span></td>
                      <td style={{ padding: "16px 24px" }}><span style={{ display: "inline-flex", borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: status.color, background: status.background }}>{STATUS_LABELS[entry.status]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {entries.length > 0 && entries.length < entriesTotal && (
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(156,175,136,0.16)" }}>
            <button className="ws-btn ws-btn-outline" onClick={loadMoreEntries} disabled={loadingMore}>{loadingMore ? "Loading…" : `Load more entries (${entries.length} of ${entriesTotal})`} <ArrowUpRight size={14} /></button>
          </div>
        )}
      </article>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleDelete} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: "var(--color-error)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Trash2 size={15} /> Remove this holding</button>
      </div>
    </>
  );
}
