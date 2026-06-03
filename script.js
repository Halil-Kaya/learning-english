/* ============================================================
   Learning English — Kelime Ezberleme
   Modlar: Kartlar · Test · Eşleştirme · Boşluk Doldur
   ============================================================ */

"use strict";

// ---------- Durum ----------
let WORDS = [];        // tüm kelimeler
let deck = [];         // o anki karıştırılmış deste
let idx = 0;
let know = 0, learn = 0;
let mode = "cards";
let wrongPool = [];    // yanlış bilinenler (tekrar için)

const $ = (id) => document.getElementById(id);

// ============================================================
//  VERİ YÜKLEME — SET SİSTEMİ
// ============================================================
const LS_KEY = "le-current-set";

// Uygulama açılışı: önce set manifestini (sets.json) dene,
// olmazsa eski words.txt'ye düş.
async function init() {
  try {
    const res = await fetch("sets.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no manifest");
    const sets = await res.json();
    buildSetSelect(sets);
    const saved = localStorage.getItem(LS_KEY);
    const start = sets.find((s) => s.file === saved) ? saved : sets[0].file;
    $("set-select").value = start;
    await loadSet(start);
  } catch (e) {
    // sets.json yok → tek dosya (words.txt) modu
    $("set-select").style.display = "none";
    loadWords();
  }
}

function buildSetSelect(sets) {
  const sel = $("set-select");
  sel.innerHTML = "";
  sets.forEach((s) => {
    const o = document.createElement("option");
    o.value = s.file;
    o.textContent = `${s.label} · ${s.count}`;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => {
    localStorage.setItem(LS_KEY, sel.value);
    loadSet(sel.value);
  });
}

async function loadSet(file) {
  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    parseWords(await res.text());
    wrongPool = []; // yeni sete geçince yanlış havuzunu sıfırla
  } catch (e) {
    showEmpty(true);
  }
}

// Eski tek-dosya yedeği
async function loadWords() {
  try {
    const res = await fetch("words.txt", { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const text = await res.text();
    parseWords(text);
  } catch (e) {
    // file:// veya sunucu yoksa: elle yükleme bekle
    showEmpty(true);
  }
}

function parseWords(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 3) continue;
    const [word, type, meaning] = parts;
    if (!word || !meaning) continue;
    // 4. alandan itibaren örnek çiftleri: en1 | tr1 | en2 | tr2 | ...
    const rest = parts.slice(3);
    const examples = [];
    for (let i = 0; i < rest.length; i += 2) {
      const en = rest[i];
      if (en) examples.push({ en, tr: rest[i + 1] || "" });
    }
    out.push({
      word, type, meaning, examples,
      // geriye uyum (ilk örnek)
      example: examples[0] ? examples[0].en : "",
      exampleTr: examples[0] ? examples[0].tr : "",
    });
  }
  WORDS = out;
  if (WORDS.length === 0) { showEmpty(true); return; }
  showEmpty(false);
  $("word-count").textContent = WORDS.length + " kelime";
  startMode(mode, true);
}

function showEmpty(on) {
  $("empty-state").classList.toggle("hidden", !on);
  $("main").classList.toggle("hidden", on);
  $("stats").classList.toggle("hidden", on);
  document.querySelector(".progress").classList.toggle("hidden", on);
  $("tabs").classList.toggle("hidden", on);
}

// Dosya elle yükleme
$("file-input").addEventListener("change", (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => parseWords(e.target.result);
  reader.readAsText(file, "utf-8");
});

