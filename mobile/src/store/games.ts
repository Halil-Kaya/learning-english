// ============================================================
//  Oyun store'u — yalnız yüksek skorlar (set × oyun başına).
//  Oyunlar kelime ilerlemesine ve oturum geçmişine YAZMAZ
//  (bkz. GAMES-SPEC.md). Dil çiftine göre ayrı tutulur, kalıcı.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LanguagePair, StudyMode } from "../data/types";

type ByPair<T> = Partial<Record<LanguagePair, T>>;

/** setId → (oyun modu → en yüksek skor) */
type ScoreMap = Record<string, Partial<Record<StudyMode, number>>>;

interface GamesState {
  highScores: ByPair<ScoreMap>;
  /** Skoru kaydet; yeni rekorsa true döner. */
  submitScore: (
    pair: LanguagePair,
    setId: string,
    game: StudyMode,
    score: number
  ) => boolean;
  reset: () => void;
}

export const useGames = create<GamesState>()(
  persist(
    (set, get) => ({
      highScores: {},

      submitScore: (pair, setId, game, score) => {
        const prev = get().highScores[pair]?.[setId]?.[game] ?? 0;
        if (score <= prev) return false;
        set((s) => {
          const pairMap: ScoreMap = { ...(s.highScores[pair] ?? {}) };
          pairMap[setId] = { ...(pairMap[setId] ?? {}), [game]: score };
          return { highScores: { ...s.highScores, [pair]: pairMap } };
        });
        return true;
      },

      reset: () => set({ highScores: {} }),
    }),
    {
      name: "games",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
