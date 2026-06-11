# Ezber Modu — Gereksinim Dokümanı

> Durum: Gereksinimler onaylandı (11 Haziran 2026) · Uygulama bekliyor
> Karar sahibi: Halil Kaya · `/sc:brainstorm` oturumu çıktısı

## 1. Amaç ve Problem

Mevcut **Yazma** modu, kelimeyi zaten bilen birinin kelimeyi yazmasını istiyor;
kelimeyi *ezberletmiyor*. Kullanıcının hedefi: bir kelimeyi yazım pratiği
üzerinden **tam olarak ezberlemek** — bakarak kopyalamaktan hafızadan
hatırlamaya kademeli geçiş yapan bir akış.

Çözüm: Mevcut sekmelerin yanına yeni bir **"🧗 Ezber"** sekmesi eklenir.
Mevcut Yazma modu **değişmeden** kalır.

## 2. Kelime Başına Akış (4 Aşama)

Her kelime için sırasıyla şu aşamalar tamamlanır. Örnek kelime: `deceiver`.

### Aşama 1 — Piramit İnişi (bakarak yazma)
- Ekranda: kelime (`deceiver`), türü (`isim`), Türkçe anlamı (`aldatıcı kişi, hilekâr`).
- Kullanıcı kelimeyi **bakarak** tam yazar, sonra her basamakta bir harf
  eksiltilmiş halini yazar:
  `deceiver → deceive → deceiv → decei → dece → dec → de → d`
- Her basamak için harf kutucukları (mevcut `wslot` deseni) gösterilir;
  doğru harf kutucuğu doldurur.

### Aşama 2 — Piramit Çıkışı (hafızadan yazma)
- **Kelime ekrandan gizlenir.** Sadece Türkçe anlam ve tür görünür kalır.
- Kullanıcı hafızadan, harf harf geri tamamlar:
  `de → dec → dece → decei → deceiv → deceive → deceiver`
- (`d` basamağı inişin sonunda yazıldığı için çıkış `de` ile başlar —
  toplam basamak sayısı: `2n − 1`, n = harf sayısı.)
- **👁 Göster** butonu: takılınca kelime ~1.5 sn görünür. Kullanımı kelimeyi
  "tekrar havuzuna" (wrongPool) ekler ama piramidi sıfırlamaz.

### Aşama 3 — Cümle Yazımı (bağlam pekiştirme)
- Kelimenin örneklerinden **rastgele bir cümle** seçilir.
- Ekranda: İngilizce cümle (kelime `<b>` vurgulu) + Türkçe çevirisi.
- Kullanıcı **cümlenin tamamını** bakarak harf harf yazar.
- Kolaylık: boşluk ve noktalama işaretleri otomatik geçilir/doldurulur;
  kullanıcı yalnızca harfleri yazar. Büyük/küçük harf duyarsız.

### Aşama 4 — Final Test (ezber kontrolü)
- Ekranda **yalnızca** Türkçe anlam + kelime türü kalır. Kelime ve cümle gizli.
- Kullanıcı kelimeyi serbest metin olarak yazar, **Enter / Kontrol Et** ile doğrulanır
  (harf harf reddetme YOK — yoksa doğru harfler ipucu olur).
- ✅ Doğru → kelime tamamlandı, sesli okunur (`speak`), sonraki kelimeye geçilir.
- ❌ Yanlış → doğru kelime gösterilir, kelime **destenin sonuna yeniden eklenir**
  (piramit akışı o kelime için ileride tekrar başlar).

## 3. Hata Politikası

