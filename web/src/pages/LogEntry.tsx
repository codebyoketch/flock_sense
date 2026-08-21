// src/pages/LogEntry.tsx  (replaced with multi-step Calculator wizard)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api, ApiRequestError } from '../services/api';
import { queueEntry } from '../services/offlineEntries';
import type { Holding, EnergySource, WasteHandling, CreateEntryRequest, CreateEntryResponse, PaginatedResponse } from '../types';
import { PageTitle } from '../components/ProductPrimitives';

type Step = 'holding' | 'feed' | 'energy' | 'water-waste' | 'review' | 'done';

const STEPS: { id: Step; label: string; emoji: string }[] = [
  { id: 'holding',     label: 'Select holding',  emoji: '🐑' },
  { id: 'feed',        label: 'Feed',             emoji: '🌾' },
  { id: 'energy',      label: 'Energy',           emoji: '⚡' },
  { id: 'water-waste', label: 'Water & Waste',    emoji: '💧' },
  { id: 'review',      label: 'Review & Submit',  emoji: '✅' },
];

const ENERGY_SOURCES: { value: EnergySource; label: string }[] = [
  { value: 'grid',   label: 'Grid electricity' },
  { value: 'solar',  label: 'Solar' },
  { value: 'diesel', label: 'Diesel generator' },
  { value: 'other',  label: 'Other' },
];

const WASTE_OPTIONS: { value: WasteHandling; label: string; desc: string }[] = [
  { value: 'composted', label: 'Composted',       desc: 'Best practice — lowest emissions' },
  { value: 'biogas',    label: 'Biogas digester', desc: 'Captures methane for energy' },
  { value: 'open_pile', label: 'Open pile',       desc: 'Common, higher emissions' },
  { value: 'other',     label: 'Other',           desc: 'Other disposal method' },
];

const TYPE_LABELS = { poultry: 'Poultry', dairy: 'Dairy', goats: 'Goats', other: 'Other' } as const;

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function today() { return new Date().toISOString().slice(0, 10); }
function monthAgo() { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }

const fieldStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em',
};
const inputStyle: React.CSSProperties = {
  border: '1.5px solid rgba(156,175,136,0.35)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)', background: '#fff',
};

