import { View, Text, StyleSheet } from "react-native";
import type { ScoreGrade } from "@/types";

const GRADE_COLORS: Record<ScoreGrade, string> = {
  A: "#1b5e20",
  B: "#558b2f",
  C: "#f9a825",
  D: "#ef6c00",
  E: "#c62828",
};

export function ScoreBadge({ grade, size = "medium" }: { grade: ScoreGrade; size?: "small" | "medium" | "large" }) {
  const dims = size === "small" ? 32 : size === "large" ? 72 : 48;
  const fontSize = size === "small" ? 14 : size === "large" ? 32 : 20;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: GRADE_COLORS[grade], width: dims, height: dims, borderRadius: dims / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontWeight: "700" },
});
