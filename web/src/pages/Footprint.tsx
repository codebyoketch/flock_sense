// src/pages/Footprint.tsx
import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry } from '../lib/engine';
import { api, ApiRequestError } from '../services/api';
import { PageTitle } from '../components/ProductPrimitives';
import { EmissionsDonut, FootprintTrend } from '../components/Charts';
import { Link } from 'react-router-dom';
import type { FootprintResponse } from '../types';

export default function Footprint() {
  const { farmer, primaryHolding, latestEntry, trendData, loading } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [footprint, setFootprint] = useState<FootprintResponse | null>(null);
  const [footprintError, setFootprintError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmer) return;
    api.get<FootprintResponse>('/footprint/me')
      .then(setFootprint)
      .catch((err) => setFootprintError(err instanceof ApiRequestError ? err.message : 'Could not load your full footprint.'));
  }, [farmer]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle eyebrow="My footprint" title="Where your footprint comes from." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Log an entry first to see your footprint breakdown.</p>
          <Link to="/calculator" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Open calculator</Link>
        </div>
      </>
    );
  }

  const calc = calculateFromEntry(latestEntry, primaryHolding.count, primaryHolding.type);
  const activeBreakdown = selected
    ? calc.breakdown.find(b => b.name === selected) ?? calc.breakdown[0]
    : calc.breakdown[0];
  const total = calc.breakdown.reduce((s, b) => s + b.value, 0);

  return (
    <>
      <PageTitle
        eyebrow="My footprint"
        title="Where your footprint comes from."
        description="A transparent breakdown for the latest reporting period. Select a category to see what is driving it."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut card */}
        <article className="card-surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Estimated emissions</p>
              <h2 style={{ marginTop: 4, fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em' }}>
                {((footprint?.total_co2e_kg ?? latestEntry.estimated_co2e_kg) / 1000).toFixed(2)} <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>tCO₂e</span>
              </h2>
            </div>
            <span style={{ background: 'rgba(156,175,136,0.15)', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3a6e30' }}>Estimate</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <EmissionsDonut data={calc.breakdown} selected={selected ?? undefined} onSelect={setSelected} />
          </div>
        </article>

        {/* Selected contributor */}
        <article className="card-surface" style={{ overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid rgba(156,175,136,0.2)', background: 'var(--color-background)', padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Selected contributor</p>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em' }}>{activeBreakdown.name}</h2>
              <span style={{ fontSize: 18, fontWeight: 700, color: activeBreakdown.color }}>
                {Math.round((activeBreakdown.value / total) * 100)}%
              </span>
            </div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(248,250,245,1)', border: '1px solid rgba(156,175,136,0.25)', borderRadius: 12, padding: '14px 16px' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: activeBreakdown.color, flexShrink: 0, display: 'block' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{Math.round(activeBreakdown.value).toLocaleString()} kg CO₂e estimated</p>
                <p style={{ marginTop: 3, fontSize: 12, color: 'var(--color-text-secondary)' }}>{activeBreakdown.detail}</p>
              </div>
            </div>
            <h3 style={{ marginTop: 24, fontSize: 13, fontWeight: 700 }}>Reduction opportunity</h3>
            <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              {activeBreakdown.name === 'Waste'
                ? 'Changing from open disposal to composting is the most practical reduction path shown by this entry.'
                : activeBreakdown.name === 'Energy'
                ? 'Review whether renewable energy or more efficient equipment could lower this share.'
                : 'Track this input consistently — the strongest decisions come from repeated, peer-confirmed logs.'}
            </p>
            <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Prototype methodology: converts self-reported activity data using simplified factors. Useful for comparison, not formal certification.
            </p>
          </div>
        </article>
      </div>

      {/* Trend */}
      <article className="card-surface" style={{ padding: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Trend</p>
        <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>Your footprint is moving in the right direction.</h2>
        <div style={{ marginTop: 16 }}><FootprintTrend data={trendData.length >= 2 ? trendData : undefined} /></div>
        {footprintError && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-error, #B00020)' }}>{footprintError}</p>}
      </article>
    </>
  );
}
