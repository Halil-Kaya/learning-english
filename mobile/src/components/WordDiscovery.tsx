import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Entry } from "../data/types";
import { stripBraces } from "../engine/examples";
import { colors, radius, spacing } from "../theme";
import { Button } from "./Button";

const SCREEN_W = Dimensions.get("window").width;
const THRESHOLD = SCREEN_W * 0.25;

/**
 * Tinder tarzı kelime keşfi:
 *  - sağa kaydır = biliyorum (atlanır)
 *  - sola kaydır = bilmiyorum (sete toplanır)
 *  - karta dokun = anlamı göster/gizle
 * "Tamam" → toplanan kelimeler geri verilir.
 */
export function WordDiscovery({
  pool,
  onDone,
  onClose,
}: {
  pool: Entry[];
  onDone: (collected: Entry[]) => void;
  onClose: () => void;
}) {
  // deste açılışta dondurulur (üst bileşen yeniden karıştırsa bile bozulmaz)
  const [deck] = useState<Entry[]>(() => pool);
  const [index, setIndex] = useState(0);
  const [collected, setCollected] = useState<Entry[]>([]);
  const [revealed, setRevealed] = useState(false);

  const indexRef = useRef(0);
  indexRef.current = index;
  const deckRef = useRef(deck);
  deckRef.current = deck;

  const position = useRef(new Animated.ValueXY()).current;

  const forceSwipe = useCallback(
    (dir: "left" | "right") => {
      const toX = dir === "right" ? SCREEN_W * 1.4 : -SCREEN_W * 1.4;
      Animated.timing(position, {
        toValue: { x: toX, y: 0 },
        duration: 220,
        useNativeDriver: false,
      }).start(() => {
        const item = deckRef.current[indexRef.current];
        if (dir === "left" && item) setCollected((c) => [...c, item]);
        position.setValue({ x: 0, y: 0 });
        setRevealed(false);
        setIndex((i) => i + 1);
      });
    },
    [position]
  );
  const forceRef = useRef(forceSwipe);
  forceRef.current = forceSwipe;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > THRESHOLD) forceRef.current("right");
        else if (g.dx < -THRESHOLD) forceRef.current("left");
        else
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ["-10deg", "0deg", "10deg"],
  });
  const knowOpacity = position.x.interpolate({
    inputRange: [0, THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const dontOpacity = position.x.interpolate({
    inputRange: [-THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const card = deck[index];
  const next = deck[index + 1];
  const exhausted = index >= deck.length;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.fill} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Button title="✕" variant="surface" small onPress={onClose} />
        <View style={styles.counter}>
          <Text style={styles.counterNum}>{collected.length}</Text>
          <Text style={styles.counterLabel}>kelime sette</Text>
        </View>
        <Button
          title="Tamam"
          variant="primary"
          small
          onPress={() => onDone(collected)}
        />
      </View>

      <Text style={styles.hint}>
        Bildiğin kelimeyi sağa, bilmediğini sola kaydır
      </Text>

      <View style={styles.stage}>
        {exhausted ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Havuzdaki kelimeler bitti 🎉</Text>
            <Text style={styles.emptyText}>
              {collected.length > 0
                ? `${collected.length} kelime topladın. "Tamam" ile sete aktar.`
                : "Hiç kelime toplamadın."}
            </Text>
          </View>
        ) : (
          <View style={styles.cardArea}>
            {next && (
              <View style={[styles.card, styles.cardBehind]} pointerEvents="none">
                <Text style={styles.term}>{next.term}</Text>
                <Text style={styles.type}>{next.type}</Text>
              </View>
            )}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
              ]}
            >
              <Animated.View style={[styles.badge, styles.badgeKnow, { opacity: knowOpacity }]}>
                <Text style={styles.badgeKnowText}>BİLİYORUM</Text>
              </Animated.View>
              <Animated.View style={[styles.badge, styles.badgeDont, { opacity: dontOpacity }]}>
                <Text style={styles.badgeDontText}>EKLE +</Text>
              </Animated.View>

              <Pressable style={styles.cardInner} onPress={() => setRevealed((r) => !r)}>
                <Text style={styles.term}>{card.term}</Text>
                <Text style={styles.type}>{card.type}</Text>
                {revealed ? (
                  <>
                    <Text style={styles.meaning}>{card.meaning}</Text>
                    {card.examples[0] && (
                      <Text style={styles.example}>{stripBraces(card.examples[0].target)}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.tapHint}>anlamı görmek için dokun</Text>
                )}
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>

      {!exhausted && (
        <View style={styles.controls}>
          <Pressable
            style={[styles.circle, styles.circleDont]}
            onPress={() => forceSwipe("left")}
          >
            <Text style={styles.circleDontText}>＋</Text>
          </Pressable>
          <Pressable
            style={[styles.circle, styles.circleKnow]}
            onPress={() => forceSwipe("right")}
          >
            <Text style={styles.circleKnowText}>✓</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.legend}>
        <Text style={styles.legendDont}>＋ Bilmiyorum (sete ekle)</Text>
        {"     "}
        <Text style={styles.legendKnow}>✓ Biliyorum (atla)</Text>
      </Text>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  counter: { alignItems: "center" },
  counterNum: { color: colors.accent, fontSize: 24, fontWeight: "800" },
  counterLabel: { color: colors.muted, fontSize: 11 },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center", marginBottom: spacing.sm },

  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.md },
  cardArea: { width: "100%", maxWidth: 360, flex: 1, maxHeight: 540 },
  card: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  cardBehind: { transform: [{ scale: 0.94 }], opacity: 0.6, alignItems: "center", justifyContent: "center" },
  cardInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  term: { color: colors.text, fontSize: 34, fontWeight: "800", textAlign: "center" },
  type: { color: colors.accent, fontSize: 14, fontStyle: "italic", marginTop: 6 },
  meaning: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: spacing.lg, textAlign: "center" },
  example: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.md, textAlign: "center" },
  tapHint: { color: colors.muted, fontSize: 13, marginTop: spacing.xl },

  badge: {
    position: "absolute",
    top: spacing.lg,
    borderWidth: 3,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 2,
  },
  badgeKnow: { right: spacing.lg, borderColor: colors.ok, transform: [{ rotate: "12deg" }] },
  badgeKnowText: { color: colors.ok, fontSize: 20, fontWeight: "900" },
  badgeDont: { left: spacing.lg, borderColor: colors.accent, transform: [{ rotate: "-12deg" }] },
  badgeDontText: { color: colors.accent, fontSize: 20, fontWeight: "900" },

  empty: { alignItems: "center", paddingHorizontal: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", marginTop: spacing.sm },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  circleDont: { borderColor: colors.accent, backgroundColor: colors.surface },
  circleDontText: { color: colors.accent, fontSize: 30, fontWeight: "800" },
  circleKnow: { borderColor: colors.ok, backgroundColor: colors.surface },
  circleKnowText: { color: colors.ok, fontSize: 28, fontWeight: "800" },

  legend: { textAlign: "center", fontSize: 12, marginBottom: spacing.md },
  legendDont: { color: colors.accent },
  legendKnow: { color: colors.ok },
});
