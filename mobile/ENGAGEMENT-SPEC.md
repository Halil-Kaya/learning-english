# Bildirim + Daily Streak — Gereksinim Spec'i

> Karar tarihi: 2026-06-12. Kullanıcı onayları: streak **en az 1 tur bitirince**
> ilerler; bildirim saatini **onboarding'de kullanıcı seçer** (+ Ayarlar'dan
> değişir); kapsam **streak + milestone kutlamaları + haftalık hedef**;
> seri koruması YOK (gün kaçırılınca sıfırlanır). Hedef: markete çıkacak
> sürümde kullanıcıyı geri getiren / tutan oyunlaştırma.

## Amaç

1. **Günlük yerel bildirim**: kullanıcının seçtiği saatte hatırlatma.
   İçerik duruma göre: hedef listesinde set varsa *"… seti öğrenilmeyi
   bekliyor"*, yoksa keşfe çağıran mesaj; streak varsa *"🔥 N günlük serin
   bozulmasın"*. Mesajlar havuzdan döner (her gün aynı metin gelmez).
2. **Daily streak**: arka arkaya kaç gün çalışıldığı (🔥 seri), en iyi seri,
   haftalık hedef (haftada N gün) ve dönüm noktası kutlamaları.

## Teknik Fizibilite (doğrulandı)

- `expo-notifications` **yerel zamanlanmış bildirimleri** Expo Go'da destekler
  (SDK 53+'ta kaldırılan yalnız *uzak push*'tır). Sunucu YOK, push YOK —
  her şey cihazda planlanan yerel bildirim. Kurulum: `npx expo install
  expo-notifications` (sürüm hizası otomatik).
- Android 13+ çalışma zamanı izni (`POST_NOTIFICATIONS`) ve bildirim kanalı
  (`setNotificationChannelAsync`) gerekir — kütüphane API'siyle çözülür.
- Saat seçici için YENİ NATİVE MODÜL EKLENMEZ: chip tabanlı özel seçici
  (saat 00–23 + dakika 00/15/30/45), varsayılan 20:00.

## Fonksiyonel Gereksinimler

### 1. Streak çekirdeği
- **Gün sayılır** ⇔ herhangi bir çalışma modu, oyun veya Kendini Dene turu
  **bitirilirse** (sonuç ekranına ulaşmak yeter; doğruluk oranı önemsiz).
- Streak **globaldir** (dil çiftinden bağımsız — uygulama kullanım serisi;
  dil değiştirmek seriyi bozmaz/ayırmaz). `ByPair` DEĞİL — bilinçli karar.
- Gün anahtarı **cihaz yerel saatiyle** `YYYY-MM-DD`.
- Kurallar (saf fonksiyon `src/engine/streak.ts`):
  - bugün zaten sayıldıysa → değişmez,
  - son aktif gün = dün → `current + 1`,
  - aksi halde → `1` (yeniden başlar). Koruma/dondurma YOK.
  - Gösterim: son aktif gün bugün veya dün değilse seri **0 görünür**.
- Store `src/store/streak.ts` (zustand + persist, `name: "ke-streak"`):
  `current`, `best`, `lastDay`, `weekDays: string[]` (bu haftanın aktif gün
  anahtarları, hafta Pazartesi başlar), `weeklyGoal` (varsayılan 5, 3–7),
  `pendingMilestone: number | null`, eylemler: `tick()`, `setWeeklyGoal`,
  `clearMilestone`, `reset`.
- `tick()` çağrı yerleri: `study/[id].tsx` `onFinish` (oyun dahil) ve
  `self-test.tsx` tur bitişi. Başka yer YOK.

### 2. Ana ekran streak başlığı
- Hedefim sekmesinin üstüne **StreakHeader** kartı:
  - sol: büyük **🔥 N** (bugün sayılmadıysa soluk/gri alev) + "en iyi: M",
  - sağ: **haftalık hedef halkası/sayacı** ("Bu hafta 3/5 gün") +
    Pzt–Paz 7 nokta (aktif günler dolu, bugün vurgulu).
- Karta dokununca küçük bir ayrıntı görünümü ŞART DEĞİL (v1: statik kart).

### 3. Milestone kutlamaları
- Eşikler: **3, 7, 14, 30, 50, 100, 365** gün.
- `tick()` yeni seride bir eşiği AŞARSA `pendingMilestone` yazılır; sonuç
  ekranından sonra (veya ana ekrana dönüşte) **tam ekran kutlama modalı**:
  büyük 🔥 + "N gün üst üste!" + devam butonu. Kapatınca `clearMilestone`.
- Aynı eşik bir kez kutlanır (seri sıfırlanıp yeniden ulaşılırsa yine kutlanır
  — eşik geçişi serinin kendi ilerleyişine bağlıdır, geçmiş kaydı tutulmaz).

### 4. Haftalık hedef
- Varsayılan **5 gün/hafta**; Ayarlar'dan 3–7 arası seçilir (chip dizisi).
- Hafta Pazartesi sıfırlanır (`weekDays` yeni haftada temizlenir — tembel
  temizlik: okuma/tick anında hafta anahtarı karşılaştırılır).
- Hedefe ulaşınca StreakHeader'da ✅ vurgusu (ayrı modal YOK — kutlama
  enflasyonundan kaçın).

