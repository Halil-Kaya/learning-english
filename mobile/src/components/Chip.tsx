import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

/** Filtre çipi (Keşfet) — aktifse vurgulu. */
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.active]}
    >
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

/** Sadece görsel rozet (set kartlarında seviye/kategori). */
export function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <Text
      style={[
        styles.badge,
        color ? { color, borderColor: color + "55" } : null,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  activeText: { color: "#fff" },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
  },
});
