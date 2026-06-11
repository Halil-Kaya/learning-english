import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import { shuffle } from "../../engine";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { StatBar } from "../StatBar";
import type { ModeProps } from "./types";

export function CardsMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const deck = useMemo(() => shuffle(entries), [entries]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [wrong] = useState<Set<string>>(() => new Set());

  const w = deck[idx];

  const advance = (next: number) => {
    if (next >= deck.length) {
      onFinish({ know, learn, wrongIds: [...wrong] });
      return;
    }
    setIdx(next);
    setFlipped(false);
  };

  const onKnow = () => {
    onRecordWord(w.id, { correct: true });
    setKnow((k) => k + 1);
    advance(idx + 1);
  };
  const onLearn = () => {
    onRecordWord(w.id, { correct: false });
    wrong.add(w.id);
    setLearn((l) => l + 1);
    advance(idx + 1);
  };

  return (
    <View style={styles.flex}>
      <StatBar know={know} learn={learn} left={deck.length - idx} total={deck.length} />

      <Pressable style={styles.card} onPress={() => setFlipped((f) => !f)}>
        {!flipped ? (
          <View style={styles.face}>
            <Text style={styles.label}>İNGİLİZCE</Text>
            <Text style={styles.term}>{w.term}</Text>
            <Text style={styles.type}>{w.type}</Text>
            <Button title="🔊" variant="surface" small onPress={() => speak(w.term)} style={styles.speak} />
            <Text style={styles.hint}>karta dokun · anlamı gör</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.backContent}>
            <Text style={styles.label}>TÜRKÇE</Text>
            <Text style={styles.meaning}>{w.meaning}</Text>
            {w.examples.slice(0, 5).map((ex, i) => (
              <View key={i} style={styles.ex}>
                <Text style={styles.exEn}>{ex.target.replace(/[{}]/g, "")}</Text>
                <Text style={styles.exTr}>{ex.source}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </Pressable>

      <View style={styles.controls}>
        <Button title="✗" variant="bad" onPress={onLearn} style={styles.ctrlSm} />
        <Button title="←" variant="ghost" onPress={() => idx > 0 && advance(idx - 1)} style={styles.ctrlSm} />
        <Button title="✓ Biliyorum" variant="ok" onPress={onKnow} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    marginVertical: spacing.lg,
    padding: spacing.xl,
  },
  face: { flex: 1, alignItems: "center", justifyContent: "center" },
  backContent: { padding: spacing.sm, gap: spacing.sm },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  term: { color: colors.text, fontSize: 38, fontWeight: "700", marginTop: spacing.md },
  type: { color: colors.accent, fontSize: 14, fontStyle: "italic", marginTop: 4 },
  speak: { marginTop: spacing.lg, width: 52 },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.xl },
  meaning: { color: colors.text, fontSize: 24, fontWeight: "700", marginVertical: spacing.md },
  ex: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  exEn: { color: colors.text, fontSize: 15, lineHeight: 21 },
  exTr: { color: colors.muted, fontSize: 13, marginTop: 2 },
  controls: { flexDirection: "row", gap: spacing.sm, alignItems: "stretch" },
  ctrlSm: { width: 64 },
});
