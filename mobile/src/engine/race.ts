// ============================================================
//  Zaman Yarışı oyunu — saf yardımcılar
//  Anlam gösterilir, 4 seçenekten doğru kelime süre dolmadan seçilir.
//  Süre her 5 doğruda kısalır; 3 can; puan combo çarpanıyla.
// ============================================================

export const RACE_LIVES = 3;
export const RACE_INITIAL_MS = 8000;
export const RACE_MIN_MS = 3000;
export const RACE_STEP_MS = 500;
/** Kaç doğruda bir süre kısalır. */
export const RACE_STEP_EVERY = 5;

/** Toplam doğru sayısına göre soru süresi (ms). */
export function raceTimeMs(correctCount: number): number {
  const steps = Math.floor(correctCount / RACE_STEP_EVERY);
  return Math.max(RACE_MIN_MS, RACE_INITIAL_MS - steps * RACE_STEP_MS);
}

/** Tur puanı: 10 × seri çarpanı (1–5x). */
export function racePoints(streak: number): number {
  return 10 * Math.min(5, Math.max(1, streak));
}
