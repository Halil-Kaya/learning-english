import { useMemo, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Entry } from "../../data/types";
import { shuffle } from "../../engine";
import { bracedTerm, segmentExample, stripBraces } from "../../engine/examples";
import {
  buildPyramid,
  isAuto,
  isLetter,
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

/** Piramit satırını maskele: harf → •, boşluk korunur. */
function maskRow(s: string): string {
  return [...s].map((ch) => (isLetter(ch) ? "•" : ch)).join("");
}

/** Cümle aşaması için {süslü} terimi olan bir örnek seç (yoksa ilk örnek). */
function pickSentenceExample(entry: Entry) {
  const braced = entry.examples.find((ex) => bracedTerm(ex.target) !== null);
  return braced ?? entry.examples[0] ?? null;
}

export function MemorizeMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const [deck, setDeck] = useState<Entry[]>(() => shuffle(entries));
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [scored] = useState<Set<string>>(() => new Set());
  const [wrong] = useState<Set<string>>(() => new Set());

  const w = deck[idx];
  const pyramid = useMemo(() => buildPyramid(w.term), [w]);

  // cümle aşaması: {terim} işaretli bir örnek; yalnız terim yazılır
  const sentenceEx = useMemo(() => pickSentenceExample(w), [w]);
  const sentence = useMemo(() => {
    if (!sentenceEx) return null;
    const term = bracedTerm(sentenceEx.target) ?? w.term;
    return {
      segments: segmentExample(
        sentenceEx.target.includes("{") ? sentenceEx.target : `{${term}}`
      ),
      term,
      source: sentenceEx.source,
      plain: stripBraces(sentenceEx.target),
    };
  }, [sentenceEx, w]);

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

  // aktif aşamada yazılacak hedef
  const target =
    phase === "sentence"
      ? sentence?.term ?? ""
      : phase === "down"
        ? pyramid.downs[step] ?? ""
        : phase === "up"
          ? pyramid.ups[step] ?? ""
          : "";

  // ara örnek cümle: piramit boyunca her ~3 basamakta bir değişir
  const globalStep = phase === "down" ? step : phase === "up" ? pyramid.downs.length + step : 0;
  const interExample = useMemo(() => {
    if (!w.examples.length) return null;
    const i = Math.floor(globalStep / 3) % w.examples.length;
    return w.examples[i];
  }, [w, globalStep]);

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
          ? sentence?.term ?? ""
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
      // yalnız kelime girişi sıfırlanır (piramit etkilenmez)
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
  const order: MemPhase[] = ["down", "up", "sentence", "final"];
  const curOrder = order.indexOf(phase);
  const chips: { key: MemPhase; label: string }[] = [
    { key: "down", label: "İniş" },
    { key: "up", label: "Çıkış" },
    ...(sentence ? [{ key: "sentence" as MemPhase, label: "Cümle" }] : []),
    { key: "final", label: "Final" },
  ];

  const isPyramid = phase === "down" || phase === "up";

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

      {/* ---- Piramit (iniş/çıkış) ---- */}
      {isPyramid && (
        <Animated.View style={[styles.pyramid, { transform: [{ translateX: x }] }]}>
          {/* iniş yarısı */}
          {pyramid.downs.map((row, i) => {
            const showLetters = phase === "down" && i < step;
            const isActive = phase === "down" && i === step;
            if (isActive) {
              return <LetterSlots key={`d${i}`} target={row} filled={pos} />;
            }
            return (
              <Text
                key={`d${i}`}
                style={[styles.pRow, showLetters ? styles.pDone : styles.pGhost]}
              >
                {showLetters ? row : maskRow(row)}
              </Text>
            );
          })}
          {/* çıkış yarısı */}
          {pyramid.ups.map((row, j) => {
            const showLetters = phase === "up" && j < step;
            const isActive = phase === "up" && j === step;
            if (isActive) {
              return <LetterSlots key={`u${j}`} target={row} filled={pos} />;
            }
            return (
              <Text
                key={`u${j}`}
                style={[styles.pRow, showLetters ? styles.pDone : styles.pGhost]}
              >
                {showLetters ? row : maskRow(row)}
              </Text>
            );
          })}
          {revealWord && <Text style={styles.peek}>{w.term}</Text>}
        </Animated.View>
      )}

      {/* ---- Ara örnek cümle (piramit boyunca) ---- */}
      {isPyramid && interExample && (
        <View style={styles.exBox}>
          <Text style={styles.exTitle}>ÖRNEK</Text>
          <Text style={styles.exTarget}>
            {segmentExample(interExample.target).map((seg, i) =>
              seg.isTerm ? (
                <Text key={i} style={phase === "up" ? styles.exBlank : styles.exTerm}>
                  {phase === "up" ? "•".repeat(seg.text.length) : seg.text}
                </Text>
              ) : (
                <Text key={i}>{seg.text}</Text>
              )
            )}
          </Text>
          <Text style={styles.exSource}>{interExample.source}</Text>
        </View>
      )}

      {/* ---- Cümle aşaması: yalnız terim yazılır ---- */}
      {phase === "sentence" && sentence && (
        <Animated.View style={[styles.sentenceWrap, { transform: [{ translateX: x }] }]}>
          <Text style={styles.sentence}>
            {sentence.segments.map((seg, i) =>
              seg.isTerm ? (
                <Text key={i} style={styles.sBlank}>
                  {" " + "_".repeat(Math.max(seg.text.length, 3)) + " "}
                </Text>
              ) : (
                <Text key={i}>{seg.text}</Text>
              )
            )}
          </Text>
          <Text style={styles.sentenceTr}>{sentence.source}</Text>
          <Text style={styles.sHint}>↓ yalnız kelimeyi yaz</Text>
          <LetterSlots target={sentence.term} filled={pos} />
        </Animated.View>
      )}

      {/* ---- Giriş kutusu ---- */}
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
  content: { alignItems: "center", paddingVertical: spacing.lg, paddingBottom: spacing.xl * 2 },
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

  pyramid: { alignItems: "center", marginTop: spacing.md, gap: 2 },
  pRow: { fontSize: 15, letterSpacing: 3, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  pDone: { color: colors.ok },
  pGhost: { color: colors.muted, opacity: 0.35 },
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
  exBlank: { color: colors.muted, letterSpacing: 1 },
  exSource: { color: colors.muted, fontSize: 13, fontStyle: "italic", marginTop: 4 },

  sentenceWrap: { width: "100%", alignItems: "center", marginTop: spacing.lg },
  sentence: { fontSize: 18, lineHeight: 28, fontWeight: "500", textAlign: "center", color: colors.text },
  sBlank: { color: colors.accent, fontWeight: "800" },
  sentenceTr: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.sm, textAlign: "center" },
  sHint: { color: colors.muted, fontSize: 12, marginTop: spacing.md },

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
