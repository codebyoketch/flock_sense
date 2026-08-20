import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getHoldings, createHolding } from "@/services/holdings";
import type { Holding, LivestockType } from "@/types";

const TYPES: LivestockType[] = ["poultry", "dairy", "goats", "other"];

export default function Holdings() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<LivestockType>("poultry");
  const [count, setCount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setHoldings(await getHoldings());
    } catch {
      // offline — keep whatever was last loaded
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    const n = parseInt(count, 10);
    if (!n || n <= 0) {
      Alert.alert("Invalid count", "Enter how many animals you have.");
      return;
    }
    setSubmitting(true);
    try {
      await createHolding(type, n);
      setModalVisible(false);
      setCount("");
      await load();
    } catch (e: any) {
      Alert.alert("Couldn't add holding", e.message ?? "Try again once you're back online.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={holdings}
        keyExtractor={(h) => h.holdingId}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.muted}>No holdings yet. Add your first below.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/holding/${item.holdingId}`)}>
            <View>
              <Text style={styles.rowTitle}>
                {item.count} {item.type}
              </Text>
              {item.score && <Text style={styles.rowSub}>Score: {item.score}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Add holding</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add a holding</Text>

            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="How many?"
              keyboardType="number-pad"
              value={count}
              onChangeText={setCount}
            />

            <Pressable style={styles.primaryButton} onPress={handleAdd} disabled={submitting}>
              <Text style={styles.primaryButtonText}>{submitting ? "Adding..." : "Add holding"}</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  muted: { color: "#777", textAlign: "center", marginTop: 40 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  rowTitle: { fontSize: 16, fontWeight: "600", textTransform: "capitalize" },
  rowSub: { fontSize: 13, color: "#777", marginTop: 2 },
  chevron: { fontSize: 20, color: "#999" },
  fab: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#2e7d32",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  fabText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  typeChipActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  typeChipText: { textTransform: "capitalize", color: "#333" },
  typeChipTextActive: { color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 14, fontSize: 16 },
  primaryButton: { backgroundColor: "#2e7d32", borderRadius: 8, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelText: { textAlign: "center", color: "#777", padding: 6 },
});
