# İçerik Üretim İlerlemesi

> Bu dosya oturumlar arası ilerleme takibini sağlar.
> Her parti tamamlandığında burası güncellenir.

## Durum: Faz 0 Tamamlandı

- [x] Faz 0 — Altyapı (validate-catalog.mjs, PROGRESS.md, create-set arama özelliği)
- [x] Parti 1 — Kelimeler 1–150 (sıklık: Başlangıç 1–10) ✓ 2026-06-11
- [x] Parti 2 — Kelimeler 151–300 (sıklık: Başlangıç 11–20) ✓ 2026-06-11
- [x] Parti 3 — Kelimeler 301–450 (sıklık: Başlangıç 21–30) ✓ 2026-06-12
- [x] Parti 4 — Kelimeler 451–600 (sıklık: Başlangıç 31–40) ✓ 2026-06-12
- [x] Parti 5 — Kelimeler 601–750 (sıklık: Başlangıç 41–50) ✓ 2026-06-12
- [x] Parti 6 — Kelimeler 751–900 (sıklık: Başlangıç 51–60) ✓ 2026-06-12
- [x] Parti 7 — Kelimeler 901–1000 + Orta başlangıcı 1001–1050 (sıklık: Başlangıç 61–70) ✓ 2026-06-12
- [x] Parti 8 — Kelimeler 1051–1200 (sıklık: Başlangıç 71–80) ✓ 2026-06-12
- [x] Parti 9 — Kelimeler 1201–1350 (Orta 81–90) ✓ 2026-06-12
- [x] Parti 10 — Kelimeler 1351–1500 (Orta 91–100) ✓ 2026-06-12
- [x] Parti 11 — Kelimeler 1501–1650 (Orta 101–110) ✓ 2026-06-12
- [ ] Parti 12 — Kelimeler 1651–1800
- [ ] Parti 13 — Kelimeler 1801–1950
- [ ] Parti 14 — Kelimeler 1951–2100
- [ ] Parti 15 — Kelimeler 2101–2250
- [ ] Parti 16 — Kelimeler 2251–2400
- [ ] Parti 17 — Kelimeler 2401–2550
- [ ] Parti 18 — Kelimeler 2551–2700
- [ ] Parti 19 — Kelimeler 2701–2850
- [ ] Parti 20 — Kelimeler 2851–3000
- [ ] Parti 21 — Kelimeler 3001–3150 (İleri başlangıcı)
- [ ] Parti 22 — Kelimeler 3151–3300
- [ ] Parti 23 — Kelimeler 3301–3450
- [ ] Parti 24 — Kelimeler 3451–3600
- [ ] Parti 25 — Kelimeler 3601–3750
- [ ] Parti 26 — Kelimeler 3751–3900
- [ ] Parti 27 — Kelimeler 3901–4050
- [ ] Parti 28 — Kelimeler 4051–4200
- [ ] Parti 29 — Kelimeler 4201–4350
- [ ] Parti 30 — Kelimeler 4351–4500
- [ ] Parti 31 — Kelimeler 4501–4650
- [ ] Parti 32 — Kelimeler 4651–4800
- [ ] Parti 33 — Kelimeler 4801–5000
- [ ] Parti 34 — Öbekler 1–150 (phrasal verbs, idioms grubu 1)
- [ ] Parti 35 — Öbekler 151–300
- [ ] Parti 36 — Öbekler 301–450
- [ ] Parti 37 — Öbekler 451–500 (son parti)

## Mevcut Katalog Durumu

- Mevcut set sayısı: 143 (Set 1–33 orijinal + Başlangıç 1–80 Parti 1–8 + Orta 81–110 Parti 9–11)
- Mevcut girdi sayısı: 2146
- Son güncelleme: 2026-06-12

## Sıradaki Adım

**Parti 12** — Orta kelimeler, sıklık 1651–1800 (Orta 111–120) — KULLANICIDAN ONAY BEKLENIYOR

"Devam et" dediğinde buradan devam edilecek.

## Kurallar (Hatırlatma)

- Her parti ~150 kelime, 10 set × 15 kelime
- Set isimleri: "Başlangıç 4", "Başlangıç 5", ... (devam eden sayı)
- Seviye: 1–1000 → beginner, 1001–3000 → intermediate, 3001–5000 → advanced
- Her girdide 10 özgün örnek cümle (EN {terim} + TR çevirisi)
- Mevcut 496 girdinin termlerini TEKRARLAMA
- Parti bittikten sonra `node scripts/validate-catalog.mjs` çalıştır
- Commit mesajı: "Parti N: [sıklık aralığı] — X set, Y kelime eklendi"
