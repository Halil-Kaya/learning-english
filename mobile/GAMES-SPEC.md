# Oyunlar — Gereksinim Spec'i

> Karar tarihi: 2026-06-12. Kullanıcı onayları: oyunlar **mod seçicide** yaşar,
> zorluk **seviyeye göre artar**, ek oyunların **üçü de** eklenir,
> oyun sonuçları **kelime ilerlemesine İŞLEMEZ** (sadece eğlence + skor).

## Genel İlkeler

- Oyunlar `ModePicker`'a yeni kart olarak eklenir; `StudyMode` union'a yeni
  anahtarlar girer. Her set ile oynanabilir.
- **İlerlemeye dokunmaz:** oyun bileşenleri `onRecordWord` ÇAĞIRMAZ.
  `study/[id].tsx` oyun modlarında `addSession` da çağırmaz (v1: oyun oturumu
  geçmişe yazılmaz).
- **Yüksek skor:** yeni `src/store/games.ts` (zustand persist, `ByPair`,
  `setId → { game → highScore }`). Oyun sonunda "Rekor!" gösterimi.
- **Dil bağımsızlık korunur:** harf havuzları kelimeden türetilir; şaşırtıcı
  (decoy) harfler hedef dil alfabesinden + kelimedeki aksanlı harflerden seçilir.
  Hiçbir oyunda dile özel sabit yok.
- Saf mantık `src/engine/` (test edilebilir), UI `src/components/modes/`,
  metinler `src/i18n/tr.ts`.
- Ortak `ModeProps` kullanılır (`entries`, `speak`, `onFinish`); oyunlar kendi
  skor sonuç ekranını gösterir (mevcut `ResultView`'a skor varyantı eklenebilir).

## Oyun 1 — 🧩 Kelime Kur (kullanıcının istediği)

Anlam gösterilir, karışık harflere tıklayarak kelime kurulur.

- Ekran: TR anlam + tür; altta karıştırılmış harf kutucukları; üstte kurulan
  kelimenin boş kutuları.
- Harfe tıkla → kutuya eklenir; "Geri" son harfi iade eder; "Temizle" hepsini.
- Tüm kutular dolunca otomatik kontrol: doğruysa yeşil animasyon + `speak`,
  sonraki kelime; yanlışsa shake + harfler iade.
- **Zorluk merdiveni (onaylandı):** oturum 0 decoy ile başlar; her doğru
  kelimede decoy +1 (maks 3), her yanlışta bir kademe düşer.
- Çok kelimeli öbekler dahil: boşluk kutusu sabit/açık gösterilir.
- Puan: kelime uzunluğu + decoy×2; üst üste doğrularda ×combo.
- Saf yardımcılar: `src/engine/anagram.ts` (harf havuzu üret, decoy seç, karıştır).

## Oyun 2 — ⏱ Zaman Yarışı

Anlam ekrana gelir, 4 seçenekten doğru kelimeyi süre dolmadan seç.

- Süre çubuğu: 8 sn başlar; her 5 doğruda 0.5 sn kısalır (min 3 sn).
- 3 can: yanlış veya süre dolması can götürür + combo sıfırlar.
- Puan: temel 10 × combo çarpanı (1x→5x). Canlar bitince oyun sonu + rekor.
- Deste biterse karıştırılıp başa sarar (oyun can bazlı biter, kelime bazlı değil).
- Seçenek üretimi mevcut test motorundan (`src/engine/test.ts`) yeniden kullanılır.

## Oyun 3 — 🪢 Adam Asmaca

- İpucu: TR anlam + tür. Kelimenin harf kutuları (boşluk/noktalama otomatik açık).
- A–Z klavye ızgarası: harf kelimede varsa tüm konumları açılır; yoksa 6 haktan
  biri gider (asılma aşamaları View/emoji ile basit çizim — SVG bağımlılığı yok).
- Kazanınca `speak` + puan = kalan can × kelime uzunluğu; kaybedince kelime
  gösterilir, sonraki kelimeye geçilir.
- Saf yardımcılar: `src/engine/hangman.ts` (tahmin durumu, açık harf seti).

## Oyun 4 — 🗺 Kelime Avı (Wend tarzı — görseldeki)

Izgarada gizli 3–4 kelimeyi komşu hücreleri takip ederek bul; her harf tam bir kez kullanılır.

- Setten 3–4 kelime seçilir (toplam harf sayısı ızgara kapasitesine göre);
  kelimeler ızgaraya "yılan yolu" şeklinde yerleştirilir (yatay/dikey komşuluk),
  artan hücreler bloke (gri) gösterilir.
- Kullanıcı hücreden başlayıp komşu hücrelere sürükleyerek/tıklayarak yol çizer;
  yol bir hedef kelimeyse hücreler renklenir ve kelime bulunan listesine düşer.
- Alt panel: bulunacak kelimelerin uzunluk kutuları + **TR anlamları**
  (öğrenme değeri buradan gelir).
- "Geri Al" ve "İpucu" (rastgele bulunmamış kelimenin ilk hücresini gösterir;
  ipucu skoru yarıya düşürür).
- Zorluk: 4×4 (2–3 kelime) başlar; her tamamlanan turda 5×4 → 5×5 → 6×5 büyür.
- Puan: kelime başına uzunluk×5, tur bitirme bonusu, ipucu cezası.
- Saf üretici: `src/engine/wordhunt.ts` — geri izlemeli (backtracking)
  yerleştirme; sığmazsa yeniden dener; seed ile deterministik test edilebilir.
  **En karmaşık parça — en son yapılır.**

## Mod Seçici Kartları

| mode | emoji | başlık | açıklama |
|---|---|---|---|
| `anagram` | 🧩 | Kelime Kur | Harfleri sıraya diz, kelimeyi oluştur |
| `race` | ⏱ | Zaman Yarışı | Süre dolmadan doğru kelimeyi seç |
| `hangman` | 🪢 | Adam Asmaca | Harf tahmin et, kelimeyi kurtar |
| `hunt` | 🗺 | Kelime Avı | Izgarada gizli kelimeleri bul |

Seçicide oyunlar mevcut 6 moddan görsel olarak ayrışır ("OYUNLAR" başlığı altında ikinci grup).

## Uygulama Partileri ("devam et" akışı)

- [ ] **Parti A** — Altyapı + Kelime Kur: `engine/anagram.ts`, `AnagramMode.tsx`,
      `games` store (yüksek skor), ModePicker'da OYUNLAR grubu, skor sonuç ekranı,
      `study/[id].tsx`'te oyun modlarının ilerleme/geçmişe yazmaması.
- [ ] **Parti B** — Zaman Yarışı: `RaceMode.tsx` (+ süre/can/combo), rekor entegrasyonu.
- [ ] **Parti C** — Adam Asmaca: `engine/hangman.ts`, `HangmanMode.tsx`.
- [ ] **Parti D** — Kelime Avı: `engine/wordhunt.ts` (grid üretici) + `HuntMode.tsx`.

Her parti sonunda: `npx tsc --noEmit` → commit → push.

## Açık Kararlar (varsayılanlarla ilerlenir, istenirse değişir)

1. Oyun oturumları geçmiş sekmesine hiç yazılmıyor (v1). İstenirse `kind: "game"`
   etiketiyle ayrıca gösterilebilir.
2. Kelime Avı'nda anlamlar ipucu panelinde baştan açık (öğretici). İstenirse
   "kelime bulununca anlam görünür" moduna çevrilebilir.
3. Zaman Yarışı süre/can değerleri (8sn/3 can) oynanabilirlik testine göre ayarlanabilir.
