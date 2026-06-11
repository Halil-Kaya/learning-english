import type { Entry } from "../../data/types";
import type { SpeakFn } from "../../engine/speak";

export interface ModeResult {
  know: number;
  learn: number;
  wrongIds: string[];
  durationSec?: number;
}

/** Tüm çalışma modlarının ortak arayüzü. */
export interface ModeProps {
  entries: Entry[];
  speak: SpeakFn;
  onRecordWord: (
    entryId: string,
    result: { correct: boolean; mastered?: boolean }
  ) => void;
  onFinish: (res: ModeResult) => void;
}
