import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { getPendingVerifications, submitVerification, getReciprocity } from "@/services/verification";
import type { PendingVerification, Reciprocity } from "@/types";
import { useFocusEffect } from "expo-router";

export default function Verify() {
  const [items, setItems] = useState<PendingVerification[]>([]);
  const [reciprocity, setReciprocity] = useState<Reciprocity | null>(null);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [pending, recip] = await Promise.all([getPendingVerifications(), getReciprocity()]);
      setItems(pending);
      setReciprocity(recip);
    } catch {
      // offline — leave list as-is
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleVerdict = async (entryId: string, verdict: "confirm" | "flag") => {
    if (verdict === "flag") {
      Alert.prompt?.(
        "Flag this entry",
        "What looks off?",
        async (note) => {
          await runVerdict(entryId, "flag", note);
        }
      ) ?? (await runVerdict(entryId, "flag"));
      return;
    }
    await runVerdict(entryId, "confirm");
  };

  const runVerdict = async (entryId: string, verdict: "confirm" | "flag", note?: string) => {
    setBusyEntryId(entryId);
    try {
      await submitVerification(entryId, verdict, note);
      setItems((prev) => prev.filter((i) => i.entryId !== entryId));
    } catch (e: any) {
      Alert.alert("Couldn't submit", e.message ?? "Try again once you're online.");
    } finally {
      setBusyEntryId(null);
    }
  };

  return (
    <View style={styles.container}>
      {reciprocity && (
        <View style={styles.reciprocityBar}>
          <Text style={styles.reciprocityText}>
            You've verified {reciprocity.given}, {reciprocity.owed} still owed to activate your own score
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.entryId}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.muted}>Nothing waiting on you right now.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.farmerName} · {item.holdingType}
            </Text>
            <Text style={styles.cardSub}>
              Period ending {item.periodEnd} · ~{item.estimatedCo2eKg.toFixed(1)} kg CO2e
            </Text>
            <Text style={styles.cardSub}>
              {item.verificationsSoFar}/{item.verificationsRequired} verifications so far
            </Text>
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionButton, styles.confirmButton]}
                disabled={busyEntryId === item.entryId}
                onPress={() => handleVerdict(item.entryId, "confirm")}
              >
                <Text style={styles.confirmText}>Looks right</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.flagButton]}
                disabled={busyEntryId === item.entryId}
                onPress={() => handleVerdict(item.entryId, "flag")}
              >
                <Text style={styles.flagText}>Flag as implausible</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  reciprocityBar: { backgroundColor: "#e8f5e9", padding: 12 },
  reciprocityText: { fontSize: 13, color: "#2e7d32", textAlign: "center" },
  muted: { color: "#777", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#f5f5f5", borderRadius: 10, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", textTransform: "capitalize" },
  cardSub: { fontSize: 13, color: "#666", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 8, padding: 10, alignItems: "center" },
  confirmButton: { backgroundColor: "#2e7d32" },
  confirmText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  flagButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#c62828" },
  flagText: { color: "#c62828", fontWeight: "600", fontSize: 13 },
});
