// ============================================================
//  Çekirdek veri tipleri
//  Tüm içerik bir DİL ÇİFTİNE (languagePair) bağlıdır.
//  Yeni dil eklemek = yeni katalog içeriği + locale; KOD DEĞİŞMEZ.
//  (bkz. CLAUDE.md "Dil Mimarisi")
// ============================================================

/** "hedef-kaynak": öğrenilen dil → açıklama dili. v1: yalnız "en-tr". */
export type LanguagePair =
  | "en-tr" // İngilizce → Türkçe (v1)
  | "en-es"
  | "es-tr"
  | "tr-es"
  | "es-en"
  | "de-en"
  | "en-de"
  | "de-tr"
  | "tr-de";

export type Level = "beginner" | "intermediate" | "advanced";

/** Tek kelime mi, çok kelimeli bağlam/öbek mi (come vs come by). */
export type EntryKind = "word" | "phrase";

/** Setin geldiği yer: paketlenmiş katalog veya kullanıcının oluşturduğu. */
export type SetSource = "catalog" | "user";

/** Bir örnek cümle: hedef dilde (terim {süslü}) + kaynak dilde çeviri. */
export interface Example {
  /** Öğrenilen dildeki cümle; terim {süslü parantez} ile işaretli. */
  target: string;
  /** Kullanıcının diline çeviri. */
  source: string;
}

/** Bir kelime ya da öbek. */
export interface Entry {
  id: string;
  kind: EntryKind;
  /** Öğrenilen dildeki terim (ör. "vow", "come by"). */
  term: string;
  /** Sözcük türü (isim/fiil/sıfat/zarf/öbek...) — kaynak dilde etiket. */
  type: string;
  /** Kullanıcının dilindeki anlam. */
  meaning: string;
  examples: Example[];
}

/** 15'lik (son sette 16) kelime grubu. */
export interface WordSet {
  id: string;
  languagePair: LanguagePair;
  name: string;
  level: Level;
  category: string; // bkz. CATEGORIES (catalog/categories.ts)
  source: SetSource;
  entries: Entry[];
}

/** Katalog/keşfet listelerinde kullanılan hafif set özeti. */
export interface SetSummary {
  id: string;
  name: string;
  level: Level;
  category: string;
  source: SetSource;
  count: number;
}

// ---------- İlerleme ----------

/** Bir kelimenin öğrenilme durumu. */
export type WordStatus = "new" | "learning" | "mastered";

export interface WordState {
  status: WordStatus;
  correct: number;
  wrong: number;
  /** ISO tarih; son görülme. */
  lastSeen?: string;
}

export type StudyMode =
  | "cards"
  | "test"
  | "match"
  | "fill"
  | "write"
  | "memorize"
  | "anagram"
  | "race"
  | "hangman"
  | "hunt";

/**
 * Oyun modları: kelime ilerlemesine (recordWord) ve oturum geçmişine
 * (addSession) YAZMAZ — yalnız eğlence + yüksek skor (src/store/games.ts).
 */
export const GAME_MODES: ReadonlySet<StudyMode> = new Set([
  "anagram",
  "race",
  "hangman",
  "hunt",
]);

/** Tamamlanan bir çalışma oturumunun kaydı. */
export interface SessionRecord {
  id: string;
  setId: string;
  mode: StudyMode;
  /** ISO tarih. */
  date: string;
  know: number;
  learn: number;
  /** saniye (varsa). */
  durationSec?: number;
}
