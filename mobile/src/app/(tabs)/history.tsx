import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import type { SessionRecord, StudyMode } from "../../data/types";
import { useAllSets } from "../../data/useSets";
import { t } from "../../i18n";
import { useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";

const MODE_LABEL: Record<StudyMode, string> = {
  cards: "🃏 Kartlar",
  test: "🧠 Test",
  match: "🔗 Eşleştirme",
  fill: "✏️ Boşluk Doldur",
  write: "⌨️ Yazma",
  memorize: "🧗 Ezber",
  anagram: "🧩 Kelime Kur", // oyunlar geçmişe yazılmaz; tip bütünlüğü için
  race: "⏱ Zaman Yarışı",
  hangman: "🪢 Adam Asmaca",
  hunt: "🗺 Kelime Avı",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const router = useRouter();
  const pair = useSettings((s) => s.languagePair);
  const history = useLibrary((s) => s.history[pair]) ?? [];
  const allSets = useAllSets();

  const nameById = useMemo(
    () => new Map(allSets.map((s) => [s.id, s.name])),
    [allSets]
  );

  if (history.length === 0) {
    return (
      <Screen>
        <Text style={styles.title}>{t("historyTitle")}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🕘</Text>
          <Text style={styles.emptyBody}>{t("historyEmpty")}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{t("historyTitle")}</Text>
      <FlatList
        data={history}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Row item={item} setName={nameById.get(item.setId)} onPress={() => router.push(`/set/${item.setId}`)} />
        )}
      />
    </Screen>
  );
}

function Row({
  item,
  setName,
  onPress,
}: {
  item: SessionRecord;
  setName?: string;
  onPress: () => void;
}) {
  const done = item.know + item.learn;
  const score = done ? Math.round((item.know / done) * 100) : 0;
  return (
    <View style={styles.row} onTouchEnd={onPress}>
      <View style={styles.flex}>
        <Text style={styles.setName}>{setName ?? "—"}</Text>
        <Text style={styles.meta}>
          {MODE_LABEL[item.mode]} · {formatDate(item.date)}
        </Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={[styles.score, { color: score >= 80 ? colors.ok : score >= 50 ? colors.accent2 : colors.bad }]}>
          {score}%
        </Text>
        <Text style={styles.scoreSub}>
          {item.know}✓ {item.learn}✗
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginVertical: spacing.lg,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  flex: { flex: 1 },
  setName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  scoreBox: { alignItems: "flex-end" },
  score: { fontSize: 18, fontWeight: "800" },
  scoreSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyBody: { color: colors.muted, fontSize: 14 },
});
