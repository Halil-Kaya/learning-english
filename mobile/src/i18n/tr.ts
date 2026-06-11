// ============================================================
//  Türkçe arayüz metinleri (v1 tek dil)
//  i18n altyapısı kuruldu; yeni UI dili = yeni sözlük + index'e ekle.
// ============================================================

export const tr = {
  appName: "Kelime Ezber",

  // sekmeler
  tabHome: "Hedefim",
  tabExplore: "Keşfet",
  tabHistory: "Geçmiş",
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

  // history
  historyTitle: "Çalıştıklarım",
  historyEmpty: "Henüz çalışma kaydın yok.",
  historyAgain: "Tekrar çalış",

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
  modeMemorizeDesc: "Piramit + final test",

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
  createAddWord: "+ Kelime ekle",
  createSave: "Seti kaydet",
  createSetName: "Set adı",
  createHintBraces:
    "İpucu: örnek cümlede terimi {süslü parantez} ile işaretle — boşluk doldur ve ezber modu bunu kullanır.",
  createSplitNote: "15 kelimeyi aşan listeler otomatik 15'lik setlere bölünür.",
  createNeedWords: "En az 1 kelime ekle.",
  createWordCount: "kelime eklendi",

  // memorize phases
  memDown: "1/4 · KELİMEYE BAKARAK YAZ",
  memUp: "2/4 · HAFIZADAN TAMAMLA",
  memSentence: "3/4 · CÜMLEYİ YAZ",
  memFinal: "4/4 · HİÇ BAKMADAN YAZ",
  memPyramidRestart: "✗ Yanlış harf — piramit baştan!",
  memSentenceRestart: "✗ Yanlış harf — cümle baştan",
} as const;

export type Dict = typeof tr;
