// ============================================================
//  convert-sets.mjs
//  Web projesindeki set-XX.txt dosyalarını (pipe formatı)
//  mobil uygulamanın bundle'ladığı katalog JSON'una çevirir.
//
//  Kaynak satır formatı:
//    terim | tür | anlam | hedef1 | kaynak1 | hedef2 | kaynak2 | ...
//  (hedef cümlede terim {süslü} ile işaretli)
//
//  Çıktı: src/data/catalog/en-tr/sets.json  (Set[])
//
//  Kullanım:  node scripts/convert-sets.mjs
// ============================================================

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", ".."); // mobile/scripts -> repo kökü
const OUT_DIR = join(__dirname, "..", "src", "data", "catalog", "en-tr");
const OUT_FILE = join(OUT_DIR, "sets.json");

// v1: webden taşınan setler için varsayılan etiketler.
// Kategori/seviye ileride içerik girilirken zenginleştirilecek (bkz. CLAUDE.md).
const LANGUAGE_PAIR = "en-tr";
const DEFAULT_LEVEL = "intermediate";
const DEFAULT_CATEGORY = "general";

function parseSetFile(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 3) continue;
    const [term, type, meaning] = parts;
    if (!term || !meaning) continue;

    const rest = parts.slice(3);
    const examples = [];
    for (let i = 0; i < rest.length; i += 2) {
      const target = rest[i];
      if (target) examples.push({ target, source: rest[i + 1] || "" });
    }
    entries.push({
      // Boşluk içeren terim = öbek/bağlam (come by, give up...)
      kind: /\s/.test(term) ? "phrase" : "word",
      term,
      type,
      meaning,
      examples,
    });
  }
  return entries;
}

async function main() {
  const files = (await readdir(REPO_ROOT))
    .filter((f) => /^set-\d+\.txt$/.test(f))
    .sort();

  if (files.length === 0) {
    console.error("Kaynak set-XX.txt dosyası bulunamadı:", REPO_ROOT);
    process.exit(1);
  }

  const sets = [];
  for (const file of files) {
    const num = file.match(/set-(\d+)\.txt/)[1]; // "01"
    const text = await readFile(join(REPO_ROOT, file), "utf-8");
    const entries = parseSetFile(text);
    const setId = `${LANGUAGE_PAIR}-set-${num}`;
    sets.push({
      id: setId,
      languagePair: LANGUAGE_PAIR,
      name: `Set ${Number(num)}`,
      level: DEFAULT_LEVEL,
      category: DEFAULT_CATEGORY,
      source: "catalog",
      entries: entries.map((e, i) => ({ id: `${setId}-${i}`, ...e })),
    });
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(sets, null, 0), "utf-8");

  const totalEntries = sets.reduce((n, s) => n + s.entries.length, 0);
  const phrases = sets.reduce(
    (n, s) => n + s.entries.filter((e) => e.kind === "phrase").length,
    0
  );
  console.log(`✓ ${sets.length} set, ${totalEntries} girdi (${phrases} öbek)`);
  console.log(`✓ yazıldı: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
