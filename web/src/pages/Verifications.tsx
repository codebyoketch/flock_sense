import { useEffect, useState } from "react";
import { api, ApiRequestError } from "../services/api";
import { useToast } from "../components/Toast";
import type {
  PendingVerification,
  ReciprocityStatus,
  SubmitVerificationRequest,
  SubmitVerificationResponse,
  LivestockType,
  PaginatedResponse,
} from "../types";

const TYPE_LABELS: Record<LivestockType, string> = {
  poultry: "Poultry",
  dairy: "Dairy",
  goats: "Goats",
  other: "Other",
};

const PAGE_SIZE = 20;

export default function Verifications() {
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reciprocity, setReciprocity] = useState<ReciprocityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagNote, setFlagNote] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, reciprocityRes] = await Promise.all([
        api.get<PaginatedResponse<PendingVerification>>(`/verifications/pending?page=1&page_size=${PAGE_SIZE}`),
        api.get<ReciprocityStatus>("/verifications/reciprocity"),
      ]);
      setPending(pendingRes.data);
      setPage(pendingRes.page);
      setTotal(pendingRes.total);
      setReciprocity(reciprocityRes);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load verifications.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get<PaginatedResponse<PendingVerification>>(
        `/verifications/pending?page=${nextPage}&page_size=${PAGE_SIZE}`
      );
      setPending((prev) => [...prev, ...res.data]);
      setPage(res.page);
      setTotal(res.total);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Couldn't load more.", "error");
    } finally {
      setLoadingMore(false);
    }
  }

  async function submit(entryId: string, verdict: "confirm" | "flag", note?: string) {
    setSubmittingId(entryId);
    try {
      const payload: SubmitVerificationRequest = { entry_id: entryId, verdict, note };
      await api.post<SubmitVerificationResponse>("/verifications", payload);
      setPending((prev) => prev.filter((p) => p.entry_id !== entryId));
      setTotal((prev) => Math.max(0, prev - 1));
      setFlaggingId(null);
      setFlagNote("");
      showToast(verdict === "confirm" ? "Verification submitted" : "Entry flagged for review");
      // Reciprocity counts change after any submission — refresh it.
      const r = await api.get<ReciprocityStatus>("/verifications/reciprocity");
      setReciprocity(r);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't submit your verification.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="page">
      <h1>Verify peer entries</h1>
      <p className="muted">
        Confirming a neighbor's entry helps their score go live — and yours needs the same from others.
      </p>

      {reciprocity && (
        <div className={`card reciprocity-banner ${reciprocity.score_active ? "" : "reciprocity-warning"}`}>
          <p>
            <strong>{reciprocity.given}</strong> verifications given · <strong>{reciprocity.owed}</strong> owed
          </p>
          {!reciprocity.score_active && (
            <p className="muted">Your own score won't be shareable externally until you're caught up.</p>
          )}
        </div>
      )}

      {loading && <p className="loading">Loading pending verifications…</p>}

      {error && !loading && (
        <div className="error-banner">
          {error}{" "}
          <button className="btn-link" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && pending.length === 0 && (
        <div className="empty-state">
          <p>Nothing waiting on you right now.</p>
        </div>
      )}

      {!loading && !error && pending.length > 0 && (
        <ul className="verification-list">
          {pending.map((v) => (
            <li key={v.entry_id} className="card verification-card">
              <div className="verification-header">
                <span className="badge">{TYPE_LABELS[v.holding_type]}</span>
                <span className="muted">{v.farmer_name}</span>
              </div>
              <p>
                Period ending {v.period_end} · {v.estimated_co2e_kg.toFixed(1)} kg CO2e
              </p>
              <p className="muted">
                {v.verifications_so_far} of {v.verifications_required} confirmations so far
              </p>

              {flaggingId === v.entry_id ? (
                <div className="inline-form">
                  <textarea
                    placeholder="What looks off?"
                    value={flagNote}
                    onChange={(e) => setFlagNote(e.target.value)}
                  />
                  <div className="button-row">
                    <button
                      className="btn btn-danger"
                      disabled={submittingId === v.entry_id || !flagNote.trim()}
                      onClick={() => submit(v.entry_id, "flag", flagNote.trim())}
                    >
                      Submit flag
                    </button>
                    <button
                      className="btn-link"
                      onClick={() => {
                        setFlaggingId(null);
                        setFlagNote("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="button-row">
                  <button
                    className="btn btn-primary"
                    disabled={submittingId === v.entry_id}
                    onClick={() => submit(v.entry_id, "confirm")}
                  >
                    {submittingId === v.entry_id ? "Submitting…" : "Confirm"}
                  </button>
                  <button className="btn-link btn-danger" onClick={() => setFlaggingId(v.entry_id)}>
                    Flag
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && pending.length < total && (
        <button className="btn-link" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading…" : `Load more (${pending.length} of ${total})`}
        </button>
      )}
    </div>
  );
}
