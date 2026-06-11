// ============================================================
//  Test modu — çoktan seçmeli şık üretimi (saf)
// ============================================================

import type { Entry } from "../data/types";
import { sample, shuffle } from "./shuffle";

export interface TestQuestion {
  entry: Entry;
  /** Karışık şıklar (doğru cevap dahil). UI meaning'i gösterir. */
  choices: Entry[];
}

/** Bir girdi için 4 şıklı soru (3 çeldirici aynı havuzdan). */
export function buildQuestion(entry: Entry, pool: Entry[]): TestQuestion {
  const distractors = sample(
    pool.filter((e) => e.id !== entry.id && e.meaning !== entry.meaning),
    3
  );
  return { entry, choices: shuffle([entry, ...distractors]) };
}