// ============================================================
//  YARDIMCILAR
// ============================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(word) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Örnek cümlede {kelime} -> <b>kelime</b> (önce HTML kaçışı)
function highlightExample(ex) {
  if (!ex) return "";
  return escapeHtml(ex).replace(/\{([^}]+)\}/g, "<b>$1</b>");
}
// Rastgele bir örnek seç (yoksa null)
function pickExample(w) {
  if (w.examples && w.examples.length) {
    return w.examples[Math.floor(Math.random() * w.examples.length)];
  }
  return w.example ? { en: w.example, tr: w.exampleTr } : null;
}
// Bir kelimenin tüm örneklerini numaralı liste olarak çiz
function renderExamples(container, examples) {
  container.innerHTML = "";
  if (!examples || !examples.length) return;
  examples.forEach((ex, i) => {
    const item = document.createElement("div");
    item.className = "ex-item";
    item.innerHTML =
      `<span class="ex-num">${i + 1}</span>` +
      `<div class="ex-body"><div class="ex-en">${highlightExample(ex.en)}</div>` +
      `<div class="ex-tr">${escapeHtml(ex.tr || "")}</div></div>`;
    container.appendChild(item);
  });
}
// {kelime} -> doğru cevap (parantez içi)
function blankFromExample(ex) {
  const m = ex.match(/\{([^}]+)\}/);
  return m ? m[1] : null;
}
// {kelime} -> "..... <boşluk> ....."
function exampleWithBlank(ex) {
  return ex.replace(/\{[^}]+\}/g, '<span class="blank"></span>');
}

function updateStats(total) {
  $("s-know").textContent = know;
  $("s-learn").textContent = learn;
  $("s-left").textContent = Math.max(0, total - idx);
  const done = know + learn;
  $("s-score").textContent = done ? Math.round((know / done) * 100) + "%" : "0%";
  const pct = total ? Math.round((idx / total) * 100) : 0;
  $("progress-fill").style.width = pct + "%";
}

// ============================================================
//  SEKME / MOD YÖNETİMİ
// ============================================================
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    startMode(t.dataset.mode, true);
  });
});

function showView(name) {
  ["cards", "test", "match", "fill", "write", "result"].forEach((v) => {
    $("view-" + v).classList.add("hidden");
  });
  if (name) $("view-" + name).classList.remove("hidden");
}

function startMode(m, useAll) {
  mode = m;
  const source = (useAll || wrongPool.length === 0) ? WORDS : wrongPool;
  deck = shuffle(source);
  idx = 0; know = 0; learn = 0;
  // "Boşluk Doldur" kendi destesini tutuyor → her başlangıçta sıfırla
  // (yoksa "Sadece Yanlışları" tekrar sonuç ekranını açar)
  fillDeck = []; fillIdx = 0;
  if (m === "cards") { showView("cards"); renderCard(); }
  else if (m === "test") { showView("test"); renderTest(); }
  else if (m === "match") { showView("match"); startMatch(); }
  else if (m === "fill") { showView("fill"); renderFill(); }
  else if (m === "write") { showView("write"); renderWrite(); }
  updateStats(deck.length);
}

// ============================================================
//  1) KARTLAR
// ============================================================
const flashcard = $("flashcard");
flashcard.addEventListener("click", (e) => {
  if (e.target.closest(".speak-btn")) return;
  flashcard.classList.toggle("flipped");
});

function renderCard() {
  if (idx >= deck.length) return finish();
  const w = deck[idx];
  flashcard.classList.remove("flipped");
  $("fc-word").textContent = w.word;
  $("fc-type").textContent = w.type;
  $("fc-meaning").textContent = w.meaning;
  renderExamples($("fc-examples"), w.examples);
  $("fc-examples").scrollTop = 0;
  updateStats(deck.length);
}

$("fc-speak").addEventListener("click", (e) => { e.stopPropagation(); speak(deck[idx].word); });
$("c-know").addEventListener("click", () => { know++; idx++; renderCard(); });
$("c-learn").addEventListener("click", () => { learn++; pushWrong(deck[idx]); idx++; renderCard(); });
$("c-next").addEventListener("click", () => { if (idx < deck.length - 1) { idx++; renderCard(); } });
$("c-prev").addEventListener("click", () => { if (idx > 0) { idx--; renderCard(); } });

