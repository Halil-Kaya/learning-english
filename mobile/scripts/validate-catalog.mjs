#!/usr/bin/env node
// Katalog doğrulama scripti.
// Her içerik partisi eklendikten sonra çalıştır: node scripts/validate-catalog.mjs
// Sorun bulursa ayrıntılı hata verir; temizse özet sayıları basar.

import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __dir = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dir, "../src/data/catalog/en-tr/sets.json");

const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);
const VALID_KINDS = new Set(["word", "phrase"]);
const VALID_SOURCES = new Set(["catalog", "user"]);

// Kategori listesi (mobile/src/data/categories.ts'den kopyalandı)
const VALID_CATEGORIES = new Set([
  "general", "daily-life", "travel", "food-drink", "work-career",
  "academic", "health", "technology", "nature", "emotions",
  "phrasal-verbs", "idioms", "grammar-words", "exam-prep",
  "business-english", "slang-informal", "my-sets",
]);

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error(`  ✗ HATA: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠ UYARI: ${msg}`);
  warnings++;
}

let sets;
try {
  const raw = readFileSync(catalogPath, "utf8");
  sets = JSON.parse(raw);
} catch (e) {
  console.error(`Katalog okunamadı: ${e.message}`);
  process.exit(1);
}

console.log(`\nKatalog doğrulanıyor: ${catalogPath}`);
console.log(`Set sayısı: ${sets.length}\n`);

const allSetIds = new Set();
const allEntryIds = new Set();
const allTerms = new Set(); // terim mükerrerleri için

let totalEntries = 0;
let totalExamples = 0;

for (const set of sets) {
  // Set alanları
  if (!set.id) err(`Set id eksik: ${JSON.stringify(set).slice(0, 60)}`);
  if (allSetIds.has(set.id)) err(`Mükerrer set id: ${set.id}`);
  else allSetIds.add(set.id);

  if (!set.name) err(`Set adı eksik: ${set.id}`);
  if (!VALID_LEVELS.has(set.level)) err(`Geçersiz level "${set.level}" — set: ${set.id}`);
  if (!VALID_CATEGORIES.has(set.category)) warn(`Bilinmeyen category "${set.category}" — set: ${set.id}`);
  if (!VALID_SOURCES.has(set.source)) err(`Geçersiz source "${set.source}" — set: ${set.id}`);
  if (!Array.isArray(set.entries)) { err(`entries array değil — set: ${set.id}`); continue; }

  if (set.entries.length === 0) warn(`Boş set: ${set.id}`);
  if (set.entries.length > 20) warn(`Büyük set (${set.entries.length} girdi): ${set.id}`);

  totalEntries += set.entries.length;

  for (const entry of set.entries) {
    // Entry alanları
    if (!entry.id) err(`Entry id eksik — set: ${set.id}`);
    if (allEntryIds.has(entry.id)) err(`Mükerrer entry id: ${entry.id}`);
    else allEntryIds.add(entry.id);

    if (!entry.term) err(`term eksik — entry: ${entry.id}`);
    if (!entry.meaning) err(`meaning eksik — entry: ${entry.id}`);
    if (!VALID_KINDS.has(entry.kind)) err(`Geçersiz kind "${entry.kind}" — entry: ${entry.id}`);
    if (!entry.type) warn(`type boş — entry: ${entry.id ?? entry.term}`);

    // Tür/kind tutarlılığı (boşluk içeren = phrase olmalı)
    if (entry.term && /\s/.test(entry.term) && entry.kind !== "phrase") {
      warn(`Boşluklu terim ama kind="word": "${entry.term}" (${entry.id})`);
    }
    if (entry.term && !/\s/.test(entry.term) && entry.kind === "phrase") {
      warn(`Boşluksuz terim ama kind="phrase": "${entry.term}" (${entry.id})`);
    }

    // Mükerrer terim (normalleştirilmiş)
    const termKey = entry.term?.toLowerCase().trim();
    if (termKey) {
      if (allTerms.has(termKey)) warn(`Mükerrer terim: "${entry.term}" — entry: ${entry.id}`);
      else allTerms.add(termKey);
    }

    // Örnekler
    if (!Array.isArray(entry.examples)) {
      err(`examples array değil — entry: ${entry.id}`);
      continue;
    }

    const exCount = entry.examples.length;
    totalExamples += exCount;

    if (exCount < 1) warn(`Hiç örnek yok — entry: ${entry.id} (${entry.term})`);
    if (exCount > 0 && exCount < 5) warn(`Az örnek (${exCount}/10) — entry: ${entry.id} (${entry.term})`);

    for (const ex of entry.examples) {
      if (!ex.target) { err(`target boş — entry: ${entry.id}`); continue; }
      if (!ex.source) warn(`source (TR çeviri) boş — entry: ${entry.id} (${entry.term})`);

      // {süslü parantez} kontrolü
      if (!ex.target.includes("{")) {
        warn(`{terim} işareti yok — entry: ${entry.id} (${entry.term}): "${ex.target.slice(0, 60)}"`);
      }

      // Uzunluk kontrolü (tahmini 6–14 kelime)
      const wordCount = ex.target.trim().split(/\s+/).length;
      if (wordCount < 4) warn(`Çok kısa örnek (${wordCount} kelime) — entry: ${entry.id}: "${ex.target}"`);
      if (wordCount > 20) warn(`Çok uzun örnek (${wordCount} kelime) — entry: ${entry.id}: "${ex.target.slice(0, 60)}"`);
    }
  }
}

const avgEx = totalEntries > 0 ? (totalExamples / totalEntries).toFixed(1) : 0;

console.log("─────────────────────────────────────────");
console.log(`Setler:     ${sets.length}`);
console.log(`Girdiler:   ${totalEntries}`);
console.log(`Örnekler:   ${totalExamples} (ortalama ${avgEx}/girdi)`);
console.log(`Hatalar:    ${errors}`);
console.log(`Uyarılar:   ${warnings}`);
console.log("─────────────────────────────────────────");

if (errors > 0) {
  console.error(`\n✗ Doğrulama BAŞARISIZ — ${errors} hata düzeltilmeli.\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠ Doğrulama UYARIYLA geçti — ${warnings} uyarı gözden geçirilebilir.\n`);
} else {
  console.log(`\n✓ Doğrulama başarılı!\n`);
}
