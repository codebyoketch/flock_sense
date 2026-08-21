import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { login } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { COLORS, RADII } from "@/constants/theme";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refreshFarmer } = useAuth();

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert("Missing details", "Please enter your phone number and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ phone: phone.trim(), password });
      await refreshFarmer();
    } catch (e: any) {
      Alert.alert("Login failed", e.message ?? "Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlockSense</Text>
      <Text style={styles.subtitle}>Login to your FlockSense account</Text>

      <TextInput
        style={styles.input}
        placeholder="+254 7XX XXX XXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoFocus
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Signing in..." : "Login"}</Text>
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        Don't have an account? Sign Up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.sm,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: COLORS.primary, marginTop: 16 },
});
