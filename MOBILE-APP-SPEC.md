# Mobil Uygulama — Gereksinim Dokümanı

> Durum: Gereksinimler onaylandı (11 Haziran 2026) · Tasarım/uygulama bekliyor
> Karar sahibi: Halil Kaya · `/sc:brainstorm` oturumu çıktısı
> Konum: Bu repo içinde **`mobile/`** klasörü (web uygulamasına dokunulmaz)

## 1. Amaç

Webdeki kelime ezberleme uygulamasının ([index.html](../index.html)) tüm çalışma
modlarını içeren, üstüne **set yönetimi** (keşfet / çalışma listesi / geçmiş)
ekleyen bir React Native mobil uygulaması. v1 hedefi: Türkçe konuşan birinin
İngilizce kelime ezberlemesi. Mimari, ileride başka dil çiftlerine
(EN→TR, ES→TR, TR→ES, EN→ES, ES→EN, DE→EN, EN→DE, DE→TR, TR→DE, …)
**kod değişikliği gerektirmeden içerik ekleyerek** genişleyecek şekilde kurulur.

## 2. Teknoloji Kararları (onaylı)

| Karar | Seçim | Gerekçe |
|---|---|---|
| Altyapı | **Expo** (TypeScript, Expo Router, EAS Build) | Telefonda QR ile anında test; ileride Google girişi, abonelik (RevenueCat/IAP) ve AdMob reklamları config plugin'leriyle destekler — bare RN'e geçiş gerekmez. Reklam/IAP eklendiğinde Expo Go yerine dev build kullanılır. |
| Veri | **Tamamen cihazda** | Katalog uygulamayla paketlenir (bundled JSON); kullanıcı verisi (listeler, ilerleme) cihazda saklanır. Backend yok. Google girişi/abonelik ileride eklendiğinde senkronizasyon ayrıca tasarlanır. |
| Başlangıç kataloğu | **Webdeki 33 set taşınır** | set-01..33 (`kelime \| tür \| anlam \| 10× örnek çifti` formatı) yeni katalog formatına dönüştürülür. Kategori/seviye etiketleri dönüşümde atanır. |
| Kullanıcı seti | **Sadece uygulama içi oluşturma** | Dosya yükleme yok. Form ile kelime girilir; 15'i aşan listeler otomatik 15'lik setlere bölünür. |
| İlerleme | **Set + kelime bazında** | Set geçmişi (tarih, mod, skor) ve kelime durumu (yeni/çalışılıyor/ezberlendi) tutulur; "sadece yanlışları" akışı ve ileride SRS bunun üstüne kurulur. |

## 3. Kullanıcı Akışları

