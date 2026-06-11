import { StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";

/** Çalışma üst şeridi: biliyorum / kalan / öğreniyorum / başarı + ilerleme. */
export function StatBar({
  know,
  learn,
  left,
  total,
}: {
  know: number;
  learn: number;
  left: number;
  total: number;
}) {
  const done = know + learn;
  const score = done ? Math.round((know / done) * 100) : 0;
  const pct = total ? Math.round(((total - left) / total) * 100) : 0;
  return (
    <View>
      <View style={styles.row}>
        <Stat n={know} label={t("statKnow")} color={colors.ok} />
        <Stat n={left} label={t("statLeft")} color={colors.accent} />
        <Stat n={learn} label={t("statLearn")} color={colors.bad} />
        <Stat n={`${score}%`} label={t("statScore")} color={colors.text} />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function Stat({
  n,
  label,
  color,
}: {
  n: number | string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.num, { color }]}>{n}</Text>
      <Text style={styles.lbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 10,
    alignItems: "center",
  },
  num: { fontSize: 20, fontWeight: "700" },
  lbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
  track: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.accent, borderRadius: radius.pill },
});
