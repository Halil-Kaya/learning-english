import Constants from "expo-constants";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { isPairAvailable, PAIRS } from "../../data/languages";
import { t } from "../../i18n";
import { useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { colors, radius, spacing } from "../../theme";

export default function Settings() {
  const { languagePair, sound, setLanguagePair, setSound } = useSettings();
  const resetLibrary = useLibrary((s) => s.reset);

  const confirmReset = () => {
    Alert.alert(t("settingsReset"), t("settingsResetConfirm"), [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sıfırla",
        style: "destructive",
        onPress: () => resetLibrary(),
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>{t("settingsTitle")}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={styles.section}>{t("settingsLanguage")}</Text>
        <View style={styles.card}>
          {PAIRS.map((p) => {
            const available = isPairAvailable(p.pair);
            const active = languagePair === p.pair;
            return (
              <View
                key={p.pair}
                style={[styles.langRow, !available && styles.disabled]}
                onTouchEnd={() => available && setLanguagePair(p.pair)}
              >
                <Text style={styles.flag}>{p.learnFlag}</Text>
                <View style={styles.flex}>
                  <Text style={styles.langName}>{p.learn}</Text>
                  <Text style={styles.langVia}>{p.via} açıklamalı</Text>
                </View>
                {!available && <Text style={styles.soon}>yakında</Text>}
                {active && <Text style={styles.check}>✓</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.section}>{t("settingsSound")}</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t("settingsSound")}</Text>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.section}>{t("settingsAbout")}</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t("settingsVersion")}</Text>
            <Text style={styles.value}>
              {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.danger]} onTouchEnd={confirmReset}>
          <Text style={styles.dangerText}>{t("settingsReset")}</Text>
        </View>
      </ScrollView>
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
  body: { gap: spacing.sm, paddingBottom: spacing.xl },
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  disabled: { opacity: 0.45 },
  flag: { fontSize: 22 },
  flex: { flex: 1 },
  langName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  langVia: { color: colors.muted, fontSize: 12, marginTop: 1 },
  soon: { color: colors.muted, fontSize: 12, fontStyle: "italic" },
  check: { color: colors.accent, fontSize: 18, fontWeight: "800" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  toggleLabel: { color: colors.text, fontSize: 15 },
  value: { color: colors.muted, fontSize: 15 },
  danger: { marginTop: spacing.xl, padding: spacing.lg, alignItems: "center" },
  dangerText: { color: colors.bad, fontSize: 15, fontWeight: "700" },
});
