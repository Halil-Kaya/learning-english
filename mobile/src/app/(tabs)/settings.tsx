import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { TimePickerModal } from "../../components/TimePickerModal";
import { isPairAvailable, PAIRS } from "../../data/languages";
import {
  buildNotifyContext,
  disableNotifications,
  enableNotifications,
  refreshNotifications,
} from "../../engine/notify";
import { t } from "../../i18n";
import { useGames } from "../../store/games";
import { useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { useStreak } from "../../store/streak";
import { colors, radius, spacing } from "../../theme";

const WEEKLY_GOAL_OPTIONS = [3, 4, 5, 6, 7];
const pad = (n: number) => String(n).padStart(2, "0");

export default function Settings() {
  const { languagePair, sound, setLanguagePair, setSound } = useSettings();
  const notifyEnabled = useSettings((s) => s.notifyEnabled);
  const notifyHour = useSettings((s) => s.notifyHour);
  const notifyMinute = useSettings((s) => s.notifyMinute);
  const setNotify = useSettings((s) => s.setNotify);
  const weeklyGoal = useStreak((s) => s.weeklyGoal);
  const setWeeklyGoal = useStreak((s) => s.setWeeklyGoal);
  const resetLibrary = useLibrary((s) => s.reset);
  const resetGames = useGames((s) => s.reset);
  const resetStreak = useStreak((s) => s.reset);

  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const toggleNotify = async (on: boolean) => {
    if (on) {
      const granted = await enableNotifications(buildNotifyContext());
      if (granted) setNotify({ enabled: true });
      else Alert.alert(t("settingsNotify"), t("settingsNotifyDenied"));
    } else {
      setNotify({ enabled: false });
      await disableNotifications();
    }
  };

  const onPickTime = (hour: number, minute: number) => {
    setNotify({ hour, minute });
    setTimePickerOpen(false);
    // enabled değilse refresh no-op'tur (yalnız iptal eder)
    refreshNotifications(buildNotifyContext());
  };

  const confirmReset = () => {
    Alert.alert(t("settingsReset"), t("settingsResetConfirm"), [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sıfırla",
        style: "destructive",
        onPress: () => {
          resetLibrary();
          resetGames();
          resetStreak();
        },
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

        <Text style={styles.section}>{t("settingsNotify")}</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t("settingsNotifyToggle")}</Text>
            <Switch
              value={notifyEnabled}
              onValueChange={toggleNotify}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          <Pressable
            style={[styles.toggleRow, styles.timeRow, !notifyEnabled && styles.disabled]}
            onPress={() => notifyEnabled && setTimePickerOpen(true)}
          >
            <Text style={styles.toggleLabel}>{t("settingsNotifyTime")}</Text>
            <Text style={styles.timeValue}>
              {pad(notifyHour)}:{pad(notifyMinute)}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.section}>{t("settingsWeeklyGoal")}</Text>
        <View style={[styles.card, styles.goalCard]}>
          <Text style={styles.goalHint}>{t("settingsWeeklyGoalHint")}</Text>
          <View style={styles.goalChips}>
            {WEEKLY_GOAL_OPTIONS.map((n) => {
              const active = weeklyGoal === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setWeeklyGoal(n)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.goalUnit}>{t("settingsWeeklyGoalUnit")} / hafta</Text>
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

      <TimePickerModal
        visible={timePickerOpen}
        hour={notifyHour}
        minute={notifyMinute}
        onClose={() => setTimePickerOpen(false)}
        onConfirm={onPickTime}
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
  timeRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  timeValue: { color: colors.accent, fontSize: 16, fontWeight: "700" },
  goalCard: { padding: spacing.lg, gap: spacing.md },
  goalHint: { color: colors.muted, fontSize: 13 },
  goalChips: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { color: colors.muted, fontSize: 16, fontWeight: "700" },
  chipTextActive: { color: colors.accent },
  goalUnit: { color: colors.muted, fontSize: 12, textAlign: "center" },
  danger: { marginTop: spacing.xl, padding: spacing.lg, alignItems: "center" },
  dangerText: { color: colors.bad, fontSize: 15, fontWeight: "700" },
});
