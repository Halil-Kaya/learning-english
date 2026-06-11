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

## iOS'ta Yayınlama — TestFlight (arkadaşlara feedback için)

Bulutta (EAS Build) derleyip TestFlight ile dağıtırız; Mac'te Xcode imzalama
uğraşı yok. **Apple Developer Program** üyeliği gerekir (yıllık $99).

Kimlik: `com.halilkaya.kelimeezber` ([app.json](app.json)) · Profiller: [eas.json](eas.json)

### Tek seferlik kurulum
```bash
npm install -g eas-cli           # EAS komut satırı
cd mobile
eas login                        # Expo hesabı (yoksa ücretsiz aç)
eas init                         # projeyi Expo'ya bağlar (projectId yazar)
```

### Derle + TestFlight'a gönder
```bash
eas build -p ios --profile production
# İlk seferde Apple hesabına giriş ister; sertifika/provisioning'i
# OTOMATİK oluşturur. Derleme bulutta ~15-20 dk sürer.

eas submit -p ios --latest
# Derlemeyi App Store Connect'e yükler. İstenirse App Store Connect
# API anahtarı / Apple ID ister; uygulama kaydını gerekiyorsa oluşturur.
```

### Arkadaşları davet et
1. [App Store Connect](https://appstoreconnect.apple.com) → **TestFlight** sekmesi.
2. Derleme işlenince (~birkaç dk): **Internal Testing** (ekibindeki en çok 100 kişi,
   anında) ya da **External Testing** (link ile en çok 10.000 kişi; ilk derlemede
   kısa bir "Beta App Review" var, genelde hızlı).
3. Arkadaşların telefonuna **TestFlight** uygulamasını kurar, gönderdiğin
   davet linkine dokunur → uygulama yüklenir.

> **Senin cihazın:** kendini *internal tester* olarak ekle → her yeni derleme
> anında düşer. TestFlight derlemeleri **90 gün** geçerli; süre dolunca ya da
> değişiklik yapınca `eas build` + `eas submit` tekrar.
>
> **Sürüm artırma:** `production` profilinde `autoIncrement` açık + EAS uzaktan
> build numarası yönetir; her gönderimde otomatik artar.

### Alternatif: TestFlight'sız hızlı paylaşım (ad-hoc)
Birkaç kişiye, Apple incelemesi olmadan doğrudan kurulum:
```bash
eas device:create                       # her arkadaşın cihaz UDID'sini kaydet
eas build -p ios --profile preview       # internal dağıtım derlemesi
# Çıkan linki paylaş; kayıtlı cihazlar doğrudan kurar (yılda 100 cihaz sınırı)
```

> Reklam (AdMob) / abonelik (IAP) eklenince geliştirme için **dev build**:
> `npx expo install expo-dev-client` + `eas build --profile development`.

## Android Derlemesi (opsiyonel)
```bash
eas build -p android --profile preview   # paylaşılabilir APK
```

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
