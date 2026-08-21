import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiRequestError } from "../services/api";
import { useToast } from "../components/Toast";
import type { Holding, LivestockType, CreateHoldingRequest, PaginatedResponse } from "../types";

const TYPE_LABELS: Record<LivestockType, string> = {
  poultry: "Poultry",
  dairy: "Dairy",
  goats: "Goats",
  other: "Other",
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
    <div className="page">
      <div className="page-header">
        <h1>Your holdings</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add holding"}
        </button>
      </div>

      {showForm && (
        <form className="card form" onSubmit={handleAddHolding}>
          <div className="form-field">
            <label htmlFor="type">Livestock type</label>
            <select id="type" value={newType} onChange={(e) => setNewType(e.target.value as LivestockType)}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="count">Count</label>
            <input
              id="count"
              type="number"
              min={1}
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              placeholder="e.g. 120"
            />
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save holding"}
          </button>
        </form>
      )}

      {loading && <p className="loading">Loading your holdings…</p>}

      {error && !loading && (
        <div className="error-banner">
          {error}{" "}
          <button className="btn-link" onClick={loadHoldings}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && holdings.length === 0 && (
        <div className="empty-state">
          <p>No holdings yet.</p>
          <p>Add your first one to start logging entries and tracking your footprint.</p>
        </div>
      )}

      {!loading && !error && holdings.length > 0 && (
        <ul className="holding-list">
          {holdings.map((h) => (
            <li key={h.holding_id} className="card holding-card">
              <Link to={`/holding/${h.holding_id}`} className="holding-link">
                <span className="badge">{TYPE_LABELS[h.type]}</span>
                <span className="holding-count">{h.count} animals</span>
              </Link>
              <button
                className="btn-link btn-danger"
                onClick={() => handleDelete(h.holding_id)}
                disabled={deletingId === h.holding_id}
              >
                {deletingId === h.holding_id ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
