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
  completeOnboarding: (pair: LanguagePair) => void;
  setLanguagePair: (pair: LanguagePair) => void;
  setSound: (on: boolean) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      onboarded: false,
      languagePair: "en-tr",
      sound: true,
      completeOnboarding: (pair) => set({ onboarded: true, languagePair: pair }),
      setLanguagePair: (pair) => set({ languagePair: pair }),
      setSound: (on) => set({ sound: on }),
      reset: () => set({ onboarded: false, languagePair: "en-tr", sound: true }),
    }),
    {
      name: "ke-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
