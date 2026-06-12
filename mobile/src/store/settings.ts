// ============================================================
//  Ayarlar store — dil çifti, ses, onboarding durumu (kalıcı)
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LanguagePair } from "../data/types";

interface SettingsState {
  onboarded: boolean;
  languagePair: LanguagePair;
  sound: boolean;
  /** Günlük hatırlatma bildirimi açık mı. */
  notifyEnabled: boolean;
  /** Hatırlatma saati (0–23) ve dakikası (0/15/30/45). */
  notifyHour: number;
  notifyMinute: number;
  /** Mevcut kullanıcıya tek seferlik hatırlatma kartı kapatıldı mı. */
  notifyPromptDismissed: boolean;
  completeOnboarding: (pair: LanguagePair) => void;
  setLanguagePair: (pair: LanguagePair) => void;
  setSound: (on: boolean) => void;
  setNotify: (cfg: { enabled?: boolean; hour?: number; minute?: number }) => void;
  dismissNotifyPrompt: () => void;
  reset: () => void;
}

const DEFAULTS = {
  onboarded: false,
  languagePair: "en-tr" as LanguagePair,
  sound: true,
  notifyEnabled: false,
  notifyHour: 20,
  notifyMinute: 0,
  notifyPromptDismissed: false,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      completeOnboarding: (pair) => set({ onboarded: true, languagePair: pair }),
      setLanguagePair: (pair) => set({ languagePair: pair }),
      setSound: (on) => set({ sound: on }),
      setNotify: (cfg) =>
        set((s) => ({
          notifyEnabled: cfg.enabled ?? s.notifyEnabled,
          notifyHour: cfg.hour ?? s.notifyHour,
          notifyMinute: cfg.minute ?? s.notifyMinute,
        })),
      dismissNotifyPrompt: () => set({ notifyPromptDismissed: true }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "ke-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
