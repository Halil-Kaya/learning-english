import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

/** Koyu arka planlı, güvenli alan saygılı ekran sarmalayıcı. */
export function Screen({
  children,
  style,
  pad = true,
}: {
  children: ReactNode;
  style?: ViewStyle;
  pad?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={[pad ? styles.padded : null, styles.flex, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
