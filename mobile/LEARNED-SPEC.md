# Öğrendiklerim — Gereksinim Spec'i

> Karar tarihi: 2026-06-12. Kullanıcı onayları: oturum geçmişi UI'dan **tamamen
> kalkar**; Kendini Dene havuzunu **kullanıcı seçer** (Hızlı 20 / Tam tarama);
> **gerçek swipe jesti** (Tinder benzeri); yanlış çıkan kelimeler set işaretini
> **değiştirmez** (sonuçta listelenir, kullanıcı isterse işareti kendi kaldırır).

## Amaç

Alt sekmedeki **Geçmiş → Öğrendiklerim** olur. Kullanıcı bir seti "öğrendim"
olarak işaretler; işaretlenen setler bu sekmede birikir. Sekmenin üstündeki
**Kendini Dene** butonu öğrenilen setlerin kelimelerinden Tinder benzeri bir
kaydırma oturumu başlatır; oturum sonunda bilinmeyen kelimeler listelenir.

## Fonksiyonel Gereksinimler

### 1. Set işaretleme
- Set detayında (`src/app/set/[id].tsx`) mevcut "Listeme Ekle" yanına
  **"🎓 Öğrendim" / "Öğrenilmiş ✓"** toggle butonu.
- İşaret serbesttir (koşul yok); tekrar basınca işaret kalkar.
- Store: `library.ts` içine `learnedSets: ByPair<string[]>` +
  `markLearned` / `unmarkLearned`. `reset` bunları da temizler.

### 2. Öğrendiklerim sekmesi (Geçmiş'in yerine)
- `(tabs)/history.tsx` → `(tabs)/learned.tsx`; sekme etiketi **"Öğrendiklerim"**,
  ikon 🎓. Oturum geçmişi UI'ı tamamen kalkar
  (store'daki `history` verisi ve `addSession` kaydı DURUR — ileride gerekirse UI geri gelir).
- İçerik: öğrenilen setlerin kartları (ad, seviye, kategori, kelime sayısı,
  ezberlenme durumu); karta dokununca set detayına gider.
- Üstte **"🃏 Kendini Dene"** butonu. Boş durumda: "Henüz öğrenilmiş set yok —
  set detayından 🎓 Öğrendim'i işaretle" + Keşfet'e yönlendirme.

### 3. Kendini Dene akışı
- Butona basınca seçim sunulur (iki buton): **Hızlı (20 kelime)** /
  **Tam tarama (hepsi)**. Havuz: tüm öğrenilen setlerin girdileri; Hızlı'da
  karışık rastgele 20 (havuz 20'den küçükse hepsi).
- Yeni ekran: `src/app/self-test.tsx` (sekme dışı, study gibi push edilir).
- **Swipe kartı (Tinder benzeri):** kart önde İngilizce terim (+tür, 🔊);
  dokununca çevrilir (anlam + örnekler). PanResponder + Animated ile:
  - sağa kaydır = **biliyorum** (yeşil "BİLİYORUM ✓" etiketi belirir),
  - sola kaydır = **bilmiyorum** (kırmızı etiket), kart dönerek uçar;
  - eşik altı bırakmada kart yerine yaylanır; alt tarafta buton eşdeğerleri de durur.
  - Yeni bağımlılık YOK (gesture-handler/reanimated eklenmez).
- Kaydırmalar `recordWord`'e normal işler (oyun değil, çalışma sayılır);
  oturum geçmişe yazılmaz (geçmiş kalktı).
- **Sonuç ekranı:** doğru/yanlış sayısı + **bilinmeyen kelimelerin listesi**
  (terim + anlam satırları, 🔊 ile dinlenebilir). "Bilmediklerimi tekrar dene"
  (yalnız yanlışlarla yeni tur) ve "Kapat" butonları.
- Set işaretleri değişmez; otomatik düşürme/uyarı YOK (onaylanan karar).

## Teknik Notlar (mimari kurallara uyum)

- Dil bağımsız: havuz `learnedSets[pair]` üzerinden; her şey `ByPair`.
- Saf yardımcı: havuz örnekleme (`samplePool(entries, n?)`) — mevcut
  `shuffle`/`sample` yeniden kullanılır, yeni engine dosyası gerekmez.
- `SessionRecord`/`history` tipleri ve verisi store'da kalır (UI yok);
  `study/[id].tsx`'teki `addSession` çağrısı da kaldırılır.
- i18n: tüm yeni metinler `tr.ts`'e (tabLearned, learnedTitle, learnedEmpty,
  selfTest, selfTestQuick, selfTestFull, selfTestKnown, selfTestUnknown,
  selfTestRetryWrong, setMarkLearned, setUnmarkLearned...).

## Uygulama Partileri ("devam et" akışı)

- [ ] **Parti A** — İşaretleme + sekme: `learnedSets` store alanı, set detayında
      🎓 toggle, Geçmiş sekmesinin Öğrendiklerim'e dönüşmesi (liste + boş durum),
      `addSession` çağrısının kaldırılması.
- [ ] **Parti B** — Kendini Dene: havuz seçimi (Hızlı 20 / Hepsi), swipe kart
      ekranı (`self-test.tsx`, PanResponder), bilinmeyenler listeli sonuç ekranı,
      "bilmediklerimi tekrar dene" turu.

Her parti sonunda: `npx tsc --noEmit` → commit → push.

## Açık Kararlar (varsayılanla ilerlenir)

1. Kendini Dene `recordWord`'e işler (çalışma sayılır) — istenirse kapatılır.
2. Hızlı tur boyutu 20 — istenirse ayarlanır.
3. Öğrenilen set Keşfet/listede ayrıca rozetlenmez (v1) — istenirse 🎓 rozeti eklenir.
