import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import { buildQuestion, shuffle } from "../../engine";
import { racePoints, raceTimeMs, RACE_LIVES } from "../../engine/race";
import { t } from "../../i18n";
import { useGames } from "../../store/games";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";
import type { ModeProps } from "./types";

type Picked = {
  /** Kullanıcının dokunduğu seçenek (zaman aşımında null). */
  optionId: string | null;
  outcome: "correct" | "wrong" | "timeout";
} | null;

/**
 * ⏱ Zaman Yarışı — anlam gösterilir, 4 seçenekten doğru kelimeyi süre
 * dolmadan seç. 3 can; süre her 5 doğruda kısalır (8sn → min 3sn).
 * OYUN modu: ilerlemeye yazmaz; yüksek skor tutulur. Deste bitince
 * karıştırılıp başa sarar — oyun can bazlı biter.
 */
export function RaceMode({ entries, speak, onFinish, setId }: ModeProps) {
  const pair = useSettings((s) => s.languagePair);
  const submitScore = useGames((s) => s.submitScore);

  const deckRef = useRef<Entry[]>(shuffle(entries));
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<Picked>(null);
  const [lives, setLives] = useState(RACE_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // setTimeout/animasyon callback'lerinde bayat closure'a düşmemek için
  const totals = useRef({ score: 0, streak: 0, lives: RACE_LIVES, correct: 0, wrong: 0 });
  const wrong = useRef<Set<string>>(new Set()).current;
  const finished = useRef(false);

  const w = deckRef.current[qIdx % deckRef.current.length];
  const q = useMemo(() => buildQuestion(w, entries), [w, entries]);
  const timeMs = useMemo(() => raceTimeMs(totals.current.correct), [qIdx]);

  // süre çubuğu animasyonu: soru başına 1 → 0
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (finished.current) return;
    progress.setValue(1);
    const anim = Animated.timing(progress, {
      toValue: 0,
      duration: timeMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start(({ finished: ranOut }) => {
      if (ranOut) onTimeout();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx]);

  const endGame = () => {
    if (finished.current) return;
    finished.current = true;
    const fin = totals.current;
    const isRecord = setId ? submitScore(pair, setId, "race", fin.score) : false;
    onFinish({
      know: fin.correct,
      learn: fin.wrong,
      wrongIds: [...wrong],
      score: fin.score,
      isRecord,
    });
  };

  const goNext = () => {
    if (finished.current) return;
    if (totals.current.lives <= 0) {
      endGame();
      return;
    }
    setPicked(null);
    setQIdx((i) => {
      const n = i + 1;
      if (n % deckRef.current.length === 0) {
        deckRef.current = shuffle(entries);
      }
      return n;
    });
  };

  const loseLife = (optionId: string | null, outcome: "wrong" | "timeout") => {
    totals.current.lives -= 1;
    totals.current.streak = 0;
    totals.current.wrong += 1;
    wrong.add(w.id);
    setLives(totals.current.lives);
    setStreak(0);
    setPicked({ optionId, outcome });
    setTimeout(goNext, 1100);
  };

  const onTimeout = () => {
    if (finished.current) return;
    loseLife(null, "timeout");
  };

  const choose = (c: Entry) => {
    if (picked || finished.current) return;
    progress.stopAnimation();
    if (c.id === w.id) {
      totals.current.streak += 1;
      totals.current.correct += 1;
      totals.current.score += racePoints(totals.current.streak);
      setScore(totals.current.score);
      setStreak(totals.current.streak);
      setPicked({ optionId: c.id, outcome: "correct" });
      speak(w.term);
      setTimeout(goNext, 700);
    } else {
      loseLife(c.id, "wrong");
    }
  };

  const barColor = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [colors.bad, colors.accent2, colors.accent2],
  });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const hearts =
    "❤️".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, RACE_LIVES - lives));

  return (
    <View style={styles.flex}>
      {/* skor / can / seri */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameScore")}</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <Text style={styles.hearts}>{hearts}</Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameCombo")}</Text>
          <Text style={[styles.statValue, streak >= 2 && styles.statHot]}>
            {streak >= 2 ? `${Math.min(5, streak)}x` : "—"}
          </Text>
        </View>
      </View>

      {/* süre çubuğu */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
      </View>

      {/* soru: anlam */}
      <View style={styles.qCard}>
        <Text style={styles.label}>{t("gameRacePrompt")}</Text>
        <Text style={styles.meaning}>{w.meaning}</Text>
        <Text style={styles.type}>{w.type}</Text>
      </View>

      {/* seçenekler: hedef dilde terimler */}
      <View style={styles.options}>
        {q.choices.map((c) => {
          const isAnswer = c.id === w.id;
          const isPickedWrong =
            picked?.outcome === "wrong" && picked.optionId === c.id;
          return (
            <Pressable
              key={c.id}
              disabled={!!picked}
              onPress={() => choose(c)}
              style={[
                styles.option,
                picked && isAnswer && styles.correct,
                isPickedWrong && styles.wrong,
                picked && !isAnswer && !isPickedWrong && styles.dim,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  picked && isAnswer && styles.correctText,
                  isPickedWrong && styles.wrongText,
                ]}
              >
                {c.term}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {picked?.outcome === "timeout" && (
        <Text style={styles.timeoutText}>{t("gameTimeUp")}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  stat: { alignItems: "center", minWidth: 64 },
  statLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "800" },
  statHot: { color: colors.accent2 },
  hearts: { fontSize: 18, letterSpacing: 2 },

  barTrack: {
    height: 8,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: radius.pill },

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
  meaning: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: spacing.sm, textAlign: "center" },
  type: { color: colors.accent, fontSize: 14, fontStyle: "italic", marginTop: 4 },

  options: { gap: spacing.sm },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  optionText: { color: colors.text, fontSize: 16, fontWeight: "600", textAlign: "center" },
  correct: { borderColor: colors.ok, backgroundColor: colors.okSoft },
  correctText: { color: colors.ok },
  wrong: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  wrongText: { color: colors.bad },
  dim: { opacity: 0.45 },
  timeoutText: {
    color: colors.bad,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.md,
  },
});
