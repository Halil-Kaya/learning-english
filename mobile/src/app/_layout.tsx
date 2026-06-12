import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MilestoneModal } from "../components/MilestoneModal";
import { buildNotifyContext, refreshNotifications } from "../engine/notify";
import { setUiLanguage } from "../i18n";
import { useHydrated } from "../store/hydration";
import { colors } from "../theme";

setUiLanguage("tr"); // v1: tek arayüz dili

export default function RootLayout() {
  const hydrated = useHydrated();

  // Açılışta planlı bildirimleri güncel duruma göre yeniden kur (izin İSTEMEZ).
  useEffect(() => {
    if (hydrated) refreshNotifications(buildNotifyContext());
  }, [hydrated]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="set/[id]" />
          <Stack.Screen
            name="study/[id]"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="create-set"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="self-test"
            options={{ animation: "slide_from_bottom" }}
          />
        </Stack>
        <MilestoneModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
