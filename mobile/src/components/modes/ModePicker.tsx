import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { StudyMode } from "../../data/types";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";

interface ModeCard {
  mode: StudyMode;
  emoji: string;
  title: string;
  desc: string;
}

const MODES: ModeCard[] = [
  { mode: "cards", emoji: "🃏", title: t("modeCards"), desc: t("modeCardsDesc") },
  { mode: "test", emoji: "🧠", title: t("modeTest"), desc: t("modeTestDesc") },
  { mode: "match", emoji: "🔗", title: t("modeMatch"), desc: t("modeMatchDesc") },
  { mode: "fill", emoji: "✏️", title: t("modeFill"), desc: t("modeFillDesc") },
  { mode: "write", emoji: "⌨️", title: t("modeWrite"), desc: t("modeWriteDesc") },
  { mode: "memorize", emoji: "🧗", title: t("modeMemorize"), desc: t("modeMemorizeDesc") },
];

/** Oyunlar: ilerlemeye yazmaz, yüksek skor tutar (bkz. GAMES-SPEC.md). */
const GAMES: ModeCard[] = [
  { mode: "anagram", emoji: "🧩", title: t("modeAnagram"), desc: t("modeAnagramDesc") },
  { mode: "race", emoji: "⏱", title: t("modeRace"), desc: t("modeRaceDesc") },
  { mode: "hangman", emoji: "🪢", title: t("modeHangman"), desc: t("modeHangmanDesc") },
  { mode: "hunt", emoji: "🗺", title: t("modeHunt"), desc: t("modeHuntDesc") },
];

export function ModePicker({ onPick }: { onPick: (m: StudyMode) => void }) {
  const renderGroup = (cards: ModeCard[]) => (
    <View style={styles.grid}>
      {cards.map((m) => (
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

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t("pickerStudyHeader")}</Text>
      {renderGroup(MODES)}
      <Text style={[styles.header, styles.gamesHeader]}>{t("pickerGamesHeader")}</Text>
      {renderGroup(GAMES)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  header: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  gamesHeader: { marginTop: spacing.xl },
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
