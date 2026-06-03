# 📚 Learning English — Kelime Ezberleme Uygulaması

İngilizce kelimeleri **kartlarla**, **testlerle**, **eşleştirme oyunuyla** ve
**cümle içinde boşluk doldurma** alıştırmalarıyla ezberlemen için yapılmış,
tamamen tarayıcıda çalışan (HTML/CSS/JS) bir uygulama. Sunucuya, internete,
ücretli bir servise ihtiyaç yok.

---

## 🚀 Nasıl Çalıştırılır?

Kelime verisi tarayıcı tarafından okunur. İki yol var:

### Yol 1 — Yerel sunucu (önerilen)
Terminalde proje klasörüne gir ve şunu çalıştır:

```bash
cd /Users/halilkaya/Desktop/my-work/learning-english
python3 -m http.server 8000
```

Sonra tarayıcıdan **http://localhost:8000** adresini aç. İlk set otomatik yüklenir.

### Yol 2 — Docker (nginx ile)
Docker kuruluysa proje klasöründe tek komut:

```bash
docker compose up
```

Sonra tarayıcıdan **http://localhost:8080** adresini aç. Durdurmak için
`Ctrl+C`, arka planda çalıştırmak için `docker compose up -d`.

> Klasör container'a bağlı (volume) olduğu için `words.txt` / `set-XX.txt`
> dosyalarını düzenleyip sayfayı yenilemen yeterli — yeniden build gerekmez.

### Yol 3 — Dosyayı elle yükle
`index.html` dosyasına çift tıklayıp doğrudan tarayıcıda açarsan, tarayıcı
güvenlik nedeniyle dosyaları okuyamayabilir. Bu durumda uygulamadaki
**"📂 words.txt yükle"** butonuna basıp bir `set-XX.txt` dosyasını elle seçebilirsin.

---

## 🗂️ Setler (15'lik paketler)

Kelimeler **33 sete** bölünmüştür (her set ~15 kelime). Amaç: hepsini tek
seferde değil, paket paket ezberlemek.

- Uygulamanın sağ üstündeki **açılır menüden** set seçersin (`Set 1 · 15`, `Set 2 · 15` …).
- Seçtiğin set tarayıcıda **hatırlanır** — uygulamayı tekrar açtığında kaldığın setten devam edersin.
- Her set ayrı bir dosyadır: `set-01.txt`, `set-02.txt`, … `set-33.txt`.
- `sets.json` dosyası hangi setlerin olduğunu (dosya adı, etiket, kelime sayısı) listeler.

**Yeni set eklemek için:** yeni bir `set-34.txt` oluştur ve `sets.json`'a
`{ "file": "set-34.txt", "label": "Set 34", "count": 15 }` satırını ekle.

---

## ✍️ words.txt İçin Veri Nasıl Üretilir?

Her satır **bir kelimedir**. Alanlar **dikey çizgi `|`** ile ayrılır.
Toplam **5 alan** vardır:

```
kelime | tür | türkçe anlamı | örnek cümle | cümlenin türkçesi
```

| # | Alan | Açıklama | Örnek |
|---|------|----------|-------|
| 1 | **kelime** | Ezberlenecek İngilizce kelime | `vow` |
| 2 | **tür** | Kelime türü (isim, fiil, sıfat, zarf...) | `fiil / isim` |
| 3 | **türkçe anlamı** | Virgülle birden fazla anlam yazılabilir | `yemin etmek, söz vermek` |
| 4 | **örnek cümle** | Hedef kelime **`{süslü parantez}`** içinde olmalı | `She made a {vow} to never give up.` |
| 5 | **cümlenin türkçesi** | Örnek cümlenin Türkçe karşılığı | `Asla vazgeçmemeye yemin etti.` |

### Önemli Kurallar

