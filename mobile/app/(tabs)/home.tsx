import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useAuth } from "@/context/AuthContext";
import { getMyScore } from "@/services/scores";
import { getPendingVerifications } from "@/services/verification";
import { getHoldings } from "@/services/holdings";
import { COLORS, RADII } from "@/constants/theme";
import type { ScoreSummary, PendingVerification } from "@/types";

export default function Home() {
  const router = useRouter();
  const { farmer } = useAuth();
  const [score, setScore] = useState<ScoreSummary | null>(null);
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [hasHoldings, setHasHoldings] = useState<boolean | null>(null); // null = still checking
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const holdings = await getHoldings();
      setHasHoldings(holdings.length > 0);
    } catch {
      // offline — leave as whatever we last knew
    }
    try {
      const [scoreRes, pendingRes] = await Promise.all([getMyScore(), getPendingVerifications()]);
      setScore(scoreRes);
      setPending(pendingRes);
    } catch {
      // Offline or not yet scored — screen still renders with whatever we have.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Karibu, {farmer?.name?.split(" ")[0] ?? "there"}</Text>
      <SyncStatusIndicator />

      {hasHoldings === false ? (
        <View style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>Add your first holding</Text>
          <Text style={styles.onboardingBody}>
            Tell us what livestock you keep — poultry, dairy, goats, and more — so you can start logging data
            and building your sustainability score.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/holdings")}>
            <Text style={styles.primaryButtonText}>Add a holding</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.scoreCard}>
            {score ? (
              <>
                <ScoreBadge grade={score.overallScore} size="large" />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={styles.scoreLabel}>Overall sustainability score</Text>
                  <Text style={styles.holdingSummary}>
                    {(score.holdings ?? []).map((h) => `${h.type[0].toUpperCase()}${h.type.slice(1)}: ${h.score}`).join(" · ")}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.muted}>Log entries to see your score here.</Text>
            )}
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/log-entry")}>
            <Text style={styles.primaryButtonText}>Log this week's data</Text>
          </Pressable>
        </>
      )}

      {pending.length > 0 && (
        <Pressable style={styles.verifyCard} onPress={() => router.push("/(tabs)/verify")}>
          <Text style={styles.verifyText}>
            {pending.length} {pending.length === 1 ? "entry" : "entries"} waiting for your verification
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 16,
    marginTop: 20,
  },
  scoreLabel: { fontSize: 14, color: COLORS.textSecondary },
  holdingSummary: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  muted: { color: COLORS.textMuted },
  onboardingCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADII.lg,
    padding: 20,
    marginTop: 20,
  },
  onboardingTitle: { fontSize: 17, fontWeight: "700", color: COLORS.primaryDark },
  onboardingBody: { fontSize: 14, color: COLORS.primaryDarkText, marginTop: 8, lineHeight: 20 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  verifyCard: {
    backgroundColor: COLORS.warningLight,
    borderRadius: RADII.md,
    padding: 14,
    marginTop: 16,
  },
  verifyText: { color: COLORS.warningDarker, fontWeight: "600" },
});