// ============================================================
//  2) TEST (çoktan seçmeli, karışık şıklar)
// ============================================================
let testAnswered = false;

function renderTest() {
  if (idx >= deck.length) return finish();
  testAnswered = false;
  const w = deck[idx];
  $("q-word").textContent = w.word;
  $("q-type").textContent = w.type;

  const distractors = shuffle(WORDS.filter((x) => x.word !== w.word)).slice(0, 3);
  const choices = shuffle([w, ...distractors]);

  const box = $("q-options");
  box.innerHTML = "";
  choices.forEach((c) => {
    const b = document.createElement("button");
    b.className = "option";
    b.textContent = c.meaning;
    b.addEventListener("click", () => {
      if (testAnswered) return;
      testAnswered = true;
      const correct = c.word === w.word;
      b.classList.add(correct ? "correct" : "wrong");
      box.querySelectorAll(".option").forEach((opt) => {
        if (opt.textContent === w.meaning) opt.classList.add("correct");
        opt.disabled = true;
      });
      if (correct) know++; else { learn++; pushWrong(w); }
      updateStats(deck.length);
      setTimeout(() => { idx++; renderTest(); }, 950);
    });
    box.appendChild(b);
  });
  updateStats(deck.length);
}
$("q-speak").addEventListener("click", () => speak(deck[idx].word));

// ============================================================
//  3) EŞLEŞTİRME (Quizlet tarzı hafıza oyunu)
// ============================================================
let matchSelected = null;
let matchPairs = 0;
let matchTotal = 0;
let matchTimer = null;
let matchStart = 0;

function startMatch() {
  $("match-done").classList.add("hidden");
  $("match-grid").classList.remove("hidden");
  const pool = shuffle(WORDS).slice(0, Math.min(6, WORDS.length)); // 6 çift = 12 kart
  matchTotal = pool.length;
  matchPairs = 0;
  matchSelected = null;

  const tiles = [];
  pool.forEach((w) => {
    tiles.push({ id: w.word, kind: "word", text: w.word });
    tiles.push({ id: w.word, kind: "meaning", text: w.meaning });
  });
  const shuffledTiles = shuffle(tiles);

  const grid = $("match-grid");
  grid.innerHTML = "";
  shuffledTiles.forEach((t) => {
    const el = document.createElement("div");
    el.className = "match-tile " + (t.kind === "word" ? "word" : "");
    el.textContent = t.text;
    el.dataset.id = t.id;
    el.addEventListener("click", () => onMatchClick(el));
    grid.appendChild(el);
  });

  $("match-progress").textContent = `0 / ${matchTotal} eşleşti`;
  matchStart = performance.now();
  clearInterval(matchTimer);
  matchTimer = setInterval(() => {
    const s = ((performance.now() - matchStart) / 1000).toFixed(1);
    $("match-timer").textContent = "⏱️ " + s + "s";
  }, 100);
}

function onMatchClick(el) {
  if (el.classList.contains("matched")) return;
  if (matchSelected === el) { el.classList.remove("selected"); matchSelected = null; return; }

  if (!matchSelected) {
    matchSelected = el;
    el.classList.add("selected");
    return;
  }

  const a = matchSelected, b = el;
  if (a.dataset.id === b.dataset.id) {
    // doğru eşleşme
    a.classList.add("flash-ok"); b.classList.add("flash-ok");
    setTimeout(() => {
      a.classList.add("matched"); b.classList.add("matched");
      a.classList.remove("selected", "flash-ok"); b.classList.remove("flash-ok");
    }, 250);
    matchSelected = null;
    matchPairs++;
    $("match-progress").textContent = `${matchPairs} / ${matchTotal} eşleşti`;
    if (matchPairs === matchTotal) finishMatch();
  } else {
    // yanlış
    a.classList.add("flash-bad"); b.classList.add("flash-bad");
    setTimeout(() => {
      a.classList.remove("selected", "flash-bad"); b.classList.remove("flash-bad");
    }, 450);
    matchSelected = null;
  }
}