1. **Süslü parantez `{}` zorunlu.** Örnek cümlede ezberlenecek kelimeyi
   `{}` içine al. Uygulama "boşluk doldurma" modunda o kelimeyi cümleden
   çıkarıp `_____` boşluğu bırakır, sen elinle yazarsın.
   - ✅ `He gave a {sly} smile.`
   - ❌ `He gave a sly smile.`  (parantez yok → boşluk doldurma çalışmaz)

2. Cümledeki kelime, 1. alandaki kelimeden biraz farklı olabilir
   (çekimli hali). Sorun değil — kontrol esnek yapılmıştır.
   - `mourn` → `The whole country {mourned} the loss.` ✓

3. `#` ile başlayan satırlar **yorumdur**, yok sayılır.
   Boş satırlar da yok sayılır.

4. Bir alanı boş bırakmak istersen yine de `|` koy:
   `word | isim | anlam |  | ` (cümle yoksa o moda dahil edilmez)

### Tam Bir Satır Örneği

```
crucial | sıfat | kritik, çok önemli | Sleep is {crucial} for your health. | Uyku sağlığın için kritik öneme sahip.
```

> 💡 **İpucu:** Yeni kelime eklemek için Claude'a kelime listesini ver,
> "bunları words.txt formatında üret" de. Bu README'deki formata göre üretir.

---

## 🎮 Modlar / Özellikler

| Mod | Ne yapar? |
|-----|-----------|
| 🃏 **Kartlar** | Kelimeyi gör, çevir, anlamı + örnek cümleyi gör. "Biliyorum / Öğreniyorum" işaretle. |
| 🧠 **Test** | Kelime gösterilir, karıştırılmış 4 şık arasından doğru anlamı seçersin. |
| 🔗 **Eşleştirme** | Quizlet tarzı hafıza oyunu: kelimeleri anlamlarıyla eşleştir, süreyle yarış. |
| ✏️ **Boşluk Doldur** | Örnek cümlede boşluk + Türkçesi gösterilir, doğru kelimeyi elinle yazarsın. |

### Ekstra Özellikler
- 🔀 Kartlar her turda **karıştırılır** (spaced practice mantığı).
- 📊 İlerleme çubuğu + doğru/yanlış sayacı.
- 🔁 **Sadece yanlışları tekrar et** — bilemediğin kelimelere odaklan.
- 🔊 Telaffuz: kelimeye tıklayınca tarayıcı sesli okur (Web Speech API).
- 🗂️ Seçtiğin **set tarayıcıda hatırlanır** (yenileyince kaldığın setten açılır).

---

## 📁 Proje Yapısı

```
learning-english/
├── index.html      # Arayüz
├── style.css       # Tasarım
├── script.js       # Uygulama mantığı
├── sets.json       # Set listesi (manifest)
├── set-01.txt      # 1. set (15 kelime)
├── set-02.txt      # 2. set …
│   …              # … set-33.txt'e kadar
├── words.txt       # Eski tek dosya (yedek — sets.json yoksa kullanılır)
├── Dockerfile          # nginx tabanlı imaj
├── docker-compose.yml  # `docker compose up` ile çalıştırma
├── nginx.conf          # nginx ayarı (cache kapalı, utf-8)
└── README.md       # Bu dosya
```

---

## 🧠 Ezberleme İpuçları (bonus)

1. **Aktif hatırlama:** Önce kelimeyi gör, anlamı tahmin et, *sonra* çevir.
   Pasif okumaktan çok daha etkilidir.
2. **Aralıklı tekrar:** Bilemediklerini "Sadece yanlışları tekrar et" ile
   günde 2-3 kez gözden geçir.
3. **Cümle içinde öğren:** Tek kelime değil, cümleyle ezberle. "Boşluk Doldur"
   modu tam bunun için.
4. **Üreterek öğren:** Eşleştirme ve yazma modları, beynini bilgiyi *üretmeye*
   zorlar — en kalıcı yöntem budur.
5. **Küçük paketler:** Bir oturuşta 15-20 kelime yeter. Fazlası yorar.

İyi çalışmalar! 🎯
