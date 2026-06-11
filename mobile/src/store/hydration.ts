// ============================================================
//  Persist hydration kapısı — AsyncStorage'dan okuma bitene kadar
//  uygulama "yükleniyor" durumunda kalır (yanlış yönlendirmeyi önler).
// ============================================================

import { useEffect, useState } from "react";
import { useLibrary } from "./library";
import { useSettings } from "./settings";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useSettings.persist.hasHydrated() && useLibrary.persist.hasHydrated()
  );

  useEffect(() => {
    const check = () =>
      setHydrated(
        useSettings.persist.hasHydrated() && useLibrary.persist.hasHydrated()
      );
    const unsub1 = useSettings.persist.onFinishHydration(check);
    const unsub2 = useLibrary.persist.onFinishHydration(check);
    check();
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, []);

  return hydrated;
}
