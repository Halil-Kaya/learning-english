// ============================================================
//  Katalog yükleyici
//  Paketlenmiş set JSON'larını dil çiftine göre sunar.
//  Yeni dil eklemek: CATALOG_BY_PAIR'e bir satır ekle (kod mimarisi değişmez).
// ============================================================

import type { LanguagePair, SetSummary, WordSet } from "../types";
import enTrSets from "./en-tr/sets.json";

// JSON'lar tip güvencesiyle WordSet[] olarak okunur.
const CATALOG_BY_PAIR: Partial<Record<LanguagePair, WordSet[]>> = {
  // JSON'un geniş çıkarsanan tipini WordSet[]'e indirger (kind/level union'ları için).
  "en-tr": enTrSets as unknown as WordSet[],
};

/** Bir dil çiftinin tüm katalog setleri. */
export function getCatalogSets(pair: LanguagePair): WordSet[] {
  return CATALOG_BY_PAIR[pair] ?? [];
}

/** Hafif özetler (Keşfet listeleri). */
export function getCatalogSummaries(pair: LanguagePair): SetSummary[] {
  return getCatalogSets(pair).map(toSummary);
}

export function toSummary(set: WordSet): SetSummary {
  return {
    id: set.id,
    name: set.name,
    level: set.level,
    category: set.category,
    source: set.source,
    count: set.entries.length,
  };
}

/** Katalogda hangi dil çiftleri mevcut (onboarding/ayarlar için). */
export function availablePairs(): LanguagePair[] {
  return Object.keys(CATALOG_BY_PAIR) as LanguagePair[];
}

/** Bir kataloğun ilgili dil çiftindeki tek seti. */
export function findCatalogSet(
  pair: LanguagePair,
  id: string
): WordSet | undefined {
  return getCatalogSets(pair).find((s) => s.id === id);
}
