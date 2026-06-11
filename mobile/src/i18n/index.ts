// ============================================================
//  i18n — v1 tek dil (TR). Yeni UI dili eklemek için DICTS'e ekle.
// ============================================================

import { tr, type Dict } from "./tr";

const DICTS: Record<string, Dict> = { tr };

let current: Dict = DICTS.tr;

export function t<K extends keyof Dict>(key: K): Dict[K] {
  return current[key];
}

export function setUiLanguage(lang: string) {
  current = DICTS[lang] ?? DICTS.tr;
}
