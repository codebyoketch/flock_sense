import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { getEntriesForHolding } from "@/services/entries";
import type { Entry } from "@/types";

const STATUS_LABEL: Record<Entry["status"], string> = {
  queued: "Waiting to sync",
  pending_verification: "Awaiting verification",
  verified: "Verified",
  flagged: "Flagged for review",
};

export default function HoldingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entries, setEntries] = useState<Entry[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (id) getEntriesForHolding(id).then(setEntries);
    }, [id])
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={entries}
      keyExtractor={(e) => e.clientId}
      ListEmptyComponent={<Text style={styles.muted}>No entries logged for this holding yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.period}>
            {item.periodStart} → {item.periodEnd}
          </Text>
          <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
          {item.estimatedCo2eKg != null && (
            <Text style={styles.co2e}>~{item.estimatedCo2eKg.toFixed(1)} kg CO2e</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  muted: { color: "#777", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#f5f5f5", borderRadius: 10, padding: 14, marginBottom: 10 },
  period: { fontSize: 14, fontWeight: "600" },
  status: { fontSize: 12, color: "#777", marginTop: 2 },
  co2e: { fontSize: 13, color: "#2e7d32", marginTop: 6, fontWeight: "600" },
});
