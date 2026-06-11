# 📚 Kelime Ezber — Mobil (React Native / Expo)

Web kelime-ezberleme uygulamasının mobil sürümü. 6 çalışma modu (Kartlar, Test,
Eşleştirme, Boşluk Doldur, Yazma, **Ezber**) + set yönetimi (Keşfet, Hedef
Listesi, Geçmiş, Set Oluşturma). Tüm veri **cihazda** — backend yok.

> Gereksinimler: [../MOBILE-APP-SPEC.md](../MOBILE-APP-SPEC.md) · Mimari kurallar: [CLAUDE.md](CLAUDE.md)

## Gereksinimler

- **Node 18+** (geliştirme Node 25 ile yapıldı)
- **Expo Go** uygulaması (telefonda, App Store / Play Store) — en kolay test yolu
- iOS Simulator için Xcode / Android Emulator için Android Studio (opsiyonel)

## Çalıştırma

```bash
cd mobile
npm install          # bağımlılıklar (ilk sefer)
npx expo start       # geliştirme sunucusu + QR kod
```

Terminalde çıkan **QR kodu** telefonundaki Expo Go ile okut → uygulama açılır.
Alternatifler:

```bash
npx expo start --ios       # iOS Simulator (Xcode gerekir)
npx expo start --android   # Android Emulator (Android Studio gerekir)
```

Geliştirirken: terminalde `r` yeniden yükler, `m` geliştirici menüsünü açar.

## Doğrulama

```bash
npx tsc --noEmit                 # tip kontrolü
npx expo export -p ios           # tüm grafiği bundle'layıp doğrular (Xcode gerekmez)
```

## Üretim Derlemesi (EAS)

```bash
npm install -g eas-cli
eas build -p android --profile preview   # APK
eas build -p ios --profile preview       # iOS (Apple hesabı gerekir)
```

> Reklam (AdMob) ve abonelik (IAP) eklenince Expo Go yetmez; **dev build**
> gerekir: `npx expo install expo-dev-client` + `eas build --profile development`.

## Klasör Yapısı

```
mobile/
├─ src/
│  ├─ app/                    # Expo Router ekranları (dosya tabanlı yönlendirme)
│  │  ├─ _layout.tsx          # kök: hydration kapısı + Stack
│  │  ├─ index.tsx            # giriş kapısı (onboarding ↔ sekmeler)
│  │  ├─ onboarding.tsx       # öğrenme dili seçimi
│  │  ├─ (tabs)/              # Hedefim · Keşfet · Geçmiş · Ayarlar
│  │  ├─ set/[id].tsx         # set detayı
│  │  ├─ study/[id].tsx       # çalışma oturumu (mod seçici + 6 mod + sonuç)
│  │  └─ create-set.tsx       # kullanıcı seti oluşturma
│  ├─ components/
│  │  ├─ modes/               # 6 çalışma modu + ModePicker + ResultView
│  │  └─ ...                  # Screen, Button, Chip, SetCard, StatBar
│  ├─ engine/                 # SAF mantık (shuffle, examples, memorize, test, speak)
│  ├─ store/                  # zustand + AsyncStorage (settings, library, hydration)
│  ├─ data/                   # types, categories, languages, catalog/, useSets
│  │  └─ catalog/en-tr/sets.json   # paketlenmiş 33 set (üretildi)
│  ├─ i18n/                   # arayüz metinleri (tr)
│  └─ theme/                  # renk/ölçü token'ları (web paletinden)
└─ scripts/convert-sets.mjs   # ../set-XX.txt → katalog JSON dönüştürücü
```

## İçerik Ekleme

### Mevcut kataloğu yeniden üretmek
33 set, web projesindeki `../set-XX.txt` dosyalarından üretilir:

```bash
node scripts/convert-sets.mjs   # → src/data/catalog/en-tr/sets.json
```

### Yeni dil çifti eklemek
Kod değişmeden, sadece içerik (bkz. [CLAUDE.md](CLAUDE.md) “Dil Mimarisi”):
1. `src/data/catalog/<pair>/sets.json` üret.
2. `src/data/catalog/index.ts` → `CATALOG_BY_PAIR`'e ekle.
3. (Gerekirse) `src/engine/speak.ts` → `localeOf()`'a TTS locale'i ekle.

Onboarding ve Ayarlar yeni çifti otomatik gösterir.

## Notlar

- **Tema:** koyu, web sürümünün paletinden (`src/theme`).
- **Sesli okuma:** cihazın TTS'i (`expo-speech`), öğrenilen dilin aksanıyla.
- **Veri sıfırlama:** Ayarlar → “Verileri sıfırla”.
- v1 dil çifti: **İngilizce → Türkçe**. Diğerleri “yakında” (içerik bekliyor).
