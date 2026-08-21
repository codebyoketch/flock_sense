// src/pages/Benchmark.tsx
import { ArrowDownRight, UsersRound } from 'lucide-react';
import { PageTitle } from '../components/ProductPrimitives';
import { BenchmarkBars, FootprintTrend } from '../components/Charts';

const cooperativeStats = [
  { value: '8.9',  unit: 'kg CO₂e / animal', label: 'Cooperative average' },
  { value: '10.1', unit: 'kg CO₂e / animal', label: 'Regional average' },
  { value: '24',   unit: 'farms',             label: 'Improving this period' },
];

export default function Benchmark() {
  return (
    <>
      <PageTitle
        eyebrow="Sustainability benchmark"
        title="You are 18% below your cooperative average."
        description="Your farm is compared with anonymised, like-for-like peer records to make the number more useful — not to rank farmers publicly."
        actions={
          <select
            aria-label="Benchmark period"
            style={{ borderRadius: 12, border: '1.5px solid rgba(156,175,136,0.4)', background: '#fff', padding: '10px 14px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            <option>Last 6 months</option>
            <option>Last 3 months</option>
            <option>Last 30 days</option>
          </select>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 20, marginBottom: 20 }}>
        {/* Bars */}
        <article className="card-surface" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>CO₂e per animal</p>
          <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>Comparable footprint intensity</h2>
          <div style={{ marginTop: 16 }}><BenchmarkBars /></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, background: 'rgba(156,175,136,0.12)', borderRadius: 12, padding: '12px 14px' }}>
            <ArrowDownRight size={18} style={{ flexShrink: 0, color: '#3a6e30' }} />
            <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: '#214a25' }}>
              At 7.3 kg CO₂e per animal, your farm is 1.6 kg below the cooperative's current average.
            </p>
          </div>
        </article>

        {/* Trend */}
        <article className="card-surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Performance over time</p>
              <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>The gap is widening in your favour.</h2>
            </div>
            <UsersRound size={22} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
          </div>
          <div style={{ marginTop: 16 }}><FootprintTrend /></div>
        </article>
      </div>

      {/* Peer context banner */}
      <article className="card-surface" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr' }}>
          <div style={{ background: 'var(--color-primary)', padding: 24, color: '#FDF6EC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(253,246,236,0.55)' }}>Peer context</p>
            <h2 style={{ marginTop: 8, fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.3 }}>
              Benchmarking builds practical, collective learning.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 24 }}>
            {cooperativeStats.map(({ value, unit, label }) => (
              <div key={label}>
                <strong style={{ fontSize: 24, letterSpacing: '-0.04em' }}>{value}</strong>
                <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>{unit}</span>
                <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
