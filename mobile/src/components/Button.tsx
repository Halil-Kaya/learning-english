import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "../theme";

type Variant = "primary" | "ok" | "bad" | "ghost" | "surface";

export function Button({
  title,
  onPress,
  variant = "surface",
  small,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  small?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.text, small && styles.textSmall, { color: v.fg }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; border: string; fg: string }> = {
  primary: { bg: colors.accent, border: colors.accent, fg: "#fff" },
  ok: { bg: colors.okSoft, border: "rgba(74,222,128,0.35)", fg: colors.ok },
  bad: { bg: colors.badSoft, border: "rgba(248,113,113,0.35)", fg: colors.bad },
  ghost: { bg: "transparent", border: colors.border, fg: colors.text },
  surface: { bg: colors.surface, border: colors.border, fg: colors.text },
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  small: { paddingVertical: 8, paddingHorizontal: spacing.lg, borderRadius: radius.sm },
  text: { fontSize: 16, fontWeight: "600" },
  textSmall: { fontSize: 14 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});
