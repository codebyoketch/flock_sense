import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link, router } from "expo-router";
import { register } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { COLORS, RADII } from "@/constants/theme";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [farmName, setFarmName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refreshFarmer } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert("Missing details", "Please fill in your name, phone, and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please confirm your password.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        farmName: farmName.trim() || undefined,
        animalType: "unspecified", // default for now
        herdSize: 0, // default for now
      });
      await refreshFarmer();
      // No livestock holding yet — send them straight to add their first one.
      router.replace("/(tabs)/holdings");
    } catch (e: any) {
      Alert.alert("Registration failed", e.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐔 Create Account</Text>
      <Text style={styles.subtitle}>Join FlockSense and start tracking your sustainability</Text>

      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} autoFocus />
      <TextInput
        style={styles.input}
        placeholder="+254 7XX XXX XXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Farm name" value={farmName} onChangeText={setFarmName} />
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Creating account..." : "Create Account →"}</Text>
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginBottom: 20 },
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
