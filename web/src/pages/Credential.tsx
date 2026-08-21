// src/pages/Credential.tsx
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api, ApiRequestError } from '../services/api';
import { PageTitle, ScoreDial, ProofChip } from '../components/ProductPrimitives';
import { Link } from 'react-router-dom';
import type { BadgeResponse } from '../types';

const scoreByGrade: Record<string, number> = { A: 95, B: 82, C: 70, D: 58, E: 45 };

export default function Credential() {
  const { farmer, loading } = useApp();
  const [badge, setBadge] = useState<BadgeResponse | null>(null);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmer?.farmer_id) {
      setBadgeLoading(false);
      return;
    }
    setBadgeLoading(true);
    setError(null);
    api.get<BadgeResponse>(`/badge/${farmer.farmer_id}`)
      .then(setBadge)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : 'Could not load your credential.'))
      .finally(() => setBadgeLoading(false));
  }, [farmer?.farmer_id]);

  if (loading || badgeLoading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!badge) {
    return (
      <>
        <PageTitle eyebrow="Ledger credential" title="Your verifiable sustainability proof." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {error ?? 'A credential becomes available after your score is verified and anchored to the ledger.'}
          </p>
          <Link to="/verifications" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Review verification status</Link>
        </div>
      </>
    );
  }

  const period = new Date(badge.verified_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <>
      <PageTitle
        eyebrow="Ledger credential"
        title="Your verifiable sustainability proof."
        description="This credential summarises your verified period in a form that cooperatives, buyers, and lenders can read and trust."
      />

      {/* Credential card */}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <article style={{ background: 'var(--color-primary)', borderRadius: 28, padding: '44px 48px', color: '#FDF6EC', position: 'relative', overflow: 'hidden', boxShadow: '0 22px 60px rgba(128,0,32,0.28)' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -70, right: -70, width: 270, height: 270, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 34, right: 96, width: 116, height: 116, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 28, marginBottom: 38 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(253,246,236,0.55)' }}>FlockSense · Sustainability Credential</p>
              <h2 style={{ marginTop: 10, fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em' }}>{badge.farmer_name}</h2>
              <p style={{ marginTop: 6, fontSize: 15, color: 'rgba(253,246,236,0.65)' }}>{typeof farmer?.location === 'string' ? farmer.location : '—'} · {period}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ScoreDial score={scoreByGrade[badge.overall_score] ?? 0} grade={badge.overall_score} verified />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 30 }}>
            {[
              { label: 'Sustainability score', value: badge.overall_score },
              { label: 'Verified', value: period },
              { label: 'Chain', value: badge.chain },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(253,246,236,0.5)', marginBottom: 6 }}>{label}</p>
                <strong style={{ fontSize: 21, letterSpacing: '-0.03em' }}>{value}</strong>
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Peer verified</span>
            <ProofChip />
          </div>
        </article>

        {/* Share prompt */}
        <div className="card-surface" style={{ marginTop: 24, padding: '30px 32px', borderRadius: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <span style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(128,0,32,0.08)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <ShieldCheck size={23} />
            </span>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>How to share this credential</h3>
              <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                This credential is backed by the ledger transaction <strong>{badge.ledger_tx_id}</strong>. Share a PDF export or screenshot with your cooperative, SACCO, or buyer.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="ws-btn ws-btn-primary" onClick={() => window.print()}>Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
