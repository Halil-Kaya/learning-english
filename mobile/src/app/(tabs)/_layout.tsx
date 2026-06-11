import { Tabs } from "expo-router";
import { Text } from "react-native";
import { t } from "../../i18n";
import { colors } from "../../theme";

function icon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bgSoft,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabHome"), tabBarIcon: icon("🎯") }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: t("tabExplore"), tabBarIcon: icon("🧭") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: t("tabHistory"), tabBarIcon: icon("🕘") }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t("tabSettings"), tabBarIcon: icon("⚙️") }}
      />
    </Tabs>
  );
}
