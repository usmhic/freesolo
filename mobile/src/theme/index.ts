// Brand tokens, shared with the web app (web/app/global.css): slate navy for
// structure and text, sunset orange for the primary action, on warm paper.
// The older names (clay, terra, sand, muted) are kept as aliases so every
// screen picks up the brand without renaming each style.
export const Colors = {
  // Brand
  navy:    "#233846",
  navyDeep:"#16242F",
  sunset:  "#FF6D1D",
  sunsetStrong: "#E85A0C",
  sunsetSoft:   "#FFEADD",
  line:    "#E6E0D6",
  // Core palette
  ink:     "#16232E",
  paper:   "#F8F6F2",
  sand:    "#EFEBE4",
  clay:    "#FF6D1D",
  terra:   "#E85A0C",
  sage:    "#3F7A5A",
  sky:     "#2F6F8F",
  white:   "#FFFFFF",
  muted:   "#55626C",
  // Semantic
  danger:  "#DC2626",
  success: "#2D7D46",
  warning: "#D97706",
  // Surfaces
  surface: "#FFFFFF",
  surfaceAlt: "#FBFAF7",
} as const;

export const Fonts = {
  display:     "PlusJakartaSans_800ExtraBold",
  displayItalic:"PlusJakartaSans_700Bold",
  body:        "DMSans_400Regular",
  bodyMedium:  "DMSans_500Medium",
  bodySemiBold:"DMSans_600SemiBold",
  bodyLight:   "DMSans_300Light",
} as const;

export const Spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl:64,
} as const;

export const Radius = {
  xs:  6,
  sm:  10,
  md:  14,
  lg:  20,
  xl:  28,
  xxl: 36,
  full:999,
} as const;

export const Shadow = {
  xs: {
    shadowColor: "#16232E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: "#16232E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#16232E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#16232E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: "#16232E",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },
} as const;