### 5. Bildirimler
- Modül: `src/engine/notify.ts` — izin isteme, Android kanalı, planlama.
- **Planlama stratejisi**: tek "daily repeating" yerine **önümüzdeki 7 gün
  için 7 ayrı tarihli bildirim** planlanır (her birinin metni farklı
  olabilir). `refreshNotifications()` önce tümünü iptal eder, sonra mevcut
  duruma göre yeniden kurar. Çağrı yerleri: uygulama açılışı (kök layout),
  bildirim ayarı değişimi, hedef listesi/streak'i değiştiren tur sonları
  (ucuz olduğundan debounce gerekmez).
- **Mesaj seçimi** (planlama anındaki duruma göre, havuzdan sırayla/karışık):
  1. Hedef listesinde set VARSA → set adıyla: `"{setName}" seti öğrenilmeyi
     bekliyor 📚`, `Bugün 15 kelime = 5 dakika. "{setName}" hazır ✨` …
  2. Hedef boş ama streak ≥ 2 → `🔥 {n} günlük serin bozulmasın!`,
     `Seri devam etsin — bugünün turunu yap 🔥` …
  3. İkisi de yoksa → `Yeni kelimeler seni bekliyor — bir set keşfet 🧭`,
     `Günde 5 dakika yeter. Hadi bir set seç 📖` …
  - Havuzlar `src/i18n/tr.ts`'te dizi olarak (`notifyMsgsSet`,
    `notifyMsgsStreak`, `notifyMsgsExplore`) — dil bağımsızlık korunur.
- **Ayarlar** yeni bölüm "Bildirimler": aç/kapa anahtarı + saat satırı
  (dokununca chip'li saat seçici). Açarken izin istenir; reddedilirse anahtar
  kapalı kalır + "Sistem ayarlarından izin ver" ipucu.
- Store: `settings.ts`'e `notifyEnabled: boolean`, `notifyHour: number`,
  `notifyMinute: number` (varsayılan 20:00, `notifyEnabled: false` başlar;
  onboarding adımı açar).
- Bildirime dokununca uygulama açılır (ek deep-link YOK, v1).

### 6. Onboarding adımı
- Dil seçiminden sonra **2. adım**: "Sana ne zaman hatırlatalım?" — chip'li
  saat seçici (varsayılan 20:00) + **"Hatırlat"** (izin ister, planlar) ve
  **"Şimdi değil"** (atlanır, `notifyEnabled=false`) butonları.
- Mevcut (zaten onboarded) kullanıcılar adımı görmez → Hedefim sekmesinde
  **tek seferlik** "🔔 Günlük hatırlatma kur" kartı (kapatılabilir;
  `notifyPromptDismissed` bayrağı settings'te). Karta dokununca Ayarlar'daki
  akışla aynı izin+saat akışı.

## Teknik Notlar (mimari kurallara uyum)

- Saf mantık `src/engine/streak.ts` + `src/engine/notify.ts` (planlama
  hesabı saf, yan etkiler ince sarmalayıcıda); UI `src/components/`.
- Dil bağımsız: bildirim metinleri i18n'den; set adı veriden gelir. Streak
  global (bilinçli istisna — kullanım serisi, öğrenme verisi değil).
- `Date` kullanımı yalnız store/engine çağrı anında (`dayKey(new Date())`).
- Yeni bağımlılık YALNIZ `expo-notifications` (`npx expo install` ile).
- Geliştirme notu: Expo Go'da yerel bildirim test edilebilir; saat tetiklemesi
  için cihaz saati beklemek yerine kısa `timeInterval` trigger'lı geçici test
  fonksiyonu kullanılabilir (commit'lenmez).

## Uygulama Partileri ("devam et" akışı)

- [ ] **Parti A — Streak çekirdeği + ana ekran**: `engine/streak.ts`
      (saf, birim mantık), `store/streak.ts`, `tick()` bağlama (study +
      self-test), Hedefim'de StreakHeader (🔥 + hafta noktaları + haftalık
      hedef sayacı).
- [ ] **Parti B — Milestone + haftalık hedef ayarı**: kutlama
      modalı (eşik geçişinde), Ayarlar'da haftalık hedef chip'leri,
      hafta devri (Pazartesi) tembel temizliği.
- [ ] **Parti C — Bildirim altyapısı + Ayarlar**:
      `expo-notifications` kurulumu, `engine/notify.ts` (izin, kanal,
      7 günlük planlama, mesaj havuzları), Ayarlar "Bildirimler" bölümü
      (aç/kapa + chip'li saat seçici), kök layout'ta refresh.
- [ ] **Parti D — Onboarding adımı + mevcut kullanıcı kartı**:
      onboarding'e saat adımı, Hedefim'de tek seferlik hatırlatma kurma
      kartı, `notifyPromptDismissed`.

Her parti sonunda: `npx tsc --noEmit` → commit → push.

## Açık Kararlar (varsayılanla ilerlenir)

1. Streak global (dil çifti başına değil) — istenirse `ByPair`'e taşınır.
2. Haftalık hedef varsayılanı 5 gün — Ayarlar'dan 3–7.
3. Bildirim varsayılan saati 20:00; dakika adımı 15.
4. Milestone eşikleri 3/7/14/30/50/100/365 — değiştirilebilir sabit dizi.
5. Oyun turu bitirmek de streak sayar (çalışmayla aynı) — istenirse yalnız
   çalışma modlarına daraltılır.
