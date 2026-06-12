import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import {
  buildHuntPuzzle,
  HUNT_ROUND_BONUS,
  HUNT_ROUNDS,
  huntNeighbors,
  huntWordScore,
  type HuntPuzzle,
  type HuntWord,
} from "../../engine/wordhunt";
import { t } from "../../i18n";
import { useGames } from "../../store/games";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import type { ModeProps } from "./types";
import { useShake } from "./useShake";

/**
 * 🗺 Kelime Avı (Wend tarzı) — ızgarada gizli kelimeleri komşu hücreleri
 * takip ederek bul; her harf hücresi tam bir kelimeye aittir.
 * OYUN modu: ilerlemeye yazmaz; yüksek skor tutulur.
 * Tur ilerledikçe ızgara büyür (4×4 → 6×5). İpucu kelime puanını yarılar.
 */
export function HuntMode({ entries, speak, onFinish, setId }: ModeProps) {
  const pair = useSettings((s) => s.languagePair);
  const submitScore = useGames((s) => s.submitScore);

  const usedIds = useRef<Set<string>>(new Set()).current;
  const totals = useRef({ score: 0, know: 0, learn: 0 });
  const wrong = useRef<Set<string>>(new Set()).current;
  const finished = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Tur bulmacası kur: önce kullanılmamış kelimeler, olmadı tüm set. */
  const makeRound = (round: number): HuntPuzzle | null => {
    const cfg = HUNT_ROUNDS[round];
    const fresh = entries.filter((e) => !usedIds.has(e.id));
    const puzzle =
      buildHuntPuzzle(fresh, cfg.rows, cfg.cols, cfg.words) ??
      buildHuntPuzzle(entries, cfg.rows, cfg.cols, cfg.words);
    puzzle?.words.forEach((w) => usedIds.add(w.entryId));
    return puzzle;
  };

  const [roundIdx, setRoundIdx] = useState(0);
  const [puzzle, setPuzzle] = useState<HuntPuzzle | null>(() => makeRound(0));
  const [path, setPath] = useState<number[]>([]);
  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [foundCells, setFoundCells] = useState<Set<number>>(() => new Set());
  const [hintedIds, setHintedIds] = useState<Set<string>>(() => new Set());
  const [hintCell, setHintCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const { x, shake } = useShake();

  const endGame = () => {
    if (finished.current) return;
    finished.current = true;
    const fin = totals.current;
    const isRecord = setId ? submitScore(pair, setId, "hunt", fin.score) : false;
    onFinish({
      know: fin.know,
      learn: fin.learn,
      wrongIds: [...wrong],
      score: fin.score,
      isRecord,
    });
  };

  const nextRound = () => {
    const n = roundIdx + 1;
    if (n >= HUNT_ROUNDS.length) {
      endGame();
      return;
    }
    const p = makeRound(n);
    if (!p) {
      endGame();
      return;
    }
    setRoundIdx(n);
    setPuzzle(p);
    setPath([]);
    setFoundIds(new Set());
    setFoundCells(new Set());
    setHintedIds(new Set());
    setHintCell(null);
  };

  const acceptWord = (word: HuntWord, cells: number[]) => {
    const hinted = hintedIds.has(word.entryId);
    totals.current.score += huntWordScore(word.letters.length, hinted);
    if (hinted) {
      totals.current.learn += 1;
      wrong.add(word.entryId);
    } else {
      totals.current.know += 1;
    }

    const nextFoundIds = new Set(foundIds).add(word.entryId);
    const nextFoundCells = new Set(foundCells);
    cells.forEach((ci) => nextFoundCells.add(ci));
    setFoundIds(nextFoundIds);
    setFoundCells(nextFoundCells);
    setPath([]);
    if (hintCell !== null && word.path[0] === hintCell) setHintCell(null);
    speak(word.term);

    if (puzzle && nextFoundIds.size === puzzle.words.length) {
      totals.current.score += HUNT_ROUND_BONUS;
      setScore(totals.current.score);
      advanceTimer.current = setTimeout(nextRound, 1100);
    } else {
      setScore(totals.current.score);
    }
  };

  const tapCell = (i: number) => {
    if (!puzzle || finished.current) return;
    if (puzzle.grid[i] === null || foundCells.has(i)) return;

    const last = path[path.length - 1];
    if (path.length && i === last) {
      setPath((p) => p.slice(0, -1)); // son hücreye tekrar dokun = geri al
      return;
    }
    if (path.includes(i)) return;
    if (path.length && !huntNeighbors(last, puzzle.rows, puzzle.cols).includes(i)) {
      setPath([i]); // komşu değil → yeni başlangıç
      return;
    }

    const np = [...path, i];
    const traced = np.map((ci) => puzzle.grid[ci]).join("");
    const match = puzzle.words.find(
      (w) => !foundIds.has(w.entryId) && w.letters.join("") === traced
    );
    if (match) {
      const sameCells =
        match.path.length === np.length && match.path.every((ci) => np.includes(ci));
      if (sameCells) {
        acceptWord(match, np);
      } else {
        shake(); // harfler tuttu ama hücreler başka kelimelere ait
        setPath([]);
      }
      return;
    }
    setPath(np);
  };

  const useHint = () => {
    if (!puzzle) return;
    const unfound = puzzle.words.filter((w) => !foundIds.has(w.entryId));
    if (!unfound.length) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    setHintedIds((s) => new Set(s).add(pick.entryId));
    setHintCell(pick.path[0]);
  };

  const skipRound = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (puzzle) {
      for (const w of puzzle.words) {
        if (!foundIds.has(w.entryId)) {
          totals.current.learn += 1;
          wrong.add(w.entryId);
        }
      }
    }
    nextRound();
  };

  // set bu oyun için çok küçükse (2+ harfli en az 2 kelime gerekir) bitir
  useEffect(() => {
    if (!puzzle) endGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);
  if (!puzzle) return null;

  const { rows, cols, grid } = puzzle;
  const cfgLabel = `${rows}×${cols}`;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* skor / tur */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t("gameScore")}</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <Text style={styles.progress}>
          {t("gameHuntRound")} {roundIdx + 1}/{HUNT_ROUNDS.length} · {cfgLabel}
        </Text>
      </View>

      {/* ızgara */}
      <Animated.View style={[styles.board, { transform: [{ translateX: x }] }]}>
        {Array.from({ length: rows }).map((_, r) => (
          <View key={r} style={styles.boardRow}>
            {Array.from({ length: cols }).map((_, c) => {
              const i = r * cols + c;
              const ch = grid[i];
              if (ch === null) {
                return <View key={i} style={[styles.cell, styles.cellBlocked]} />;
              }
              const isFound = foundCells.has(i);
              const inPath = path.includes(i);
              const isHint = hintCell === i && !isFound;
              return (
                <Pressable
                  key={i}
                  onPress={() => tapCell(i)}
                  style={[
                    styles.cell,
                    styles.cellLetter,
                    isHint && styles.cellHint,
                    inPath && styles.cellPath,
                    isFound && styles.cellFound,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      inPath && styles.cellTextPath,
                      isFound && styles.cellTextFound,
                    ]}
                  >
                    {ch.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* hedef kelimeler: uzunluk kutuları + anlamlar */}
      <View style={styles.targets}>
        <Text style={styles.targetsTitle}>{t("gameHuntTargets")}</Text>
        {puzzle.words.map((w) => {
          const found = foundIds.has(w.entryId);
          return (
            <View key={w.entryId} style={styles.targetRow}>
              <View style={styles.dots}>
                {found ? (
                  <Text style={styles.targetTerm}>✓ {w.term}</Text>
                ) : (
                  w.letters.map((_, k) => <View key={k} style={styles.dot} />)
                )}
              </View>
              <Text style={styles.targetMeaning} numberOfLines={1}>
                {w.meaning}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button title={t("gameClear")} variant="ghost" small onPress={() => setPath([])} />
        <Button title={`💡 ${t("hint")}`} variant="ghost" small onPress={useHint} />
        <Button title={t("skip")} variant="ghost" small onPress={skipRound} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xl },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  stat: { alignItems: "flex-start" },
  statLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "800" },
  progress: { color: colors.muted, fontSize: 13, fontWeight: "700" },

  board: { gap: 6 },
  boardRow: { flexDirection: "row", gap: 6 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  cellBlocked: { backgroundColor: colors.bgSoft, opacity: 0.6 },
  cellLetter: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 3,
  },
  cellHint: { borderColor: colors.accent2, borderBottomColor: colors.accent2 },
  cellPath: { backgroundColor: colors.accent, borderColor: colors.accent },
  cellFound: {
    backgroundColor: colors.okSoft,
    borderColor: "rgba(74,222,128,0.45)",
    borderBottomWidth: 1,
  },
  cellText: { color: colors.text, fontSize: 22, fontWeight: "800" },
  cellTextPath: { color: "#fff" },
  cellTextFound: { color: colors.ok },

  targets: {
    marginTop: spacing.lg,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  targetsTitle: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  targetRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dots: { flexDirection: "row", gap: 4, alignItems: "center", minWidth: 96 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  targetTerm: { color: colors.ok, fontSize: 14, fontWeight: "700" },
  targetMeaning: { color: colors.muted, fontSize: 13, fontStyle: "italic", flex: 1 },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
