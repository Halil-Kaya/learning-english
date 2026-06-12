import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import { shuffle } from "../../engine";
import {
  HANGMAN_MAX_WRONG,
  hangmanAlphabet,
  hangmanScore,
  isWordComplete,
  letterInTerm,
} from "../../engine/hangman";
import { isAuto } from "../../engine/memorize";
import { t } from "../../i18n";
import { useGames } from "../../store/games";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import type { ModeProps } from "./types";

/** Asılma figürü: yanlış sayısına göre parça parça çizilir (monospace). */
function figure(wrong: number): string {
  const head = wrong >= 1 ? "○" : " ";
  const torso = wrong >= 2 ? "│" : " ";
  const lArm = wrong >= 3 ? "╱" : " ";
  const rArm = wrong >= 4 ? "╲" : " ";
  const lLeg = wrong >= 5 ? "╱" : " ";
  const rLeg = wrong >= 6 ? "╲" : " ";
  return [
    " ┌───┐ ",
    ` │   ${head} `,
    ` │  ${lArm}${torso}${rArm}`,
    ` │  ${lLeg} ${rLeg}`,
    "─┴─────",
  ].join("\n");
}

/**
 * 🪢 Adam Asmaca — anlam + tür ipucuyla harf tahmini; 6 yanlış hakkı.
 * OYUN modu: ilerlemeye yazmaz; yüksek skor tutulur.
 * Puan: kalan can × kelimenin harf sayısı.
 */
