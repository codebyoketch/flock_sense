import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, ApiRequestError } from "../services/api";
import { useToast } from "../components/Toast";
import type { HoldingDetailSummary, Entry, PaginatedResponse, LivestockType } from "../types";

const PAGE_SIZE = 20;

const TYPE_LABELS: Record<LivestockType, string> = {
  poultry: "Poultry",
  dairy: "Dairy",
  goats: "Goats",
  other: "Other",
};

const STATUS_LABELS: Record<Entry["status"], string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  flagged: "Flagged",
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
      const [detail, entryRes] = await Promise.all([
        api.get<HoldingDetailSummary>(`/holdings/${holdingId}`),
        api.get<PaginatedResponse<Entry>>(`/holdings/${holdingId}/entries?page=1&page_size=${PAGE_SIZE}`),
      ]);
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

  if (loading) return <p className="loading">Loading holding…</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!holding) return null;

  return (
    <div className="page">
      <Link to="/holdings" className="btn-link">
        ← Back to holdings
      </Link>

      <div className="page-header">
        <h1>{TYPE_LABELS[holding.type]}</h1>
        {holding.score && <span className="badge score-badge">Score {holding.score}</span>}
      </div>

      <div className="card summary-grid">
        <div>
          <p className="label">Count</p>
          {editingCount ? (
            <form onSubmit={handleUpdateCount} className="inline-form">
              <input type="number" min={1} value={countInput} onChange={(e) => setCountInput(e.target.value)} />
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" className="btn-link" onClick={() => setEditingCount(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <p className="value">
              {holding.count} animals{" "}
              <button className="btn-link" onClick={() => setEditingCount(true)}>
                Edit
              </button>
            </p>
          )}
        </div>
        <div>
          <p className="label">Trend</p>
          <p className="value">{holding.trend ?? "—"}</p>
        </div>
        <div>
          <p className="label">Entries logged</p>
          <p className="value">{holding.entry_count ?? entries.length}</p>
        </div>
        <div>
          <p className="label">Latest entry</p>
          <p className="value">
            {holding.latest_entry_at ? new Date(holding.latest_entry_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <div className="page-header">
        <h2>Entry history</h2>
        <Link to="/log-entry" className="btn btn-primary">
          Log new entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No entries logged for this holding yet.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Est. CO2e (kg)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.entry_id}>
                <td>
                  {entry.period_start} – {entry.period_end}
                </td>
                <td>{entry.estimated_co2e_kg.toFixed(1)}</td>
                <td>
                  <span className={`status status-${entry.status}`}>{STATUS_LABELS[entry.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {entries.length > 0 && entries.length < entriesTotal && (
        <button className="btn-link" onClick={loadMoreEntries} disabled={loadingMore}>
          {loadingMore ? "Loading…" : `Load more (${entries.length} of ${entriesTotal})`}
        </button>
      )}

      <button className="btn-link btn-danger" onClick={handleDelete}>
        Remove this holding
      </button>
    </div>
  );
}
