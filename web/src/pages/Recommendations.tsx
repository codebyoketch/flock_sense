// src/pages/Recommendations.tsx
import { AlertTriangle, CheckCircle2, CircleDollarSign, TimerReset } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry, getRecommendation } from '../lib/engine';
import { PageTitle, RecommendationCard } from '../components/ProductPrimitives';
import { Link } from 'react-router-dom';

const stepCards = [
  { title: 'Start composting',     text: 'Ask the cooperative about a shared composting approach.',          status: 'Highest impact' },
  { title: 'Watch energy use',     text: 'Track lighting and water-heating hours for two weeks.',            status: 'Track next' },
  { title: 'Keep the record',      text: 'A verified trend is more useful than a single strong month.',      status: 'Build trust' },
];

export default function Recommendations() {
  const { primaryHolding, latestEntry, loading } = useApp();

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle eyebrow="Explainable recommendations" title="Improve the part of the footprint that matters most." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Log an entry first to receive recommendations.</p>
          <Link to="/calculator" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Open calculator</Link>
        </div>
      </>
    );
  }

  const calc = calculateFromEntry(latestEntry, primaryHolding.count);
  const rec  = getRecommendation(calc, latestEntry.waste_handling, latestEntry.energy.source);

  const decisionTrail = [
    { icon: AlertTriangle,      title: 'Largest contributor',    text: `${calc.highestCategory.name} is ${Math.round((calc.highestCategory.value / calc.totalKg) * 100)}% of the estimated footprint.` },
    { icon: TimerReset,         title: 'Practical timing',       text: 'This action can be discussed with a cooperative group before your next reporting period.' },
    { icon: CircleDollarSign,   title: 'Finance-ready signal',   text: 'A documented improvement creates a stronger verified record over time.' },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Explainable recommendations"
        title="Improve the part of the footprint that matters most."
        description="FlockSense uses transparent rules, not a black-box AI. The recommendation follows the largest calculated contributor in your latest farm log."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 20, marginBottom: 20 }}>
        <RecommendationCard {...rec} />

        <article className="card-surface" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Why this surfaced</p>
          <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>Decision trail</h2>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {decisionTrail.map(({ icon: Icon, title, text }) => (
              <div key={title} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(128,0,32,0.08)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <Icon size={15} />
                </span>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700 }}>{title}</h3>
                  <p style={{ marginTop: 3, fontSize: 12, lineHeight: 1.55, color: 'var(--color-text-secondary)' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {stepCards.map((item, idx) => (
          <article key={item.title} className="card-surface" style={{ padding: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--color-secondary)' }}>0{idx + 1}</span>
            <h3 style={{ marginTop: 20, fontSize: 15, fontWeight: 700 }}>{item.title}</h3>
            <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{item.text}</p>
            <p style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#3a6e30' }}>
              <CheckCircle2 size={13} />{item.status}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
