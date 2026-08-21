// src/pages/Overview.tsx  (replaces Dashboard.tsx)
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, Droplets, Leaf } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry, getRecommendation } from '../lib/engine';
import { PageTitle, MetricCard, ScoreDial, DimensionMeter, RecommendationCard, StatusSeal } from '../components/ProductPrimitives';
import { FootprintTrend } from '../components/Charts';

export default function Overview() {
  const { farmer, primaryHolding, latestEntry, trendData, loading } = useApp();

  const farmerName = farmer?.name?.split(' ')[0] ?? 'Farmer';

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading your dashboard…
      </div>
    );
  }

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle
          eyebrow="Farm overview"
          title={`Good morning, ${farmerName}.`}
          description="Start by adding a holding and logging your first farm entry."
          actions={
            <Link to="/holdings" className="ws-btn ws-btn-primary">
              Add a holding
            </Link>
          }
        />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            No farm data yet. Add a holding, then use the Calculator to log your first entry.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <Link to="/holdings" className="ws-btn ws-btn-primary">Add holding</Link>
            <Link to="/calculator" className="ws-btn ws-btn-outline">Open calculator</Link>
          </div>
        </div>
      </>
    );
  }

  const calc = calculateFromEntry(latestEntry, primaryHolding.count, primaryHolding.type);
  // Go Entry uses flat fields: energy_source, waste_handling
  const rec  = getRecommendation(
    calc,
    latestEntry.waste_handling,
    latestEntry.energy_source,
  );
  const verified = latestEntry.status === 'verified';


  return (
    <>
      <PageTitle
        eyebrow="Farm overview"
        title={`Good morning, ${farmerName}.`}
        description="Here is your latest sustainability picture — measured, explained, and ready for your cooperative."
        actions={
          <Link to="/calculator" className="ws-btn ws-btn-primary">
            Log this week's data
          </Link>
        }
      />

      {/* Metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 }}>
        <MetricCard icon={Leaf}          label="Sustainability score"  value={`${calc.score} / 100`}               trend="Based on latest entry" />
        <MetricCard icon={BarChart3}     label="Carbon footprint"      value={calc.totalTons.toFixed(2)}  unit="tCO₂e"  trend="Latest reporting period" accent="orange" />
        <MetricCard icon={Droplets}      label="CO₂e / animal"         value={calc.perAnimal.toFixed(1)}  unit="kg"     trend={`${primaryHolding.count} animals`} accent="sage" />
        <MetricCard icon={CheckCircle2}  label="Verification"          value={verified ? 'Verified' : 'Pending'} trend={verified ? 'Peer confirmed' : 'Awaiting peers'} accent="cream" />
      </div>

      {/* Scorecard + Recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, marginBottom: 20 }}>
        {/* Scorecard */}
        <article className="card-surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Current scorecard</p>
              <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em' }}>A clear baseline — with a clear next move.</h2>
            </div>
            <StatusSeal verified={verified} confirmations={latestEntry.status === 'pending_verification' ? 1 : 2} flagged={latestEntry.status === 'flagged'} />
          </div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <ScoreDial score={calc.score} grade={calc.grade} verified={verified} />
            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {calc.dimensions.map(d => <DimensionMeter key={d.label} {...d} />)}
            </div>
          </div>
          {calc.anomaly && (
            <div style={{ marginTop: 20, display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(255,140,66,0.08)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#7a3d00' }}>
              <Droplets size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {calc.anomaly}
            </div>
          )}
        </article>

        {/* Recommendation */}
        <RecommendationCard {...rec} />
      </div>

      {/* Trend chart */}
      <article className="card-surface" style={{ padding: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Historical footprint</p>
        <h2 style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: '-0.035em' }}>Your sustainability trend</h2>
        <div style={{ marginTop: 16 }}>
          <FootprintTrend data={trendData.length >= 2 ? trendData : undefined} />
        </div>
      </article>
    </>
  );
}