| Aşama | Yanlış harf basılınca |
|---|---|
| Piramit (iniş + çıkış) | **Tüm piramit baştan başlar** (Aşama 1'in ilk basamağına dönülür). Kutu "shake" animasyonu + kısa hata bildirimi. |
| Cümle | O **cümle** baştan başlar (piramit etkilenmez). |
| Final test | Harf reddetme yok; yalnızca Enter'da kontrol. Yanlışsa kelime kuyruğa döner. |

## 4. Puanlama ve Mevcut Sistemle Entegrasyon

- **Biliyorum (know):** Final testi ilk denemede, 👁 Göster kullanmadan geçen kelime.
- **Öğreniyorum (learn) + wrongPool:** Final testte yanlış yazılan VEYA çıkışta
  👁 Göster kullanılan kelime. ("Sadece Yanlışları" akışıyla uyumlu.)
- Kuyruğa dönen kelime ikinci turda doğru tamamlanırsa sayaçlar değişmez
  (ilk sonucu korunur); sadece desteden düşer.
- Üst ilerleme çubuğu ve istatistik şeridi mevcut `updateStats` ile çalışır;
  desteki kelime sayısı bazlıdır.
- Kelime içi ilerleme göstergesi: `Piramit 5/15 · Cümle · Final` benzeri
  mini adım göstergesi.

## 5. Arayüz Gereksinimleri

- Yeni sekme: `🧗 Ezber` (`data-mode="memorize"`), `view-memorize` bölümü.
- Mevcut bileşenler yeniden kullanılır: `wslot` harf kutuları, `fill-feedback`,
  `shake` animasyonu, `speak()` TTS, `pickExample`, `highlightExample`.
- Görünür alanlar aşamaya göre: anlam/tür her aşamada sabit üstte; kelime
  yalnızca Aşama 1'de; cümle+çeviri yalnızca Aşama 3'te.
- Butonlar: `🔊 Dinle` (her aşamada), `👁 Göster` (yalnız Aşama 2),
  `Atla →` (kelimeyi learn sayıp geçer).
- Mobil uyumlu: mevcut tek `input` + `input` event deseni korunur
  (`autocapitalize/autocorrect/spellcheck` kapalı).

## 6. Kapsam Dışı / Değişmeyecekler

- Mevcut 5 mod (Kartlar, Test, Eşleştirme, Boşluk Doldur, Yazma) aynen kalır.
- Set dosyası formatı değişmez; ek veri alanı gerekmez
  (cümleler `{kelime}` işaretli mevcut örneklerden gelir).
- Yeni bağımlılık eklenmez (vanilla JS/CSS).

## 7. Açık Sorular (varsayılanlarla ilerlenebilir)

1. **Uzun kelime piramidi:** 12+ harfli kelimede piramit ~23 basamak sürüyor.
   Varsayılan: sınırsız (kullanıcı yoğun pratik istiyor). Gerekirse ileride
   "iniş 1'e kadar değil 3'e kadar" gibi kısaltma seçeneği eklenebilir.
2. **Cümle hata politikası sertliği:** Cümle-baştan yerine yalnız
   harf-reddetme istenirse tek satırlık değişiklik.
3. **Final testte harf kutusu ipucu:** Kutular kelime uzunluğunu ele veriyor.
   Varsayılan: kutu yerine düz input (uzunluk ipucu yok).

## 8. Kabul Kriterleri

- [ ] `deceiver` için akış: 8 iniş + 7 çıkış basamağı + 1 cümle + 1 final test.
- [ ] Çıkış aşamasında kelime ekranda hiçbir yerde görünmüyor.
- [ ] Piramidin herhangi bir basamağında yanlış harf → akış `deceiver` tam
      yazımına (iniş başı) dönüyor.
- [ ] Cümle aşamasında boşluk/noktalama otomatik geçiliyor; yanlış harf
      cümleyi baştan başlatıyor.
- [ ] Final testte yanlış cevap kelimeyi destenin sonuna ekliyor; deste o
      kelime tekrar geçilmeden bitmiyor.
- [ ] İstatistikler (know/learn/başarı) ve "Sadece Yanlışları" akışı çalışıyor.
- [ ] Boşluk içeren girdilerde (varsa) boşluk basamak sayısına dahil edilmiyor.

## Sonraki Adım

Uygulama için: `/sc:implement EZBER-MODU-SPEC.md` (dosyalar: `index.html`,
`script.js`, `style.css`).
