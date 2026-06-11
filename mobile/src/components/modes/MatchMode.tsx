import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Entry } from "../../data/types";
import { sample, shuffle } from "../../engine";
import { colors, radius, spacing } from "../../theme";
import type { ModeProps } from "./types";

interface Tile {
  key: string;
  pairId: string;
  text: string;
  kind: "word" | "meaning";
}

export function MatchMode({ entries, onRecordWord, onFinish }: ModeProps) {
  const pool = useMemo<Entry[]>(
    () => sample(entries, Math.min(6, entries.length)),
    [entries]
  );
  const tiles = useMemo<Tile[]>(() => {
    const t: Tile[] = [];
    pool.forEach((e) => {
      t.push({ key: e.id + "-w", pairId: e.id, text: e.term, kind: "word" });
      t.push({ key: e.id + "-m", pairId: e.id, text: e.meaning, kind: "meaning" });
    });
    return shuffle(t);
  }, [pool]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [badPair, setBadPair] = useState<[string, string] | null>(null);

  const onTap = (tile: Tile) => {
    if (matched.has(tile.pairId) || badPair) return;
    if (selected === tile.key) {
      setSelected(null);
      return;
    }
    if (!selected) {
      setSelected(tile.key);
      return;
    }
    const first = tiles.find((t) => t.key === selected)!;
    if (first.pairId === tile.pairId && first.key !== tile.key) {
      const nextMatched = new Set(matched).add(tile.pairId);
      setMatched(nextMatched);
      setSelected(null);
      onRecordWord(tile.pairId, { correct: true });
      if (nextMatched.size === pool.length) {
        onFinish({ know: pool.length, learn: 0, wrongIds: [] });
      }
    } else {
      setBadPair([selected, tile.key]);
      setTimeout(() => {
        setBadPair(null);
        setSelected(null);
      }, 450);
    }
  };

  return (
    <View style={styles.flex}>
      <Text style={styles.progress}>
        {matched.size} / {pool.length} eşleşti
      </Text>
      <View style={styles.grid}>
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.pairId);
          const isSelected = selected === tile.key;
          const isBad = badPair?.includes(tile.key);
          return (
            <Pressable
              key={tile.key}
              onPress={() => onTap(tile)}
              style={[
                styles.tile,
                tile.kind === "word" && styles.wordTile,
                isSelected && styles.selected,
                isBad && styles.bad,
                isMatched && styles.matched,
              ]}
            >
              <Text style={[styles.tileText, tile.kind === "word" && styles.wordText]}>
                {tile.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingTop: spacing.lg },
  progress: { color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "space-between" },
  tile: {
    width: "47.5%",
    minHeight: 84,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  wordTile: { backgroundColor: colors.surface2 },
  wordText: { fontWeight: "800" },
  tileText: { color: colors.text, fontSize: 14, textAlign: "center" },
  selected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  bad: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  matched: { opacity: 0.2, borderColor: colors.ok },
});
