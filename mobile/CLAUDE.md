# Kelime Ezber — Mobil Uygulama (kurallar)

> Bu dosya, bu klasörde kod yazan herkes (ve Claude) için **mimari kurallardır**.
> Gereksinimlerin tamamı: [../MOBILE-APP-SPEC.md](../MOBILE-APP-SPEC.md).
> Expo SDK 54 — kod yazmadan önce sürümlü dokümana bak: https://docs.expo.dev/versions/v54.0.0/

## Ne / Nasıl

React Native (**Expo**, TypeScript, Expo Router) kelime ezberleme uygulaması.
Web sürümündeki ([../index.html](../index.html)) 6 çalışma modunu taşır, üstüne
set yönetimi (keşfet / hedef listesi / geçmiş / set oluşturma) ekler.

- **Tüm veri cihazda.** Backend yok. Katalog uygulamayla paketlenir; kullanıcı
  verisi (listeler, ilerleme, kullanıcı setleri) AsyncStorage'da (zustand persist).
- **State:** `zustand` + `persist` → `src/store/`. Türetilmiş veri hook'larla
  (`src/data/useSets.ts`), kalıcılık `createJSONStorage(AsyncStorage)`.
- **Saf mantık UI'dan ayrı:** çalışma modlarının çekirdek mantığı `src/engine/`
  (saf, test edilebilir). UI bileşenleri `src/components/`.

## ⚠️ Dil Mimarisi (en önemli kural)

Uygulama tek bir dil için DEĞİL, **dil çiftleri** için kurulmuştur:
`LanguagePair = "en-tr" | "es-tr" | "de-en" | ...` (hedef-kaynak: öğrenilen dil →
açıklama dili). v1'de yalnız **`en-tr`** içeriği var.

**KURAL: Yeni dil eklemek KOD DEĞİŞİKLİĞİ GEREKTİRMEZ. Sadece içerik + locale.**

Yeni bir dil çifti (ör. `es-tr`) eklemek için yapılacaklar:
1. `src/data/catalog/es-tr/sets.json` üret (bkz. `scripts/convert-sets.mjs` deseni).
2. `src/data/catalog/index.ts` → `CATALOG_BY_PAIR`'e bir satır ekle.
3. `src/data/languages.ts` → `PAIRS` listesinde o çiftin `available` olması otomatik
   (katalogda içerik varsa). Onboarding/Ayarlar onu otomatik gösterir.
4. TTS locale'i gerekiyorsa `src/engine/speak.ts` → `localeOf()`'a ekle.

