import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryEmoji, categoryLabel, levelLabel } from "../data/categories";
import type { WordSet } from "../data/types";
import { masteredCount, useLibrary } from "../store/library";
import { useSettings } from "../store/settings";
import { colors, levelColor, radius, spacing } from "../theme";
import { Badge } from "./Chip";

/** Hedef/keşfet/geçmiş listelerinde kullanılan set kartı. */
export function SetCard({
  set,
  onPress,
  right,
  subtitle,
}: {
  set: WordSet;
  onPress?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
}) {
  const pair = useSettings((s) => s.languagePair);
  const states = useLibrary((s) => s.wordStates[pair]);
  const total = set.entries.length;
  const mastered = masteredCount(states, set.entries.map((e) => e.id));
  const pct = total ? Math.round((mastered / total) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headRow}>
        <Text style={styles.emoji}>{categoryEmoji(set.category)}</Text>
        <View style={styles.flex}>
          <Text style={styles.name}>{set.name}</Text>
          <Text style={styles.sub}>
            {subtitle ??
              `${categoryLabel(set.category)} · ${total} kelime`}
          </Text>
        </View>
        {right}
      </View>
      <View style={styles.metaRow}>
        <Badge
          label={levelLabel(set.level)}
          color={levelColor[set.level]}
        />
        {mastered > 0 && (
          <Text style={styles.progress}>{mastered}/{total} ezberlendi</Text>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85, borderColor: colors.accent },
  headRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
  emoji: { fontSize: 26 },
  name: { color: colors.text, fontSize: 17, fontWeight: "700" },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  progress: { color: colors.muted, fontSize: 12 },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.accent2 },
});
