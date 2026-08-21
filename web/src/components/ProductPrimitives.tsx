// src/components/ProductPrimitives.tsx
// Shared workspace UI primitives — restyled from flocksense-mvp with brand theme colors.
import { Check, CircleAlert, Leaf, ShieldCheck } from 'lucide-react';
import { type ComponentType, type ReactNode } from 'react';

/* ── Page Title ── */
export function PageTitle({
  eyebrow, title, description, actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-title-block">
      <div>
        <p className="page-eyebrow">{eyebrow}</p>
        <h1 className="page-h1">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

/* ── Metric Card ── */
type Accent = 'burgundy' | 'orange' | 'sage' | 'cream';
const accentClasses: Record<Accent, string> = {
  burgundy: 'metric-icon-burgundy',
  orange:   'metric-icon-orange',
  sage:     'metric-icon-sage',
  cream:    'metric-icon-cream',
};

export function MetricCard({
  icon: Icon, label, value, unit, trend, accent = 'burgundy',
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  accent?: Accent;
}) {
  return (
    <article className="card-surface metric-card">
      <div className={`metric-icon-wrap ${accentClasses[accent]}`}>
        <Icon className="metric-icon" />
      </div>
      <p className="metric-label">{label}</p>
      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {trend && <p className="metric-trend">{trend}</p>}
    </article>
  );
}

/* ── Score Dial ── */
export function ScoreDial({
  score, grade, verified = false, compact = false,
}: {
  score: number;
  grade: string;
  verified?: boolean;
  compact?: boolean;
}) {
  const outer = compact ? 96 : 144;
  const inner = compact ? 78 : 112;
  const deg   = score * 3.6;

  return (
    <div
      className="score-dial-outer"
      style={{
        width: outer, height: outer,
        background: `conic-gradient(var(--color-primary) ${deg}deg, #E8D5D5 0deg)`,
      }}
    >
      <div className="score-dial-inner" style={{ width: inner, height: inner }}>
        <span className="score-dial-grade" style={{ fontSize: compact ? 28 : 44 }}>{grade}</span>
        <span className="score-dial-sub">{score}/100</span>
      </div>
      {verified && <span className="score-dial-verified">Verified</span>}
    </div>
  );
}

/* ── Status Seal ── */
export function StatusSeal({
  verified, confirmations = 2, flagged = false,
}: {
  verified: boolean;
  confirmations?: number;
  flagged?: boolean;
}) {
  if (flagged) {
    return (
      <div className="status-seal status-seal-flagged">
        <CircleAlert size={14} />
        Flagged for review
      </div>
    );
  }
  return (
    <div className={`status-seal ${verified ? 'status-seal-verified' : 'status-seal-pending'}`}>
      <span className={`status-seal-icon ${verified ? 'status-seal-icon-verified' : 'status-seal-icon-pending'}`}>
        {verified ? <Check size={12} /> : <span style={{ fontSize: 10 }}>{confirmations}</span>}
      </span>
      {verified ? 'Peer verified' : `${confirmations} of 2 confirmations`}
    </div>
  );
}

/* ── Dimension Meter ── */
export function DimensionMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="dimension-meter">
      <div className="dimension-meter-header">
        <span>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div className="dimension-track">
        <div className="dimension-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ── Recommendation Card ── */
export function RecommendationCard({
  title, body, impact, action,
}: {
  title: string;
  body: string;
  impact: string;
  action: string;
}) {
  return (
    <article className="rec-card">
      <div className="rec-card-badge">
        <span className="rec-card-badge-icon"><Leaf size={14} /></span>
        Explainable insight
      </div>
      <h3 className="rec-card-title">{title}</h3>
      <p className="rec-card-body">{body}</p>
      <div className="rec-card-footer">
        <span className="rec-card-impact">{impact}</span>
        <button className="rec-card-action">{action}</button>
      </div>
    </article>
  );
}

/* ── Proof Chip ── */
export function ProofChip() {
  return (
    <span className="proof-chip">
      <ShieldCheck size={13} />
      Ledger anchored
    </span>
  );
}
