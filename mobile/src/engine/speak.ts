// ============================================================
//  TTS — cihazın ses sentezi (expo-speech).
//  Okunan dil = dil çiftinin HEDEF dili (öğrenilen dil).
// ============================================================

import * as Speech from "expo-speech";
import type { LanguagePair } from "../data/types";

/** Dil çiftinin hedef (öğrenilen) dilini BCP-47 locale'e çevir. */
export function localeOf(pair: LanguagePair): string {
  const target = pair.split("-")[0];
  switch (target) {
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "de":
      return "de-DE";
    case "tr":
      return "tr-TR";
    default:
      return "en-US";
  }
}

/** Ses açıksa metni hedef dilde okur. */
export function makeSpeak(pair: LanguagePair, sound: boolean) {
  const language = localeOf(pair);
  return (text: string) => {
    if (!sound || !text) return;
    Speech.stop();
    Speech.speak(text, { language, rate: 0.9 });
  };
}

export type SpeakFn = ReturnType<typeof makeSpeak>;
