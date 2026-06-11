import { useMemo, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Entry } from "../../data/types";
import { shuffle } from "../../engine";
import { pickExample, stripBraces } from "../../engine/examples";
import {
  buildPyramid,
  isAuto,
  type MemPhase,
  skipAutos,
} from "../../engine/memorize";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { LetterSlots } from "./LetterSlots";
import type { ModeProps } from "./types";
import { useShake } from "./useShake";

const PHASE_LABEL: Record<MemPhase, string> = {
  down: t("memDown"),
  up: t("memUp"),
  sentence: t("memSentence"),
  final: t("memFinal"),
};

export function MemorizeMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const [deck, setDeck] = useState<Entry[]>(() => shuffle(entries));
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [scored] = useState<Set<string>>(() => new Set());
  const [wrong] = useState<Set<string>>(() => new Set());

  const w = deck[idx];
  const pyramid = useMemo(() => buildPyramid(w.term), [w]);
  const sentence = useMemo(() => {
    const ex = pickExample(w);
    return ex ? { target: stripBraces(ex.target), source: ex.source } : null;
  }, [w]);

  const [phase, setPhase] = useState<MemPhase>("down");
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState(() => 0);
  const [accepted, setAccepted] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; bad?: boolean } | null>(null);
  const [revealWord, setRevealWord] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [done, setDone] = useState(false);
  const [finalValue, setFinalValue] = useState("");
  const { x, shake } = useShake();

  const target =
    phase === "sentence"
      ? sentence?.target ?? ""
      : phase === "down"
        ? pyramid.downs[step] ?? ""
        : phase === "up"
          ? pyramid.ups[step] ?? ""
          : "";

  // --- bir kelimeyi sıfırla (yeni kelimeye geçince) ---
  const resetWord = (nextWord: Entry) => {
    const p = buildPyramid(nextWord.term);
    setPhase("down");
    setStep(0);
    setPos(skipAutos(p.downs[0] ?? "", 0));
    setAccepted("");
    setFeedback(null);
    setRevealWord(false);
    setPeeked(false);
    setDone(false);
    setFinalValue("");
  };

  const goNextWord = () => {
    const n = idx + 1;
    if (n >= deck.length) {
      onFinish({ know, learn, wrongIds: [...wrong] });
      return;
    }
    setIdx(n);
    resetWord(deck[n]);
  };

  // --- aşama tamamlandı ---
  const stepComplete = () => {
    let nextPhase: MemPhase = phase;
    let nextStep = step;
    if (phase === "down") {
      nextStep = step + 1;
      if (nextStep >= pyramid.downs.length) {
        nextPhase = "up";
        nextStep = 0;
        if (pyramid.ups.length === 0) nextPhase = sentence ? "sentence" : "final";
      }
    } else if (phase === "up") {
      nextStep = step + 1;
      if (nextStep >= pyramid.ups.length) nextPhase = sentence ? "sentence" : "final";
    } else if (phase === "sentence") {
      nextPhase = "final";
    }

    setFeedback(null);
    setAccepted("");
    setPhase(nextPhase);
    setStep(nextStep);
    if (nextPhase === "final") {
      setPos(0);
    } else {
      const nextTarget =
        nextPhase === "sentence"
          ? sentence?.target ?? ""
          : nextPhase === "down"
            ? pyramid.downs[nextStep] ?? ""
            : pyramid.ups[nextStep] ?? "";
      setPos(skipAutos(nextTarget, 0));
    }
  };

  // --- yanlış harf ---
  const mistake = () => {
    shake();
    if (phase === "sentence") {
      setPos(skipAutos(target, 0));
      setAccepted("");
      setFeedback({ text: t("memSentenceRestart"), bad: true });
    } else {
      // piramit baştan
      setPhase("down");
      setStep(0);
      setPos(skipAutos(pyramid.downs[0] ?? "", 0));
      setAccepted("");
      setFeedback({ text: t("memPyramidRestart"), bad: true });
    }
  };

  // --- slot girişleri (down/up/sentence) ---
  const onSlotChange = (raw: string) => {
    if (done || phase === "final") return;
    if (raw.length <= accepted.length) {
      // geri silme yok → kabul edilen değere geri dön
      setAccepted(target.slice(0, pos));
      return;
    }
    const appended = raw.slice(accepted.length);
    let p = pos;
    let failed = false;
    for (const ch of appended) {
      if (isAuto(ch)) continue; // yazılan boşluk/noktalama yok say
      p = skipAutos(target, p);
      if (p >= target.length) break;
      if (ch.toLowerCase() === target[p].toLowerCase()) {
        p++;
        p = skipAutos(target, p);
      } else {
        failed = true;
        break;
      }
    }
    if (failed) {
      mistake();
      return;
    }
    setRevealWord(false);
    if (p >= target.length) {
      stepComplete();
    } else {
      setPos(p);
      setAccepted(target.slice(0, p));
    }
  };

  // --- 👁 Göster (yalnız çıkış) ---
  const reveal = () => {
    if (phase !== "up" || done) return;
    setPeeked(true);
    if (!wrong.has(w.id)) wrong.add(w.id);
    setRevealWord(true);
    setTimeout(() => setRevealWord(false), 1600);
  };

  // --- final kontrol ---
  const checkFinal = () => {
    if (phase !== "final" || done) return;
    const guess = finalValue.trim().toLowerCase();
    if (!guess) return;
    setDone(true);
    const correct = guess === w.term.toLowerCase();
    if (!scored.has(w.id)) {
      scored.add(w.id);
      if (correct && !peeked) {
        setKnow((k) => k + 1);
        onRecordWord(w.id, { correct: true, mastered: true });
      } else {
        setLearn((l) => l + 1);
        wrong.add(w.id);
        onRecordWord(w.id, { correct: false });
      }
    }
    if (correct) {
      setFeedback({ text: `✓ Doğru! — ${w.term}` });
      speak(w.term);
    } else {
      setFeedback({ text: `✗ Yanlış. Doğrusu: "${w.term}" — kelime sona eklendi`, bad: true });
      setDeck((d) => [...d, w]); // kuyruğun sonuna
    }
  };

  const skip = () => {
    if (!scored.has(w.id)) {
      scored.add(w.id);
      setLearn((l) => l + 1);
      wrong.add(w.id);
      onRecordWord(w.id, { correct: false });
    }
    goNextWord();
  };

  // ---------- görünüm ----------
  const chips: { key: MemPhase; label: string }[] = [
    { key: "down", label: "İniş" },
    { key: "up", label: "Çıkış" },
    ...(sentence ? [{ key: "sentence" as MemPhase, label: "Cümle" }] : []),
    { key: "final", label: "Final" },
  ];
  const order: MemPhase[] = ["down", "up", "sentence", "final"];
  const curOrder = order.indexOf(phase);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>{PHASE_LABEL[phase]}</Text>

      <View style={styles.chips}>
        {chips.map((c) => {
          const ci = order.indexOf(c.key);
          const active = c.key === phase;
          const doneChip = ci < curOrder;
          let label = c.label;
          if (active && (c.key === "down" || c.key === "up")) {
            const total = c.key === "down" ? pyramid.downs.length : pyramid.ups.length;
            label += ` ${Math.min(step + 1, total)}/${total}`;
          }
          return (
            <Text key={c.key} style={[styles.chip, active && styles.chipActive, doneChip && styles.chipDone]}>
              {label}
            </Text>
          );
        })}
      </View>

      {phase === "down" && <Text style={styles.word}>{w.term}</Text>}
      <Text style={styles.type}>{w.type}</Text>
      <Text style={styles.meaning}>{w.meaning}</Text>

      {phase === "sentence" && sentence ? (
        <Animated.View style={{ transform: [{ translateX: x }] }}>
          <Text style={styles.sentence}>
            {[...sentence.target].map((ch, i) => (
              <Text
                key={i}
                style={
                  i < pos ? styles.sChDone : i === pos ? styles.sChCur : styles.sChRest
                }
              >
                {ch}
              </Text>
            ))}
          </Text>
          <Text style={styles.sentenceTr}>{sentence.source}</Text>
        </Animated.View>
      ) : phase !== "final" ? (
        <Animated.View style={{ transform: [{ translateX: x }] }}>
          {revealWord ? (
            <LetterSlots target={w.term} filled={0} revealAll />
          ) : (
            <LetterSlots target={target} filled={pos} />
          )}
        </Animated.View>
      ) : null}

      {phase !== "final" ? (
        <TextInput
          style={styles.input}
          value={accepted}
          onChangeText={onSlotChange}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          placeholder="harfleri yaz..."
          placeholderTextColor={colors.muted}
        />
      ) : (
        <TextInput
          style={styles.input}
          value={finalValue}
          onChangeText={setFinalValue}
          editable={!done}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          placeholder="kelimeyi hatırla ve yaz..."
          placeholderTextColor={colors.muted}
          onSubmitEditing={checkFinal}
        />
      )}

      <View style={styles.actions}>
        <Button title={t("listen")} variant="ghost" small onPress={() => speak(w.term)} />
        {phase === "up" && <Button title={t("reveal")} variant="ghost" small onPress={reveal} />}
        {phase === "final" && !done && (
          <Button title={t("check")} variant="primary" small onPress={checkFinal} />
        )}
        <Button title={t("skip")} variant="ghost" small onPress={skip} />
      </View>

      {feedback && (
        <Text style={[styles.fb, feedback.bad ? styles.bad : styles.good]}>{feedback.text}</Text>
      )}
      {done && <Button title={t("next")} variant="primary" onPress={goNextWord} style={styles.next} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { alignItems: "center", paddingVertical: spacing.lg },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  chips: { flexDirection: "row", gap: 6, marginTop: spacing.md, flexWrap: "wrap", justifyContent: "center" },
  chip: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  chipActive: { color: "#fff", backgroundColor: colors.accent, borderColor: colors.accent },
  chipDone: { color: colors.ok, borderColor: "rgba(74,222,128,0.35)" },
  word: { color: colors.text, fontSize: 36, fontWeight: "700", marginTop: spacing.lg },
  type: { color: colors.accent, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  meaning: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.sm, textAlign: "center" },
  sentence: { fontSize: 20, lineHeight: 30, fontWeight: "500", marginTop: spacing.lg, textAlign: "center" },
  sChDone: { color: colors.ok },
  sChCur: { color: colors.text, textDecorationLine: "underline", textDecorationColor: colors.accent },
  sChRest: { color: colors.muted, opacity: 0.5 },
  sentenceTr: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.sm, textAlign: "center" },
  input: {
    width: "100%",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    letterSpacing: 1,
    textAlign: "center",
    paddingVertical: 12,
    marginTop: spacing.lg,
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, flexWrap: "wrap", justifyContent: "center" },
  fb: { fontSize: 14, fontWeight: "600", marginTop: spacing.lg, textAlign: "center" },
  good: { color: colors.ok },
  bad: { color: colors.bad },
  next: { marginTop: spacing.lg, alignSelf: "stretch" },
});