Bunun dışında HİÇBİR ekran/komponent/мод dile özel kod içermemeli. Dile özel her şey
`languagePair`'e göre store'dan/katalogdan gelir. Kullanıcının listeleri, ilerlemesi
ve kullanıcı setleri **dil çiftine göre ayrı** tutulur (`ByPair<T>` — store'a bak).

UI metinleri şimdilik Türkçe (`src/i18n/tr.ts`). i18n altyapısı kuruldu; yeni UI dili
= yeni sözlük + `src/i18n/index.ts`'e ekleme. (Öğrenme dili ≠ arayüz dili.)

## Set ve Girdi Yapısı

`src/data/types.ts` tek kaynaktır. Özet:

```
WordSet { id, languagePair, name, level, category, source, entries[] }
Entry   { id, kind, term, type, meaning, examples[] }
Example { target, source }   // target: öğrenilen dil, terim {süslü} işaretli
```

Kurallar:
- **Katalog setleri = 15 girdi** (son sette 16). **Kullanıcı setleri = sınırsız** (40+ kelime serbest, otomatik bölme kaldırıldı).
- `kind`: tek kelime `"word"`, çok kelimeli bağlam/öbek `"phrase"`
  (örn. `come` ≠ `come by`). Boşluk içeren terim öbek sayılır.
- `examples[].target` içinde terim **`{süslü parantez}`** ile işaretlenir.
  **Boşluk Doldur** ve **Ezber** modları bunu kullanır — işaretsiz örnek bu modlarda
  boşluk üretmez. Katalogda girdi başına ~10 örnek hedeflenir, kullanıcıda ≥1.
- `level`: `beginner | intermediate | advanced`.
- `source`: `catalog` (paketli) veya `user` (kullanıcı, `category: "my-sets"`).

## Kategori / Seviye Taksonomisi

Tek kaynak: `src/data/categories.ts`. Aktif + olası kategoriler:

| key | etiket | not |
|---|---|---|
| `general` | Genel | webden taşınan 33 setin varsayılanı |
| `daily-life` | Günlük Yaşam | |
| `travel` | Seyahat | |
| `food-drink` | Yiyecek & İçecek | |
| `work-career` | İş & Kariyer | |
| `academic` | Akademik | |
| `health` | Sağlık | |
| `technology` | Teknoloji | |
| `nature` | Doğa & Çevre | |
| `emotions` | Duygular & Kişilik | |
| `phrasal-verbs` | Öbek Fiiller | `kind: phrase` ağırlıklı |
| `idioms` | Deyimler & Kalıplar | `kind: phrase` |
| `grammar-words` | Bağlaçlar & İşlev Kelimeleri | |
| `exam-prep` | Sınav Hazırlık | olası genişleme |
| `business-english` | İş İngilizcesi | olası genişleme |
| `slang-informal` | Günlük Konuşma & Argo | olası genişleme |
| `my-sets` | Benim Setlerim | kullanıcı setleri (sanal) |

Seviyeler: `beginner` (Başlangıç), `intermediate` (Orta), `advanced` (İleri).
Yeni kategori = `CATEGORIES`'e bir satır; Keşfet yalnız **içinde set olan**
kategorileri gösterir.

## Çalışma Modları

`src/components/modes/` — hepsi ortak `ModeProps` arayüzünü uygular
(`entries`, `speak`, `onRecordWord`, `onFinish`). Yeni mod eklemek:
modu yaz → `ModePicker` ve `study/[id].tsx`'teki `MODE_COMPONENTS`'e ekle →
`StudyMode` union'ına (`types.ts`) anahtar ekle.

- **cards / test / match / fill / write / memorize** + oyunlar:
  **anagram / race / hangman / hunt** (oyunlar `GAME_MODES`'ta — ilerleme ve
  geçmişe YAZMAZ, yalnız yüksek skor `src/store/games.ts`; bkz. GAMES-SPEC.md)
- **Ezber (`memorize`)** akışı (piramit kaldırıldı — webdeki spec'ten ayrışır):
  yaz (kelimeyi 10 kez, bakarak) → cümle (3 örnek cümlede boşluk doldur) → final test.
  Yazmada hata = yalnız o satır baştan; cümlede hata = o cümle baştan; final yanlışsa
  kelime destenin sonuna döner. Saf yardımcılar `src/engine/memorize.ts`.

## İlerleme

`recordWord(pair, entryId, {correct, mastered?})` her girdi için durum tutar
(`new → learning → mastered`). Ezber final'ini ilk denemede, **göstermeden**
geçen kelime `mastered`. Oturum bitince `addSession` geçmişe yazar. İkisi de
`src/store/library.ts`.

## Gelecek Entegrasyonlar (v1'de UYGULANMADI — yeri burada)

Spec gereği mimari bunlara hazır; eklerken:
- **Google girişi / hesap:** `src/store/settings.ts` yanına bir `auth` store;
  giriş sonrası cihaz verisini buluta senkron eden katman (store'lar zaten
  `ByPair` serileştirilebilir).
- **Abonelik (IAP):** içerik kilidi için Keşfet'te set kartına `locked` türevi
  (ör. ücretsiz N set). Expo + RevenueCat config plugin.
- **Reklam (AdMob):** Expo config plugin + dev build (Expo Go reklam göstermez).
  Yerleştirme: oturum sonu (`ResultView`) ve liste aralarına banner.

## Yapma / Dikkat

- Web projesine (üst dizin) **dokunma**. Bu klasör bağımsızdır.
- Modlar/ekranlar dile özel string GÖMME — `i18n` ve katalogdan al.
- **SDK 54** kullanılır (App Store/Play Store'daki Expo Go ile uyumlu). SDK
  yükseltirken Expo Go'nun o sürümü desteklediğinden emin ol, yoksa dev build gerekir.
- Yeni native modül = `npx expo install` (sürüm hizası); Expo Go'da çalışıp
  çalışmadığını kontrol et.
- Değişiklikten sonra: `npx tsc --noEmit` ve gerekiyorsa `npx expo export -p ios`
  ile bundle doğrula.
