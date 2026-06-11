// ============================================================
//  Set arama hook'ları — katalog + kullanıcı setlerini birleştirir,
//  aktif dil çiftine göre çalışır.
// ============================================================

import { useMemo } from "react";
import { useLibrary } from "../store/library";
import { useSettings } from "../store/settings";
import { getCatalogSets } from "./catalog";
import type { WordSet } from "./types";

/** Aktif dil çiftinin tüm setleri (katalog + kullanıcı). */
export function useAllSets(): WordSet[] {
  const pair = useSettings((s) => s.languagePair);
  const userSets = useLibrary((s) => s.userSets[pair]);
  return useMemo(
    () => [...getCatalogSets(pair), ...(userSets ?? [])],
    [pair, userSets]
  );
}

/** Id'ye göre tek set. */
export function useSet(id: string | undefined): WordSet | undefined {
  const all = useAllSets();
  return useMemo(() => all.find((s) => s.id === id), [all, id]);
}

/** Hedef listesindeki setler — eklenme sırasıyla. */
export function useStudyListSets(): WordSet[] {
  const pair = useSettings((s) => s.languagePair);
  const ids = useLibrary((s) => s.studyList[pair]);
  const all = useAllSets();
  return useMemo(() => {
    const byId = new Map(all.map((s) => [s.id, s]));
    return (ids ?? []).map((id) => byId.get(id)).filter(Boolean) as WordSet[];
  }, [ids, all]);
}
