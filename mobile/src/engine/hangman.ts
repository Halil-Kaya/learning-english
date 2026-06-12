// ============================================================
//  Adam Asmaca oyunu — saf yardımcılar
//  Klavye dile özel sabit A–Z listesi DEĞİL: setteki tüm terimlerin
//  harflerinden türetilir (dil bağımsız — bkz. CLAUDE.md "Dil Mimarisi").
// ============================================================

import type { Entry } from "../data/types";
import { lettersOf } from "./anagram";

/** Yanlış tahmin hakkı (asılma aşaması sayısı). */
export const HANGMAN_MAX_WRONG = 6;

/**
 * Klavye harfleri: setteki tüm terimlerin benzersiz harfleri, sıralı.
 * (Hedef kelimenin harfleri sette zaten var; ayrıca eklemeye gerek yok.)
 */
export function hangmanAlphabet(entries: Entry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) for (const ch of lettersOf(e.term)) set.add(ch);
  return [...set].sort();
}

/** Harf terimde geçiyor mu? (küçük/büyük duyarsız) */
export function letterInTerm(term: string, ch: string): boolean {
  return lettersOf(term).includes(ch.toLowerCase());
}

/** Tüm harfler tahmin edildi mi? */
export function isWordComplete(term: string, guessed: ReadonlySet<string>): boolean {
  return lettersOf(term).every((ch) => guessed.has(ch));
}

/** Tur puanı: kalan can × kelimenin harf sayısı. */
export function hangmanScore(term: string, wrongCount: number): number {
  return Math.max(0, HANGMAN_MAX_WRONG - wrongCount) * lettersOf(term).length;
}
