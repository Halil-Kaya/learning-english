import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { AnagramMode } from "../../components/modes/AnagramMode";
import { CardsMode } from "../../components/modes/CardsMode";
import { FillMode } from "../../components/modes/FillMode";
import { HangmanMode } from "../../components/modes/HangmanMode";
import { HuntMode } from "../../components/modes/HuntMode";
import { MatchMode } from "../../components/modes/MatchMode";
import { MemorizeMode } from "../../components/modes/MemorizeMode";
import { ModePicker } from "../../components/modes/ModePicker";
import { RaceMode } from "../../components/modes/RaceMode";
import { ResultView } from "../../components/modes/ResultView";
import { TestMode } from "../../components/modes/TestMode";
import { WriteMode } from "../../components/modes/WriteMode";
import type { ModeProps, ModeResult } from "../../components/modes/types";
import type { Entry, StudyMode } from "../../data/types";
import { useSet } from "../../data/useSets";
import { makeSpeak } from "../../engine/speak";
import { useLibrary } from "../../store/library";
import { useSettings } from "../../store/settings";
import { useStreak } from "../../store/streak";
import { colors, spacing } from "../../theme";

const MODE_COMPONENTS: Record<StudyMode, (p: ModeProps) => React.ReactElement | null> = {
  cards: CardsMode,
  test: TestMode,
  match: MatchMode,
  fill: FillMode,
  write: WriteMode,
  memorize: MemorizeMode,
  anagram: AnagramMode,
  race: RaceMode,
  hangman: HangmanMode,
  hunt: HuntMode,
};

export default function StudySession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const set = useSet(id);
  const pair = useSettings((s) => s.languagePair);
  const sound = useSettings((s) => s.sound);
  const recordWord = useLibrary((s) => s.recordWord);
  const tickStreak = useStreak((s) => s.tick);

  const speak = useMemo(() => makeSpeak(pair, sound), [pair, sound]);

  const [mode, setMode] = useState<StudyMode | null>(null);
  const [deck, setDeck] = useState<Entry[]>([]);
  const [result, setResult] = useState<ModeResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  if (!set) {
    return (
      <Screen>
        <Header title="—" onClose={() => router.back()} />
        <Text style={styles.missing}>Set bulunamadı.</Text>
      </Screen>
    );
  }

  const start = (m: StudyMode, entries: Entry[]) => {
    setMode(m);
    setDeck(entries);
    setResult(null);
    setRunKey((k) => k + 1);
  };

  // Geçmiş UI'ı kaldırıldı (Öğrendiklerim'e dönüştü) — oturum kaydı tutulmuyor.
  // Tur bitişi günlük seriyi ilerletir (çalışma/oyun fark etmez).
  const onFinish = (res: ModeResult) => {
    tickStreak();
    setResult(res);
  };

  const onRecordWord: ModeProps["onRecordWord"] = (entryId, r) =>
    recordWord(pair, entryId, r);

  // ---- içerik seçimi ----
  let body: React.ReactNode;
  if (result) {
    body = (
      <ResultView
        result={result}
        onRestart={() => start(mode!, set.entries)}
        onWrongOnly={() =>
          start(mode!, set.entries.filter((e) => result.wrongIds.includes(e.id)))
        }
        onBack={() => router.back()}
      />
    );
  } else if (mode) {
    const ModeComp = MODE_COMPONENTS[mode];
    body = (
      <ModeComp
        key={runKey}
        entries={deck}
        speak={speak}
        onRecordWord={onRecordWord}
        onFinish={onFinish}
        setId={set.id}
      />
    );
  } else {
    body = <ModePicker onPick={(m) => start(m, set.entries)} />;
  }

  // mod içindeyken (veya sonuç ekranında) ← mod seçimine döner; seçimdeyken ✕ kapatır
  const inMode = mode !== null;
  const backToPicker = () => {
    setMode(null);
    setResult(null);
  };

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Header
        title={set.name}
        icon={inMode ? "back" : "close"}
        onClose={inMode ? backToPicker : () => router.back()}
      />
      <View style={styles.flex}>{body}</View>
    </Screen>
  );
}

function Header({
  title,
  onClose,
  icon = "close",
}: {
  title: string;
  onClose: () => void;
  icon?: "close" | "back";
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
        <Text style={styles.closeText}>{icon === "back" ? "←" : "✕"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  closeText: { color: colors.text, fontSize: 16 },
  missing: { color: colors.muted, marginTop: spacing.xl },
});
