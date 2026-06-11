import { useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { shuffle } from "../../engine";
import { isLetter } from "../../engine/memorize";
import { pickExample } from "../../engine/examples";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { StatBar } from "../StatBar";
import { LetterSlots } from "./LetterSlots";
import type { ModeProps } from "./types";
import { useShake } from "./useShake";

/** Ortak önek uzunluğu (küçük harf duyarsız). */
function commonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

export function WriteMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const deck = useMemo(() => shuffle(entries), [entries]);
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [filled, setFilled] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wrong] = useState<Set<string>>(() => new Set());
  const peeked = useRef(false);
  const { x, shake } = useShake();
  const inputRef = useRef<TextInput>(null);

  const w = deck[idx];
  const target = w.term;
  const ex = useMemo(() => pickExample(w), [w]);

  const onChange = (val: string) => {
    if (done) return;
    const fl = commonPrefix(val.toLowerCase(), target.toLowerCase());
    if (fl < val.length) shake(); // yanlış harf
    setFilled(fl);
    setRevealed(false);
    if (fl === target.length) success();
  };

  const success = () => {
    setDone(true);
    if (!peeked.current) {
      onRecordWord(w.id, { correct: true });
      setKnow((k) => k + 1);
    } else {
      onRecordWord(w.id, { correct: false });
      wrong.add(w.id);
      setLearn((l) => l + 1);
    }
    speak(target);
  };

  const reveal = () => {
    if (done) return;
    peeked.current = true;
    setRevealed(true);
    setTimeout(() => setRevealed(false), 1600);
  };

  const skip = () => {
    onRecordWord(w.id, { correct: false });
    wrong.add(w.id);
    setLearn((l) => l + 1);
    next(true);
  };

  const next = (skipped = false) => {
    const n = idx + 1;
    if (n >= deck.length) {
      const finalLearn = learn + (skipped ? 1 : 0);
      onFinish({ know, learn: finalLearn, wrongIds: [...wrong] });
      return;
    }
    setIdx(n);
    setFilled(0);
    setDone(false);
    setRevealed(false);
    peeked.current = false;
  };

  return (
    <View style={styles.flex}>
      <StatBar know={know} learn={learn} left={deck.length - idx} total={deck.length} />
      <View style={styles.card}>
        <Text style={styles.label}>BU KELİMEYİ HARF HARF YAZ</Text>
        <Text style={styles.meaning}>{w.meaning}</Text>
        <Text style={styles.type}>{w.type}</Text>

        <Animated.View style={{ transform: [{ translateX: x }] }}>
          <LetterSlots target={target} filled={filled} revealAll={revealed} />
        </Animated.View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={target.slice(0, filled)}
          onChangeText={onChange}
          editable={!done}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder="harfleri yaz..."
          placeholderTextColor={colors.muted}
        />
        {ex && <Text style={styles.tr}>{ex.source}</Text>}

        <View style={styles.actions}>
          <Button title={t("listen")} variant="ghost" small onPress={() => speak(target)} />
          <Button title={t("reveal")} variant="ghost" small onPress={reveal} />
          <Button title={t("skip")} variant="ghost" small onPress={skip} />
        </View>

        {done && <Text style={[styles.fb, styles.good]}>✓ Doğru! — {target}</Text>}
        {done && <Button title={t("next")} variant="primary" onPress={() => next()} style={styles.next} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  meaning: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.md, textAlign: "center" },
  type: { color: colors.accent, fontSize: 13, fontStyle: "italic", marginTop: 2 },
  input: {
    width: "100%",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    letterSpacing: 2,
    textAlign: "center",
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  tr: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.md, textAlign: "center" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, flexWrap: "wrap", justifyContent: "center" },
  fb: { fontSize: 15, fontWeight: "600", marginTop: spacing.lg },
  good: { color: colors.ok },
  next: { marginTop: spacing.md, alignSelf: "stretch" },
});