export default function LogEntry() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('holding');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(true);

  // Form state
  const [holdingId,      setHoldingId]      = useState('');
  const [periodStart,    setPeriodStart]    = useState(monthAgo());
  const [periodEnd,      setPeriodEnd]      = useState(today());
  const [feedType,       setFeedType]       = useState('Commercial layer feed');
  const [feedQuantity,   setFeedQuantity]   = useState('');
  const [energySource,   setEnergySource]   = useState<EnergySource>('grid');
  const [energyQuantity, setEnergyQuantity] = useState('');
  const [waterQuantity,  setWaterQuantity]  = useState('');
  const [wasteHandling,  setWasteHandling]  = useState<WasteHandling>('open_pile');

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<CreateEntryResponse | null>(null);
  const [offlineQueued, setOfflineQueued] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<PaginatedResponse<Holding>>('/holdings');
        setHoldings(res.data);
        if (res.data.length > 0) setHoldingId(res.data[0].holding_id);
      } catch {
        setError('Could not load your holdings.');
      } finally {
        setLoadingHoldings(false);
      }
    })();
  }, []);

  async function handleSubmit() {
    setError(null);
    if (!holdingId || !feedType || !feedQuantity || !energyQuantity || !waterQuantity) {
      setError('Fill in every field before submitting.');
      return;
    }
    const feedKg = Number(feedQuantity);
    const energyKwh = Number(energyQuantity);
    const waterLiters = Number(waterQuantity);
    if (![feedKg, energyKwh, waterLiters].every((value) => Number.isFinite(value) && value >= 0)) {
      setError('Use zero or a positive number for each measurement.');
      return;
    }
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      setError('Choose a reporting period with an end date on or after the start date.');
      return;
    }
    // Go's entryRequest uses flat fields: feed_type, feed_kg, energy_source, energy_kwh, water_liters
    const payload: CreateEntryRequest = {
      client_id:      generateClientId(),
      holding_id:     holdingId,
      period_start:   periodStart,
      period_end:     periodEnd,
      feed_type:      feedType,
      feed_kg:        feedKg,
      energy_source:  energySource,
      energy_kwh:     energyKwh,
      water_liters:   waterLiters,
      waste_handling: wasteHandling,
    };
    if (!navigator.onLine) {
      if (!queueEntry(payload)) {
        setError('Your device could not save this entry for later sync. Please try again.');
        return;
      }
      setOfflineQueued(true);
      setStep('done');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<CreateEntryResponse>('/entries', payload);
      setResult(res);
      setStep('done');
    } catch (err) {
      if (!(err instanceof ApiRequestError) && queueEntry(payload)) {
        setOfflineQueued(true);
        setStep('done');
      } else {
        setError(err instanceof ApiRequestError ? err.message : 'Could not submit. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = STEPS.findIndex(s => s.id === step);
  const selectedHolding = holdings.find(h => h.holding_id === holdingId);

  /* ── Progress bar ── */
  function ProgressBar() {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map((s, i) => {
          const done    = i < stepIndex;
          const current = s.id === step;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
                fontSize: 14,
                background: done ? 'var(--color-primary)' : current ? 'rgba(128,0,32,0.1)' : 'rgba(156,175,136,0.1)',
                color: done ? '#fff' : current ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: 700,
              }}>
                {done ? '✓' : s.emoji}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: current ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: i === 4 ? 'inline' : undefined }}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: done ? 'var(--color-primary)' : 'rgba(156,175,136,0.3)', flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Done screen ── */
  if (step === 'done' && (result || offlineQueued)) {
    return (
      <>
        <PageTitle eyebrow="Footprint calculator" title={offlineQueued ? "Entry saved offline." : "Entry logged."} />
        <div className="card-surface" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <CheckCircle2 size={56} style={{ color: '#3a6e30', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{offlineQueued ? 'Your entry is safe on this device.' : 'Entry submitted successfully!'}</h2>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            {offlineQueued
              ? 'It will sync automatically when your connection returns, then move to peer verification.'
              : <><strong>Estimated footprint: {result!.estimated_co2e_kg.toFixed(1)} kg CO₂e</strong><br />Status: pending peer verification.</>}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            <button className="ws-btn ws-btn-primary" onClick={() => navigate('/dashboard')}>View dashboard</button>
            <button className="ws-btn ws-btn-outline" onClick={() => navigate(`/holding/${result?.holding_id ?? holdingId}`)}>View holding</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Footprint calculator"
        title="Turn this week's farm log into a useful estimate."
        description="FlockSense uses transparent factors to show a directional CO₂e estimate. It does not present a certified or scientific measurement."
      />

      <div className="card-surface" style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
        <ProgressBar />

        {/* ── Step: Holding ── */}
        {step === 'holding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Which holding is this for?</h2>

            {loadingHoldings && <p style={{ color: 'var(--color-text-secondary)' }}>Loading your holdings…</p>}

            {!loadingHoldings && holdings.length === 0 && (
              <div>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>You need a holding before you can log an entry.</p>
                <button className="ws-btn ws-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/holdings')}>Add a holding</button>
              </div>
            )}

            {holdings.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {holdings.map(h => (
                    <button
                      key={h.holding_id}
                      onClick={() => setHoldingId(h.holding_id)}
                      style={{
                        border: h.holding_id === holdingId ? '2px solid var(--color-primary)' : '1.5px solid rgba(156,175,136,0.3)',
                        borderRadius: 14, padding: '14px 18px', background: h.holding_id === holdingId ? 'rgba(128,0,32,0.04)' : '#fff',
                        cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{h.type === 'poultry' ? '🐔' : h.type === 'dairy' ? '🐄' : h.type === 'goats' ? '🐐' : '🐾'}</span>
                      <div>
                        <strong style={{ fontSize: 14 }}>{TYPE_LABELS[h.type]}</strong>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{h.count} animals</p>
                      </div>
                      {h.holding_id === holdingId && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Period start</label>
                    <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Period end</label>
                    <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step: Feed ── */}
        {step === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>🌾 Feed inputs</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Feed is usually the largest contributor to farm emissions. Log what you used this period.
            </p>
            <div style={fieldStyle}>
              <label style={labelStyle}>Feed type</label>
              <input value={feedType} onChange={e => setFeedType(e.target.value)} style={inputStyle} placeholder="e.g. Commercial layer feed" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Quantity (kg)</label>
              <input type="number" min={0} value={feedQuantity} onChange={e => setFeedQuantity(e.target.value)} style={inputStyle} placeholder="e.g. 420" />
            </div>
          </div>
        )}

        {/* ── Step: Energy ── */}
        {step === 'energy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>⚡ Energy use</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Include lights, water pumps, and any other farm electricity this period.
            </p>
            <div style={fieldStyle}>
              <label style={labelStyle}>Energy source</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ENERGY_SOURCES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEnergySource(opt.value)}
                    style={{
                      border: energySource === opt.value ? '2px solid var(--color-primary)' : '1.5px solid rgba(156,175,136,0.3)',
                      borderRadius: 12, padding: '11px 16px', background: energySource === opt.value ? 'rgba(128,0,32,0.04)' : '#fff',
                      cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Quantity (kWh)</label>
              <input type="number" min={0} value={energyQuantity} onChange={e => setEnergyQuantity(e.target.value)} style={inputStyle} placeholder="e.g. 80" />
            </div>
          </div>
        )}

        {/* ── Step: Water & Waste ── */}
        {step === 'water-waste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>💧 Water & Waste</h2>
            <div style={fieldStyle}>
              <label style={labelStyle}>Water use (litres)</label>
              <input type="number" min={0} value={waterQuantity} onChange={e => setWaterQuantity(e.target.value)} style={inputStyle} placeholder="e.g. 2400" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Manure / waste handling</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {WASTE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setWasteHandling(opt.value)}
                    style={{
                      border: wasteHandling === opt.value ? '2px solid var(--color-primary)' : '1.5px solid rgba(156,175,136,0.3)',
                      borderRadius: 12, padding: '11px 16px', background: wasteHandling === opt.value ? 'rgba(128,0,32,0.04)' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{opt.label}</strong>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Review ── */}
        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Review your entry</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Holding',     `${TYPE_LABELS[selectedHolding?.type ?? 'other']} · ${selectedHolding?.count ?? '?'} animals`],
                ['Period',      `${periodStart} → ${periodEnd}`],
                ['Feed',        `${feedQuantity} kg — ${feedType}`],
                ['Energy',      `${energyQuantity} kWh — ${energySource}`],
                ['Water',       `${waterQuantity} L`],
                ['Waste',       WASTE_OPTIONS.find(w => w.value === wasteHandling)?.label ?? wasteHandling],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'rgba(156,175,136,0.07)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-secondary)' }}>{label}</p>
                  <p style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,140,66,0.08)', border: '1px solid rgba(255,140,66,0.25)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#7a4200', lineHeight: 1.55 }}>
              💡 After submission, cooperative peers will review your entry before it counts toward your sustainability score.
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-error)', fontWeight: 600 }}>{error}</p>
        )}

        {/* ── Nav buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(156,175,136,0.2)' }}>
          {stepIndex > 0 ? (
            <button className="ws-btn ws-btn-outline" onClick={() => setStep(STEPS[stepIndex - 1].id)}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {step !== 'review' ? (
            <button
              className="ws-btn ws-btn-primary"
              disabled={step === 'holding' && holdings.length === 0}
              onClick={() => setStep(STEPS[stepIndex + 1].id)}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="ws-btn ws-btn-cta" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit entry ✓'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
