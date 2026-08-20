import { useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { getHoldings } from "@/services/holdings";
import { logEntry } from "@/services/entries";
import type { Holding } from "@/types";
import { useFocusEffect } from "expo-router";

const ENERGY_SOURCES = ["grid", "solar", "diesel", "none"] as const;

export default function LogEntry() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [holdingId, setHoldingId] = useState<string | null>(null);
  const [feedType, setFeedType] = useState("");
  const [feedKg, setFeedKg] = useState("");
  const [energySource, setEnergySource] = useState<(typeof ENERGY_SOURCES)[number]>("grid");
  const [energyKwh, setEnergyKwh] = useState("");
  const [waterLiters, setWaterLiters] = useState("");
  const [wasteHandling, setWasteHandling] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getHoldings()
        .then((data) => {
          setHoldings(data);
          if (data.length === 1) setHoldingId(data[0].holdingId);
        })
        .catch(() => {});
    }, [])
  );

  const resetForm = () => {
    setFeedType("");
    setFeedKg("");
    setEnergyKwh("");
    setWaterLiters("");
    setWasteHandling("");
  };

  const handleSubmit = async () => {
    if (!holdingId) {
      Alert.alert("Select a holding", "Choose which livestock this entry is for.");
      return;
    }
    if (!feedKg || !waterLiters || !wasteHandling) {
      Alert.alert("Missing fields", "Please fill in feed, water, and waste handling.");
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setSubmitting(true);
    try {
      const saved = await logEntry({
        holdingId,
        periodStart: weekAgo.toISOString().slice(0, 10),
        periodEnd: now.toISOString().slice(0, 10),
        feed: { type: feedType || "unspecified", quantityKg: parseFloat(feedKg) },
        energy: { source: energySource, quantityKwh: parseFloat(energyKwh || "0") },
        water: { quantityLiters: parseFloat(waterLiters) },
        wasteHandling,
      });
      // Saved locally regardless of connectivity. If we were online, logEntry already
      // synced it and estimatedCo2eKg will be set — show it. Otherwise it'll sync
      // in the background and the estimate will appear later on the entry/holding screens.
      if (saved.estimatedCo2eKg != null) {
        Alert.alert(
          "Saved",
          `Logged — an estimated ${saved.estimatedCo2eKg.toFixed(1)} kg CO2e for this period. Awaiting peer verification.`
        );
      } else {
        Alert.alert("Saved", "Your entry has been logged and will sync automatically.");
      }
      resetForm();
    } catch (e: any) {
      Alert.alert("Couldn't save entry", e.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={styles.title}>Log this week's data</Text>

      <Text style={styles.label}>Holding</Text>
      <View style={styles.chipRow}>
        {holdings.map((h) => (
          <Pressable
            key={h.holdingId}
            style={[styles.chip, holdingId === h.holdingId && styles.chipActive]}
            onPress={() => setHoldingId(h.holdingId)}
          >
            <Text style={[styles.chipText, holdingId === h.holdingId && styles.chipTextActive]}>
              {h.count} {h.type}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Feed type</Text>
      <TextInput style={styles.input} placeholder="e.g. commercial layer feed" value={feedType} onChangeText={setFeedType} />

      <Text style={styles.label}>Feed quantity (kg)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={feedKg} onChangeText={setFeedKg} />

      <Text style={styles.label}>Energy source</Text>
      <View style={styles.chipRow}>
        {ENERGY_SOURCES.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, energySource === s && styles.chipActive]}
            onPress={() => setEnergySource(s)}
          >
            <Text style={[styles.chipText, energySource === s && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Energy usage (kWh, if any)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={energyKwh} onChangeText={setEnergyKwh} />

      <Text style={styles.label}>Water used (liters)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={waterLiters} onChangeText={setWaterLiters} />

      <Text style={styles.label}>Waste / manure handling</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. open pile, composted, biogas"
        value={wasteHandling}
        onChangeText={setWasteHandling}
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? "Saving..." : "Save entry"}</Text>
      </Pressable>
      <Text style={styles.footnote}>Saved instantly, even offline — syncs automatically when you're back online.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  chipText: { textTransform: "capitalize", color: "#333", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  submitButton: { backgroundColor: "#2e7d32", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 16 },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footnote: { fontSize: 12, color: "#888", textAlign: "center", marginTop: 8, marginBottom: 24 },
});
