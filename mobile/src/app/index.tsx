import { Redirect } from "expo-router";
import { useSettings } from "../store/settings";

/** Giriş kapısı: onboarding tamamlandıysa sekmelere, değilse dil seçimine. */
export default function Index() {
  const onboarded = useSettings((s) => s.onboarded);
  return <Redirect href={onboarded ? "/(tabs)" : "/onboarding"} />;
}
