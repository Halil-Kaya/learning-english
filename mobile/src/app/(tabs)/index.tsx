import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { HomeNotifyCard } from "../../components/HomeNotifyCard";
import { SetCard } from "../../components/SetCard";
import { StreakHeader } from "../../components/StreakHeader";
import { useStudyListSets } from "../../data/useSets";
import { t } from "../../i18n";
import { colors, spacing } from "../../theme";

export default function Home() {
  const router = useRouter();
  const sets = useStudyListSets();

  return (
    <Screen>
      <Text style={styles.title}>{t("homeTitle")}</Text>
      <StreakHeader />
      <HomeNotifyCard />

      {sets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>{t("homeEmptyTitle")}</Text>
          <Text style={styles.emptyBody}>{t("homeEmptyBody")}</Text>
          <Button
            title={t("homeGoExplore")}
            variant="primary"
            onPress={() => router.push("/(tabs)/explore")}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          data={sets}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SetCard
              set={item}
              onPress={() => router.push(`/set/${item.id}`)}
              right={
                <Button
                  title={t("homeStudy")}
                  variant="primary"
                  small
                  onPress={() => router.push(`/study/${item.id}`)}
                />
              }
            />
          )}
        />
      )}
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
  list: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  emptyBtn: { marginTop: spacing.md },
});
