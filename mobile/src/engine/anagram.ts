// ============================================================
//  Kelime Kur oyunu — saf yardımcılar
//  Anlam gösterilir; karışık harf kutucuklarına tıklayarak kelime
//  kurulur. Şaşırtıcı (decoy) harfler dile özel sabit listeden DEĞİL,
//  setteki diğer kelimelerin harflerinden seçilir (dil bağımsız).
// ============================================================

import type { Entry } from "../data/types";
import { isLetter } from "./memorize";
import { shuffle } from "./shuffle";

/** Zorluk merdiveni üst sınırı: en fazla bu kadar şaşırtıcı harf. */
export const MAX_DECOYS = 3;

/** Bir harf kutucuğu (id: aynı harften birden çok olabilir). */
export interface Tile {
  id: number;
  ch: string;
}

/** Terimin yalnız harf karakterleri (boşluk/noktalama atılır), küçük harf. */
export function lettersOf(term: string): string[] {
  return [...term.toLowerCase()].filter(isLetter);
}

/**
 * Decoy havuzu: setteki DİĞER girdilerin harfleri (terimin kendi
 * harfleri hariç tutulmaz — tekrarlar havuzdaki ağırlığı belirler).
 * Havuz boş kalırsa terimin kendi harflerine düşer.
 */
export function buildDecoyPool(entries: Entry[], term: string): string[] {
  const pool: string[] = [];
  for (const e of entries) {
    if (e.term === term) continue;
    pool.push(...lettersOf(e.term));
  }
  return pool.length ? pool : lettersOf(term);
}

/**
 * Kutucukları üret: terimin harfleri + `decoyCount` şaşırtıcı harf,
 * karıştırılmış. Decoylar havuzdan rastgele seçilir.
 */
export function buildTiles(term: string, decoyCount: number, pool: string[]): Tile[] {
  const letters = lettersOf(term);
  const decoys: string[] = [];
  const n = Math.min(MAX_DECOYS, Math.max(0, decoyCount));
  for (let i = 0; i < n && pool.length; i++) {
    decoys.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return shuffle([...letters, ...decoys]).map((ch, id) => ({ id, ch }));
}

/** Kurulan harf dizisi terimi karşılıyor mu? (sıralı, küçük/büyük duyarsız) */
export function isCorrect(term: string, picked: string[]): boolean {
  const target = lettersOf(term);
  if (picked.length !== target.length) return false;
  return picked.every((ch, i) => ch.toLowerCase() === target[i]);
}

/** Tur puanı: harf sayısı + decoy×2, seri çarpanıyla (1–5x). */
export function roundScore(term: string, decoyCount: number, streak: number): number {
  const base = lettersOf(term).length + decoyCount * 2;
  const combo = Math.min(5, Math.max(1, streak));
  return base * combo;
}
