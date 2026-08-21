// src/pages/Profile.tsx  (rewritten to MVP layout)
import { useState } from 'react';
import type { FormEvent } from 'react';
import { BadgeCheck, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api, ApiRequestError } from '../services/api';
import { PageTitle } from '../components/ProductPrimitives';
import type { Farmer, UpdateFarmerRequest } from '../types';

export default function Profile() {
  const { farmer, loading, refresh } = useApp();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setNameInput(farmer?.name ?? '');
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: UpdateFarmerRequest = { name: nameInput.trim() };
      await api.patch<Farmer>('/profile', body);
      refresh();
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading…</div>;

  const farmDetails = [
    ['Farm owner',     farmer?.name ?? '—'],
    ['Phone',          farmer?.phone ?? '—'],
    ['Location',       farmer?.location?.label ?? '—'],
    ['Farmer group',   farmer?.cooperative_name ?? '—'],
    ['Language',       farmer?.language ?? '—'],
  ];

  return (
    <>
      <PageTitle
        eyebrow="Farm profile"
        title={farmer?.name ?? 'Your Farm Profile'}
        description="The essential farm context FlockSense uses to keep your log, recommendations, benchmark, and peer verification useful."
        actions={
          !editing
            ? <button className="ws-btn ws-btn-outline" onClick={startEdit}>Edit profile</button>
            : undefined
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 20 }}>
        {/* Farm details */}
        <article className="card-surface" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Farm details</p>

          {editing ? (
            <form onSubmit={handleSave} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Full name</label>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid rgba(156,175,136,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
                />
              </div>
              {error && <p style={{ fontSize: 13, color: 'var(--color-error)' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="ws-btn ws-btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className="ws-btn ws-btn-outline" type="button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <dl style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {farmDetails.map(([term, detail]) => (
                <div key={term} style={{ background: 'rgba(156,175,136,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                  <dt style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-secondary)' }}>{term}</dt>
                  <dd style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{detail}</dd>
                </div>
              ))}
            </dl>
          )}

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(156,175,136,0.1)', border: '1px solid rgba(156,175,136,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#3a6e30' }}>
            <MapPin size={14} />
            Your profile is set up for local peer benchmarking.
          </div>
        </article>

        {/* Verifier reputation */}
        <article className="card-surface" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,140,66,0.1)', display: 'grid', placeItems: 'center', color: 'var(--color-secondary)' }}>
              <BadgeCheck size={20} />
            </span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-secondary)' }}>Verifier reputation</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.035em' }}>94 / 100</h2>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
            {[['18', 'successful'], ['1', 'disputed'], ['94%', 'accuracy']].map(([value, label]) => (
              <div key={label} style={{ background: 'rgba(156,175,136,0.07)', borderRadius: 12, padding: '12px 10px' }}>
                <strong style={{ display: 'block', fontSize: 18 }}>{value}</strong>
                <span style={{ marginTop: 4, display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--color-text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: 'var(--color-primary)', borderRadius: 16, padding: '16px 18px', color: '#FDF6EC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: 'var(--color-secondary)' }}>◎</span> Reciprocity active
            </div>
            <p style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: 'rgba(253,246,236,0.72)' }}>
              You have verified peer farm logs, so your own farm can receive credibility from the same community process.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
