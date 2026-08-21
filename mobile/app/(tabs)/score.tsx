import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { ScoreBadge } from "@/components/ScoreBadge";
import { getMyScore } from "@/services/scores";
import { getBadge, getBadgeShareUrl, getQrImageUrl } from "@/services/badge";
import { useAuth } from "@/context/AuthContext";
import { COLORS, RADII } from "@/constants/theme";
import type { ScoreSummary, BadgeData } from "@/types";
import { useFocusEffect, useRouter } from "expo-router";

export default function Score() {
  const router = useRouter();
  const { farmer } = useAuth();
  const [score, setScore] = useState<ScoreSummary | null>(null);
  const [badge, setBadge] = useState<BadgeData | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getMyScore()
        .then(setScore)
        .catch(() => setError(true));

      if (farmer?.farmerId) {
        getBadge(farmer.farmerId)
          .then(setBadge)
          .catch(() => setBadge(null));
      }
    }, [farmer?.farmerId])
  );

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          Your score isn't shareable yet — log a few entries and complete some peer verifications first.
        </Text>
      </View>
    );
  }

  if (!score) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.overallCard}>
        <ScoreBadge grade={score.overallScore} size="large" />
        <Text style={styles.overallLabel}>Overall sustainability score</Text>
      </View>

      {badge === undefined ? null : badge === null ? (
        <View style={styles.badgeNotReadyCard}>
          <Text style={styles.badgeNotReadyTitle}>Verified badge not shareable yet</Text>
          <Text style={styles.badgeNotReadyBody}>
            Verify a few more peers to activate your score for sharing with cooperatives, buyers, or lenders.
          </Text>
        </View>
      ) : (
        <View style={styles.badgeCard}>
          <Text style={styles.badgeCardTitle}>Verified badge</Text>
          <Image source={{ uri: getQrImageUrl(getBadgeShareUrl(farmer!.farmerId)) }} style={styles.qrImage} />
          <Text style={styles.badgeMeta}>
            Verified {new Date(badge.verifiedAt).toLocaleDateString()} · {badge.chain}
          </Text>
          <Pressable
            style={styles.proofButton}
            onPress={() => router.push(`/ledger/${badge.ledgerTxId}`)}
          >
            <Text style={styles.proofButtonText}>View on-chain proof</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>By holding</Text>
      {score.holdings.map((h) => (
        <View key={h.holdingId} style={styles.holdingCard}>
          <View style={styles.holdingHeader}>
            <ScoreBadge grade={h.score} size="small" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.holdingType}>{h.type}</Text>
              <Text style={styles.holdingMeta}>
                {h.co2ePerAnimalKg.toFixed(2)} kg CO2e/animal · trend: {h.trend}
              </Text>
            </View>
          </View>
          <View style={styles.recCard}>
            <Text style={styles.recTitle}>{h.recommendation.title}</Text>
            <Text style={styles.recBody}>{h.recommendation.body}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  muted: { color: COLORS.textMuted, textAlign: "center" },
  overallCard: { alignItems: "center", marginBottom: 24 },
  overallLabel: { marginTop: 8, fontSize: 14, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  holdingCard: { backgroundColor: COLORS.surface, borderRadius: RADII.lg, padding: 14, marginBottom: 14 },
  holdingHeader: { flexDirection: "row", alignItems: "center" },
  holdingType: { fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  holdingMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  recCard: { backgroundColor: COLORS.white, borderRadius: RADII.sm, padding: 12, marginTop: 12 },
  recTitle: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  recBody: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  badgeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  badgeCardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  qrImage: { width: 180, height: 180, borderRadius: RADII.sm, backgroundColor: COLORS.white },
  badgeMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
  proofButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  proofButtonText: { color: COLORS.white, fontWeight: "600", fontSize: 13 },
  badgeNotReadyCard: {
    backgroundColor: COLORS.warningLight,
    borderRadius: RADII.lg,
    padding: 16,
    marginBottom: 24,
  },
  badgeNotReadyTitle: { fontSize: 14, fontWeight: "700", color: COLORS.warningDarker },
  badgeNotReadyBody: { fontSize: 13, color: COLORS.warningText, marginTop: 4 },
});
