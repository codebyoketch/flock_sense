import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { api, ApiRequestError } from '../services/api';
import type { LedgerProofResponse } from '../types';

type Attestation = { verifier_id_hash?: string; entry_id?: string; verdict?: string; timestamp?: string };

export default function PublicProof() {
  const { txId } = useParams<{ txId: string }>();
  const [proof, setProof] = useState<LedgerProofResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txId) return;
    api.get<LedgerProofResponse>(`/ledger/${txId}`)
      .then(setProof)
      .catch((err) => setError(err instanceof ApiRequestError ? 'This proof link could not be verified.' : 'Could not load this proof link.'));
  }, [txId]);

  if (!proof && !error) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#FDF6EC', color: '#2D1B1B', fontFamily: 'Inter, sans-serif' }}>Checking ledger proof…</main>;

  if (error || !proof) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#FDF6EC', color: '#2D1B1B', fontFamily: 'Inter, sans-serif' }}><section style={{ maxWidth: 480, padding: 32, textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid rgba(156,175,136,0.3)' }}><ShieldCheck size={36} style={{ color: '#B00020' }} /><h1 style={{ marginTop: 14, fontSize: 22 }}>Proof unavailable</h1><p style={{ marginTop: 8, color: '#6B5B5B', lineHeight: 1.6 }}>{error}</p></section></main>;

  let attestations: Attestation[] = [];
  try {
    const parsed: unknown = JSON.parse(proof.attestation_trail);
    attestations = Array.isArray(parsed) ? parsed as Attestation[] : [];
  } catch {
    attestations = [];
  }

  return (
    <main style={{ minHeight: '100vh', padding: '40px 20px', background: '#FDF6EC', color: '#2D1B1B', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShieldCheck size={42} style={{ color: '#800020' }} />
          <p style={{ marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6B5B5B' }}>FlockSense public verification</p>
          <h1 style={{ marginTop: 7, fontSize: 27, letterSpacing: '-0.04em' }}>Ledger proof confirmed</h1>
          <p style={{ marginTop: 8, color: '#6B5B5B', lineHeight: 1.6 }}>This sustainability score was anchored with its peer-attestation trail.</p>
        </div>

        <article style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid rgba(156,175,136,0.3)', boxShadow: '0 4px 16px rgba(128,0,32,0.07)' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              ['Chain', proof.chain],
              ['Anchored', new Date(proof.anchored_at).toLocaleString('en-GB')],
              ['Score hash', proof.score_hash],
              ['Transaction ID', proof.tx_id],
            ].map(([label, value]) => <div key={label} style={{ paddingBottom: 14, borderBottom: '1px solid rgba(156,175,136,0.2)' }}><p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B5B5B' }}>{label}</p><p style={{ marginTop: 5, overflowWrap: 'anywhere', fontSize: 13, fontWeight: 700 }}>{value}</p></div>)}
          </div>
          <h2 style={{ marginTop: 24, fontSize: 17 }}>Peer attestation trail</h2>
          {attestations.length === 0 ? <p style={{ marginTop: 8, color: '#6B5B5B', fontSize: 13 }}>No attestations were recorded with this anchor.</p> : <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>{attestations.map((attestation, index) => <div key={`${attestation.entry_id}-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(156,175,136,0.1)' }}><CheckCircle2 size={17} style={{ color: '#3A6E30', flexShrink: 0 }} /><div><p style={{ fontSize: 13, fontWeight: 700 }}>{attestation.verdict === 'confirm' ? 'Peer confirmation' : 'Peer review'}</p><p style={{ marginTop: 3, color: '#6B5B5B', fontSize: 12, overflowWrap: 'anywhere' }}>Verifier {attestation.verifier_id_hash} · {attestation.timestamp ? new Date(attestation.timestamp).toLocaleString('en-GB') : 'time recorded on ledger'}</p></div></div>)}</div>}
        </article>
      </section>
    </main>
  );
}
