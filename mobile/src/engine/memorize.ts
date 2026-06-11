// ============================================================
//  Ezber modu — saf yardımcılar (piramit kurulumu, harf kuralları)
//  Akış: iniş (bakarak) → çıkış (gizli) → cümle → final test
//  (web EZBER-MODU-SPEC.md ile birebir)
// ============================================================

/** Harf mi? (boşluk/noktalama "otomatik geçilir") */
export function isLetter(ch: string): boolean {
  return /[a-zA-ZçğıöşüÇĞİÖŞÜñáéíóúü]/.test(ch);
}
export const isAuto = (ch: string) => !isLetter(ch);

export interface Pyramid {
  downs: string[]; // deceiver, deceive, ... d
  ups: string[]; // de, dec, ... deceiver
}

/**
 * Piramit basamakları. Sonu harf olmayan önekler atlanır
 * (örn. "come " gibi boşlukta biten parça yazılmaz).
 */
export function buildPyramid(word: string): Pyramid {
  const downs: string[] = [];
  const ups: string[] = [];
  const endsWithLetter = (s: string) => s.length > 0 && isLetter(s[s.length - 1]);
  for (let len = word.length; len >= 1; len--) {
    const s = word.slice(0, len);
    if (endsWithLetter(s)) downs.push(s);
  }
  for (let len = 2; len <= word.length; len++) {
    const s = word.slice(0, len);
    if (endsWithLetter(s)) ups.push(s);
  }
  return { downs, ups };
}

export type MemPhase = "down" | "up" | "sentence" | "final";

/** Verilen konumdan başlayarak harf olmayan karakterleri atla. */
export function skipAutos(target: string, pos: number): number {
  let p = pos;
  while (p < target.length && isAuto(target[p])) p++;
  return p;
}
