import { StyleSheet, Text, View } from "react-native";
import { visibleStreak, weekActiveDays, weekDayKeys } from "../engine/streak";
import { t } from "../i18n";
import { useStreak } from "../store/streak";
import { colors, radius, spacing } from "../theme";

/**
 * Ana ekran üstü: 🔥 günlük seri + en iyi seri + haftalık hedef sayacı
 * (Pzt→Paz 7 nokta, aktif günler dolu, bugün vurgulu). Streak global.
 */
export function StreakHeader() {
  const core = useStreak();
  const today = new Date();

  const streak = visibleStreak(core, today);
  const active = new Set(weekActiveDays(core, today));
  const keys = weekDayKeys(today);
  const todayKeyVal = keys[(today.getDay() + 6) % 7];
  const weekCount = keys.filter((k) => active.has(k)).length;
  const goalMet = weekCount >= core.weeklyGoal;
  const letters = t("streakWeekDayLetters");

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={[styles.flame, streak === 0 && styles.flameDim]}>🔥</Text>
        <View>
          <Text style={styles.count}>{streak}</Text>
          {core.best > 0 ? (
            <Text style={styles.best}>
              {t("streakBest")} {core.best}
            </Text>
          ) : (
            <Text style={styles.best}>{t("streakDayUnit")}</Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.weekLabel, goalMet && styles.weekLabelMet]}>
          {goalMet ? "✅ " : ""}
          {t("streakWeekLabel")} {weekCount}/{core.weeklyGoal}
        </Text>
        <View style={styles.dots}>
          {keys.map((k, i) => {
            const on = active.has(k);
            const isToday = k === todayKeyVal;
            return (
              <View key={k} style={styles.dotCol}>
                <View
                  style={[
                    styles.dot,
                    on && styles.dotOn,
                    isToday && styles.dotToday,
                  ]}
                />
                <Text style={[styles.dotLetter, isToday && styles.dotLetterToday]}>
                  {letters[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flame: { fontSize: 34 },
  flameDim: { opacity: 0.3 },
  count: { color: colors.text, fontSize: 28, fontWeight: "800", lineHeight: 30 },
  best: { color: colors.muted, fontSize: 11, marginTop: 1 },

  right: { alignItems: "flex-end", gap: spacing.xs },
  weekLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  weekLabelMet: { color: colors.ok },
  dots: { flexDirection: "row", gap: 6 },
  dotCol: { alignItems: "center", gap: 3 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dotOn: { backgroundColor: colors.accent2 },
  dotToday: { borderWidth: 2, borderColor: colors.text },
  dotLetter: { color: colors.muted, fontSize: 9 },
  dotLetterToday: { color: colors.text, fontWeight: "700" },
});
