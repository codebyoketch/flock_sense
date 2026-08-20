import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { register } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cooperativeId, setCooperativeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refreshFarmer } = useAuth();

  const handleRegister = async () => {
    if (!phone.trim() || !name.trim() || !cooperativeId.trim()) {
      Alert.alert("Missing details", "Please fill in your phone, name, and cooperative.");
      return;
    }
    setSubmitting(true);
    try {
      await register({ phone: phone.trim(), name: name.trim(), cooperativeId: cooperativeId.trim() });
      await refreshFarmer();
    } catch (e: any) {
      Alert.alert("Registration failed", e.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register your farm</Text>
      <Text style={styles.subtitle}>
        You'll add your livestock (poultry, dairy, goats, etc.) after signing up.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <TextInput
        style={styles.input}
        placeholder="+254 7XX XXX XXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Cooperative code (e.g. from your coop admin)"
        value={cooperativeId}
        onChangeText={setCooperativeId}
        autoCapitalize="none"
      />

      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Creating account..." : "Create account"}</Text>
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: "#2e7d32", marginTop: 16 },
});
