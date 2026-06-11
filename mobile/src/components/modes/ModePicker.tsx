import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StudyMode } from "../../data/types";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";

const MODES: { mode: StudyMode; emoji: string; title: string; desc: string }[] = [
  { mode: "cards", emoji: "🃏", title: t("modeCards"), desc: t("modeCardsDesc") },
  { mode: "test", emoji: "🧠", title: t("modeTest"), desc: t("modeTestDesc") },
  { mode: "match", emoji: "🔗", title: t("modeMatch"), desc: t("modeMatchDesc") },
  { mode: "fill", emoji: "✏️", title: t("modeFill"), desc: t("modeFillDesc") },
  { mode: "write", emoji: "⌨️", title: t("modeWrite"), desc: t("modeWriteDesc") },
  { mode: "memorize", emoji: "🧗", title: t("modeMemorize"), desc: t("modeMemorizeDesc") },
];

export function ModePicker({ onPick }: { onPick: (m: StudyMode) => void }) {
  return (
    <View style={styles.grid}>
      {MODES.map((m) => (
        <Pressable
          key={m.mode}
          onPress={() => onPick(m.mode)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Text style={styles.emoji}>{m.emoji}</Text>
          <Text style={styles.title}>{m.title}</Text>
          <Text style={styles.desc}>{m.desc}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "space-between" },
  card: {
    width: "47.5%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 4,
  },
  pressed: { opacity: 0.85, borderColor: colors.accent },
  emoji: { fontSize: 30 },
  title: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: spacing.xs },
  desc: { color: colors.muted, fontSize: 12 },
});
