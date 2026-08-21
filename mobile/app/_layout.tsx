import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { watchConnectivityForSync } from "@/services/sync";
import { watchPendingVerifications } from "@/services/notifications";

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    const unsubscribe = watchConnectivityForSync();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = watchPendingVerifications();
    return unsubscribe;
  }, [isAuthenticated]);

  if (isLoading) return null; // could render a splash screen here

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="holding/[id]" options={{ headerShown: true, title: "Holding" }} />
      <Stack.Screen name="entry/[id]" options={{ headerShown: true, title: "Entry" }} />
      <Stack.Screen name="ledger/[txId]" options={{ headerShown: true, title: "On-chain Proof" }} />
      <Stack.Screen name="verification-history" options={{ headerShown: true, title: "Verification History" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
