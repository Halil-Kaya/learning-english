# 🗂️ Proje Dizini — Learning English / Kelime Ezber

> Bu dosya, deponun **gezinme merkezidir** (knowledge base). İçeriği tekrarlamaz;
> doğru dosyaya yönlendirir. Ayrıntı için bağlantılara git.

Depo iki bağımsız uygulamadan oluşur:

| Uygulama | Konum | Teknoloji | Durum |
|---|---|---|---|
| **Web** — tarayıcı kelime ezberleme | depo kökü | Vanilla HTML/CSS/JS | Çalışır (6 mod) |
| **Mobil** — aynı uygulamanın telefon sürümü | [`mobile/`](mobile/) | React Native · Expo · TS | v1 kuruldu (EN→TR) |

İkisi de **aynı kelime verisini** kullanır (pipe formatlı set dosyaları). Mobil,
bu setleri JSON kataloğa dönüştürüp paketler. Backend/internet gerekmez.

---

## 📚 Dokümantasyon İndeksi

| Doküman | Kapsam |
|---|---|
| [README.md](README.md) | Web uygulaması: çalıştırma, veri formatı, modlar |
| [EZBER-MODU-SPEC.md](EZBER-MODU-SPEC.md) | "Ezber" modunun tam akış spesifikasyonu (web + mobil ortak) |
| [MOBILE-APP-SPEC.md](MOBILE-APP-SPEC.md) | Mobil uygulamanın gereksinim dokümanı |
| [mobile/README.md](mobile/README.md) | Mobil: kurulum, çalıştırma, build, klasör yapısı |
| [mobile/CLAUDE.md](mobile/CLAUDE.md) | Mobil **mimari kuralları** (dil mimarisi, set yapısı, taksonomi) |

---

## 🌐 Web Uygulaması

**Giriş noktaları**

| Dosya | Rol |
|---|---|
| [index.html](index.html) | Arayüz iskeleti, mod sekmeleri, görünümler |
| [script.js](script.js) | Tüm uygulama mantığı (veri yükleme + 6 mod) |
| [style.css](style.css) | Koyu tema, bileşen stilleri |
| [sets.json](sets.json) | Set manifesti (dosya · etiket · sayı) |
| `set-01.txt … set-33.txt` | 33 set × ~15 kelime (pipe formatı) |
| [words.txt](words.txt) | Eski tek-dosya yedeği (manifest yoksa) |

**Modlar** ([script.js](script.js) içinde bölüm bölüm):
Kartlar · Test · Eşleştirme · Boşluk Doldur · Yazma · **Ezber**
(Ezber akışı: [EZBER-MODU-SPEC.md](EZBER-MODU-SPEC.md)).

**Çalıştırma:** `python3 -m http.server 8000` → http://localhost:8000
(veya `docker compose up` → :8080). Ayrıntı: [README.md](README.md#-nasıl-çalıştırılır).

**Dağıtım:** [Dockerfile](Dockerfile) · [docker-compose.yml](docker-compose.yml) · [nginx.conf](nginx.conf)

---

## 📱 Mobil Uygulama (`mobile/`)

React Native (Expo SDK 56, TypeScript, Expo Router). ~3.5K satır TS/TSX, 45 dosya.

**Mimari katmanlar**

| Katman | Konum | İçerik |
|---|---|---|
| Ekranlar | [`mobile/src/app/`](mobile/src/app/) | Dosya tabanlı yönlendirme: onboarding, sekmeler, set/[id], study/[id], create-set |
| Çalışma modları | [`mobile/src/components/modes/`](mobile/src/components/modes/) | 6 mod + ModePicker + ResultView (ortak `ModeProps`) |
| UI bileşenleri | [`mobile/src/components/`](mobile/src/components/) | Screen, Button, Chip, SetCard, StatBar |
| Saf mantık | [`mobile/src/engine/`](mobile/src/engine/) | shuffle, examples, memorize, test, speak (UI'sız, test edilebilir) |
| Durum | [`mobile/src/store/`](mobile/src/store/) | zustand + AsyncStorage: settings, library, hydration |
| Veri | [`mobile/src/data/`](mobile/src/data/) | types, categories, languages, catalog/, useSets |
| i18n / tema | [`mobile/src/i18n/`](mobile/src/i18n/) · [`mobile/src/theme/`](mobile/src/theme/) | Arayüz metinleri (TR) · renk/ölçü token'ları |

**Katalog üretimi:** [mobile/scripts/convert-sets.mjs](mobile/scripts/convert-sets.mjs)
→ `set-XX.txt` dosyalarını [mobile/src/data/catalog/en-tr/sets.json](mobile/src/data/catalog/en-tr/sets.json)'a çevirir (33 set, 496 girdi).

**Çalıştırma:** `cd mobile && npm install && npx expo start` → QR'ı Expo Go ile okut.
Ayrıntı + build: [mobile/README.md](mobile/README.md).

---

## 🔑 Anahtar Kavramlar

- **Set = ~15 kelime.** İçerik paket paket ezberlenir; her set bir dosya/JSON kaydı.
- **`{süslü parantez}` zorunlu.** Örnek cümlede hedef kelime `{...}` ile işaretlenir;
  Boşluk Doldur / Yazma / Ezber bunu kullanır. Format: [README.md](README.md#-wordstxt-için-veri-nasıl-üretilir).
- **Kelime vs öbek.** Tek kelime (`come`) ile bağlam (`come by`) ayrıdır; mobilde
  `kind: "word" | "phrase"` alanı ([mobile/src/data/types.ts](mobile/src/data/types.ts)).
- **Dil-çifti mimarisi (mobil).** Tüm içerik `languagePair`'e bağlı (`en-tr`, `es-tr`…).
  Yeni dil = sadece içerik + kayıt, **kod değişmez**. Kural: [mobile/CLAUDE.md](mobile/CLAUDE.md#️-dil-mimarisi-en-önemli-kural).
- **Ezber modu.** İniş (bakarak) → çıkış (gizli) → cümle → final test; web ve mobilde
  birebir. Spesifikasyon: [EZBER-MODU-SPEC.md](EZBER-MODU-SPEC.md).

---

## 🛠️ Sık İşler

| İstek | Nereye |
|---|---|
| Web'e yeni set ekle | `set-34.txt` + [sets.json](sets.json)'a satır |
| Mobil kataloğu yeniden üret | `cd mobile && node scripts/convert-sets.mjs` |
| Mobile yeni dil çifti ekle | [mobile/CLAUDE.md](mobile/CLAUDE.md#️-dil-mimarisi-en-önemli-kural) (3 adım) |
| Mobil tip/bundle doğrula | `cd mobile && npx tsc --noEmit && npx expo export -p ios` |
| Kelime verisi üret | Claude'a liste ver, "[README.md](README.md) formatında üret" de |

---

## 📌 Bakım Notu

- [README.md](README.md)'deki "Modlar" tablosu **Ezber** modunu henüz listelemiyor
  (mod sonradan eklendi; bkz. [EZBER-MODU-SPEC.md](EZBER-MODU-SPEC.md)). Web README'si
  istenirse güncellenebilir.
- `mobile/AGENTS.md` Expo'nun sürümlü dokümanına işaret eder; mimari kurallar
  [mobile/CLAUDE.md](mobile/CLAUDE.md)'dedir.
