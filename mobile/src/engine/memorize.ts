// ============================================================
//  Ezber modu — saf yardımcılar (yazma turları, harf kuralları)
//  Akış: yaz (10 kez, kelimeye bakarak) → cümle (3 boşluk doldurma)
//        → final test (hiç bakmadan yaz)
//  Yazma turunda hata = yalnız o satır baştan (tümü değil).
// ============================================================

/** Harf mi? (boşluk/noktalama "otomatik geçilir") */
export function isLetter(ch: string): boolean {
  return /[a-zA-ZçğıöşüÇĞİÖŞÜñáéíóúü]/.test(ch);
}
export const isAuto = (ch: string) => !isLetter(ch);

/** Yazma aşamasında kelimenin kaç kez yazılacağı. */
export const WRITE_ROUNDS = 10;

/** Cümle aşamasında doldurulacak örnek cümle sayısı. */
export const SENTENCE_ROUNDS = 3;

export type MemPhase = "write" | "sentence" | "final";

/** Verilen konumdan başlayarak harf olmayan karakterleri atla. */
export function skipAutos(target: string, pos: number): number {
  let p = pos;
  while (p < target.length && isAuto(target[p])) p++;
  return p;
}
