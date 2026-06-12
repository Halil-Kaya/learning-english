// ============================================================
//  Yerel günlük hatırlatma bildirimleri (expo-notifications).
//  Sunucu/uzak push YOK — cihazda planlanan tarihli bildirimler.
//  Saf yardımcılar (scheduleDates, pickMessage) test edilebilir;
//  yan etkili sarmalayıcılar Notifications API'sini çağırır.
// ============================================================

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getCatalogSets } from "../data/catalog";
import { t } from "../i18n";
import { useLibrary } from "../store/library";
import { useSettings } from "../store/settings";
import { useStreak } from "../store/streak";
import { visibleStreak } from "./streak";

const CHANNEL_ID = "daily-reminder";
const SCHEDULE_DAYS = 7;

/** Bildirim planlaması için anlık durum (store'lardan toplanır). */
export interface NotifyContext {
  enabled: boolean;
  hour: number;
  minute: number;
  firstSetName: string | null; // hedef listesindeki ilk set adı (varsa)
  streak: number; // görünen seri
}

// Ön planda da bildirim göster (kullanıcı uygulamadayken planlı bildirim gelirse).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Bugünden başlayarak ardışık `days` gün için hedef saatteki tarihler.
 * Bugünkü slot geçtiyse yarından başlar (saf, test edilebilir).
 */
export function scheduleDates(
  now: Date,
  hour: number,
  minute: number,
  days = SCHEDULE_DAYS
): Date[] {
  const todaySlot = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0
  );
  const startOffset = todaySlot.getTime() > now.getTime() ? 0 : 1;
  return Array.from(
    { length: days },
    (_, i) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + startOffset + i, hour, minute, 0, 0)
  );
}

/** Duruma göre bildirim metni (gün indeksine göre havuzda döner). */
export function pickMessage(ctx: NotifyContext, dayIndex: number): string {
  let pool: readonly string[];
  if (ctx.firstSetName) pool = t("notifyMsgsSet");
  else if (ctx.streak >= 2) pool = t("notifyMsgsStreak");
  else pool = t("notifyMsgsExplore");
  const tpl = pool[dayIndex % pool.length];
  return tpl.replace("{set}", ctx.firstSetName ?? "").replace("{n}", String(ctx.streak));
}

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: t("settingsNotifyToggle"),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** İzni kontrol et; gerekiyorsa kullanıcıdan iste. true = izin verildi. */
export async function requestNotifyPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === "granted") return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted || asked.status === "granted";
}

async function hasPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted || p.status === "granted";
}

/**
 * Planlamayı sıfırlar ve mevcut duruma göre yeniden kurar.
 * Açılışta ve duruma etki eden değişimlerde çağrılır. İzin İSTEMEZ
 * (yalnız mevcut izni kontrol eder) — izin akışı enable* ile yapılır.
 */
export async function refreshNotifications(ctx: NotifyContext): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!ctx.enabled) return;
    if (!(await hasPermission())) return;
    await ensureAndroidChannel();

    const dates = scheduleDates(new Date(), ctx.hour, ctx.minute);
    for (let i = 0; i < dates.length; i++) {
      await Notifications.scheduleNotificationAsync({
        content: { title: t("appName"), body: pickMessage(ctx, i) },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dates[i],
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch {
    // bildirim hatası uygulamayı düşürmesin (Expo Go / izin uçları)
  }
}

/**
 * Kullanıcı bildirimi AÇTIĞINDA: izin iste, başarılıysa planla.
 * Dönüş: izin verildi mi (false ise çağıran anahtarı kapalı tutar).
 */
export async function enableNotifications(ctx: NotifyContext): Promise<boolean> {
  const granted = await requestNotifyPermission();
  if (!granted) return false;
  await refreshNotifications({ ...ctx, enabled: true });
  return true;
}

/** Tüm planlı bildirimleri iptal eder (kullanıcı kapatınca). */
export async function disableNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* yut */
  }
}

/** Store'lardan anlık bildirim bağlamı (reaktif değil — çağrı anında okur). */
export function buildNotifyContext(): NotifyContext {
  const settings = useSettings.getState();
  const streak = useStreak.getState();
  const lib = useLibrary.getState();
  const pair = settings.languagePair;

  const all = [...getCatalogSets(pair), ...(lib.userSets[pair] ?? [])];
  const byId = new Map(all.map((s) => [s.id, s]));
  const firstSet = (lib.studyList[pair] ?? [])
    .map((id) => byId.get(id))
    .find(Boolean);

  return {
    enabled: settings.notifyEnabled,
    hour: settings.notifyHour,
    minute: settings.notifyMinute,
    firstSetName: firstSet?.name ?? null,
    streak: visibleStreak(streak, new Date()),
  };
}
