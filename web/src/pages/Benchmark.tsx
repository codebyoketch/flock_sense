// src/pages/Benchmark.tsx — live data from GET /scores/benchmark?type=<holding_type>
import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, UsersRound } from 'lucide-react';
import { PageTitle } from '../components/ProductPrimitives';
import { BenchmarkBars, FootprintTrend } from '../components/Charts';
import { useApp } from '../contexts/AppContext';
import { api, ApiRequestError } from '../services/api';
import type { BenchmarkResult } from '../types';

export default function Benchmark() {
  const { primaryHolding, trendData, loading: ctxLoading } = useApp();
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!primaryHolding) return;
    setLoading(true);
    setError(null);
    api.get<BenchmarkResult>(`/scores/benchmark?type=${primaryHolding.type}`)
      .then(setBenchmark)
      .catch(err => setError(err instanceof ApiRequestError ? err.message : 'Could not load benchmark data.'))
      .finally(() => setLoading(false));
  }, [primaryHolding]);

  if (ctxLoading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;
  }

  if (!primaryHolding) {
    return (
      <>
        <PageTitle
          eyebrow="Sustainability benchmark"
          title="Compare your footprint with peers."
          description="Add a holding and log an entry to see how your farm compares with others in your cooperative."
        />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No holdings yet — add one to unlock benchmarking.</p>
        </div>
      </>
    );
  }

  // Derive headline stats from live data (or show placeholder if still loading)
  const farmerVal   = benchmark?.farmer_co2e_per_animal_kg ?? null;
  const regionalVal = benchmark?.regional_avg_co2e_per_animal_kg ?? null;
  const diffPct     = (farmerVal !== null && regionalVal !== null && regionalVal > 0)
    ? Math.round(Math.abs(farmerVal - regionalVal) / regionalVal * 100)
    : null;
  const isBetter    = farmerVal !== null && regionalVal !== null && farmerVal < regionalVal;

  const headlineTitle = diffPct !== null
    ? `You are ${diffPct}% ${isBetter ? 'below' : 'above'} your cooperative average.`
    : loading
    ? 'Calculating your benchmark…'
    : 'Compare your footprint with peers.';

  const barData = benchmark ? [
    { name: 'Your farm',    value: benchmark.farmer_co2e_per_animal_kg,          fill: '#800020' },
    { name: 'Cooperative',  value: benchmark.regional_avg_co2e_per_animal_kg,     fill: '#FF8C42' },
  ] : [];

  const cooperativeStats = benchmark ? [
    { value: `${benchmark.farmer_co2e_per_animal_kg.toFixed(1)}`,   unit: 'kg CO₂e / animal', label: 'Your farm' },
    { value: `${benchmark.regional_avg_co2e_per_animal_kg.toFixed(1)}`, unit: 'kg CO₂e / animal', label: 'Cooperative average' },
    { value: `${benchmark.percentile ?? '—'}`,                        unit: 'percentile',       label: 'Your ranking' },
  ] : [
    { value: '—', unit: 'kg CO₂e / animal', label: 'Your farm' },
    { value: '—', unit: 'kg CO₂e / animal', label: 'Cooperative average' },
    { value: '—', unit: 'percentile',        label: 'Your ranking' },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Sustainability benchmark"
        title={headlineTitle}
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
          <div style={{ marginTop: 16 }}>
            {loading
              ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', paddingTop: 40, textAlign: 'center' }}>Loading benchmark…</p>
              : error
              ? <p style={{ fontSize: 13, color: 'var(--color-error, #B00020)', paddingTop: 20 }}>{error}</p>
              : barData.length > 0
              ? <BenchmarkBars data={barData} />
              : <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', paddingTop: 40, textAlign: 'center' }}>Log entries first to unlock your benchmark.</p>
            }
          </div>
          {benchmark && diffPct !== null && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10, background: isBetter ? 'rgba(156,175,136,0.12)' : 'rgba(255,140,66,0.1)', borderRadius: 12, padding: '12px 14px' }}>
              {isBetter
                ? <ArrowDownRight size={18} style={{ flexShrink: 0, color: '#3a6e30' }} />
                : <ArrowUpRight size={18} style={{ flexShrink: 0, color: '#7a4200' }} />}
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: isBetter ? '#214a25' : '#7a4200' }}>
                At {benchmark.farmer_co2e_per_animal_kg.toFixed(1)} kg CO₂e per animal, your farm is {diffPct}%{' '}
                {isBetter ? 'below' : 'above'} the cooperative's current average.
              </p>
            </div>
          )}
        </article>

        {/* Trend */}
        <article className="card-surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Performance over time</p>
              <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>
                {isBetter ? 'The gap is widening in your favour.' : 'Track your improvement over time.'}
              </h2>
            </div>
            <UsersRound size={22} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
          </div>
          <div style={{ marginTop: 16 }}><FootprintTrend data={trendData.length >= 2 ? trendData : undefined} /></div>
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
