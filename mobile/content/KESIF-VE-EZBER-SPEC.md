# Kelime Keşfet + Ezber Düzeltmeleri + Responsive — Gereksinim & Plan

> Durum: Gereksinimler onaylandı (2026-06-11) · `/sc:brainstorm` çıktısı
> Karar sahibi: Halil Kaya
> Not: Parti 3 içerik üretimi bu 3 iş bitene kadar **beklemede**.

## Onaylanan Kararlar

| Konu | Karar |
|---|---|
| Keşfet kartı içeriği | Önce kelime + tür; **karta dokununca** TR anlam açılır (kendini test et) |
| Keşfet havuzu hariç tutma | Hedef listesindeki setler + geçmişte çalışılan setlerdeki kelimeler (+ kullanıcı setleri + bu oturumda toplananlar) |
| "Tamam" sonrası | Toplanan kelimeler **kendi setini oluştur formuna aktarılır**; isim verip kaydedilir |
| Ezber ara cümle | Piramit boyunca **birkaç basamakta bir** (≈3) örnek cümle gösterilir (okuma, yazma yok) |

---

## İş 1 — Ezber Modu Düzeltmeleri  (`src/components/modes/MemorizeMode.tsx`)

1. **Piramit görünür olsun.** Şu an her adımda tek satır kutu var; piramidin
   tamamı görünmüyor. Tamamlanan basamaklar ekranda **birikerek piramit şeklini**
   oluştursun (sönük/✓ satırlar), aktif basamak kutularla yazılır.
   - İniş: `deceiver → … → d`, Çıkış: `de → … → deceiver` (mevcut `buildPyramid`).
   - Çok uzun kelimede taşmaması için ScrollView + auto-scroll / pencere.
2. **Cümle aşaması: sadece kelime yazılsın.** Tüm cümle harf harf yazdırma
   KALDIRILIR. Cümle düz metin gösterilir, içindeki **terim ({süslü}) boşluk**
   olur; kullanıcı yalnız terimi yazar. Yanlış harf → sadece kelime girişi
   sıfırlanır (piramit etkilenmez). TR çeviri altta görünür.
3. **Ara örnek cümleler.** İniş/çıkış boyunca her ≈3 basamakta bir, kelimenin 10
   örneğinden biri (sırayla) pasif bir kutuda gösterilir (EN terim vurgulu + TR).
   Yazma yok, akışı kesmez.

Saf mantık değişirse `src/engine/memorize.ts`'e yardımcı eklenir. Puanlama/hata
politikası (final test, mastered) korunur.

## İş 2 — Kelime Keşfet (Tinder)  (`create-set.tsx` + yeni bileşen + store seçici)

- `create-set` ekranına **"🔍 Kelime Keşfet"** butonu.
- Açılan görünüm: kart destesi. **Kelime + tür** üstte; karta dokun → TR anlam.
  - Sağa kaydır = **biliyorum** → atılır.
  - Sola kaydır = **bilmiyorum** → sete toplanır, sayaç +1.
  - Erişilebilirlik için ✓/✗ butonları da olur.
- Üstte sayaç: **"Sette: N kelime"** (sola kaydırılan sayısı).
- **Havuz:** o dil çiftinin tüm katalog girdileri − (hedef listesi setleri ∪
  geçmiş setleri ∪ kullanıcı setleri ∪ bu oturumda görülenler). Karıştırılır.
- Havuz bitince "hepsini gördün" mesajı + Tamam.
- **Tamam** → toplanan kelimeler create-set `entries` listesine eklenir
  (önceden eklenenlerle birleşir); kullanıcı isim verir, kaydeder. **Sınır yok.**
- Kaydırma: RN çekirdeği `PanResponder + Animated` (yeni bağımlılık yok).

## İş 3 — iPhone 15 Pro Max Responsive (430×932)

- `Screen` alt güvenli alanı (home indicator) saygısı: alt butonlar (Kaydet,
  Ezber aksiyonları) çentiğe/indicator'a girmesin.
- Büyük fontlar (kelime 36, piramit) + uzun içerik dar ekranda taşmasın.
- Klavye açıkken giriş alanları görünür kalsın (KeyboardAvoidingView kontrolü).
- Tüm ekranlar gözden geçirilir; simülatör/preview ile doğrulanır.

---

## Sıra
1. İş 1 (Ezber) → onay → 2. İş 2 (Keşfet) → onay → 3. İş 3 (Responsive) → onay →
   Parti 3 içeriğe dönülür.
