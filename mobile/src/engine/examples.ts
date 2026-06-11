// ============================================================
//  Örnek cümle yardımcıları (saf)
//  Hedef cümlede terim {süslü parantez} ile işaretli.
// ============================================================

import type { Entry, Example } from "../data/types";
import { shuffle } from "./shuffle";

/** {süslü} işaretlerini kaldır: "She made a {vow}." -> "She made a vow." */
export function stripBraces(s: string): string {
  return s.replace(/[{}]/g, "");
}

/** {içerik} -> içerik (boşluk doldurma cevabı). Yoksa null. */
export function bracedTerm(target: string): string | null {
  const m = target.match(/\{([^}]+)\}/);
  return m ? m[1] : null;
}

export interface Segment {
  text: string;
  isTerm: boolean;
}

/** Cümleyi {terim} sınırlarında parçalara böl (vurgu/boşluk için). */
export function segmentExample(target: string): Segment[] {
  const out: Segment[] = [];
  const re = /\{([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(target))) {
    if (m.index > last) out.push({ text: target.slice(last, m.index), isTerm: false });
    out.push({ text: m[1], isTerm: true });
    last = m.index + m[0].length;
  }
  if (last < target.length) out.push({ text: target.slice(last), isTerm: false });
  return out;
}

/** Rastgele bir örnek seç (yoksa null). */
export function pickExample(entry: Entry): Example | null {
  if (entry.examples && entry.examples.length) {
    return entry.examples[Math.floor(Math.random() * entry.examples.length)];
  }
  return null;
}

/** {terim} içeren örneği olan girdiler (boşluk doldur için). */
export function entriesWithBlank(entries: Entry[]): Entry[] {
  return entries.filter((e) =>
    e.examples.some((ex) => bracedTerm(ex.target) !== null)
  );
}

/** Boşluk doldur sorusu için {terim}'li rastgele örnek. */
export function pickBlankExample(entry: Entry): Example | null {
  const withBlank = entry.examples.filter((ex) => bracedTerm(ex.target) !== null);
  if (!withBlank.length) return null;
  return shuffle(withBlank)[0];
}
