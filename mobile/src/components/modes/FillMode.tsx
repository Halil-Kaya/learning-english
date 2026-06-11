import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { Entry, Example } from "../../data/types";
import { bracedTerm, entriesWithBlank, pickBlankExample, segmentExample, shuffle } from "../../engine";
import { t } from "../../i18n";
import { colors, radius, spacing } from "../../theme";
import { Button } from "../Button";
import { StatBar } from "../StatBar";
import type { ModeProps } from "./types";

export function FillMode({ entries, speak, onRecordWord, onFinish }: ModeProps) {
  const deck = useMemo(() => shuffle(entriesWithBlank(entries)), [entries]);
  const [idx, setIdx] = useState(0);
  const [know, setKnow] = useState(0);
  const [learn, setLearn] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"none" | "good" | "bad">("none");
  const [wrong] = useState<Set<string>>(() => new Set());

  if (deck.length === 0) {
    return (
      <View style={styles.flex}>
        <Text style={styles.empty}>Bu sette boşluk doldurmaya uygun örnek yok.</Text>
        <Button title={t("resultBackToSet")} variant="ghost" onPress={() => onFinish({ know: 0, learn: 0, wrongIds: [] })} />
      </View>
    );
  }

  const w: Entry = deck[idx];
  const ex = useMemo<Example>(() => pickBlankExample(w)!, [w]);
  const answer = bracedTerm(ex.target) ?? w.term;

  const check = () => {
    if (feedback !== "none") return;
    const guess = value.trim().toLowerCase();
    if (!guess) return;
    const correct = guess === answer.toLowerCase();
    onRecordWord(w.id, { correct });
    if (correct) {
      setKnow((k) => k + 1);
      setFeedback("good");
      speak(answer);
    } else {
      setLearn((l) => l + 1);
      wrong.add(w.id);
      setFeedback("bad");
    }
  };

  const next = () => {
    const n = idx + 1;
    if (n >= deck.length) {
      onFinish({ know, learn, wrongIds: [...wrong] });
      return;
    }
    setIdx(n);
    setValue("");
    setFeedback("none");
  };

  const segments = segmentExample(ex.target);

  return (
    <View style={styles.flex}>
      <StatBar know={know} learn={learn} left={deck.length - idx} total={deck.length} />
      <View style={styles.card}>
        <Text style={styles.label}>CÜMLEDEKİ BOŞLUĞU DOLDUR</Text>
        <Text style={styles.sentence}>
          {segments.map((s, i) =>
            s.isTerm ? (
              <Text key={i} style={styles.blank}>
                {" ____ "}
              </Text>
            ) : (
              <Text key={i}>{s.text}</Text>
            )
          )}
        </Text>
        <Text style={styles.tr}>{ex.source}</Text>
        <Text style={styles.hint}>
          {t("hint")}: {w.meaning}
        </Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          editable={feedback === "none"}
          placeholder="İngilizce kelimeyi yaz..."
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={feedback === "none" ? check : next}
        />

        {feedback === "good" && <Text style={[styles.fb, styles.good]}>✓ Doğru! — {answer}</Text>}
        {feedback === "bad" && <Text style={[styles.fb, styles.bad]}>✗ Yanlış. Doğrusu: "{answer}"</Text>}

        {feedback === "none" ? (
          <Button title={t("check")} variant="primary" onPress={check} style={styles.btn} />
        ) : (
          <Button title={t("next")} variant="primary" onPress={next} style={styles.btn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", marginVertical: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  sentence: { color: colors.text, fontSize: 20, fontWeight: "500", lineHeight: 30, marginTop: spacing.md },
  blank: { color: colors.accent, fontWeight: "800" },
  tr: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: spacing.sm },
  hint: { color: colors.accent, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 17,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  fb: { fontSize: 15, fontWeight: "600", marginTop: spacing.lg },
  good: { color: colors.ok },
  bad: { color: colors.bad },
  btn: { marginTop: spacing.lg },
});
