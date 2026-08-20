import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { requestOtp, verifyOtp } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [submitting, setSubmitting] = useState(false);
  const { refreshFarmer } = useAuth();

  const handleRequestOtp = async () => {
    if (!phone.trim()) return;
    setSubmitting(true);
    try {
      await requestOtp(phone.trim());
      setStep("otp");
    } catch (e: any) {
      Alert.alert("Couldn't send code", e.message ?? "Please check your number and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setSubmitting(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
      await refreshFarmer();
    } catch (e: any) {
      Alert.alert("Code didn't match", e.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlockSense</Text>
      <Text style={styles.subtitle}>
        {step === "phone" ? "Enter your phone number to sign in" : `Enter the code sent to ${phone}`}
      </Text>

      {step === "phone" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="+254 7XX XXX XXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
          <Pressable style={styles.button} onPress={handleRequestOtp} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? "Sending..." : "Send code"}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            autoFocus
            maxLength={6}
          />
          <Pressable style={styles.button} onPress={handleVerifyOtp} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? "Verifying..." : "Verify & sign in"}</Text>
          </Pressable>
          <Pressable onPress={() => setStep("phone")}>
            <Text style={styles.link}>Use a different number</Text>
          </Pressable>
        </>
      )}

      <Link href="/(auth)/register" style={styles.link}>
        New here? Register your farm
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 15, color: "#555", textAlign: "center", marginBottom: 20 },
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
