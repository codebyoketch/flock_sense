import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ScoreBadge } from "@/components/ScoreBadge";
import { getMyScore } from "@/services/scores";
import type { ScoreSummary } from "@/types";
import { useFocusEffect } from "expo-router";

export default function Score() {
  const [score, setScore] = useState<ScoreSummary | null>(null);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getMyScore()
        .then(setScore)
        .catch(() => setError(true));
    }, [])
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
  muted: { color: "#777", textAlign: "center" },
  overallCard: { alignItems: "center", marginBottom: 24 },
  overallLabel: { marginTop: 8, fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  holdingCard: { backgroundColor: "#f5f5f5", borderRadius: 12, padding: 14, marginBottom: 14 },
  holdingHeader: { flexDirection: "row", alignItems: "center" },
  holdingType: { fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  holdingMeta: { fontSize: 12, color: "#777", marginTop: 2 },
  recCard: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginTop: 12 },
  recTitle: { fontSize: 13, fontWeight: "700", color: "#2e7d32" },
  recBody: { fontSize: 13, color: "#555", marginTop: 4 },
});
