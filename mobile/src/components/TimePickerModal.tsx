import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { t } from "../i18n";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const pad = (n: number) => String(n).padStart(2, "0");

/** Saat (00–23) + dakika (00/15/30/45) seçen modal. Native modül YOK. */
export function TimePickerModal({
  visible,
  hour,
  minute,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
}) {
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);

  useEffect(() => {
    if (visible) {
      setH(hour);
      setM(minute);
    }
  }, [visible, hour, minute]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{t("notifyTimePickerTitle")}</Text>
          <Text style={styles.preview}>
            {pad(h)}:{pad(m)}
          </Text>

          <Text style={styles.label}>{t("settingsNotifyTime")}</Text>
          <ScrollView style={styles.hourScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hourGrid}>
              {HOURS.map((hh) => {
                const active = hh === h;
                return (
                  <Pressable
                    key={hh}
                    onPress={() => setH(hh)}
                    style={[styles.hourCell, active && styles.cellActive]}
                  >
                    <Text style={[styles.cellText, active && styles.cellTextActive]}>
                      {pad(hh)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.minRow}>
            {MINUTES.map((mm) => {
              const active = mm === m;
              return (
                <Pressable
                  key={mm}
                  onPress={() => setM(mm)}
                  style={[styles.minCell, active && styles.cellActive]}
                >
                  <Text style={[styles.cellText, active && styles.cellTextActive]}>:{pad(mm)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title={t("notifyTimePickerDone")}
            variant="primary"
            onPress={() => onConfirm(h, m)}
            style={styles.done}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "center" },
  preview: {
    color: colors.accent,
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  hourScroll: { maxHeight: 160 },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  hourCell: {
    width: 52,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  minRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  minCell: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cellActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  cellText: { color: colors.muted, fontSize: 15, fontWeight: "700" },
  cellTextActive: { color: colors.accent },
  done: { marginTop: spacing.lg },
});
