import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { COLORS, RADII } from "@/constants/theme";

export function SyncStatusIndicator() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: isConnected ? COLORS.primary : COLORS.disabled }]} />
      <Text style={styles.label}>{isConnected ? "Synced" : "Offline — will sync when connected"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: RADII.xs },
  label: { fontSize: 12, color: COLORS.textMuted },
});
