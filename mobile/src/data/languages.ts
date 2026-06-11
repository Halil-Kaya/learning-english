// ============================================================
//  Dil çifti tanımları (onboarding + ayarlar)
//  available: katalogda içerik var mı (yoksa "yakında").
// ============================================================

import { availablePairs } from "./catalog";
import type { LanguagePair } from "./types";

export interface PairDef {
  pair: LanguagePair;
  /** Öğrenilen dil. */
  learn: string;
  learnFlag: string;
  /** Açıklama dili. */
  via: string;
}

export const PAIRS: PairDef[] = [
  { pair: "en-tr", learn: "İngilizce", learnFlag: "🇬🇧", via: "Türkçe" },
  { pair: "en-es", learn: "İngilizce", learnFlag: "🇬🇧", via: "İspanyolca" },
  { pair: "es-tr", learn: "İspanyolca", learnFlag: "🇪🇸", via: "Türkçe" },
  { pair: "tr-es", learn: "Türkçe", learnFlag: "🇹🇷", via: "İspanyolca" },
  { pair: "es-en", learn: "İspanyolca", learnFlag: "🇪🇸", via: "İngilizce" },
  { pair: "de-en", learn: "Almanca", learnFlag: "🇩🇪", via: "İngilizce" },
  { pair: "en-de", learn: "İngilizce", learnFlag: "🇬🇧", via: "Almanca" },
  { pair: "de-tr", learn: "Almanca", learnFlag: "🇩🇪", via: "Türkçe" },
  { pair: "tr-de", learn: "Türkçe", learnFlag: "🇹🇷", via: "Almanca" },
];

export function isPairAvailable(pair: LanguagePair): boolean {
  return availablePairs().includes(pair);
}

export function pairLabel(pair: LanguagePair): string {
  const d = PAIRS.find((p) => p.pair === pair);
  return d ? `${d.learnFlag} ${d.learn}` : pair;
}
