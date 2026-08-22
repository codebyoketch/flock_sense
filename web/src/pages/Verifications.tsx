// src/pages/Verifications.tsx  (rewritten to MVP UX)
import { useState } from 'react';
import { Check, CircleAlert, Flag, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { api, ApiRequestError } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { PageTitle } from '../components/ProductPrimitives';
import type { PendingVerification, SubmitVerificationResponse } from '../types';

export default function Verifications() {
  const { verifications, loading, refresh } = useApp();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, 'confirm' | 'flag'>>({});

  async function submit(entry_id: string, verdict: 'confirm' | 'flag') {
    setSubmitting(entry_id);
    try {
      await api.post<SubmitVerificationResponse>('/verifications', { entry_id, verdict });
      setDone(d => ({ ...d, [entry_id]: verdict }));
      refresh();
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : 'Could not submit verification. Try again.');
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  return (
    <>
      <PageTitle
        eyebrow="Verification centre"
        title="Peer review makes self-reported data more useful."
        description="Cooperative members confirm whether a farm log looks plausible based on their knowledge of that farm. It is tamper-resistant social accountability — not a replacement for KYC."
        actions={
          <button className="ws-btn ws-btn-outline" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {verifications.length === 0 && (
        <div className="card-surface" style={{ padding: 40, textAlign: 'center' }}>
          <ShieldCheck size={40} style={{ color: 'var(--color-primary)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>No pending verifications</h3>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            You're all caught up. New requests will appear here when cooperative members submit entries.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {verifications.map((v: PendingVerification) => {
          const verdict = done[v.entry_id];

          return (
            <article key={v.entry_id} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
              {/* Main card */}
              <div className="card-surface" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid rgba(156,175,136,0.2)', background: 'var(--color-background)', padding: '20px 24px' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Verification request</p>
                    <h2 style={{ marginTop: 4, fontSize: 20, fontWeight: 700, letterSpacing: '-0.035em' }}>{v.farmer_name || 'Cooperative member'}</h2>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      Period ending {new Date(v.period_end).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{ background: 'rgba(255,140,66,0.12)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: '#7a4200' }}>
                    Awaiting your review
                  </span>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
                    Does this submission appear plausible based on your knowledge of this farm's operations?
                  </p>
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      [`${v.estimated_co2e_kg.toFixed(1)} kg`, 'Estimated CO₂e'],
                      [`${v.feed_kg.toLocaleString()} kg`, `Feed · ${v.feed_type}`],
                    ].map(([value, label]) => (
                      <div key={label} style={{ background: 'rgba(156,175,136,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{value}</span>
                        <span style={{ marginTop: 4, display: 'block', fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {verdict === 'flag' && (
                    <div style={{ marginTop: 16, background: 'rgba(176,0,32,0.06)', border: '1px solid rgba(176,0,32,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--color-primary)' }}>
                      <CircleAlert size={14} style={{ display: 'inline', marginRight: 6 }} />
                      Flagged for review. A cooperative lead should compare these figures with typical patterns.
                    </div>
                  )}

                  {!verdict && (
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        className="ws-btn ws-btn-primary"
                        disabled={submitting === v.entry_id}
                        onClick={() => submit(v.entry_id, 'confirm')}
                      >
                        <Check size={14} /> {submitting === v.entry_id ? 'Submitting…' : 'Confirm plausibility'}
                      </button>
                      <button
                        className="ws-btn ws-btn-outline"
                        style={{ color: 'var(--color-primary)', borderColor: 'rgba(176,0,32,0.3)' }}
                        disabled={submitting === v.entry_id}
                        onClick={() => submit(v.entry_id, 'flag')}
                      >
                        <Flag size={14} /> Flag for review
                      </button>
                    </div>
                  )}

                  {verdict && (
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: verdict === 'confirm' ? '#3a6e30' : 'var(--color-primary)' }}>
                      {verdict === 'confirm' ? <Check size={16} /> : <Flag size={16} />}
                      {verdict === 'confirm' ? 'You confirmed this entry.' : 'You flagged this entry for review.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <article className="card-surface" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(156,175,136,0.12)', display: 'grid', placeItems: 'center', color: '#3a6e30' }}>
                      <UsersRound size={18} />
                    </span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-secondary)' }}>Reported inputs</p>
                      <h2 style={{ fontSize: 15, fontWeight: 700 }}>Review context</h2>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      [`${v.energy_kwh.toLocaleString()} kWh`, `${v.energy_source} energy`],
                      [`${v.water_liters.toLocaleString()} L`, 'Water used'],
                      [v.waste_handling.replace('_', ' '), 'Waste handling'],
                    ].map(([value, label]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(156,175,136,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article style={{ background: 'rgba(255,140,66,0.08)', border: '1px solid rgba(255,140,66,0.2)', borderRadius: 20, padding: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#7a4200' }}>Reciprocity</p>
                  <h2 style={{ marginTop: 8, fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.3 }}>Verification has a cost — and a reason to care.</h2>
                  <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: '#7a4200' }}>
                    Members who verify peer logs can have their own records verified in return. Attestations contribute to each verifier's standing.
                  </p>
                </article>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
