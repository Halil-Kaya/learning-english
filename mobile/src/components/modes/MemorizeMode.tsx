import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Entry, Example } from "../../data/types";
import { shuffle } from "../../engine";
import { bracedTerm, segmentExample } from "../../engine/examples";
import {
  isAuto,
  isLetter,
  SENTENCE_ROUNDS,
  skipAutos,
  WRITE_ROUNDS,
  type MemPhase,
} from "../../engine/memorize";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { LetterSlots } from "./LetterSlots";
import type { ModeProps } from "./types";
import { useShake } from "./useShake";

const PHASE_LABEL: Record<MemPhase, string> = {
  write: t("memWrite"),
  sentence: t("memSentence"),
  final: t("memFinal"),
};

/** Satırı maskele: harf → •, boşluk korunur. */
function maskRow(s: string): string {
  return [...s].map((ch) => (isLetter(ch) ? "•" : ch)).join("");
}

/** Cümle aşaması için {terim} işaretli en çok N örnek seç (karışık). */
function pickSentenceExamples(entry: Entry, n = SENTENCE_ROUNDS): Example[] {
  const braced = entry.examples.filter((ex) => bracedTerm(ex.target) !== null);
  return shuffle(braced).slice(0, n);
}

export function MemorizeMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const [deck, setDeck] = useState<Entry[]>(() => shuffle(entries));
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [scored] = useState<Set<string>>(() => new Set());
  const [wrong] = useState<Set<string>>(() => new Set());

  const w = deck[idx];

  // cümle aşaması: {terim} işaretli örneklerden 3 tanesi; yalnız terim yazılır
  const sentences = useMemo(
    () =>
      pickSentenceExamples(w).map((ex) => {
        const term = bracedTerm(ex.target) ?? w.term;
        return { segments: segmentExample(ex.target), term, source: ex.source };
      }),
    [w]
  );

  const [phase, setPhase] = useState<MemPhase>("write");
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState(() => skipAutos(w.term, 0));
  const [accepted, setAccepted] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; bad?: boolean } | null>(null);
  const [revealWord, setRevealWord] = useState(false);
  const [peeked, setPeeked] = useState(false);
  const [done, setDone] = useState(false);
  const [finalValue, setFinalValue] = useState("");
  const { x, shake } = useShake();

  // iOS'ta klavye alt barı kapatmasın: klavye yüksekliği kadar boşluk bırak.
  // (Android'de pencere "resize" modunda kendiliğinden daralır.)
  const insets = useSafeAreaInsets();
  const [kbPad, setKbPad] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const show = Keyboard.addListener("keyboardWillShow", (e) =>
      setKbPad(Math.max(0, e.endCoordinates.height - insets.bottom))
    );
    const hide = Keyboard.addListener("keyboardWillHide", () => setKbPad(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [insets.bottom]);

  // aktif harf satırı her zaman görünür kalsın diye otomatik kaydırma
  const scrollRef = useRef<ScrollView>(null);
  const rowsY = useRef(0);
  const onActiveRowLayout = (e: LayoutChangeEvent) => {
    const y = rowsY.current + e.nativeEvent.layout.y;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
  };
  useEffect(() => {
    // yazma bitince (cümle/final) içerik kısalır → başa dön
    if (phase === "sentence" || phase === "final") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [phase]);

  // aktif aşamada yazılacak hedef
  const target =
    phase === "write" ? w.term : phase === "sentence" ? sentences[step]?.term ?? "" : "";

  // yazma aşamasında her ~3 satırda bir değişen örnek cümle
  const interExample = useMemo(() => {
    if (!w.examples.length) return null;
    const i = Math.floor(step / 3) % w.examples.length;
    return w.examples[i];
  }, [w, step]);

  // --- bir kelimeyi sıfırla (yeni kelimeye geçince) ---
  const resetWord = (nextWord: Entry) => {
    setPhase("write");
    setStep(0);
    setPos(skipAutos(nextWord.term, 0));
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
    if (phase === "write") {
      nextStep = step + 1;
      if (nextStep >= WRITE_ROUNDS) {
        nextPhase = sentences.length ? "sentence" : "final";
        nextStep = 0;
      }
    } else if (phase === "sentence") {
      nextStep = step + 1;
      if (nextStep >= sentences.length) {
        nextPhase = "final";
        nextStep = 0;
      }
    }

    setFeedback(null);
    setAccepted("");
    setPhase(nextPhase);
    setStep(nextStep);
    if (nextPhase === "final") {
      setPos(0);
    } else {
      const nextTarget = nextPhase === "write" ? w.term : sentences[nextStep]?.term ?? "";
      setPos(skipAutos(nextTarget, 0));
    }
  };

  // --- yanlış harf: yalnız aktif satır/cümle girişi baştan ---
  const mistake = () => {
    shake();
    setPos(skipAutos(target, 0));
    setAccepted("");
    setFeedback({
      text: phase === "sentence" ? t("memSentenceRestart") : t("memRowRestart"),
      bad: true,
    });
  };

  // --- slot girişleri (write/sentence) ---
  const onSlotChange = (raw: string) => {
    if (done || phase === "final") return;
    if (raw.length <= accepted.length) {
      setAccepted(target.slice(0, pos));
      return;
    }
    const appended = raw.slice(accepted.length);
    let p = pos;
    let failed = false;
    for (const ch of appended) {
      if (isAuto(ch)) continue;
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

  // --- 👁 Göster (yalnız cümle aşaması; kelime artık gizli) ---
  const reveal = () => {
    if (phase !== "sentence" || done) return;
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
      setDeck((d) => [...d, w]);
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
  const order: MemPhase[] = ["write", "sentence", "final"];
  const curOrder = order.indexOf(phase);
  const chips: { key: MemPhase; label: string }[] = [
    { key: "write", label: "Yaz" },
    ...(sentences.length ? [{ key: "sentence" as MemPhase, label: "Cümle" }] : []),
    { key: "final", label: "Final" },
  ];

  return (
    <View style={[styles.flex, kbPad > 0 && { paddingBottom: kbPad }]}>
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>{PHASE_LABEL[phase]}</Text>

      <View style={styles.chips}>
        {chips.map((c) => {
          const ci = order.indexOf(c.key);
          const active = c.key === phase;
          const doneChip = ci < curOrder;
          let label = c.label;
          if (active && c.key === "write") {
            label += ` ${Math.min(step + 1, WRITE_ROUNDS)}/${WRITE_ROUNDS}`;
          }
          if (active && c.key === "sentence") {
            label += ` ${Math.min(step + 1, sentences.length)}/${sentences.length}`;
          }
          return (
            <Text key={c.key} style={[styles.chip, active && styles.chipActive, doneChip && styles.chipDone]}>
              {label}
            </Text>
          );
        })}
      </View>

      {phase === "write" && <Text style={styles.word}>{w.term}</Text>}
      <Text style={styles.type}>{w.type}</Text>
      <Text style={styles.meaning}>{w.meaning}</Text>

      {/* ---- Yazma aşaması: kelimeyi 10 kez tam haliyle yaz ---- */}
      {phase === "write" && (
        <Animated.View
          style={[styles.rows, { transform: [{ translateX: x }] }]}
          onLayout={(e) => (rowsY.current = e.nativeEvent.layout.y)}
        >
          {Array.from({ length: WRITE_ROUNDS }).map((_, i) => {
            if (i === step) {
              return (
                <View key={i} onLayout={onActiveRowLayout}>
                  <LetterSlots target={w.term} filled={pos} />
                </View>
              );
            }
            const isDone = i < step;
            return (
              <Text key={i} style={[styles.row, isDone ? styles.rowDone : styles.rowGhost]}>
                {isDone ? w.term : maskRow(w.term)}
              </Text>
            );
          })}
        </Animated.View>
      )}

      {/* ---- Ara örnek cümle (yazma boyunca) ---- */}
      {phase === "write" && interExample && (
        <View style={styles.exBox}>
          <Text style={styles.exTitle}>ÖRNEK</Text>
          <Text style={styles.exTarget}>
            {segmentExample(interExample.target).map((seg, i) =>
              seg.isTerm ? (
                <Text key={i} style={styles.exTerm}>
                  {seg.text}
                </Text>
              ) : (
                <Text key={i}>{seg.text}</Text>
              )
            )}
          </Text>
          <Text style={styles.exSource}>{interExample.source}</Text>
        </View>
      )}

      {/* ---- Cümle aşaması: 3 örnek cümlede boşluğu doldur ---- */}
      {phase === "sentence" && sentences[step] && (
        <Animated.View style={[styles.sentenceWrap, { transform: [{ translateX: x }] }]}>
          <Text style={styles.sentence}>
            {sentences[step].segments.map((seg, i) =>
              seg.isTerm ? (
                <Text key={i} style={styles.sBlank}>
                  {" " + "_".repeat(Math.max(seg.text.length, 3)) + " "}
                </Text>
              ) : (
                <Text key={i}>{seg.text}</Text>
              )
            )}
          </Text>
          <Text style={styles.sentenceTr}>{sentences[step].source}</Text>
          <Text style={styles.sHint}>↓ yalnız kelimeyi yaz</Text>
          <LetterSlots target={sentences[step].term} filled={pos} />
          {revealWord && <Text style={styles.peek}>{w.term}</Text>}
        </Animated.View>
      )}

    </ScrollView>

    {/* ---- Sabit alt bar: giriş + eylemler (klavyenin hemen üstünde) ---- */}
    <View style={styles.bottom}>
      {feedback && (
        <Text style={[styles.fb, feedback.bad ? styles.bad : styles.good]}>{feedback.text}</Text>
      )}

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
        {phase === "sentence" && <Button title={t("reveal")} variant="ghost" small onPress={reveal} />}
        {phase === "final" && !done && (
          <Button title={t("check")} variant="primary" small onPress={checkFinal} />
        )}
        <Button title={t("skip")} variant="ghost" small onPress={skip} />
      </View>

      {done && <Button title={t("next")} variant="primary" onPress={goNextWord} style={styles.next} />}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { alignItems: "center", paddingTop: spacing.md, paddingBottom: spacing.lg },
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
  word: { color: colors.text, fontSize: 32, fontWeight: "700", marginTop: spacing.md },
  type: { color: colors.accent, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  meaning: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: spacing.sm, textAlign: "center" },

  rows: { alignItems: "center", marginTop: spacing.md, gap: 2 },
  row: { fontSize: 15, letterSpacing: 3, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  rowDone: { color: colors.ok },
  rowGhost: { color: colors.muted, opacity: 0.35 },
  peek: { color: colors.accent, fontSize: 24, fontWeight: "800", letterSpacing: 2, marginTop: spacing.sm },

  exBox: {
    width: "100%",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  exTitle: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700", marginBottom: 4 },
  exTarget: { color: colors.text, fontSize: 15, lineHeight: 22 },
  exTerm: { color: colors.accent, fontWeight: "700" },
  exSource: { color: colors.muted, fontSize: 13, fontStyle: "italic", marginTop: 4 },

  sentenceWrap: { width: "100%", alignItems: "center", marginTop: spacing.lg },
  sentence: { fontSize: 18, lineHeight: 28, fontWeight: "500", textAlign: "center", color: colors.text },
  sBlank: { color: colors.accent, fontWeight: "800" },
  sentenceTr: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.sm, textAlign: "center" },
  sHint: { color: colors.muted, fontSize: 12, marginTop: spacing.md },

  bottom: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
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
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap", justifyContent: "center" },
  fb: { fontSize: 13, fontWeight: "600", marginBottom: spacing.sm, textAlign: "center" },
  good: { color: colors.ok },
  bad: { color: colors.bad },
  next: { marginTop: spacing.sm, alignSelf: "stretch" },
});
