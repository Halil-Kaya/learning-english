import { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Entry } from "../data/types";
import type { SpeakFn } from "../engine/speak";
import { t } from "../i18n";
import { colors, radius, spacing } from "../theme";
import { Button } from "./Button";

const SWIPE_THRESHOLD = 110;
const FLY_DISTANCE = 520;

/**
 * Tinder benzeri kaydırma kartı (Kendini Dene):
 * sağa kaydır = biliyorum, sola = bilmiyorum, dokun = anlamı çevir.
 * Ek bağımlılık yok — PanResponder + Animated.
 * Her kart için `key={entry.id}` ile yeniden kurulmalı (pozisyon sıfırlanır).
 */
export function SwipeCard({
  entry,
  speak,
  onResult,
}: {
  entry: Entry;
  speak: SpeakFn;
  onResult: (know: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const answered = useRef(false);

  const flyOut = (dir: 1 | -1, dy = 0) => {
    if (answered.current) return;
    answered.current = true;
    Animated.timing(position, {
      toValue: { x: dir * FLY_DISTANCE, y: dy },
      duration: 220,
      useNativeDriver: true,
    }).start(() => onResult(dir === 1));
  };

  const pan = useRef(
    PanResponder.create({
      // dokunuşları çocuklara bırak; yalnız belirgin yatay sürüklemeyi yakala
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) flyOut(1, g.dy);
        else if (g.dx < -SWIPE_THRESHOLD) flyOut(-1, g.dy);
        else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-260, 0, 260],
    outputRange: ["-16deg", "0deg", "16deg"],
  });
  const knowOpacity = position.x.interpolate({
    inputRange: [30, 130],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-130, -30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]}
      >
        {/* sürükleme etiketleri */}
        <Animated.View style={[styles.tag, styles.tagKnow, { opacity: knowOpacity }]}>
          <Text style={styles.tagKnowText}>{t("selfTestKnow")}</Text>
        </Animated.View>
        <Animated.View style={[styles.tag, styles.tagNope, { opacity: nopeOpacity }]}>
          <Text style={styles.tagNopeText}>{t("selfTestDontKnow")}</Text>
        </Animated.View>

        <Pressable style={styles.face} onPress={() => setFlipped((f) => !f)}>
          {!flipped ? (
            <View style={styles.front}>
              <Text style={styles.term}>{entry.term}</Text>
              <Text style={styles.type}>{entry.type}</Text>
              <Text style={styles.hint}>{t("selfTestSwipeHint")}</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.back}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.meaning}>{entry.meaning}</Text>
              {entry.examples.slice(0, 3).map((ex, i) => (
                <View key={i} style={styles.ex}>
                  <Text style={styles.exTarget}>{ex.target.replace(/[{}]/g, "")}</Text>
                  <Text style={styles.exSource}>{ex.source}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Animated.View>

      <View style={styles.actions}>
        <Button
          title={t("selfTestDontKnow")}
          variant="bad"
          onPress={() => flyOut(-1)}
          style={styles.actionBtn}
        />
        <Button title="🔊" variant="surface" onPress={() => speak(entry.term)} />
        <Button
          title={t("selfTestKnow")}
          variant="ok"
          onPress={() => flyOut(1)}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  face: { flex: 1 },
  front: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  term: { color: colors.text, fontSize: 36, fontWeight: "800", textAlign: "center" },
  type: { color: colors.accent, fontSize: 14, fontStyle: "italic", marginTop: spacing.sm },
  hint: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  back: { padding: spacing.xl, gap: spacing.md },
  meaning: { color: colors.text, fontSize: 26, fontWeight: "800", textAlign: "center" },
  ex: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  exTarget: { color: colors.text, fontSize: 14, lineHeight: 20 },
  exSource: { color: colors.muted, fontSize: 13, fontStyle: "italic", marginTop: 2 },

  tag: {
    position: "absolute",
    top: spacing.lg,
    zIndex: 2,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    transform: [{ rotate: "-12deg" }],
  },
  tagKnow: { left: spacing.lg, borderColor: colors.ok, backgroundColor: colors.okSoft },
  tagKnowText: { color: colors.ok, fontWeight: "800", fontSize: 16 },
  tagNope: {
    right: spacing.lg,
    borderColor: colors.bad,
    backgroundColor: colors.badSoft,
    transform: [{ rotate: "12deg" }],
  },
  tagNopeText: { color: colors.bad, fontWeight: "800", fontSize: 16 },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: { flex: 1 },
});
