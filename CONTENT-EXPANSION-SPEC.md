# İçerik Genişletme + Kelime Arama — Gereksinim Dokümanı

> Durum: Gereksinimler onaylandı (11 Haziran 2026) · Uygulama bekliyor
> Karar sahibi: Halil Kaya · `/sc:brainstorm` oturumu çıktısı
> Kapsam: **mobil uygulama** (`mobile/`). Web (kök dizin) bu işten ETKİLENMEZ.

## 1. Amaç

İki bağımsız iş:

**A — Kelime havuzu genişletme:** Mobil kataloğa, sıklık temelli **5000 İngilizce
kelime + ~500 öbek/bağlam** (come by, sign up, look forward to…) eklemek. Her
girdi mevcut 33 setteki formatla birebir: tür + Türkçe anlam + **10 özgün örnek
cümle** (EN `{terim}` işaretli + TR çevirisi). Üretim **parça parça** yapılır;
her parti sonunda kullanıcıya "devam edeyim mi?" diye sorulur (oturumlar arası
sürdürülebilir program).

**B — Aramayla set oluşturma:** Keşfet → "Kendi setini oluştur" akışına **kelime
arama** eklenir. Kullanıcı havuzdaki kelimeyi/öbeği arar, hazır içeriğiyle
(anlam + 10 örnek) kendi setine ekler. Kullanıcı setlerinde **15 sınırı kalkar**
(40+ kelime olabilir). Kullanım senaryosu: kullanıcı dışarıda gördüğü kelimeyi
uygulamada aratıp setine ekler, başka hiçbir şey girmesi gerekmez.

## 2. Onaylı Kararlar

| Karar | Seçim |
|---|---|
| Havuz hedefi | **5000 kelime + ~500 öbek** (≈370 katalog seti) |
| Kelime envanteri | Özgür/açık frekans listelerinden (NGSL vb.) — sıklık sırasıyla |
| İçerik üretimi | **Tamamı Claude tarafından özgün** üretilir (telif temiz, mevcut set stiliyle aynı). Sözlük sitelerinden örnek cümle ÇEKİLMEZ (lisanslı içerik). |
| Parti boyutu | **~150 kelime / parti** (10 set × 15) → ≈ **37 parti** |
| Onay akışı | Her parti: üret → doğrula → entegre → commit → **"devam edeyim mi?"** |
| Set oluşturma | **Arama + elle giriş birlikte**; kullanıcı setinde kelime sınırı yok |

## 3. İş A — Kelime Havuzu Programı

### 3.1 Faz 0 — Altyapı (tek oturum, içerik üretiminden ÖNCE)
1. **Envanter:** Özgür frekans listelerinden master envanter dosyası üretilir
   (`mobile/content/inventory.json`): sıklık sıralı 5000 kelime + ~500 öbek.
   - Mevcut 496 girdiyle **mükerrer ayıklama** (mevcut kelimeler envanterden düşülür
     ya da "var" işaretlenir).
   - Seviye eşlemesi (varsayılan): sıklık 1–1000 → `beginner`,
     1001–3000 → `intermediate`, 3001–5000 → `advanced`. Öbekler yaygınlığa göre dağıtılır.
2. **İlerleme takibi:** `mobile/content/PROGRESS.md` — hangi parti üretildi,
   hangi aralık sırada. Her oturum buradan devam eder (oturumlar arası hafıza).
3. **Doğrulama scripti:** `mobile/scripts/validate-catalog.mjs` — her partide çalışır:
   - her girdi: 10 örnek, her örnekte `{terim}` mevcut, TR çevirisi dolu
   - şema uyumu (kind/level/category geçerli), id benzersiz, havuz çapında mükerrer yok
4. **Katalog ölçekleme:** 5500 girdi ≈ 7–8 MB JSON. Tek dosya açılışı yavaşlatabilir;
   katalog **seviye/parça bazında bölünmüş dosyalara** geçirilir (tasarım `/sc:design`
   veya implement sırasında — gereksinim: açılış hızı mevcut haliyle aynı kalmalı).

### 3.2 Faz 2..N — İçerik partileri (≈37 kez, her biri onaylı)
Her partinin sabit akışı:
1. Envanterden sıradaki ~150 kelime/öbek alınır (sıklık sırasıyla).
2. Her girdi için üretilir: tür · TR anlam · 10 özgün örnek (EN `{terim}` + TR).
3. `validate-catalog.mjs` + `tsc --noEmit` geçilir.
4. Katalog dosyalarına entegre edilir; `PROGRESS.md` güncellenir; **commit**.
5. Kullanıcıya özet verilir (kaç kelime, hangi aralık) ve **"devam edeyim mi?"** sorulur.
   - "Devam" → sıradaki parti. Oturum yenilense bile `PROGRESS.md`'den devam edilir.