function finishMatch() {
  clearInterval(matchTimer);
  const secs = ((performance.now() - matchStart) / 1000).toFixed(1);
  $("match-grid").classList.add("hidden");
  $("match-done").classList.remove("hidden");
  $("match-done-sub").textContent = `${matchTotal} çift · ${secs} saniyede tamamlandı 🎯`;
}

$("match-restart").addEventListener("click", startMatch);
$("match-again").addEventListener("click", startMatch);

// ============================================================
//  4) BOŞLUK DOLDUR (cümle + türkçe, kelimeyi yaz)
// ============================================================
let fillDeck = [];
let fillIdx = 0;
let fillCurrentEx = null; // o anki soruda kullanılan örnek

function renderFill() {
  // sadece örnek cümlesi olan kelimeler
  if (fillDeck.length === 0 || fillIdx === 0) {
    fillDeck = shuffle(deck.filter((w) => pickExample(w)));
    fillIdx = 0;
  }
  if (fillDeck.length === 0) {
    $("fill-sentence").textContent = "Örnek cümlesi olan kelime bulunamadı.";
    $("fill-tr").textContent = ""; $("fill-meaning").textContent = "";
    return;
  }
  if (fillIdx >= fillDeck.length) return finish();

  const w = fillDeck[fillIdx];
  fillCurrentEx = pickExample(w); // her soruda rastgele bir örnek
  $("fill-sentence").innerHTML = exampleWithBlank(fillCurrentEx.en);
  $("fill-tr").textContent = fillCurrentEx.tr || "";
  $("fill-meaning").textContent = "İpucu: " + w.meaning;
  $("fill-input").value = "";
  $("fill-input").disabled = false;
  $("fill-feedback").textContent = "";
  $("fill-feedback").className = "fill-feedback";
  $("fill-next").classList.add("hidden");
  $("fill-check").classList.remove("hidden");
  $("fill-input").focus();
  updateStats(fillDeck.length);
  idx = fillIdx;
}

function checkFill() {
  const w = fillDeck[fillIdx];
  const answer = (fillCurrentEx && blankFromExample(fillCurrentEx.en)) || w.word;
  const guess = $("fill-input").value.trim().toLowerCase();
  if (!guess) return;
  const correct = guess === answer.toLowerCase();
  const fb = $("fill-feedback");
  if (correct) {
    fb.textContent = "✓ Doğru! — " + answer;
    fb.className = "fill-feedback good";
    know++;
  } else {
    fb.textContent = `✗ Yanlış. Doğrusu: "${answer}"`;
    fb.className = "fill-feedback bad";
    learn++; pushWrong(w);
  }
  $("fill-input").disabled = true;
  $("fill-check").classList.add("hidden");
  $("fill-next").classList.remove("hidden");
  updateStats(fillDeck.length);
}

$("fill-check").addEventListener("click", checkFill);
$("fill-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if ($("fill-input").disabled) { nextFill(); }
    else checkFill();
  }
});
$("fill-next").addEventListener("click", nextFill);
function nextFill() { fillIdx++; renderFill(); }

// ============================================================
//  5) YAZMA (kelimeyi harf harf yaz)
// ============================================================
let writeTarget = "";
let writeDone = false;

function renderWrite() {
  if (idx >= deck.length) return finish();
  writeDone = false;
  const w = deck[idx];
  writeTarget = w.word;
  $("write-meaning").textContent = w.meaning;
  $("write-type").textContent = w.type || "";
  const wex = pickExample(w);
  $("write-tr").textContent = wex ? wex.tr || "" : "";
  const fb = $("write-feedback");
  fb.textContent = ""; fb.className = "fill-feedback";
  const inp = $("write-input");
  inp.value = ""; inp.disabled = false;
  buildWriteSlots(0);
  $("write-next").classList.add("hidden");
  inp.focus();
  updateStats(deck.length);
}

