import { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { useStreak } from "../store/streak";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme";

/**
 * Dönüm noktası (3/7/14/30/50/100/365 gün) aşıldığında tam ekran kutlama.
 * `pendingMilestone` store'da set edilir (tick içinde); burada gösterilip
 * kapatılınca temizlenir. Kök layout'a global mount edilir → her ekranın
 * üstüne çıkar (sonuç ekranı dahil).
 */
export function MilestoneModal() {
  const milestone = useStreak((s) => s.pendingMilestone);
  const clear = useStreak((s) => s.clearMilestone);
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (milestone != null) {
      scale.setValue(0.6);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [milestone, scale]);

  return (
    <Modal visible={milestone != null} transparent animationType="fade" onRequestClose={clear}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.flame}>🔥</Text>
          <Text style={styles.number}>{milestone}</Text>
          <Text style={styles.sub}>{t("milestoneSub")}</Text>
          <Text style={styles.heading}>{t("milestoneHeading")}</Text>
          <Text style={styles.blurb}>{t("milestoneBlurb")}</Text>
          <Button
            title={t("milestoneContinue")}
            variant="primary"
            onPress={clear}
            style={styles.btn}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent2,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    gap: spacing.xs,
  },
  flame: { fontSize: 64 },
  number: { color: colors.accent2, fontSize: 56, fontWeight: "800", lineHeight: 60 },
  sub: { color: colors.muted, fontSize: 15 },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  blurb: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  btn: { marginTop: spacing.lg, minWidth: 200 },
});