### 3.1 İlk açılış (onboarding)
- Kullanıcı **hangi dili öğrenmek istediğini** seçer (v1'de tek seçenek: İngilizce — Türkçe açıklamalı).
- Seçim kalıcıdır; **Ayarlar**'dan değiştirilene kadar tüm uygulama o dil çiftinde çalışır.
- Dil çifti değiştirildiğinde listeler/ilerleme dil çiftine göre ayrı tutulur (silinmez).

### 3.2 Ana ekran — Çalışma Hedefim
- Kullanıcının **çalışma listesine aldığı setler** sıralanır (hedef kuyruk).
- Her set kartında: ad, kategori, seviye, ilerleme (ezberlenen kelime sayısı), son çalışma.
- Sete dokununca set detayına; "Çalış" ile doğrudan mod seçimine gidilir.
- Liste boşsa Keşfet'e yönlendiren boş durum ekranı.

### 3.3 Keşfet
- Tüm katalog **kategoriye göre** ve **seviyeye göre (Başlangıç / Orta / İleri)** filtrelenip gezilebilir.
- İçerik birimi iki türde olabilir:
  - **Kelime** (`come`, `vow`, `velocity`)
  - **Bağlam / öbek** (`come by`, `give up`, `look forward to`) — ayrı bir girdi, kendi anlamı ve örnekleriyle. Veri modelinde `kind: word | phrase` ayrımı zorunlu.
- Kullanıcı bir seti **çalışma listesine ekler/çıkarır**; istediği seti listeye almadan da anında çalışabilir.
- Set detay sayfası: 15 kelimenin listesi (kelime + anlam), seviye, kategori, örnek sayısı.

### 3.4 Geçmiş — Çalıştıklarım
- Daha önce çalışılan setlerin listesi: tarih, kullanılan mod(lar), skor(lar).
- Sete girince geçmiş oturum özetleri ve kelime bazlı durum (ezberlendi/çalışılıyor) görünür.
- Buradan tekrar çalışmaya başlanabilir.

### 3.5 Set oluşturma (kullanıcı seti)
- Form ile girdi: terim, tür (isim/fiil/sıfat/zarf/öbek...), anlam, en az 1 örnek cümle çifti (hedef dil + kaynak dil, `{terim}` işaretli).
- 15 kelime dolunca set kapanır; devam edilirse yeni set otomatik açılır (Set 2, Set 3…).
- Kullanıcı setleri katalog setleriyle aynı yapıda saklanır, aynı modlarla çalışılır, "Benim Setlerim" kategorisinde görünür.

### 3.6 Çalışma oturumu — webdeki 6 mod
Webdeki davranışlar birebir korunur (dokunmatik için uyarlanır):
1. **Kartlar** — çevirmeli kart, biliyorum/öğreniyorum, örnek listesi, TTS.
2. **Test** — 4 şıklı çoktan seçmeli, karışık şıklar.
3. **Eşleştirme** — 6 çift hafıza oyunu, süre tutma.
4. **Boşluk Doldur** — örnek cümlede `{kelime}` boşluğu, ipucu olarak anlam.
5. **Yazma** — harf kutucuklarına harf harf yazma, yanlış harf reddedilir, göster/atla.
6. **Ezber** — piramit iniş (bakarak) + çıkış (gizli, hafızadan) + cümle yazımı + final test; piramitte hata = piramit baştan, cümlede hata = cümle baştan, final yanlışsa kelime kuyruğun sonuna ([EZBER-MODU-SPEC.md](../EZBER-MODU-SPEC.md) esas alınır).
- Oturum sonu: skor ekranı, "tümünü tekrar" / "sadece yanlışları".
- Oturum sonucu geçmişe yazılır; kelime durumları güncellenir.
- TTS: cihazın yerel ses sentezi (expo-speech), hedef dilin aksanıyla.

### 3.7 Ayarlar
- Dil çifti değiştirme (v1'de tek seçenek görünür ama ekran hazır olur).
- Ses açık/kapalı, tema (v1: webdeki koyu tema).
- İleride: hesap (Google girişi), abonelik durumu, veri sıfırlama.

## 4. Veri Modeli Gereksinimleri (yapı — şema tasarımı /sc:design'da)

- **Dil çifti (`languagePair`)**: her katalog seti, kullanıcı seti ve ilerleme kaydı
  bir dil çiftine bağlıdır (`en-tr`, `es-tr`, `de-en`, …). UI metinleri v1'de Türkçe;
  i18n altyapısı kurulur ama tek dil gönderilir.
- **Set**: id, ad, dil çifti, seviye (`beginner | intermediate | advanced`),
  kategori, kaynak (`catalog | user`), 15 girdi.
- **Girdi (kelime/öbek)**: `kind: word | phrase`, terim, tür, anlam,
  örnek cümleler `[{ hedef, kaynak }]` — hedef cümlede terim `{...}` ile işaretli
  (boşluk doldur ve ezber modları bunu kullanır). Katalog girdilerinde 10 örnek hedeflenir,
  kullanıcı girdilerinde en az 1.
- **Kelime durumu**: girdi başına `new | learning | mastered` + sayaçlar
  (doğru/yanlış, son görülme). Ezber finali ilk denemede geçilen kelime `mastered` adayıdır.
- **Oturum kaydı**: set id, mod, tarih, doğru/yanlış sayısı, süre.
- **Listeler**: çalışma hedefi (sıralı), çalışılanlar (oturum kayıtlarından türetilir).

## 5. Kategori ve Seviye Taksonomisi (rules dosyasına yazılacak)

`mobile/CLAUDE.md` (proje rules dosyası) şunları içermek ZORUNDA:
- Dil çifti mimarisi ve "yeni dil = sadece içerik + locale ekle, kod değişmez" kuralı.
- Set yapısı (15 girdi, alanlar, `{terim}` işaretleme kuralı, 10 örnek hedefi).
- Seviyeler: `beginner` (Başlangıç), `intermediate` (Orta), `advanced` (İleri).
- Kategori listesi (v1 + olası genişlemeler):

| Anahtar | Ad (TR) | Not |
|---|---|---|
| `daily-life` | Günlük Yaşam | |
| `travel` | Seyahat | |
| `food-drink` | Yiyecek & İçecek | |
| `work-career` | İş & Kariyer | |
| `academic` | Akademik | sınav setlerinin üst kümesi |
| `health` | Sağlık | |
| `technology` | Teknoloji | |
| `nature` | Doğa & Çevre | |
| `emotions` | Duygular & Kişilik | |
| `phrasal-verbs` | Öbek Fiiller | `kind: phrase` ağırlıklı |
| `idioms` | Deyimler & Kalıplar | `kind: phrase` |
| `grammar-words` | Bağlaçlar & İşlev Kelimeleri | |
| `exam-prep` | Sınav Hazırlık (YDS/IELTS/TOEFL) | olası genişleme |
| `business-english` | İş İngilizcesi | olası genişleme |
| `slang-informal` | Günlük Konuşma & Argo | olası genişleme |
| `general` | Genel | webden taşınan 33 setin varsayılanı |
| `my-sets` | Benim Setlerim | kullanıcı setleri (sanal kategori) |

- Webden taşınan 33 set: `general` kategorisi + `intermediate` seviye varsayılanıyla
  girer; etiketler ileride içerik girilirken zenginleştirilir.

## 6. Fonksiyonel Olmayan Gereksinimler

- **Çevrimdışı çalışma**: uygulama internetsiz tam işlevseldir.
- **TypeScript zorunlu**; çalışma modu motorları UI'dan ayrık, saf fonksiyon/saf state
  olarak yazılır (test edilebilirlik + ileride web ile paylaşım ihtimali).
- iOS + Android tek kod tabanı; webdeki koyu tema ve görsel dil korunur.
- Gelecek entegrasyonlara hazırlık (kod değil, mimari boşluk): Google girişi,
  abonelik (içerik kilidi: ücretsiz N set / premium tümü gibi), reklam alanları.
  Bu üçü v1'de UYGULANMAZ; rules dosyasına "nereye ekleneceği" notu düşülür.
- `mobile/README.md`: kurulum, çalıştırma (`npx expo start`), telefonda test,
  build komutları, klasör yapısı, katalog içeriği ekleme rehberi.

## 7. Kabul Kriterleri (v1)

- [ ] `mobile/` altında Expo projesi; web projesi dosyalarına dokunulmamış.
- [ ] İlk açılışta dil seçimi; Ayarlar'dan değiştirilebilir; seçim kalıcı.
- [ ] 33 set katalogda; kategori ve seviye filtreleriyle Keşfet'te gezilebilir.
- [ ] Set çalışma listesine eklenip çıkarılabilir; ana ekranda sıralı görünür.
- [ ] 6 çalışma modu da mobilde çalışıyor; Ezber akışı web spec'iyle birebir.
- [ ] Oturum sonuçları geçmişe yazılıyor; kelime durumları güncelleniyor;
      uygulama kapatılıp açılınca her şey yerinde (kalıcılık).
- [ ] Uygulama içinden set oluşturulabiliyor; 15'i aşınca otomatik bölünüyor.
- [ ] `mobile/CLAUDE.md` dil mimarisi + set yapısı + kategori taksonomisini içeriyor.
- [ ] `mobile/README.md` ile sıfırdan biri projeyi çalıştırabiliyor.

## 8. Açık Sorular (varsayılanla ilerlenebilir)

1. **Kelime "mastered" eşiği**: Ezber finalini ilk denemede geçmek yeterli mi,
   yoksa 2 farklı günde mi gerekli? Varsayılan: tek geçiş yeterli, ileride SRS ile sıkılaştırılır.
2. **Ezber piramidi uzun kelime davranışı** webdeki açık soruyla aynı (sınırsız varsayılan).
3. **Keşfet'te tek kelime çalışma**: kullanıcı tek bir kelimeyi/öbeği listeye alabilsin mi,
   yoksa birim hep set mi? Varsayılan: birim set; tek kelime ekleme "Benim Setlerim"de
   otomatik bir "Seçtiklerim" seti oluşturarak çözülür.

## Sonraki Adım

Mimari ve ekran/şema tasarımı için: `/sc:design MOBILE-APP-SPEC.md`
veya doğrudan uygulama planı için: `/sc:workflow MOBILE-APP-SPEC.md`
