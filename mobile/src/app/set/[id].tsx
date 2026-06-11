import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Chip";
import { Screen } from "../../components/Screen";
import { categoryEmoji, categoryLabel, levelLabel } from "../../data/categories";
import type { Entry } from "../../data/types";
import { useSet } from "../../data/useSets";
import { t } from "../../i18n";
import { masteredCount, useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { colors, levelColor, radius, spacing } from "../../theme";

export default function SetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const set = useSet(id);
  const pair = useSettings((s) => s.languagePair);
  const studyIds = useLibrary((s) => s.studyList[pair]) ?? [];
  const states = useLibrary((s) => s.wordStates[pair]);
  const addToList = useLibrary((s) => s.addToStudyList);
  const removeFromList = useLibrary((s) => s.removeFromStudyList);

  if (!set) {
    return (
      <Screen>
        <Text style={styles.missing}>Set bulunamadı.</Text>
        <Button title="← Geri" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const inList = studyIds.includes(set.id);
  const mastered = masteredCount(states, set.entries.map((e) => e.id));

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <FlatList
        data={set.entries}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Button title="← Geri" variant="ghost" small onPress={() => router.back()} style={styles.back} />
            <Text style={styles.emoji}>{categoryEmoji(set.category)}</Text>
            <Text style={styles.name}>{set.name}</Text>
            <View style={styles.badges}>
              <Badge label={levelLabel(set.level)} color={levelColor[set.level]} />
              <Badge label={categoryLabel(set.category)} />
              <Badge label={`${set.entries.length} ${t("setWords")}`} />
            </View>
            {mastered > 0 && (
              <Text style={styles.mastered}>{mastered}/{set.entries.length} ezberlendi</Text>
            )}
            <View style={styles.actions}>
              <Button
                title={t("setStart")}
                variant="primary"
                onPress={() => router.push(`/study/${set.id}`)}
                style={styles.flex}
              />
              <Button
                title={inList ? t("setRemove") : t("setAdd")}
                variant={inList ? "bad" : "surface"}
                onPress={() =>
                  inList ? removeFromList(pair, set.id) : addToList(pair, set.id)
                }
                style={styles.flex}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <EntryRow entry={item} status={states?.[item.id]?.status} />}
      />
    </Screen>
  );
}

function EntryRow({ entry, status }: { entry: Entry; status?: string }) {
  const dot =
    status === "mastered" ? colors.ok : status === "learning" ? colors.accent2 : colors.border;
  return (
    <View style={styles.entry}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={styles.flex}>
        <Text style={styles.term}>
          {entry.term}
          {entry.kind === "phrase" && <Text style={styles.phraseTag}>  öbek</Text>}
        </Text>
        <Text style={styles.meaning}>{entry.meaning}</Text>
      </View>
      <Text style={styles.type}>{entry.type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  header: { gap: spacing.sm, paddingTop: spacing.md, marginBottom: spacing.md },
  back: { alignSelf: "flex-start", paddingHorizontal: 0, borderColor: "transparent" },
  emoji: { fontSize: 40, marginTop: spacing.sm },
  name: { color: colors.text, fontSize: 26, fontWeight: "800" },
  badges: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", marginTop: spacing.xs },
  mastered: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  flex: { flex: 1 },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  term: { color: colors.text, fontSize: 16, fontWeight: "700" },
  phraseTag: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  meaning: { color: colors.muted, fontSize: 13, marginTop: 1 },
  type: { color: colors.accent, fontSize: 12, fontStyle: "italic" },
  missing: { color: colors.text, fontSize: 16, marginVertical: spacing.xl },
});
