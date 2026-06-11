import { StyleSheet, Text, View } from "react-native";
import { isAuto } from "../../engine/memorize";
import { colors, radius } from "../../theme";

/** Harf kutucukları: dolu / aktif / boş / (göster) tüm harfler. */
export function LetterSlots({
  target,
  filled,
  revealAll = false,
}: {
  target: string;
  filled: number;
  revealAll?: boolean;
}) {
  return (
    <View style={styles.row}>
      {[...target].map((ch, i) => {
        if (isAuto(ch)) return <View key={i} style={styles.space} />;
        const isFilled = i < filled;
        const isCurrent = i === filled;
        return (
          <View
            key={i}
            style={[
              styles.slot,
              isFilled && styles.filled,
              isCurrent && !revealAll && styles.current,
              revealAll && styles.reveal,
            ]}
          >
            <Text
              style={[
                styles.text,
                isFilled && styles.filledText,
                revealAll && styles.revealText,
              ]}
            >
              {isFilled || revealAll ? ch : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7, marginVertical: 18 },
  slot: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 2,
    borderRadius: radius.sm,
  },
  space: { width: 14 },
  text: { color: colors.text, fontSize: 22, fontWeight: "700" },
  filled: { borderBottomColor: colors.ok },
  filledText: { color: colors.ok },
  current: { borderBottomColor: colors.accent, borderColor: colors.accent },
  reveal: { borderBottomColor: colors.accent },
  revealText: { color: colors.accent },
});
