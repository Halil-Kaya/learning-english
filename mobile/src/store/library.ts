// ============================================================
//  Kütüphane store — hedef listesi, geçmiş, kelime durumları,
//  kullanıcı setleri. Her şey DİL ÇİFTİNE göre ayrı tutulur (kalıcı).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  LanguagePair,
  SessionRecord,
  WordSet,
  WordState,
} from "../data/types";

/** Dil çiftine göre haritalanan kayıtlar. */
type ByPair<T> = Partial<Record<LanguagePair, T>>;

interface LibraryState {
  studyList: ByPair<string[]>; // sıralı set id'leri
  history: ByPair<SessionRecord[]>;
  wordStates: ByPair<Record<string, WordState>>;
  userSets: ByPair<WordSet[]>;

  addToStudyList: (pair: LanguagePair, setId: string) => void;
  removeFromStudyList: (pair: LanguagePair, setId: string) => void;
  addSession: (pair: LanguagePair, rec: SessionRecord) => void;
  recordWord: (
    pair: LanguagePair,
    entryId: string,
    result: { correct: boolean; mastered?: boolean }
  ) => void;
  addUserSets: (pair: LanguagePair, sets: WordSet[]) => void;
  reset: () => void;
}

const nowIso = () => new Date().toISOString();

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      studyList: {},
      history: {},
      wordStates: {},
      userSets: {},

      addToStudyList: (pair, setId) =>
        set((s) => {
          const list = s.studyList[pair] ?? [];
          if (list.includes(setId)) return s;
          return { studyList: { ...s.studyList, [pair]: [...list, setId] } };
        }),

      removeFromStudyList: (pair, setId) =>
        set((s) => ({
          studyList: {
            ...s.studyList,
            [pair]: (s.studyList[pair] ?? []).filter((id) => id !== setId),
          },
        })),

      addSession: (pair, rec) =>
        set((s) => ({
          history: {
            ...s.history,
            [pair]: [rec, ...(s.history[pair] ?? [])].slice(0, 200),
          },
        })),

      recordWord: (pair, entryId, result) =>
        set((s) => {
          const states = { ...(s.wordStates[pair] ?? {}) };
          const prev: WordState = states[entryId] ?? {
            status: "new",
            correct: 0,
            wrong: 0,
          };
          const next: WordState = {
            status: prev.status,
            correct: prev.correct + (result.correct ? 1 : 0),
            wrong: prev.wrong + (result.correct ? 0 : 1),
            lastSeen: nowIso(),
          };
          if (result.mastered) next.status = "mastered";
          else if (!result.correct) next.status = "learning";
          else if (prev.status === "new") next.status = "learning";
          states[entryId] = next;
          return { wordStates: { ...s.wordStates, [pair]: states } };
        }),

      addUserSets: (pair, sets) =>
        set((s) => ({
          userSets: {
            ...s.userSets,
            [pair]: [...(s.userSets[pair] ?? []), ...sets],
          },
        })),

      reset: () =>
        set({ studyList: {}, history: {}, wordStates: {}, userSets: {} }),
    }),
    {
      name: "ke-library",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ---------- Türetilmiş yardımcılar (seçici) ----------

export function masteredCount(
  states: Record<string, WordState> | undefined,
  entryIds: string[]
): number {
  if (!states) return 0;
  return entryIds.filter((id) => states[id]?.status === "mastered").length;
}