export function HangmanMode({ entries, speak, onFinish, setId }: ModeProps) {
  const pair = useSettings((s) => s.languagePair);
  const submitScore = useGames((s) => s.submitScore);

  const [deck] = useState<Entry[]>(() => shuffle(entries));
  const alphabet = useMemo(() => hangmanAlphabet(deck), [deck]);

  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null);

  const totals = useRef({ score: 0, know: 0, learn: 0 });
  const wrong = useRef<Set<string>>(new Set()).current;
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const w = deck[idx];
  const termChars = useMemo(() => [...w.term], [w]);

  const goWord = (n: number) => {
    if (n >= deck.length) {
      const fin = totals.current;
      const isRecord = setId ? submitScore(pair, setId, "hangman", fin.score) : false;
      onFinish({
        know: fin.know,
        learn: fin.learn,
        wrongIds: [...wrong],
        score: fin.score,
        isRecord,
      });
      return;
    }
    setIdx(n);
    setGuessed(new Set());
    setWrongCount(0);
    setOutcome(null);
  };

  const guess = (ch: string) => {
    if (outcome || guessed.has(ch)) return;
    const nextGuessed = new Set(guessed).add(ch);
    setGuessed(nextGuessed);

    if (letterInTerm(w.term, ch)) {
      if (isWordComplete(w.term, nextGuessed)) {
        totals.current.score += hangmanScore(w.term, wrongCount);
        totals.current.know += 1;
        setScore(totals.current.score);
        setKnow(totals.current.know);
        setOutcome("won");
        speak(w.term);
        nextTimer.current = setTimeout(() => goWord(idx + 1), 1200);
      }
    } else {
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      if (nextWrong >= HANGMAN_MAX_WRONG) {
        totals.current.learn += 1;
        setLearn(totals.current.learn);
        wrong.add(w.id);
        setOutcome("lost");
        nextTimer.current = setTimeout(() => goWord(idx + 1), 1600);
      }
    }
  };

  const skipWord = () => {
    if (nextTimer.current) clearTimeout(nextTimer.current);
    if (!outcome) {
      totals.current.learn += 1;
      setLearn(totals.current.learn);
      wrong.add(w.id);
    }
    goWord(idx + 1);
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* skor / ilerleme / kalan hak */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameScore")}</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <Text style={styles.progress}>
          {idx + 1}/{deck.length}
        </Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameLivesLeft")}</Text>
          <Text style={[styles.statValue, wrongCount >= 4 && styles.statDanger]}>
            {HANGMAN_MAX_WRONG - wrongCount}
          </Text>
        </View>
      </View>

      {/* figür + ipucu */}
      <Text style={styles.figure}>{figure(wrongCount)}</Text>
      <Text style={styles.type}>{w.type}</Text>
      <Text style={styles.meaning}>{w.meaning}</Text>

      {/* kelime kutuları */}
      <View style={styles.slotsRow}>
        {termChars.map((ch, i) => {
          if (isAuto(ch)) {
            return (
              <Text key={i} style={styles.autoChar}>
                {ch === " " ? "␣" : ch}
              </Text>
            );
          }
          const hit = guessed.has(ch.toLowerCase());
          const showLost = outcome === "lost" && !hit;
          return (
            <View
              key={i}
              style={[styles.slot, hit && styles.slotOk, showLost && styles.slotBad]}
            >
              <Text
                style={[
                  styles.slotText,
                  hit && styles.slotTextOk,
                  showLost && styles.slotTextBad,
                ]}
              >
                {hit || showLost ? ch : ""}
              </Text>
            </View>
          );
        })}
      </View>

      {outcome === "won" && <Text style={styles.wonText}>✓ {w.term}</Text>}
      {outcome === "lost" && (
        <Text style={styles.lostText}>
          {t("gameHangmanLost")} {w.term}
        </Text>
      )}

      {/* klavye: setin harflerinden türetilmiş */}
      <View style={styles.keys}>
        {alphabet.map((ch) => {
          const used = guessed.has(ch);
          const hit = used && letterInTerm(w.term, ch);
          const miss = used && !hit;
          return (
            <Pressable
              key={ch}
              disabled={used || !!outcome}
              onPress={() => guess(ch)}
              style={({ pressed }) => [
                styles.key,
                hit && styles.keyHit,
                miss && styles.keyMiss,
                pressed && !used && styles.keyPressed,
              ]}
            >
              <Text style={[styles.keyText, hit && styles.keyTextHit, miss && styles.keyTextMiss]}>
                {ch.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button title={t("skip")} variant="ghost" small onPress={skipWord} />
      </View>
    </ScrollView>
  );
}

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { alignItems: "center", paddingTop: spacing.md, paddingBottom: spacing.xl },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stat: { alignItems: "center", minWidth: 64 },
  statLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "800" },
  statDanger: { color: colors.bad },
  progress: { color: colors.muted, fontSize: 13, fontWeight: "700" },

  figure: {
    color: colors.accent2,
    fontFamily: MONO,
    fontSize: 16,
    lineHeight: 20,
    marginTop: spacing.md,
    textAlign: "left",
  },
  type: { color: colors.accent, fontSize: 13, fontStyle: "italic", marginTop: spacing.md },
  meaning: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: spacing.xs,
    textAlign: "center",
  },

  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.lg,
    minHeight: 44,
  },
  slot: {
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 2,
    borderRadius: radius.sm,
  },
  slotOk: { borderBottomColor: colors.ok },
  slotBad: { borderColor: colors.bad, borderBottomColor: colors.bad },
  slotText: { color: colors.text, fontSize: 19, fontWeight: "700" },
  slotTextOk: { color: colors.ok },
  slotTextBad: { color: colors.bad },
  autoChar: { color: colors.muted, fontSize: 16, fontWeight: "700", marginHorizontal: 2 },

  wonText: { color: colors.ok, fontSize: 16, fontWeight: "700", marginTop: spacing.sm },
  lostText: { color: colors.bad, fontSize: 16, fontWeight: "700", marginTop: spacing.sm },

  keys: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7,
    marginTop: spacing.lg,
    maxWidth: 360,
  },
  key: {
    width: 40,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderRadius: radius.md,
  },
  keyPressed: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  keyHit: { backgroundColor: colors.okSoft, borderColor: colors.ok, opacity: 0.7 },
  keyMiss: { backgroundColor: colors.badSoft, borderColor: colors.bad, opacity: 0.5 },
  keyText: { color: colors.text, fontSize: 18, fontWeight: "800" },
  keyTextHit: { color: colors.ok },
  keyTextMiss: { color: colors.bad },

  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
});
