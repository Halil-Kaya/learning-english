import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { getCatalogSets } from "../data/catalog";
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

function ensureBraced(target: string, term: string): string {
  if (!target) return "";
  if (target.includes("{")) return target;
  const i = target.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return target;
  return target.slice(0, i) + "{" + target.slice(i, i + term.length) + "}" + target.slice(i + term.length);
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[ğ]/g, "g").replace(/[ı]/g, "i").replace(/[ş]/g, "s")
    .replace(/[ü]/g, "u").replace(/[ö]/g, "o").replace(/[ç]/g, "c");
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<TextInput>(null);

  const catalogEntries = useMemo(
    () => getCatalogSets(pair).flatMap((s) => s.entries),
    [pair]
  );

  const searchResults = useMemo(() => {
    const q = normalize(searchQuery);
    if (q.length < 2) return [];
    return catalogEntries
      .filter(
        (e) =>
          !entries.some((a) => a.term.toLowerCase() === e.term.toLowerCase()) &&
          (normalize(e.term).includes(q) || normalize(e.meaning).includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, catalogEntries, entries]);

  const addFromCatalog = (entry: Entry) => {
    const { id: _id, ...rest } = entry;
    setEntries((list) => [...list, rest]);
    setSearchQuery("");
  };

  const removeEntry = (idx: number) => {
    setEntries((list) => list.filter((_, i) => i !== idx));
  };

  const addWord = () => {
    if (!draft.term.trim() || !draft.meaning.trim()) {
      setError("Terim ve anlam zorunlu.");
      return;
    }
    if (entries.some((e) => e.term.toLowerCase() === draft.term.trim().toLowerCase())) {
      setError("Bu terim zaten eklendi.");
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
    const ts = Date.now();
    const setId = `${pair}-user-${ts}`;
    const set: WordSet = {
      id: setId,
      languagePair: pair,
      name: base,
      level: "beginner",
      category: "my-sets",
      source: "user",
      entries: entries.map((e, i) => ({ id: `${setId}-${i}`, ...e })),
    };
    addUserSets(pair, [set]);
    addToList(pair, setId);
    router.back();
  };

  const showResults = searchQuery.trim().length >= 2;

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Field label={t("createSetName")} value={name} onChange={setName} />

          <View style={styles.divider} />

          <Text style={styles.count}>
            {entries.length} {t("createWordCount")}
          </Text>

          {entries.length > 0 && (
            <View style={styles.chips}>
              {entries.map((e, i) => (
                <Pressable key={i} style={styles.chip} onPress={() => removeEntry(i)}>
                  <Text style={styles.chipTerm}>{e.term}</Text>
                  <Text style={styles.chipX}>✕</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Arama */}
          <Text style={styles.sectionLabel}>{t("createSearchLabel")}</Text>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder={t("createSearchPlaceholder")}
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            )}
          </View>

          {showResults && (
            <View style={styles.results}>
              {searchResults.length === 0 ? (
                <Text style={styles.noResults}>{t("createNoResults")}</Text>
              ) : (
                searchResults.map((entry) => (
                  <Pressable
                    key={entry.id}
                    style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                    onPress={() => addFromCatalog(entry)}
                  >
                    <View style={styles.resultTexts}>
                      <Text style={styles.resultTerm}>{entry.term}</Text>
                      <Text style={styles.resultMeaning}>{entry.meaning}</Text>
                    </View>
                    <Text style={styles.resultAdd}>+ Ekle</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Elle giriş */}
          <Text style={styles.sectionLabel}>{t("createManualLabel")}</Text>
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
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTerm: { color: colors.text, fontSize: 13 },
  chipX: { color: colors.muted, fontSize: 11 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: spacing.xs },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: 2,
  },
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 11,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { color: colors.muted, fontSize: 12 },
  results: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultRowPressed: { backgroundColor: colors.surface2 },
  resultTexts: { flex: 1, gap: 2 },
  resultTerm: { color: colors.text, fontSize: 15, fontWeight: "600" },
  resultMeaning: { color: colors.muted, fontSize: 13 },
  resultAdd: { color: colors.accent, fontSize: 13, fontWeight: "700" },
  noResults: { color: colors.muted, fontSize: 14, padding: spacing.md, textAlign: "center" },
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
