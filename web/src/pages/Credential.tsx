// src/pages/Credential.tsx
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry } from '../lib/engine';
import { PageTitle, ScoreDial, StatusSeal, ProofChip } from '../components/ProductPrimitives';
import { Link } from 'react-router-dom';

export default function Credential() {
  const { farmer, primaryHolding, latestEntry, loading } = useApp();

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle eyebrow="Ledger credential" title="Your verifiable sustainability proof." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>You need a verified entry to generate a credential.</p>
          <Link to="/calculator" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Log an entry</Link>
        </div>
      </>
    );
  }

  const calc     = calculateFromEntry(latestEntry, primaryHolding.count);
  const verified = latestEntry.status === 'verified';
  const period   = `${new Date(latestEntry.period_start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;

  return (
    <>
      <PageTitle
        eyebrow="Ledger credential"
        title="Your verifiable sustainability proof."
        description="This credential summarises your verified period in a form that cooperatives, buyers, and lenders can read and trust."
      />

      {/* Credential card */}
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <article style={{ background: 'var(--color-primary)', borderRadius: 24, padding: 32, color: '#FDF6EC', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 48px rgba(128,0,32,0.25)' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 20, right: 60, width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(253,246,236,0.55)' }}>FlockSense · Sustainability Credential</p>
              <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>{farmer?.name ?? 'Your Farm'}</h2>
              <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(253,246,236,0.65)' }}>{farmer?.location?.label ?? '—'} · {period}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ScoreDial score={calc.score} grade={calc.grade} verified={verified} compact />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total CO₂e',    value: `${calc.totalTons.toFixed(2)} t` },
              { label: 'Per animal',    value: `${calc.perAnimal.toFixed(1)} kg` },
              { label: 'Benchmark',     value: '−18%' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(253,246,236,0.5)', marginBottom: 6 }}>{label}</p>
                <strong style={{ fontSize: 18, letterSpacing: '-0.03em' }}>{value}</strong>
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
            <StatusSeal verified={verified} confirmations={verified ? 2 : 1} />
            <ProofChip />
          </div>
        </article>

        {/* Share prompt */}
        <div className="card-surface" style={{ marginTop: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(128,0,32,0.08)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>How to share this credential</h3>
              <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                Share a PDF export or screenshot with your cooperative, SACCO, or buyer. The verification status and peer confirmations are embedded in the record.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="ws-btn ws-btn-primary" onClick={() => window.print()}>Download PDF</button>
                {!verified && (
                  <Link to="/verifications" className="ws-btn ws-btn-outline">Get verified first →</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
