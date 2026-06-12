// ============================================================
//  Daily streak — saf mantık (test edilebilir, yan etkisiz).
//  Gün anahtarı cihaz YEREL saatiyle "YYYY-MM-DD". Hafta Pazartesi başlar.
//  Streak GLOBALdir (dil çiftinden bağımsız — kullanım serisi).
// ============================================================

/** Kutlanan dönüm noktaları (gün). */
export const MILESTONES = [3, 7, 14, 30, 50, 100, 365] as const;

export interface StreakCore {
  current: number;
  best: number;
  lastDay: string | null; // "YYYY-MM-DD" (yerel)
  weekDays: string[]; // bu haftada aktif gün anahtarları
}

/** Yerel tarihten "YYYY-MM-DD". */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** İki gün anahtarı arası tam gün farkı (toKey - fromKey). */
export function daysBetween(fromKey: string, toKey: string): number {
  const MS = 86_400_000;
  return Math.round((parseKey(toKey).getTime() - parseKey(fromKey).getTime()) / MS);
}

/** O tarihin içinde bulunduğu haftanın Pazartesi gün anahtarı. */
export function mondayKeyOf(d: Date): string {
  const offset = (d.getDay() + 6) % 7; // Pazartesi'den bu yana geçen gün
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset));
}

/** O haftanın Pzt→Paz 7 gün anahtarı (nokta dizisi için). */
export function weekDayKeys(d: Date): string[] {
  const offset = (d.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) =>
    dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset + i))
  );
}

/** Mevcut haftaya ait aktif gün anahtarları (eski haftalar elenir). */
export function weekActiveDays(core: StreakCore, today: Date): string[] {
  const monK = mondayKeyOf(today);
  return core.weekDays.filter((k) => k >= monK);
}

/**
 * Görünen seri: son aktif gün bugün veya dün değilse 0 (seri kopmuş).
 * Depodaki `current` değişmez; yalnız gösterim için.
 */
export function visibleStreak(core: StreakCore, today: Date): number {
  if (!core.lastDay) return 0;
  const diff = daysBetween(core.lastDay, dayKey(today));
  return diff === 0 || diff === 1 ? core.current : 0;
}

/**
 * Bir günlük aktiviteyi işler. Aynı gün ikinci çağrı seriyi artırmaz.
 * Dönüş: yeni çekirdek + (varsa) bu çağrıda aşılan dönüm noktası.
 */
export function applyTick(
  core: StreakCore,
  today: Date
): { next: StreakCore; milestone: number | null } {
  const todayK = dayKey(today);
  const monK = mondayKeyOf(today);

  // haftayı temizle + bugünü ekle
  const week = core.weekDays.filter((k) => k >= monK);
  if (!week.includes(todayK)) week.push(todayK);

  // bugün zaten sayıldıysa seri sabit, yalnız hafta güncellenebilir
  if (core.lastDay === todayK) {
    return { next: { ...core, weekDays: week }, milestone: null };
  }

  const current =
    core.lastDay && daysBetween(core.lastDay, todayK) === 1 ? core.current + 1 : 1;
  const best = Math.max(core.best, current);
  const milestone = (MILESTONES as readonly number[]).includes(current) ? current : null;

  return { next: { current, best, lastDay: todayK, weekDays: week }, milestone };
}
