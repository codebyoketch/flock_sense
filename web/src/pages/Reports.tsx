// src/pages/Reports.tsx
import { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateFromEntry } from '../lib/engine';
import { api, ApiRequestError } from '../services/api';
import { PageTitle, ScoreDial, StatusSeal, ProofChip } from '../components/ProductPrimitives';
import { EmissionsDonut } from '../components/Charts';
import { Link } from 'react-router-dom';
import type { ReportResponse, Score } from '../types';

const scoreByGrade: Record<string, number> = { A: 95, B: 82, C: 70, D: 58, E: 45 };

export default function Reports() {
  const { farmer, primaryHolding, latestEntry, loading } = useApp();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!farmer) return;
    Promise.all([
      api.get<ReportResponse>('/reports/me'),
      api.get<Score>('/scores/me'),
    ])
      .then(([nextReport, nextScore]) => {
        setReport(nextReport);
        setScore(nextScore);
      })
      .catch((err) => setReportError(err instanceof ApiRequestError ? err.message : 'Could not load the latest report data.'));
  }, [farmer]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  if (!primaryHolding || !latestEntry) {
    return (
      <>
        <PageTitle eyebrow="Sustainability report" title="A decision-ready view of your record." />
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Log an entry first to generate a report.</p>
          <Link to="/calculator" className="ws-btn ws-btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Open calculator</Link>
        </div>
      </>
    );
  }

  const calc     = calculateFromEntry(latestEntry, primaryHolding.count, primaryHolding.type);
  const verified = report ? report.footprint.verified_entries > 0 : latestEntry.status === 'verified';
  const period   = `${new Date(latestEntry.period_start).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}–${new Date(latestEntry.period_end).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const location = typeof farmer?.location === 'string' ? farmer.location : '—';

  return (
    <>
      <PageTitle
        eyebrow="Sustainability report"
        title="A decision-ready view of your record."
        description="Use this summary with your cooperative, buyer, SACCO, or lender. It shows a clear estimate, its context, and the trust status behind it."
        actions={
          <>
            <button className="ws-btn ws-btn-outline" onClick={() => window.print()}>
              <Printer size={15} /> Print
            </button>
            <button className="ws-btn ws-btn-primary" onClick={() => window.print()}>
              <Download size={15} /> Download report
            </button>
          </>
        }
      />

      <article className="card-surface" style={{ overflow: 'hidden' }}>
        {reportError && <p style={{ margin: '16px 28px 0', fontSize: 13, color: 'var(--color-error, #B00020)' }}>{reportError}</p>}
        {/* Report header */}
        <div style={{ borderBottom: '1px solid rgba(156,175,136,0.2)', background: 'var(--color-background)', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>FlockSense sustainability report</p>
              <h2 style={{ marginTop: 8, fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em' }}>
                {farmer?.name ?? 'Your Farm'}
              </h2>
              <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {location} · Reporting period: {period}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <StatusSeal verified={verified} confirmations={verified ? 2 : 1} />
              <ProofChip />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 24, padding: '24px 28px' }}>
          {/* Score column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(156,175,136,0.08)', borderRadius: 16, padding: 24 }}>
            <ScoreDial score={score ? scoreByGrade[score.overall_score] ?? calc.score : calc.score} grade={score?.overall_score ?? calc.grade} verified={verified} />
            <p style={{ marginTop: 20, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>Sustainability score</p>
            <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Good overall performance. {calc.highestCategory.name} is the most actionable next area.
            </p>
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', borderTop: '1px dashed rgba(156,175,136,0.4)', paddingTop: 20, textAlign: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 20 }}>{((report?.footprint.total_co2e_kg ?? latestEntry.estimated_co2e_kg) / 1000).toFixed(2)}</strong>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)' }}>tCO₂e</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 20 }}>{calc.perAnimal.toFixed(1)}</strong>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)' }}>kg / animal</span>
              </div>
            </div>
          </div>

          {/* Breakdown column */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Emissions breakdown</h3>
            <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>Estimated activity-based contribution by category.</p>
            <div style={{ marginTop: 16 }}>
              <EmissionsDonut data={calc.breakdown} />
            </div>
            <div style={{ marginTop: 20, border: '1px solid rgba(156,175,136,0.25)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Recommended action</p>
              <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
                {calc.highestCategory.name === 'Waste'
                  ? 'Composting manure disposal could reduce waste-related emissions by an estimated 18%.'
                  : 'Review your highest emission category and consider practical reduction steps.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, borderTop: '1px solid rgba(156,175,136,0.2)', padding: '20px 28px' }}>
          {[
            { label: 'Latest reporting period', value: period },
            { label: 'Verified entries', value: report ? String(report.footprint.verified_entries) : (verified ? '1' : '0') },
            { label: 'Entries logged', value: report ? String(report.footprint.entry_count) : '1' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>{label}</p>
              <p style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
