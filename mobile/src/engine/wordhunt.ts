// ============================================================
//  Kelime Avı oyunu — saf üretici (Wend tarzı)
//  Setten seçilen kelimeler ızgaraya "yılan yolu" şeklinde yerleştirilir
//  (yatay/dikey komşuluk, hücre tekrarı yok). Boş kalan hücreler bloke
//  gösterilir; her harf hücresi tam bir kelimeye aittir.
// ============================================================

import type { Entry } from "../data/types";
import { lettersOf } from "./anagram";
import { shuffle } from "./shuffle";

export interface HuntWord {
  entryId: string;
  term: string;
  meaning: string;
  /** Yerleştirilen harfler (küçük, boşluksuz). */
  letters: string[];
  /** Hücre indeksleri (r*cols+c) — harf sırasıyla. */
  path: number[];
}

export interface HuntPuzzle {
  rows: number;
  cols: number;
  /** rows*cols; harf ya da null (bloke hücre). */
  grid: (string | null)[];
  words: HuntWord[];
}

/** Tur zorlukları: ızgara büyür, kelime sayısı artar. */
export const HUNT_ROUNDS = [
  { rows: 4, cols: 4, words: 3 },
  { rows: 5, cols: 4, words: 3 },
  { rows: 5, cols: 5, words: 4 },
  { rows: 6, cols: 5, words: 4 },
] as const;

export const HUNT_ROUND_BONUS = 20;

/** Kelime puanı: harf×5; ipucu kullanıldıysa yarısı. */
export function huntWordScore(letterCount: number, hinted: boolean): number {
  const base = letterCount * 5;
  return hinted ? Math.floor(base / 2) : base;
}

/** Ortogonal komşu hücre indeksleri. */
export function huntNeighbors(i: number, rows: number, cols: number): number[] {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const out: number[] = [];
  if (r > 0) out.push(i - cols);
  if (r < rows - 1) out.push(i + cols);
  if (c > 0) out.push(i - 1);
  if (c < cols - 1) out.push(i + 1);
  return out;
}

/** Bir kelimeyi boş hücrelere yılan yolu olarak yerleştir (DFS geri izleme). */
function placeWord(
  grid: (string | null)[],
  rows: number,
  cols: number,
  letters: string[]
): number[] | null {
  const free = grid
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i >= 0);

  for (const start of shuffle(free)) {
    const path: number[] = [start];
    const used = new Set<number>([start]);
    if (dfs(start, 1)) return path;

    function dfs(cur: number, depth: number): boolean {
      if (depth === letters.length) return true;
      for (const nb of shuffle(huntNeighbors(cur, rows, cols))) {
        if (grid[nb] !== null || used.has(nb)) continue;
        used.add(nb);
        path.push(nb);
        if (dfs(nb, depth + 1)) return true;
        used.delete(nb);
        path.pop();
      }
      return false;
    }
  }
  return null;
}

/**
 * Bulmaca üret: kapasiteye sığan 2+ harfli kelimelerden rastgele seçim,
 * uzundan kısaya yerleştirme; başarısız denemede yeni seçimle tekrar.
 * Uygun yerleşim bulunamazsa null (çağıran daha geniş havuzla deneyebilir).
 */
export function buildHuntPuzzle(
  entries: Entry[],
  rows: number,
  cols: number,
  wordTarget: number,
  maxAttempts = 80
): HuntPuzzle | null {
  const capacity = rows * cols;
  const candidates = entries.filter((e) => {
    const n = lettersOf(e.term).length;
    return n >= 2 && n <= capacity;
  });
  if (candidates.length < 2) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // seçim: karışık sıradan, kapasiteyi aşmadan en çok wordTarget kelime
    const selection: Entry[] = [];
    let total = 0;
    for (const e of shuffle(candidates)) {
      const n = lettersOf(e.term).length;
      if (selection.length >= wordTarget) break;
      if (total + n > capacity) continue;
      selection.push(e);
      total += n;
    }
    if (selection.length < Math.min(2, wordTarget)) continue;

    // yerleştirme: uzun kelimeler önce (geri izleme daha kolay başarır)
    const grid: (string | null)[] = Array(capacity).fill(null);
    const words: HuntWord[] = [];
    let ok = true;
    for (const e of [...selection].sort(
      (a, b) => lettersOf(b.term).length - lettersOf(a.term).length
    )) {
      const letters = lettersOf(e.term);
      const path = placeWord(grid, rows, cols, letters);
      if (!path) {
        ok = false;
        break;
      }
      path.forEach((ci, k) => (grid[ci] = letters[k]));
      words.push({ entryId: e.id, term: e.term, meaning: e.meaning, letters, path });
    }
    if (ok) return { rows, cols, grid, words };
  }
  return null;
}