### 3.3 Katalog organizasyonu (varsayılan)
- Yeni setler **sıklık bandına göre** sıralanır (en sık kelimeler ilk setlerde —
  pedagojik olarak doğru: önce işine en çok yarayacak kelimeler).
- Set adlandırma: seviye + sıra (örn. "Başlangıç 12").
- Öbekler kendi setlerinde (`phrasal-verbs` kategorisi), kelimelerle karışmaz.
- Tema bütünlüğü olan gruplar uygun kategoriyle etiketlenir; karışık setler `general`.
- Mevcut 33 set ("Set 1..33") aynen kalır.

### 3.4 Kalite gereksinimleri (mevcut setlerle aynı)
- Örnek cümleler doğal, günlük; kelimenin EN YAYGIN anlamını öğretir;
  farklı zaman/kalıp/bağlam çeşitliliği içerir.
- TR çeviriler anlam odaklı (birebir değil), akıcı Türkçe.
- Alanlarda `|` ve `{}` dışında özel işaret yok; cümleler 6–14 kelime bandında.

## 4. İş B — Aramayla Set Oluşturma

### 4.1 Akış
- "Kendi setini oluştur" ekranında iki yol birlikte:
  1. **Ara & ekle:** arama kutusu — **İngilizce terimde VE Türkçe anlamda** anlık
     arama (case/diakritik duyarsız). Sonuç satırı: terim · tür · anlam · (öbek rozeti).
     Dokun → sete eklenir (tüm hazır içeriğiyle).
  2. **Elle giriş:** mevcut form aynen kalır (havuzda olmayan kelimeler için).
- Aynı kelime ikinci kez eklenemez (sessizce engellenir/işaretli görünür).
- Sete eklenenler listede görünür; tek tek çıkarılabilir.

### 4.2 Kurallar
- **Kullanıcı setlerinde kelime sınırı YOK** — 40+ kelime serbest.
  Mevcut "15'te otomatik bölme" davranışı kullanıcı setleri için **kaldırılır**.
- Katalog setleri 15'lik kalır (değişmez).
- Arama havuzu = tüm katalog girdileri (mevcut 33 set + yeni üretilen her parti
  otomatik aranabilir olur) + kullanıcının kendi girdiği kelimeler.
- Havuzdan eklenen girdi içerik kopyası değil **referans** olabilir (veri modeli
  `/sc:design` kararı) — gereksinim: katalog içeriği güncellenirse kullanıcı seti
  güncel içerikten yararlanmalı, depolama şişmemeli.
- Çalışma modları 40+ kelimelik setlerle sorunsuz çalışmalı (eşleştirme zaten
  6'şar örnekler; diğer modlar deste mantığıyla zaten ölçekli).

### 4.3 Kabul kriterleri (İş B)
- [ ] Arama: "sign" yazınca `sign up` (öbek) ve `sign` listede; "kaydolmak"
      yazınca `sign up` bulunuyor.
- [ ] Havuzdan eklenen kelime, kullanıcı setinde 10 örneğiyle çalışılabiliyor.
- [ ] 40 kelimelik kullanıcı seti oluşturulabiliyor; bölünme olmuyor; tüm modlarda çalışıyor.
- [ ] Elle giriş hâlâ çalışıyor; arama + elle girilen kelimeler aynı sette karışabiliyor.
- [ ] Mükerrer ekleme engelleniyor.

## 5. Sıralama Önerisi

1. **Oturum 1:** Faz 0 (envanter + doğrulama + ilerleme altyapısı) **+ İş B**
   (arama özelliği — mevcut 496 kelimeyle hemen çalışır, içerik beklemez).
2. **Oturum 2..N:** içerik partileri (~37 onay turu). Her parti bağımsız commit.

## 6. Açık Sorular (varsayılanla ilerlenebilir)

1. **Push sıklığı:** her parti commit'leniyor; push her partide mi, kullanıcı
   isteyince mi? Varsayılan: kullanıcı isteyince (mevcut alışkanlık).
2. **Seviye eşiği:** 1000/3000 sınırları varsayılan; istenirse CEFR (A1-C2)
   etiketlerine geçilebilir.
3. **40+ kelimelik sette Ezber modu süresi:** kelime başına ~2-3 dk → 40 kelime
   uzun oturum. Varsayılan: dokunulmaz (kullanıcı seçimi); ileride "setin ilk
   N'i ile çalış" seçeneği eklenebilir.

## Sonraki Adım

- Altyapı + arama özelliği için: `/sc:implement CONTENT-EXPANSION-SPEC.md` (Oturum 1)
- Sonrası: her oturumda "devam" diyerek sıradaki parti.
