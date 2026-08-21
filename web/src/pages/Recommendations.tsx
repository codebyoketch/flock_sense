import { ArrowRight, CheckCircle2, ClipboardCheck, Droplets, Lightbulb, PlugZap, Recycle, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry, type EmissionBreakdown } from '../lib/engine';
import { PageTitle } from '../components/ProductPrimitives';

type Recommendation = {
  title: string;
  action: string;
  outcome: string;
  icon: typeof Wheat;
};

function formatKg(value: number) {
  return value < 1 ? value.toFixed(2) : value.toFixed(1);
}

function recommendationFor(category: EmissionBreakdown, values: {
  feedKg: number;
  energyKwh: number;
  energySource: string;
  waterLiters: number;
  wasteHandling: string;
}): Recommendation {
  switch (category.name) {
    case 'Feed': {
      const saving = category.value * 0.1;
      return {
        title: 'Reduce feed loss before changing feed suppliers.',
        action: `You logged ${values.feedKg.toLocaleString()} kg of feed. For the next period, measure the feed issued each day and compare it with what remains at week end.`,
        outcome: `A practical 10% reduction in avoidable feed loss would lower this estimate by about ${formatKg(saving)} kg CO₂e.`,
        icon: Wheat,
      };
    }
    case 'Energy': {
      const solarSavings = values.energySource === 'solar'
        ? category.value * 0.15
        : values.energyKwh * (values.energySource === 'diesel' ? 0.75 - 0.05 : values.energySource === 'grid' ? 0.42 - 0.05 : 0.5 - 0.05);
      return {
        title: values.energySource === 'solar' ? 'Keep solar use efficient as demand grows.' : `Move your highest-use equipment away from ${values.energySource} power.`,
        action: values.energySource === 'solar'
          ? `You logged ${values.energyKwh.toLocaleString()} kWh of solar energy. Track pump and lighting hours so you can spot avoidable use.`
          : `You logged ${values.energyKwh.toLocaleString()} kWh from ${values.energySource}. Start with lighting, pumping, or heating that can move to solar or shorter operating hours.`,
        outcome: values.energySource === 'solar'
          ? `Cutting avoidable energy use by 15% would lower this estimate by about ${formatKg(solarSavings)} kg CO₂e.`
          : `Supplying the same energy from solar instead would lower this estimate by about ${formatKg(solarSavings)} kg CO₂e.`,
        icon: PlugZap,
      };
    }
    case 'Water': {
      const saving = category.value * 0.2;
      return {
        title: 'Find the water use you can remove first.',
        action: `You logged ${values.waterLiters.toLocaleString()} litres. Check drinkers, hoses, and cleaning routines for leaks or water left running before the next log.`,
        outcome: `Reducing water use by 20% would lower this estimate by about ${formatKg(saving)} kg CO₂e and save ${Math.round(values.waterLiters * 0.2).toLocaleString()} litres.`,
        icon: Droplets,
      };
    }
    case 'Waste': {
      const isLowEmission = values.wasteHandling === 'composted' || values.wasteHandling === 'biogas';
      const saving = values.wasteHandling === 'open_pile' ? 0.23 : values.wasteHandling === 'other' ? 0.13 : 0;
      return {
        title: isLowEmission ? 'Keep your manure handling method consistent.' : 'Move manure away from open or unmanaged disposal.',
        action: isLowEmission
          ? `You reported ${values.wasteHandling.replace('_', ' ')} handling. Keep it consistent and record any weeks when manure is managed differently.`
          : `You reported ${values.wasteHandling.replace('_', ' ')} handling. Ask your cooperative about composting or a biogas option before the next reporting period.`,
        outcome: isLowEmission
          ? 'This is already one of the lower-emission handling options; keeping it consistent protects your score.'
          : `Changing to composted handling would lower the waste estimate by about ${formatKg(saving)} kg CO₂e per reported period.`,
        icon: Recycle,
      };
    }
  }
}

