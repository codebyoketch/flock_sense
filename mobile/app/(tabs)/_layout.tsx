import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary }}>
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="holdings"
        options={{ title: "Holdings", tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="log-entry"
        options={{ title: "Log", tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="verify"
        options={{ title: "Verify", tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="score"
        options={{ title: "Score", tabBarIcon: ({ color, size }) => <Ionicons name="leaf" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