// Harf kutucuklarını çiz (filledCount kadar harf dolu, sonraki kutu "aktif")
function buildWriteSlots(filledCount) {
  const box = $("write-slots");
  box.innerHTML = "";
  [...writeTarget].forEach((ch, i) => {
    if (ch === " ") {
      const gap = document.createElement("span");
      gap.className = "wslot space";
      box.appendChild(gap);
      return;
    }
    const s = document.createElement("span");
    s.className = "wslot";
    if (i < filledCount) { s.classList.add("filled"); s.textContent = ch; }
    else if (i === filledCount) s.classList.add("current");
    box.appendChild(s);
  });
}

// Her tuşta: yalnızca doğru harf ilerletir, yanlış harf geri alınır
function onWriteInput() {
  if (writeDone) return;
  const inp = $("write-input");
  const target = writeTarget.toLowerCase();
  const val = inp.value.toLowerCase();
  let correct = 0;
  while (correct < val.length && correct < target.length && val[correct] === target[correct]) correct++;
  if (correct < val.length) {
    inp.value = writeTarget.slice(0, correct); // yanlış harfi sil
    flashWriteError();
  }
  buildWriteSlots(correct);
  if (correct === target.length) writeSuccess();
}

function flashWriteError() {
  const box = $("write-slots");
  box.classList.remove("shake");
  void box.offsetWidth; // reflow → animasyonu yeniden tetikle
  box.classList.add("shake");
}

// İpucu: kelimeyi kısa süre tüm harfleriyle göster
function revealWrite() {
  if (writeDone) return;
  const box = $("write-slots");
  box.innerHTML = "";
  [...writeTarget].forEach((ch) => {
    const s = document.createElement("span");
    s.className = "wslot " + (ch === " " ? "space" : "reveal");
    if (ch !== " ") s.textContent = ch;
    box.appendChild(s);
  });
  pushWrong(deck[idx]); // ipucu kullandı → tekrar havuzuna
  setTimeout(() => { if (!writeDone) buildWriteSlots($("write-input").value.length); }, 1600);
}

function writeSuccess() {
  writeDone = true;
  know++;
  const fb = $("write-feedback");
  fb.textContent = "✓ Doğru! — " + writeTarget;
  fb.className = "fill-feedback good";
  $("write-input").disabled = true;
  $("write-next").classList.remove("hidden");
  $("write-next").focus();
  speak(writeTarget);
  updateStats(deck.length);
}

function nextWrite() { idx++; renderWrite(); }

$("write-input").addEventListener("input", onWriteInput);
$("write-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && writeDone) nextWrite();
});
$("write-speak").addEventListener("click", () => speak(writeTarget));
$("write-reveal").addEventListener("click", revealWrite);
$("write-skip").addEventListener("click", () => { learn++; pushWrong(deck[idx]); idx++; renderWrite(); });
$("write-next").addEventListener("click", nextWrite);

// ============================================================
//  YANLIŞ HAVUZU + SONUÇ
// ============================================================
function pushWrong(w) {
  if (w && !wrongPool.find((x) => x.word === w.word)) wrongPool.push(w);
}

function finish() {
  showView("result");
  const done = know + learn;
  const pct = done ? Math.round((know / done) * 100) : 0;
  let emoji = "📚", title = "Devam et!";
  if (pct >= 80) { emoji = "🎉"; title = "Mükemmel!"; }
  else if (pct >= 50) { emoji = "💪"; title = "İyi iş!"; }
  $("r-emoji").textContent = emoji;
  $("r-title").textContent = title;
  $("r-sub").textContent = `${pct}% başarı — ${know} doğru, ${learn} yanlış`;
  $("r-wrong").classList.toggle("hidden", wrongPool.length === 0);
}

$("r-restart").addEventListener("click", () => { wrongPool = []; startMode(mode, true); });
$("r-wrong").addEventListener("click", () => { startMode(mode, false); });

// ============================================================
//  BAŞLAT
// ============================================================
init();
