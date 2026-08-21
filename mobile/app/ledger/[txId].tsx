import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getLedgerProof } from "@/services/badge";
import { COLORS, RADII } from "@/constants/theme";
import type { LedgerProof } from "@/types";

export default function LedgerProofScreen() {
  const { txId } = useLocalSearchParams<{ txId: string }>();
  const [proof, setProof] = useState<LedgerProof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!txId) return;
    getLedgerProof(txId)
      .then(setProof)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [txId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (error || !proof) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Couldn't load this proof. Check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>On-chain proof</Text>

      <View style={styles.summaryCard}>
        <Row label="Transaction" value={proof.txId} mono />
        <Row label="Anchored at" value={new Date(proof.anchoredAt).toLocaleString()} />
        <Row label="Score hash" value={proof.scoreHash} mono />
      </View>

      <Text style={styles.sectionTitle}>Attestation trail</Text>
      <Text style={styles.sectionSubtitle}>
        Every peer verification behind this score, independently auditable — verifier identities are hashed to
        protect individual farmers' privacy.
      </Text>

      {proof.attestationTrail.map((a, i) => (
        <View key={`${a.entryId}-${i}`} style={styles.attestationCard}>
          <View style={styles.attestationHeader}>
            <View style={[styles.verdictDot, a.verdict === "confirm" ? styles.confirmDot : styles.flagDot]} />
            <Text style={styles.verdictLabel}>{a.verdict === "confirm" ? "Confirmed" : "Flagged"}</Text>
            <Text style={styles.timestamp}>{new Date(a.timestamp).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.hashLine} numberOfLines={1}>
            verifier {a.verifierIdHash.slice(0, 16)}…
          </Text>
          <Text style={styles.hashLine} numberOfLines={1}>
            entry {a.entryId}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  muted: { color: COLORS.textMuted, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: RADII.lg, padding: 16, marginBottom: 24 },
  row: { marginBottom: 10 },
  rowLabel: { fontSize: 12, color: COLORS.textMuted },
  rowValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  mono: { fontFamily: "monospace" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondaryAlt, marginBottom: 16 },
  attestationCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADII.md,
    padding: 12,
    marginBottom: 10,
  },
  attestationHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  verdictDot: { width: 8, height: 8, borderRadius: RADII.xs },
  confirmDot: { backgroundColor: COLORS.primary },
  flagDot: { backgroundColor: COLORS.danger },
  verdictLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  timestamp: { fontSize: 12, color: COLORS.textFaint },
  hashLine: { fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace", marginTop: 2 },
});
