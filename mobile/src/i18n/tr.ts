// ============================================================
//  Türkçe arayüz metinleri (v1 tek dil)
//  i18n altyapısı kuruldu; yeni UI dili = yeni sözlük + index'e ekle.
// ============================================================

export const tr = {
  appName: "Kelime Ezber",

  // sekmeler
  tabHome: "Hedefim",
  tabExplore: "Keşfet",
  tabLearned: "Öğrendiklerim",
  tabSettings: "Ayarlar",

  // onboarding
  onboardingTitle: "Hangi dili öğrenmek istiyorsun?",
  onboardingSubtitle:
    "Seçimini sonra Ayarlar'dan değiştirebilirsin. Tüm çalışman bu dile göre olur.",
  onboardingContinue: "Devam et",

  // home
  homeTitle: "Çalışma Hedefim",
  homeEmptyTitle: "Hedef listen boş",
  homeEmptyBody:
    "Keşfet'ten kelime setleri ekle, burada çalışmaya hazır olsunlar.",
  homeGoExplore: "Keşfet'e git",
  homeStudy: "Çalış",
  homeMastered: "ezberlendi",

  // explore
  exploreTitle: "Keşfet",
  exploreAllLevels: "Tüm seviyeler",
  exploreAllCategories: "Tümü",
  exploreAdd: "Listeye ekle",
  exploreAdded: "Listende ✓",
  exploreStudyNow: "Hemen çalış",
  exploreCreate: "+ Kendi setini oluştur",

  // set detail
  setWords: "kelime",
  setRemove: "Listeden çıkar",
  setAdd: "Hedef listeme ekle",
  setStart: "Çalışmaya başla",
  setMarkLearned: "🎓 Öğrendim olarak işaretle",
  setUnmarkLearned: "🎓 Öğrenilmiş ✓ — işareti kaldır",

  // öğrendiklerim
  learnedTitle: "Öğrendiklerim",
  learnedEmpty:
    "Henüz öğrenilmiş set yok.\nBir setin detayından 🎓 Öğrendim'i işaretle.",
  learnedGoExplore: "Keşfet'e git",
  learnedCount: "set öğrenildi",

  // kendini dene
  selfTest: "🃏 Kendini Dene",
  selfTestChoiceTitle: "Kendini Dene",
  selfTestChoiceMsg: "Kaç kelimeyle denemek istersin?",
  selfTestQuick: "Hızlı (20 kelime)",
  selfTestFull: "Tam tarama (hepsi)",
  selfTestCancel: "Vazgeç",
  selfTestSwipeHint: "sağa kaydır = biliyorum · sola = bilmiyorum · dokun = anlam",
  selfTestKnow: "✓ Biliyorum",
  selfTestDontKnow: "✗ Bilmiyorum",
  selfTestAllKnown: "Hepsini bildin! 🎉",
  selfTestUnknownTitle: "Bilmediklerin",
  selfTestRetryWrong: "Bilmediklerimi tekrar dene",
  selfTestClose: "Kapat",

  // settings
  settingsTitle: "Ayarlar",
  settingsLanguage: "Öğrenme dili",
  settingsSound: "Sesli okuma",
  settingsAbout: "Hakkında",
  settingsReset: "Verileri sıfırla",
  settingsResetConfirm:
    "Tüm ilerleme, listeler ve kullanıcı setlerin silinecek. Emin misin?",
  settingsVersion: "Sürüm",

  // mode picker
  pickMode: "Çalışma modu seç",
  modeCards: "Kartlar",
  modeTest: "Test",
  modeMatch: "Eşleştirme",
  modeFill: "Boşluk Doldur",
  modeWrite: "Yazma",
  modeMemorize: "Ezber",
  modeCardsDesc: "Çevir, anlamı gör",
  modeTestDesc: "Çoktan seçmeli",
  modeMatchDesc: "Eşleştirme oyunu",
  modeFillDesc: "Cümledeki boşluk",
  modeWriteDesc: "Harf harf yaz",
  modeMemorizeDesc: "10x yaz + final test",
  pickerStudyHeader: "ÇALIŞMA MODLARI",
  pickerGamesHeader: "OYUNLAR",
  modeAnagram: "Kelime Kur",
  modeAnagramDesc: "Harfleri sıraya diz",
  modeRace: "Zaman Yarışı",
  modeRaceDesc: "Süre dolmadan seç",
  modeHangman: "Adam Asmaca",
  modeHangmanDesc: "Harf tahmin et",
  modeHunt: "Kelime Avı",
  modeHuntDesc: "Izgarada gizli kelimeler",

  // games common
  gameScore: "SKOR",
  gameCombo: "SERİ",
  gameUndo: "← Geri",
  gameClear: "Temizle",
  gameNewRecord: "🏆 Yeni Rekor!",
  gameOver: "Oyun Bitti",
  gameHighScore: "Rekor",
  gameRacePrompt: "DOĞRU KELİMEYİ SEÇ",
  gameTimeUp: "⏱ Süre doldu!",
  gameLivesLeft: "HAK",
  gameHangmanLost: "✗ Asıldın! Kelime:",
  gameHuntRound: "TUR",
  gameHuntTargets: "BULUNACAK KELİMELER",

  // study common
  iKnow: "Biliyorum",
  iLearn: "Öğreniyorum",
  next: "Sonraki →",
  check: "Kontrol Et",
  listen: "🔊 Dinle",
  reveal: "👁 Göster",
  skip: "Atla →",
  prev: "←",
  hint: "İpucu",
  correct: "✓ Doğru!",
  wrong: "✗ Yanlış",
  statKnow: "Biliyorum",
  statLeft: "Kalan",
  statLearn: "Öğreniyorum",
  statScore: "Başarı",

  // result
  resultDone: "Tamamlandı!",
  resultPerfect: "Mükemmel!",
  resultGood: "İyi iş!",
  resultKeepGoing: "Devam et!",
  resultRestart: "🔄 Tümünü Tekrar",
  resultWrongOnly: "📚 Sadece Yanlışları",
  resultBackToSet: "Sete dön",

  // create set
  createTitle: "Set Oluştur",
  createTerm: "Terim (İngilizce)",
  createType: "Tür (isim/fiil/…)",
  createMeaning: "Anlam (Türkçe)",
  createExampleTarget: "Örnek cümle (İngilizce)",
  createExampleSource: "Çeviri (Türkçe)",
  createAddWord: "+ Elle ekle",
  createSave: "Seti kaydet",
  createSetName: "Set adı",
  createHintBraces:
    "İpucu: örnek cümlede terimi {süslü parantez} ile işaretle — boşluk doldur ve ezber modu bunu kullanır.",
  createNeedWords: "En az 1 kelime ekle.",
  createWordCount: "kelime eklendi",
  createSearchLabel: "Katalogda Ara",
  createSearchPlaceholder: "İngilizce veya Türkçe ile ara…",
  createNoResults: "Sonuç bulunamadı",
  createManualLabel: "Elle Giriş",

  // memorize phases
  memWrite: "1/3 · KELİMEYE BAKARAK 10 KEZ YAZ",
  memSentence: "2/3 · CÜMLELERİ DOLDUR",
  memFinal: "3/3 · HİÇ BAKMADAN YAZ",
  memRowRestart: "✗ Yanlış harf — bu satır baştan",
  memSentenceRestart: "✗ Yanlış harf — cümle baştan",
} as const;

export type Dict = typeof tr;
