import { useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import { shuffle } from "../../engine";
import {
  buildDecoyPool,
  buildTiles,
  isCorrect,
  MAX_DECOYS,
  roundScore,
  type Tile,
} from "../../engine/anagram";
import { isAuto } from "../../engine/memorize";
import { t } from "../../i18n";
import { useGames } from "../../store/games";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import type { ModeProps } from "./types";
import { useShake } from "./useShake";

/**
 * 🧩 Kelime Kur — anlam gösterilir, karışık harflere tıklayarak kelime kurulur.
 * OYUN modu: ilerlemeye yazmaz (onRecordWord çağrılmaz); yüksek skor tutulur.
 * Zorluk merdiveni: her doğruda +1 decoy (maks 3), her yanlışta -1.
 */
export function AnagramMode({ entries, speak, onFinish, setId }: ModeProps) {
  const pair = useSettings((s) => s.languagePair);
  const submitScore = useGames((s) => s.submitScore);

  const [deck] = useState<Entry[]>(() => shuffle(entries));
  const [idx, setIdx] = useState(0);
  const w = deck[idx];

  const [decoyLevel, setDecoyLevel] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() =>
    buildTiles(deck[0].term, 0, buildDecoyPool(deck, deck[0].term))
  );
  const [picked, setPicked] = useState<number[]>([]); // tile id sırası
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [wrong] = useState<Set<string>>(() => new Set());
  const [failedThis, setFailedThis] = useState(false);
  const [solved, setSolved] = useState(false);
  const { x, shake } = useShake();
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // setTimeout sonrası bayat closure'a düşmemek için sayaçların ref aynası
  const totals = useRef({ score: 0, know: 0, learn: 0 });

  // terim karakterleri: harf konumları kutucuklarla dolar, diğerleri sabit
  const termChars = useMemo(() => [...w.term], [w]);
  const letterCount = termChars.filter((ch) => !isAuto(ch)).length;
  const pickedChars = picked.map((id) => tiles.find((tl) => tl.id === id)?.ch ?? "");
  const activeDecoys = tiles.length - letterCount;

  const goWord = (n: number, level: number) => {
    if (n >= deck.length) {
      const fin = totals.current;
      const isRecord = setId
        ? submitScore(pair, setId, "anagram", fin.score)
        : false;
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
    setTiles(buildTiles(deck[n].term, level, buildDecoyPool(deck, deck[n].term)));
    setPicked([]);
    setFailedThis(false);
    setSolved(false);
  };

  const pickTile = (id: number) => {
    if (solved || picked.includes(id) || picked.length >= letterCount) return;
    const nextPicked = [...picked, id];
    setPicked(nextPicked);
    if (nextPicked.length < letterCount) return;

    // tüm kutular doldu → kontrol
    const guess = nextPicked.map((tid) => tiles.find((tl) => tl.id === tid)?.ch ?? "");
    if (isCorrect(w.term, guess)) {
      const nextStreak = streak + 1;
      const gained = roundScore(w.term, activeDecoys, nextStreak);
      totals.current.score += gained;
      setScore(totals.current.score);
      setStreak(nextStreak);
      setSolved(true);
      if (!failedThis) {
        totals.current.know += 1;
        setKnow(totals.current.know);
      } else {
        totals.current.learn += 1;
        setLearn(totals.current.learn);
      }
      const nextLevel = Math.min(MAX_DECOYS, decoyLevel + 1);
      setDecoyLevel(nextLevel);
      speak(w.term);
      nextTimer.current = setTimeout(() => goWord(idx + 1, nextLevel), 900);
    } else {
      shake();
      setPicked([]);
      setStreak(0);
      setDecoyLevel((d) => Math.max(0, d - 1));
      if (!failedThis) {
        setFailedThis(true);
        wrong.add(w.id);
      }
    }
  };

  const undo = () => {
    if (solved || !picked.length) return;
    setPicked((p) => p.slice(0, -1));
  };

  const clear = () => {
    if (solved) return;
    setPicked([]);
  };

  const skipWord = () => {
    if (nextTimer.current) clearTimeout(nextTimer.current);
    if (!solved) {
      wrong.add(w.id);
      totals.current.learn += 1;
      setLearn(totals.current.learn);
      setStreak(0);
    }
    const nextLevel = solved ? decoyLevel : Math.max(0, decoyLevel - 1);
    setDecoyLevel(nextLevel);
    goWord(idx + 1, nextLevel);
  };

  // kurulan kelime görünümü: harf konumları sırayla picked'ten dolar
  let pickedCursor = 0;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* skor çubuğu */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameScore")}</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <Text style={styles.progress}>
          {idx + 1}/{deck.length}
        </Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameCombo")}</Text>
          <Text style={[styles.statValue, streak >= 2 && styles.statHot]}>
            {streak >= 2 ? `${Math.min(5, streak)}x` : "—"}
          </Text>
        </View>
      </View>

      {/* soru: anlam + tür */}
      <Text style={styles.type}>{w.type}</Text>
      <Text style={styles.meaning}>{w.meaning}</Text>

      {/* kurulan kelime kutuları */}
      <Animated.View style={[styles.slotsRow, { transform: [{ translateX: x }] }]}>
        {termChars.map((ch, i) => {
          if (isAuto(ch)) {
            return (
              <Text key={i} style={styles.autoChar}>
                {ch === " " ? "␣" : ch}
              </Text>
            );
          }
          const filledCh = pickedChars[pickedCursor++];
          return (
            <View
              key={i}
              style={[styles.slot, solved && styles.slotOk, filledCh != null && !solved && styles.slotFilled]}
            >
              <Text style={[styles.slotText, solved && styles.slotTextOk]}>
                {solved ? ch : filledCh ?? ""}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {solved && <Text style={styles.solvedWord}>✓ {w.term}</Text>}

      {/* harf kutucukları */}
      <View style={styles.tilesWrap}>
        {tiles.map((tl) => {
          const used = picked.includes(tl.id);
          return (
            <Pressable
              key={tl.id}
              onPress={() => pickTile(tl.id)}
              disabled={used || solved}
              style={({ pressed }) => [
                styles.tile,
                used && styles.tileUsed,
                pressed && !used && styles.tilePressed,
              ]}
            >
              <Text style={[styles.tileText, used && styles.tileTextUsed]}>
                {tl.ch.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button title={t("gameUndo")} variant="ghost" small onPress={undo} />
        <Button title={t("gameClear")} variant="ghost" small onPress={clear} />
        <Button title={t("skip")} variant="ghost" small onPress={skipWord} />
      </View>
    </ScrollView>
  );
}

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
  statHot: { color: colors.accent2 },
  progress: { color: colors.muted, fontSize: 13, fontWeight: "700" },

  type: { color: colors.accent, fontSize: 13, fontStyle: "italic", marginTop: spacing.lg },
  meaning: {
    color: colors.text,
    fontSize: 24,
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
    marginTop: spacing.xl,
    minHeight: 46,
  },
  slot: {
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 2,
    borderRadius: radius.sm,
  },
  slotFilled: { borderColor: colors.accent, borderBottomColor: colors.accent },
  slotOk: { borderColor: colors.ok, borderBottomColor: colors.ok, backgroundColor: colors.okSoft },
  slotText: { color: colors.text, fontSize: 22, fontWeight: "700" },
  slotTextOk: { color: colors.ok },
  autoChar: { color: colors.muted, fontSize: 18, fontWeight: "700", marginHorizontal: 2 },
  solvedWord: { color: colors.ok, fontSize: 16, fontWeight: "700", marginTop: spacing.sm },

  tilesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    maxWidth: 360,
  },
  tile: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderRadius: radius.md,
  },
  tilePressed: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  tileUsed: { opacity: 0.25 },
  tileText: { color: colors.text, fontSize: 24, fontWeight: "800" },
  tileTextUsed: { color: colors.muted },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
