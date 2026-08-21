import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getEntry } from "@/services/entries";
import { COLORS } from "@/constants/theme";
import type { Entry } from "@/types";

export default function EntryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEntry(id)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Couldn't load this entry. It may still be syncing.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.period}>
        {entry.periodStart} → {entry.periodEnd}
      </Text>
      <Row label="Status" value={entry.status.replace("_", " ")} />
      <Row label="Feed" value={`${entry.feed.quantityKg} kg — ${entry.feed.type}`} />
      <Row label="Energy" value={`${entry.energy.quantityKwh} kWh (${entry.energy.source})`} />
      <Row label="Water" value={`${entry.water.quantityLiters} L`} />
      <Row label="Waste handling" value={entry.wasteHandling} />
      {entry.estimatedCo2eKg != null && <Row label="Estimated CO2e" value={`${entry.estimatedCo2eKg.toFixed(1)} kg`} />}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: COLORS.textMuted, textAlign: "center", padding: 24 },
  period: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLabel: { color: COLORS.textMuted },
  rowValue: { fontWeight: "600", textTransform: "capitalize" },
});
