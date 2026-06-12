import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TimePickerModal } from "../components/TimePickerModal";
import { isPairAvailable, PAIRS } from "../data/languages";
import type { LanguagePair } from "../data/types";
import { buildNotifyContext, enableNotifications } from "../engine/notify";
import { t } from "../i18n";
import { useSettings } from "../store/settings";
import { colors, radius, spacing } from "../theme";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Onboarding() {
  const router = useRouter();
  const complete = useSettings((s) => s.completeOnboarding);
  const setLanguagePair = useSettings((s) => s.setLanguagePair);
  const setNotify = useSettings((s) => s.setNotify);

  const [step, setStep] = useState<"lang" | "notify">("lang");
  const [selected, setSelected] = useState<LanguagePair | null>("en-tr");
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const goNotify = () => {
    if (!selected) return;
    setLanguagePair(selected); // bildirim bağlamı doğru dil çiftini kullansın
    setStep("notify");
  };

  const finish = () => {
    if (selected) complete(selected);
    router.replace("/(tabs)");
  };

  const enableAndFinish = async () => {
    setNotify({ hour, minute });
    const granted = await enableNotifications(buildNotifyContext());
    setNotify({ enabled: granted });
    finish();
  };

  const skipNotify = () => {
    setNotify({ enabled: false });
    finish();
  };

  if (step === "notify") {
    return (
      <Screen edges={["top", "left", "right", "bottom"]}>
        <View style={styles.notifyWrap}>
          <Text style={styles.bell}>🔔</Text>
          <Text style={[styles.title, styles.centered]}>{t("onboardingNotifyTitle")}</Text>
          <Text style={[styles.subtitle, styles.centered]}>
            {t("onboardingNotifySubtitle")}
          </Text>

          <View style={styles.timeCard}>
            <Text style={styles.timeBig}>
              {pad(hour)}:{pad(minute)}
            </Text>
            <Button
              title={t("onboardingNotifyChangeTime")}
              variant="surface"
              small
              onPress={() => setPickerOpen(true)}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button title={t("onboardingNotifyEnable")} variant="primary" onPress={enableAndFinish} />
          <Button title={t("onboardingNotifySkip")} variant="ghost" onPress={skipNotify} />
        </View>

        <TimePickerModal
          visible={pickerOpen}
          hour={hour}
          minute={minute}
          onClose={() => setPickerOpen(false)}
          onConfirm={(h, m) => {
            setHour(h);
            setMinute(m);
            setPickerOpen(false);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Text style={styles.logo}>📚 {t("appName")}</Text>
      <Text style={styles.title}>{t("onboardingTitle")}</Text>
      <Text style={styles.subtitle}>{t("onboardingSubtitle")}</Text>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {PAIRS.map((p) => {
          const available = isPairAvailable(p.pair);
          const active = selected === p.pair;
          return (
            <View
              key={p.pair}
              style={[
                styles.row,
                active && styles.rowActive,
                !available && styles.rowDisabled,
              ]}
              onTouchEnd={() => available && setSelected(p.pair)}
            >
              <Text style={styles.flag}>{p.learnFlag}</Text>
              <View style={styles.flex}>
                <Text style={styles.learn}>{p.learn}</Text>
                <Text style={styles.via}>{p.via} açıklamalı</Text>
              </View>
              {!available && <Text style={styles.soon}>yakında</Text>}
              {active && <Text style={styles.check}>✓</Text>}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t("onboardingContinue")}
          variant="primary"
          onPress={goNotify}
          disabled={!selected}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logo: { color: colors.accent, fontSize: 18, fontWeight: "800", marginTop: spacing.md },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginTop: spacing.lg,
  },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  list: { gap: spacing.sm, paddingVertical: spacing.lg },
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
  rowActive: { borderColor: colors.accent, backgroundColor: colors.surface2 },
  rowDisabled: { opacity: 0.45 },
  flag: { fontSize: 26 },
  learn: { color: colors.text, fontSize: 16, fontWeight: "700" },
  via: { color: colors.muted, fontSize: 13, marginTop: 1 },
  soon: { color: colors.muted, fontSize: 12, fontStyle: "italic" },
  check: { color: colors.accent, fontSize: 20, fontWeight: "800" },
  footer: { paddingVertical: spacing.lg, gap: spacing.sm },

  // bildirim adımı
  notifyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  centered: { textAlign: "center" },
  bell: { fontSize: 64 },
  timeCard: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  timeBig: { color: colors.accent, fontSize: 52, fontWeight: "800" },
});
