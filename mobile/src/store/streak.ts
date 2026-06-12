// ============================================================
//  Streak store — günlük seri, en iyi seri, haftalık hedef (kalıcı).
//  GLOBAL (dil çiftinden bağımsız). Saf mantık: src/engine/streak.ts
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyTick, type StreakCore } from "../engine/streak";

interface StreakState extends StreakCore {
  weeklyGoal: number; // 3–7 gün
  pendingMilestone: number | null; // kutlanmayı bekleyen dönüm

  /** Bir tur bittiğinde çağrılır (çalışma/oyun/kendini dene). */
  tick: () => void;
  setWeeklyGoal: (n: number) => void;
  clearMilestone: () => void;
  reset: () => void;
}

const INITIAL: StreakCore = { current: 0, best: 0, lastDay: null, weekDays: [] };

export const useStreak = create<StreakState>()(
  persist(
    (set) => ({
      ...INITIAL,
      weeklyGoal: 5,
      pendingMilestone: null,

      tick: () =>
        set((s) => {
          const { next, milestone } = applyTick(
            {
              current: s.current,
              best: s.best,
              lastDay: s.lastDay,
              weekDays: s.weekDays,
            },
            new Date()
          );
          return {
            ...next,
            pendingMilestone: milestone ?? s.pendingMilestone,
          };
        }),

      setWeeklyGoal: (n) => set({ weeklyGoal: Math.max(3, Math.min(7, n)) }),
      clearMilestone: () => set({ pendingMilestone: null }),
      reset: () => set({ ...INITIAL, weeklyGoal: 5, pendingMilestone: null }),
    }),
    {
      name: "ke-streak",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
