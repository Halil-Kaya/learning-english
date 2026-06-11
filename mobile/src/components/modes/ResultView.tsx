import { StyleSheet, Text, View } from "react-native";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import type { ModeResult } from "./types";

export function ResultView({
  result,
  onRestart,
  onWrongOnly,
  onBack,
}: {
  result: ModeResult;
  onRestart: () => void;
  onWrongOnly: () => void;
  onBack: () => void;
}) {
  const done = result.know + result.learn;
  const pct = done ? Math.round((result.know / done) * 100) : 0;
  let emoji = "📚";
  let title: string = t("resultKeepGoing");
  if (pct >= 80) {
    emoji = "🎉";
    title = t("resultPerfect");
  } else if (pct >= 50) {
    emoji = "💪";
    title = t("resultGood");
  }

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>
        {pct}% başarı — {result.know} doğru, {result.learn} yanlış
      </Text>
      <View style={styles.actions}>
        <Button title={t("resultRestart")} variant="primary" onPress={onRestart} />
        {result.wrongIds.length > 0 && (
          <Button title={t("resultWrongOnly")} variant="ghost" onPress={onWrongOnly} />
        )}
        <Button title={t("resultBackToSet")} variant="ghost" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emoji: { fontSize: 56 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.muted, fontSize: 15, marginBottom: spacing.lg, textAlign: "center" },
  actions: { alignSelf: "stretch", gap: spacing.sm, borderRadius: radius.lg },
});
