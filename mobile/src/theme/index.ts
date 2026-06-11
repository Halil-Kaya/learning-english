// ============================================================
//  Tema — web uygulamasının koyu paletinden taşındı (style.css)
// ============================================================

export const colors = {
  bg: "#0e0e12",
  bgSoft: "#15151b",
  surface: "#1a1a22",
  surface2: "#21212b",
  border: "#2c2c38",
  accent: "#7c6af7",
  accent2: "#f7b15a",
  text: "#f1f1f6",
  muted: "#8a8aa3",
  ok: "#4ade80",
  bad: "#f87171",
  // yarı saydam tonlar (buton/zemin vurguları)
  accentSoft: "rgba(124,106,247,0.14)",
  okSoft: "rgba(74,222,128,0.16)",
  badSoft: "rgba(248,113,113,0.16)",
} as const;

export const radius = {
  sm: 9,
  md: 12,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const font = {
  // RN'de özel font yüklemeden sistem fontu; web'deki Syne/DM Sans yerine.
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    huge: 40,
  },
} as const;

/** Seviye renk eşlemesi (rozetler için). */
export const levelColor: Record<string, string> = {
  beginner: colors.ok,
  intermediate: colors.accent2,
  advanced: colors.bad,
};
