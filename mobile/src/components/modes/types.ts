import type { Entry } from "../../data/types";
import type { SpeakFn } from "../../engine/speak";

export interface ModeResult {
  know: number;
  learn: number;
  wrongIds: string[];
  durationSec?: number;
  /** Oyun modları: tur puanı (varsa sonuç ekranı skor varyantını gösterir). */
  score?: number;
  /** Oyun modları: bu skor yeni rekor mu? */
  isRecord?: boolean;
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
  /** Oyun modları yüksek skoru set bazında tutar (games store anahtarı). */
  setId?: string;
}
