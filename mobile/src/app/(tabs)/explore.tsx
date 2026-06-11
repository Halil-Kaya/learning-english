import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Screen } from "../../components/Screen";
import { SetCard } from "../../components/SetCard";
import { CATEGORIES, LEVELS } from "../../data/categories";
import type { Level } from "../../data/types";
import { useAllSets } from "../../data/useSets";
import { t } from "../../i18n";
import { useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { colors, spacing } from "../../theme";

export default function Explore() {
  const router = useRouter();
  const pair = useSettings((s) => s.languagePair);
  const allSets = useAllSets();
  const studyIds = useLibrary((s) => s.studyList[pair]) ?? [];
  const addToList = useLibrary((s) => s.addToStudyList);
  const removeFromList = useLibrary((s) => s.removeFromStudyList);

  const [level, setLevel] = useState<Level | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  // Yalnızca içinde set bulunan kategorileri göster.
  const presentCategories = useMemo(() => {
    const keys = new Set(allSets.map((s) => s.category));
    return CATEGORIES.filter((c) => keys.has(c.key));
  }, [allSets]);

  const filtered = useMemo(
    () =>
      allSets.filter(
        (s) =>
          (!level || s.level === level) &&
          (!category || s.category === category)
      ),
    [allSets, level, category]
  );

  return (
    <Screen>
      <Text style={styles.title}>{t("exploreTitle")}</Text>

      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            label={t("exploreAllLevels")}
            active={!level}
            onPress={() => setLevel(null)}
          />
          {LEVELS.map((l) => (
            <Chip
              key={l.key}
              label={l.label}
              active={level === l.key}
              onPress={() => setLevel(level === l.key ? null : l.key)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            label={t("exploreAllCategories")}
            active={!category}
            onPress={() => setCategory(null)}
          />
          {presentCategories.map((c) => (
            <Chip
              key={c.key}
              label={`${c.emoji} ${c.label}`}
              active={category === c.key}
              onPress={() => setCategory(category === c.key ? null : c.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Button
            title={t("exploreCreate")}
            variant="ghost"
            onPress={() => router.push("/create-set")}
            style={styles.create}
          />
        }
        renderItem={({ item }) => {
          const inList = studyIds.includes(item.id);
          return (
            <SetCard
              set={item}
              onPress={() => router.push(`/set/${item.id}`)}
              right={
                <Button
                  title={inList ? t("exploreAdded") : t("exploreAdd")}
                  variant={inList ? "ok" : "surface"}
                  small
                  onPress={() =>
                    inList
                      ? removeFromList(pair, item.id)
                      : addToList(pair, item.id)
                  }
                />
              }
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginVertical: spacing.lg,
  },
  filters: { gap: spacing.sm },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  list: { gap: spacing.md, paddingVertical: spacing.lg },
  create: { marginBottom: spacing.xs },
});
