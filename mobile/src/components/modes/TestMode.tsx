import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { buildQuestion, shuffle } from "../../engine";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { StatBar } from "../StatBar";
import type { ModeProps } from "./types";

export function TestMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const deck = useMemo(() => shuffle(entries), [entries]);
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong] = useState<Set<string>>(() => new Set());

  const w = deck[idx];
  const q = useMemo(() => buildQuestion(w, entries), [w, entries]);

  const choose = (choiceId: string, meaning: string) => {
    if (picked) return;
    setPicked(meaning);
    const correct = choiceId === w.id;
    onRecordWord(w.id, { correct });
    if (correct) setKnow((k) => k + 1);
    else {
      setLearn((l) => l + 1);
      wrong.add(w.id);
    }
    setTimeout(() => {
      const next = idx + 1;
      if (next >= deck.length) onFinish({ know, learn: learn + (correct ? 0 : 1), wrongIds: [...wrong] });
      else {
        setIdx(next);
        setPicked(null);
      }
    }, 850);
  };

  return (
    <View style={styles.flex}>
      <StatBar know={know} learn={learn} left={deck.length - idx} total={deck.length} />

      <View style={styles.qCard}>
        <Text style={styles.label}>BU KELİMENİN ANLAMI?</Text>
        <Text style={styles.term}>{w.term}</Text>
        <Text style={styles.type}>{w.type}</Text>
        <Button title="🔊" variant="surface" small onPress={() => speak(w.term)} style={styles.speak} />
      </View>

      <View style={styles.options}>
        {q.choices.map((c) => {
          const isCorrect = c.id === w.id;
          const state =
            picked == null
              ? "idle"
              : isCorrect
                ? "correct"
                : c.meaning === picked
                  ? "wrong"
                  : "idle";
          return (
            <Pressable
              key={c.id}
              disabled={!!picked}
              onPress={() => choose(c.id, c.meaning)}
              style={[
                styles.option,
                state === "correct" && styles.correct,
                state === "wrong" && styles.wrong,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  state === "correct" && styles.correctText,
                  state === "wrong" && styles.wrongText,
                ]}
              >
                {c.meaning}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  qCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  term: { color: colors.text, fontSize: 32, fontWeight: "700", marginTop: spacing.sm },
  type: { color: colors.accent, fontSize: 14, fontStyle: "italic", marginTop: 4 },
  speak: { marginTop: spacing.md, width: 52 },
  options: { gap: spacing.sm },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  optionText: { color: colors.text, fontSize: 15 },
  correct: { borderColor: colors.ok, backgroundColor: colors.okSoft },
  correctText: { color: colors.ok },
  wrong: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  wrongText: { color: colors.bad },
});
