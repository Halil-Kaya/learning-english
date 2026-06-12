import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Chip";
import { Screen } from "../../components/Screen";
import { categoryEmoji, levelLabel } from "../../data/categories";
import type { WordSet } from "../../data/types";
import { useAllSets } from "../../data/useSets";
import { t } from "../../i18n";
import { masteredCount, useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { colors, levelColor, radius, spacing } from "../../theme";

export default function Learned() {
  const router = useRouter();
  const pair = useSettings((s) => s.languagePair);
  const learnedIds = useLibrary((s) => s.learnedSets[pair]) ?? [];
  const states = useLibrary((s) => s.wordStates[pair]);
  const allSets = useAllSets();

  // işaretlenme sırasıyla (en yeni üstte)
  const sets = useMemo(() => {
    const byId = new Map(allSets.map((s) => [s.id, s]));
    return [...learnedIds]
      .reverse()
      .map((id) => byId.get(id))
      .filter(Boolean) as WordSet[];
  }, [learnedIds, allSets]);

  const askSelfTest = () => {
    Alert.alert(t("selfTestChoiceTitle"), t("selfTestChoiceMsg"), [
      { text: t("selfTestCancel"), style: "cancel" },
      {
        text: t("selfTestQuick"),
        onPress: () => router.push("/self-test?size=20"),
      },
      {
        text: t("selfTestFull"),
        onPress: () => router.push("/self-test?size=all"),
      },
    ]);
  };

  if (sets.length === 0) {
    return (
      <Screen>
        <Text style={styles.title}>{t("learnedTitle")}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyBody}>{t("learnedEmpty")}</Text>
          <Button
            title={t("learnedGoExplore")}
            variant="primary"
            onPress={() => router.push("/explore")}
            style={styles.emptyBtn}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>{t("learnedTitle")}</Text>
      <FlatList
        data={sets}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Button title={t("selfTest")} variant="primary" onPress={askSelfTest} />
            <Text style={styles.count}>
              {sets.length} {t("learnedCount")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Row
            set={item}
            mastered={masteredCount(states, item.entries.map((e) => e.id))}
            onPress={() => router.push(`/set/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}

function Row({
  set,
  mastered,
  onPress,
}: {
  set: WordSet;
  mastered: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={styles.rowEmoji}>{categoryEmoji(set.category)}</Text>
      <View style={styles.flex}>
        <Text style={styles.rowName}>{set.name}</Text>
        <View style={styles.rowMeta}>
          <Badge label={levelLabel(set.level)} color={levelColor[set.level]} />
          <Text style={styles.rowSub}>
            {set.entries.length} {t("setWords")}
            {mastered > 0 ? ` · ${mastered} ezber` : ""}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginVertical: spacing.lg,
  },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  count: { color: colors.muted, fontSize: 13, textAlign: "center" },
  list: { paddingBottom: spacing.xl, gap: spacing.sm },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.85, borderColor: colors.accent },
  rowEmoji: { fontSize: 26 },
  rowName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  rowSub: { color: colors.muted, fontSize: 12 },
  chevron: { color: colors.muted, fontSize: 24, fontWeight: "300" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyEmoji: { fontSize: 52 },
  emptyBody: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  emptyBtn: { marginTop: spacing.sm, minWidth: 180 },
});
