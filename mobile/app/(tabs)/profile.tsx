import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/theme";

export default function Profile() {
  const { farmer, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.name}>{farmer?.name}</Text>
        <Text style={styles.meta}>{farmer?.phone}</Text>
        <Text style={styles.meta}>{farmer?.cooperativeName}</Text>
        {farmer?.location?.label && <Text style={styles.meta}>{farmer.location.label}</Text>}
      </View>

      <Pressable style={styles.row} onPress={() => router.push("/verification-history")}>
        <Text style={styles.rowLabel}>Verification history</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  name: { fontSize: 22, fontWeight: "700" },
  meta: { fontSize: 14, color: COLORS.textSecondaryAlt, marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLabel: { fontSize: 15 },
  chevron: { fontSize: 18, color: COLORS.textFaint },
  logoutButton: { marginTop: 32, padding: 14, alignItems: "center" },
  logoutText: { color: COLORS.danger, fontWeight: "600", fontSize: 15 },
});
