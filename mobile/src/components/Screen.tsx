import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

/** Koyu arka planlı, güvenli alan saygılı ekran sarmalayıcı. */
export function Screen({
  children,
  style,
  pad = true,
  edges = ["top", "left", "right"],
}: {
  children: ReactNode;
  style?: ViewStyle;
  pad?: boolean;
  /** Hangi kenarlarda güvenli alan boşluğu uygulanacak. Sabit alt butonlu
   *  (sekme dışı) ekranlarda "bottom" eklenir → home indicator çakışmaz. */
  edges?: Edge[];
}) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
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
