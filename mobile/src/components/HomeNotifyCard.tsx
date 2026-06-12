import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { buildNotifyContext, enableNotifications } from "../engine/notify";
import { t } from "../i18n";
import { useSettings } from "../store/settings";
import { Button } from "./Button";
import { TimePickerModal } from "./TimePickerModal";
import { colors, radius, spacing } from "../theme";

/**
 * Mevcut (onboarding'i bildirim adımından önce geçmiş) kullanıcıya tek
 * seferlik "günlük hatırlatma kur" kartı. Bildirim açıksa veya kart bir
 * kez kapatıldıysa görünmez.
 */
export function HomeNotifyCard() {
  const enabled = useSettings((s) => s.notifyEnabled);
  const dismissed = useSettings((s) => s.notifyPromptDismissed);
  const notifyHour = useSettings((s) => s.notifyHour);
  const notifyMinute = useSettings((s) => s.notifyMinute);
  const setNotify = useSettings((s) => s.setNotify);
  const dismiss = useSettings((s) => s.dismissNotifyPrompt);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (enabled || dismissed) return null;

  const onConfirm = async (hour: number, minute: number) => {
    setNotify({ hour, minute });
    setPickerOpen(false);
    const granted = await enableNotifications(buildNotifyContext());
    if (granted) {
      setNotify({ enabled: true });
      dismiss();
    } else {
      Alert.alert(t("settingsNotify"), t("settingsNotifyDenied"));
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("homeNotifyCardTitle")}</Text>
      <Text style={styles.body}>{t("homeNotifyCardBody")}</Text>
      <View style={styles.actions}>
        <Button
          title={t("homeNotifyCardEnable")}
          variant="primary"
          small
          onPress={() => setPickerOpen(true)}
          style={styles.flex}
        />
        <Pressable onPress={dismiss} hitSlop={8} style={styles.dismiss}>
          <Text style={styles.dismissText}>{t("homeNotifyCardDismiss")}</Text>
        </Pressable>
      </View>

      <TimePickerModal
        visible={pickerOpen}
        hour={notifyHour}
        minute={notifyMinute}
        onClose={() => setPickerOpen(false)}
        onConfirm={onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xs },
  flex: { flex: 1 },
  dismiss: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  dismissText: { color: colors.muted, fontSize: 13, fontWeight: "600" },
});
