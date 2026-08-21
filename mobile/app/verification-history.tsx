import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getVerificationHistory } from "@/services/verification";
import { COLORS, RADII } from "@/constants/theme";
import type { VerificationHistoryItem } from "@/types";

export default function VerificationHistory() {
  const [items, setItems] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    return getVerificationHistory()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No verifications yet — given or received.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.verificationId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => <HistoryRow item={item} />}
    />
  );
}

function HistoryRow({ item }: { item: VerificationHistoryItem }) {
  const isFlag = item.verdict === "flag";
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, isFlag ? styles.iconWrapFlag : styles.iconWrapConfirm]}>
        <Ionicons
          name={isFlag ? "flag" : "checkmark"}
          size={16}
          color={isFlag ? COLORS.danger : COLORS.primary}
        />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>
          {item.direction === "given" ? `You verified ${item.counterpartyName}` : `${item.counterpartyName} verified you`}
        </Text>
        <Text style={styles.rowSubtitle}>
          {item.holdingType} · {item.verdict === "flag" ? "Flagged" : "Confirmed"}
        </Text>
        {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
      </View>
      <Text style={styles.rowDate}>{formatDate(item.createdAt)}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: COLORS.textMuted, textAlign: "center", padding: 24 },
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14, // half of width/height — intentionally not a theme radius
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapConfirm: { backgroundColor: COLORS.primaryLight },
  iconWrapFlag: { backgroundColor: COLORS.dangerLight },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textDarkest },
  rowSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, textTransform: "capitalize" },
  rowNote: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, fontStyle: "italic" },
  rowDate: { fontSize: 12, color: COLORS.textFaint },
});
