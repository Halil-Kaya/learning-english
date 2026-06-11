import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { isPairAvailable, PAIRS } from "../data/languages";
import type { LanguagePair } from "../data/types";
import { t } from "../i18n";
import { useSettings } from "../store/settings";
import { colors, radius, spacing } from "../theme";

export default function Onboarding() {
  const router = useRouter();
  const complete = useSettings((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<LanguagePair | null>("en-tr");

  const onContinue = () => {
    if (!selected) return;
    complete(selected);
    router.replace("/(tabs)");
  };

  return (
    <Screen>
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
          onPress={onContinue}
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
  footer: { paddingVertical: spacing.lg },
});
