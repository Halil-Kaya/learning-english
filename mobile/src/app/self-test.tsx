import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { StatBar } from "../components/StatBar";
import { SwipeCard } from "../components/SwipeCard";
import type { Entry } from "../data/types";
import { useAllSets } from "../data/useSets";
import { shuffle } from "../engine";
import { buildNotifyContext, refreshNotifications } from "../engine/notify";
import { makeSpeak } from "../engine/speak";
import { t } from "../i18n";
import { useLibrary } from "../store/library";
import { useSettings } from "../store/settings";
import { useStreak } from "../store/streak";
import { colors, radius, spacing } from "../theme";

const QUICK_SIZE = 20;

/**
 * 🃏 Kendini Dene — öğrenilen setlerin kelimelerinden Tinder benzeri
 * kaydırma turu. Sonuçta bilinmeyen kelimeler listelenir.
 * recordWord'e normal işler (çalışma sayılır); oturum geçmişi tutulmaz.
 */
export default function SelfTest() {
  const { size } = useLocalSearchParams<{ size?: string }>();
  const router = useRouter();
  const pair = useSettings((s) => s.languagePair);
  const sound = useSettings((s) => s.sound);
  const learnedIds = useLibrary((s) => s.learnedSets[pair]) ?? [];
  const recordWord = useLibrary((s) => s.recordWord);
  const tickStreak = useStreak((s) => s.tick);
  const allSets = useAllSets();

  const speak = useMemo(() => makeSpeak(pair, sound), [pair, sound]);

  // havuz: öğrenilen setlerin tüm girdileri; Hızlı'da karışık ilk 20
  const [deck, setDeck] = useState<Entry[]>(() => {
    const byId = new Map(allSets.map((s) => [s.id, s]));
    const pool = learnedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .flatMap((s) => s!.entries);
    const mixed = shuffle(pool);
    return size === "all" ? mixed : mixed.slice(0, QUICK_SIZE);
  });

  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [wrongEntries, setWrongEntries] = useState<Entry[]>([]);
  const [done, setDone] = useState(false);

  const current = deck[idx];
  const next = deck[idx + 1];

  const onResult = (knew: boolean) => {
    recordWord(pair, current.id, { correct: knew });
    if (knew) setKnow((k) => k + 1);
    else {
      setLearn((l) => l + 1);
      setWrongEntries((w) => [...w, current]);
    }
    if (idx + 1 >= deck.length) {
      tickStreak(); // tur bitti → günlük seri ilerlesin
      refreshNotifications(buildNotifyContext()); // metinleri güncelle (kapalıysa no-op)
      setDone(true);
    } else setIdx(idx + 1);
  };

  const retryWrong = () => {
    setDeck(shuffle(wrongEntries));
    setIdx(0);
    setKnow(0);
    setLearn(0);
    setWrongEntries([]);
    setDone(false);
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("selfTestChoiceTitle")}</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {deck.length === 0 || (done && wrongEntries.length === 0) ? (
        // hepsi bilindi (veya havuz boş)
        <View style={styles.center}>
          <Text style={styles.bigEmoji}>🎉</Text>
          <Text style={styles.allKnown}>{t("selfTestAllKnown")}</Text>
          <Text style={styles.sub}>
            {know} {t("statKnow").toLowerCase()}
          </Text>
          <Button
            title={t("selfTestClose")}
            variant="primary"
            onPress={() => router.back()}
            style={styles.wideBtn}
          />
        </View>
      ) : done ? (
        // sonuç: bilinmeyenler listesi
        <View style={styles.flex}>
          <Text style={styles.resultSummary}>
            {know} ✓ · {learn} ✗
          </Text>
          <Text style={styles.unknownTitle}>{t("selfTestUnknownTitle")}</Text>
          <FlatList
            data={wrongEntries}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.unknownList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.unknownRow}>
                <View style={styles.flex}>
                  <Text style={styles.unknownTerm}>{item.term}</Text>
                  <Text style={styles.unknownMeaning}>{item.meaning}</Text>
                </View>
                <Button title="🔊" variant="surface" small onPress={() => speak(item.term)} />
              </View>
            )}
          />
          <View style={styles.resultActions}>
            <Button title={t("selfTestRetryWrong")} variant="primary" onPress={retryWrong} />
            <Button title={t("selfTestClose")} variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        // kaydırma turu
        <View style={styles.flex}>
          <StatBar know={know} learn={learn} left={deck.length - idx} total={deck.length} />
          <View style={styles.deckArea}>
            {next && (
              <View style={styles.behindCard}>
                <Text style={styles.behindTerm}>{next.term}</Text>
              </View>
            )}
            <SwipeCard key={current.id} entry={current} speak={speak} onResult={onResult} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  closeText: { color: colors.text, fontSize: 16 },

  deckArea: { flex: 1, marginTop: spacing.md },
  behindCard: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    bottom: 64,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.45,
  },
  behindTerm: { color: colors.muted, fontSize: 24, fontWeight: "700" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  bigEmoji: { fontSize: 56 },
  allKnown: { color: colors.text, fontSize: 24, fontWeight: "800" },
  sub: { color: colors.muted, fontSize: 14 },
  wideBtn: { marginTop: spacing.lg, minWidth: 200 },

  resultSummary: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.md,
  },
  unknownTitle: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  unknownList: { gap: spacing.sm, paddingBottom: spacing.md },
  unknownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.35)",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  unknownTerm: { color: colors.text, fontSize: 16, fontWeight: "700" },
  unknownMeaning: { color: colors.muted, fontSize: 13, marginTop: 2 },
  resultActions: { gap: spacing.sm, paddingVertical: spacing.md },
});