export default function Recommendations() {
  const { primaryHolding, latestEntry, loading } = useApp();

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle eyebrow="Practical recommendations" title="Get a clear next step from your farm data." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Log an entry first and FlockSense will identify the largest contributor and the most practical action to take next.</p>
          <Link to="/calculator" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Log farm data</Link>
        </div>
      </>
    );
  }

  const calc = calculateFromEntry(latestEntry, primaryHolding.count, primaryHolding.type);
  const categories = [...calc.breakdown].sort((a, b) => b.value - a.value);
  const primary = categories[0];
  const secondary = categories[1];
  const primaryShare = calc.totalKg > 0 ? Math.round((primary.value / calc.totalKg) * 100) : 0;
  const recommendationInputs = {
    feedKg: latestEntry.feed_kg,
    energyKwh: latestEntry.energy_kwh,
    energySource: latestEntry.energy_source,
    waterLiters: latestEntry.water_liters,
    wasteHandling: latestEntry.waste_handling,
  };
  const primaryAction = recommendationFor(primary, recommendationInputs);
  const secondaryAction = recommendationFor(secondary, recommendationInputs);
  const PrimaryIcon = primaryAction.icon;
  const SecondaryIcon = secondaryAction.icon;
  const verified = latestEntry.status === 'verified';

  return (
    <>
      <PageTitle
        eyebrow="Practical recommendations"
        title={`Start with ${primary.name.toLowerCase()} — it is driving this period’s result.`}
        description="Every action below is generated from the quantities and practices in your latest farm log. The impact figures are directional estimates, not guaranteed savings."
        actions={<Link to="/calculator" className="ws-btn ws-btn-primary">Log the next period <ArrowRight size={15} /></Link>}
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <article style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: 'var(--color-primary)', color: '#FDF6EC' }}>
          <div style={{ position: 'absolute', width: 220, height: 220, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', top: -88, right: -70 }} />
          <p style={{ position: 'relative', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(253,246,236,0.6)' }}>Your clearest next move</p>
          <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 14 }}>
            <span style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 14, background: 'rgba(255,255,255,0.12)' }}><PrimaryIcon size={21} /></span>
            <div>
              <h2 style={{ fontSize: 22, lineHeight: 1.3, letterSpacing: '-0.035em' }}>{primaryAction.title}</h2>
              <p style={{ marginTop: 10, maxWidth: 610, fontSize: 14, lineHeight: 1.65, color: 'rgba(253,246,236,0.8)' }}>{primaryAction.action}</p>
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: 20, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', fontSize: 13, lineHeight: 1.55 }}>
            <strong>Expected direction: </strong>{primaryAction.outcome}
          </div>
        </article>

        <article className="card-surface" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>What the calculation shows</p>
          <strong style={{ display: 'block', marginTop: 7, fontSize: 27, letterSpacing: '-0.05em' }}>{formatKg(calc.totalKg)} <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0, color: 'var(--color-text-secondary)' }}>kg CO₂e estimated</span></strong>
          <p style={{ marginTop: 5, fontSize: 13, color: 'var(--color-text-secondary)' }}>{formatKg(calc.perAnimal)} kg CO₂e per animal · {primaryShare}% from {primary.name.toLowerCase()}</p>
          <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
            {categories.map((category) => {
              const percentage = calc.totalKg > 0 ? (category.value / calc.totalKg) * 100 : 0;
              return <div key={category.name}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5, fontSize: 12 }}><span style={{ fontWeight: 700 }}>{category.name}</span><span style={{ color: 'var(--color-text-secondary)' }}>{formatKg(category.value)} kg · {Math.round(percentage)}%</span></div><div style={{ height: 7, overflow: 'hidden', borderRadius: 999, background: 'rgba(156,175,136,0.16)' }}><div style={{ width: `${percentage}%`, height: '100%', borderRadius: 999, background: category.color }} /></div></div>;
            })}
          </div>
        </article>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <article className="card-surface" style={{ padding: 22 }}>
          <span style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'rgba(128,0,32,0.08)', color: 'var(--color-primary)' }}><PrimaryIcon size={18} /></span>
          <p style={{ marginTop: 18, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>1 · Do this first</p>
          <h3 style={{ marginTop: 7, fontSize: 16, lineHeight: 1.35 }}>{primaryAction.title}</h3>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{primaryAction.action}</p>
        </article>

        <article className="card-surface" style={{ padding: 22 }}>
          <span style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'rgba(255,140,66,0.12)', color: '#9A5200' }}><SecondaryIcon size={18} /></span>
          <p style={{ marginTop: 18, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>2 · Then work on {secondary.name.toLowerCase()}</p>
          <h3 style={{ marginTop: 7, fontSize: 16, lineHeight: 1.35 }}>{secondaryAction.title}</h3>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{secondaryAction.action}</p>
        </article>

        <article className="card-surface" style={{ padding: 22 }}>
          <span style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 12, background: 'rgba(156,175,136,0.16)', color: '#3A6E30' }}><ClipboardCheck size={18} /></span>
          <p style={{ marginTop: 18, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>3 · Build a stronger record</p>
          <h3 style={{ marginTop: 7, fontSize: 16, lineHeight: 1.35 }}>{verified ? 'Keep this verified record moving.' : 'Ask peers to verify this period.'}</h3>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{verified ? 'Log the next period after you make one change, so your progress becomes a visible, shareable trend.' : 'This entry is still awaiting peer review. A verified entry makes your improvement record more useful to a cooperative, buyer, or lender.'}</p>
          <p style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: verified ? '#3A6E30' : '#9A5200' }}><CheckCircle2 size={14} /> {verified ? 'Peer verified' : 'Pending peer verification'}</p>
        </article>
      </section>

      {calc.anomaly && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 20, padding: '13px 16px', borderRadius: 12, border: '1px solid rgba(255,140,66,0.28)', background: 'rgba(255,140,66,0.08)', color: '#7A4200' }}><Lightbulb size={17} style={{ flexShrink: 0, marginTop: 1 }} /><p style={{ fontSize: 13, lineHeight: 1.55 }}><strong>Check before you act: </strong>{calc.anomaly}</p></div>}
    </>
  );
}
