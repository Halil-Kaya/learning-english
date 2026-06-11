import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import type { Entry, WordSet } from "../data/types";
import { t } from "../i18n";
import { useLibrary } from "../store/library";
import { useSettings } from "../store/settings";
import { colors, radius, spacing } from "../theme";

interface Draft {
  term: string;
  type: string;
  meaning: string;
  exTarget: string;
  exSource: string;
}

const empty: Draft = { term: "", type: "", meaning: "", exTarget: "", exSource: "" };

/** Örnek cümlede terimi {süslü} yap (kullanıcı işaretlemediyse). */
function ensureBraced(target: string, term: string): string {
  if (!target) return "";
  if (target.includes("{")) return target;
  const i = target.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return target;
  return target.slice(0, i) + "{" + target.slice(i, i + term.length) + "}" + target.slice(i + term.length);
}

/** entries'i 15'lik setlere böl. */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function CreateSet() {
  const router = useRouter();
  const pair = useSettings((s) => s.languagePair);
  const addUserSets = useLibrary((s) => s.addUserSets);
  const addToList = useLibrary((s) => s.addToStudyList);

  const [name, setName] = useState("");
  const [draft, setDraft] = useState<Draft>(empty);
  const [entries, setEntries] = useState<Omit<Entry, "id">[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addWord = () => {
    if (!draft.term.trim() || !draft.meaning.trim()) {
      setError("Terim ve anlam zorunlu.");
      return;
    }
    const examples = draft.exTarget.trim()
      ? [{ target: ensureBraced(draft.exTarget.trim(), draft.term.trim()), source: draft.exSource.trim() }]
      : [];
    setEntries((list) => [
      ...list,
      {
        kind: /\s/.test(draft.term.trim()) ? "phrase" : "word",
        term: draft.term.trim(),
        type: draft.type.trim() || "—",
        meaning: draft.meaning.trim(),
        examples,
      },
    ]);
    setDraft(empty);
    setError(null);
  };

  const save = () => {
    if (entries.length === 0) {
      setError(t("createNeedWords"));
      return;
    }
    const base = name.trim() || "Benim Setim";
    const chunks = chunk(entries, 15);
    const ts = Date.now();
    const sets: WordSet[] = chunks.map((group, ci) => {
      const setId = `${pair}-user-${ts}-${ci}`;
      return {
        id: setId,
        languagePair: pair,
        name: chunks.length > 1 ? `${base} (${ci + 1})` : base,
        level: "beginner",
        category: "my-sets",
        source: "user",
        entries: group.map((e, i) => ({ id: `${setId}-${i}`, ...e })),
      };
    });
    addUserSets(pair, sets);
    sets.forEach((s) => addToList(pair, s.id));
    router.back();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("createTitle")}</Text>
          <Button title="✕" variant="surface" small onPress={() => router.back()} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Field label={t("createSetName")} value={name} onChange={setName} />

          <View style={styles.divider} />
          <Text style={styles.count}>
            {entries.length} {t("createWordCount")} · {t("createSplitNote")}
          </Text>

          {entries.length > 0 && (
            <View style={styles.chips}>
              {entries.map((e, i) => (
                <Text key={i} style={styles.wordChip}>
                  {e.term}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.divider} />
          <Field label={t("createTerm")} value={draft.term} onChange={(v) => setDraft({ ...draft, term: v })} />
          <Field label={t("createType")} value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })} />
          <Field label={t("createMeaning")} value={draft.meaning} onChange={(v) => setDraft({ ...draft, meaning: v })} />
          <Field label={t("createExampleTarget")} value={draft.exTarget} onChange={(v) => setDraft({ ...draft, exTarget: v })} />
          <Field label={t("createExampleSource")} value={draft.exSource} onChange={(v) => setDraft({ ...draft, exSource: v })} />
          <Text style={styles.hint}>{t("createHintBraces")}</Text>

          <Button title={t("createAddWord")} variant="surface" onPress={addWord} style={styles.add} />

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <Button title={t("createSave")} variant="primary" onPress={save} style={styles.save} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  body: { paddingBottom: spacing.xl, gap: spacing.xs },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md },
  count: { color: colors.muted, fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  wordChip: {
    color: colors.text,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    overflow: "hidden",
  },
  field: { gap: 4, marginTop: spacing.sm },
  fieldLabel: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  input: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.sm, lineHeight: 17 },
  add: { marginTop: spacing.md },
  error: { color: colors.bad, fontSize: 13, marginTop: spacing.sm },
  save: { marginVertical: spacing.md },
});
