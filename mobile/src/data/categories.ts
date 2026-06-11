// ============================================================
//  Kategori ve seviye taksonomisi
//  (Tek kaynak — UI etiketleri buradan okunur. CLAUDE.md ile eş/.)
// ============================================================

import type { Level } from "./types";

export interface CategoryDef {
  key: string;
  /** Şimdilik TR etiket; ileride i18n'e taşınabilir. */
  label: string;
  emoji: string;
}

/** Aktif + olası kategoriler. Sıralama Keşfet'te kullanılır. */
export const CATEGORIES: CategoryDef[] = [
  { key: "general", label: "Genel", emoji: "📚" },
  { key: "daily-life", label: "Günlük Yaşam", emoji: "🏠" },
  { key: "travel", label: "Seyahat", emoji: "✈️" },
  { key: "food-drink", label: "Yiyecek & İçecek", emoji: "🍽️" },
  { key: "work-career", label: "İş & Kariyer", emoji: "💼" },
  { key: "academic", label: "Akademik", emoji: "🎓" },
  { key: "health", label: "Sağlık", emoji: "🩺" },
  { key: "technology", label: "Teknoloji", emoji: "💻" },
  { key: "nature", label: "Doğa & Çevre", emoji: "🌿" },
  { key: "emotions", label: "Duygular & Kişilik", emoji: "💬" },
  { key: "phrasal-verbs", label: "Öbek Fiiller", emoji: "🔗" },
  { key: "idioms", label: "Deyimler & Kalıplar", emoji: "🗣️" },
  { key: "grammar-words", label: "Bağlaçlar & İşlev Kelimeleri", emoji: "🧩" },
  // olası genişlemeler
  { key: "exam-prep", label: "Sınav Hazırlık", emoji: "📝" },
  { key: "business-english", label: "İş İngilizcesi", emoji: "📈" },
  { key: "slang-informal", label: "Günlük Konuşma & Argo", emoji: "😎" },
  // sanal kategori (kullanıcı setleri)
  { key: "my-sets", label: "Benim Setlerim", emoji: "⭐" },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.key, c]));

export function categoryLabel(key: string): string {
  return CATEGORY_MAP.get(key)?.label ?? key;
}
export function categoryEmoji(key: string): string {
  return CATEGORY_MAP.get(key)?.emoji ?? "📦";
}

export const LEVELS: { key: Level; label: string }[] = [
  { key: "beginner", label: "Başlangıç" },
  { key: "intermediate", label: "Orta" },
  { key: "advanced", label: "İleri" },
];

export function levelLabel(key: Level): string {
  return LEVELS.find((l) => l.key === key)?.label ?? key;
}
