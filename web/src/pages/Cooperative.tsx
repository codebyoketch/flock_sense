// src/pages/Cooperative.tsx
import { ArrowRight, BarChart3, ShieldCheck, UsersRound } from 'lucide-react';
import { PageTitle } from '../components/ProductPrimitives';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Cooperative() {
  const { farmer } = useApp();
  const cooperativeName = farmer?.cooperative_name ?? 'Your Cooperative';

  return (
    <>
      <PageTitle
        eyebrow="Cooperative view"
        title={cooperativeName}
        description="A sustainability record farmers can actually build — and institutions can understand. One verified period is useful. A history of verified periods becomes a practical risk signal."
      />

      {/* Hero banner */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: 'var(--color-primary)', padding: '40px 36px', color: '#FDF6EC', marginBottom: 20, boxShadow: '0 12px 40px rgba(128,0,32,0.2)' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 20, right: 80, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr', gap: 32, position: 'relative' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(253,246,236,0.5)' }}>For cooperatives, buyers & SACCOs</p>
            <h2 style={{ marginTop: 12, fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.04em' }}>
              A sustainability record farmers can actually build — and institutions can understand.
            </h2>
            <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.65, color: 'rgba(253,246,236,0.72)' }}>
              One verified period is useful. A history of verified periods becomes a practical risk signal, benchmark, and conversation starter.
            </p>
            <Link
              to="/credential"
              style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FDF6EC', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', transition: 'background 0.2s' }}
            >
              View my credential <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignSelf: 'end' }}>
            {[
              { value: '93',  label: 'verified farms across the cooperative' },
              { value: 'B',   label: 'average sustainability score' },
              { value: '18%', label: 'average emissions reduction' },
              { value: '24',  label: 'farms improving this period' },
            ].map(({ value, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 14px', backdropFilter: 'blur(4px)' }}>
                <span style={{ display: 'block', fontSize: 28, fontWeight: 700 }}>{value}</span>
                <p style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: 'rgba(253,246,236,0.65)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: BarChart3,   title: 'Aggregate benchmarking',    text: 'See how farms in your cooperative compare — anonymously — to make collective improvement visible.' },
          { icon: ShieldCheck, title: 'Trust layer',               text: 'Peer verification makes self-reported data more credible without replacing formal audits.' },
          { icon: UsersRound,  title: 'Reciprocity system',        text: 'Members who verify peers can have their own records verified in return, building shared accountability.' },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="card-surface" style={{ padding: 24 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(128,0,32,0.08)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)' }}>
              <Icon size={18} />
            </span>
            <h3 style={{ marginTop: 20, fontSize: 15, fontWeight: 700 }}>{title}</h3>
            <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>{text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
