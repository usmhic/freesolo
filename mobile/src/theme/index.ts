export const Colors = {
  // Core palette
  ink:     "#0A0A0A",
  paper:   "#F5F0E8",
  sand:    "#E6DDD0",
  clay:    "#B8976A",
  terra:   "#8B4513",
  sage:    "#6B8F71",
  sky:     "#4A7FA5",
  white:   "#FFFFFF",
  muted:   "#8A8278",
  // Semantic
  danger:  "#DC2626",
  success: "#2D7D46",
  warning: "#D97706",
  // Surfaces
  surface: "#FFFFFF",
  surfaceAlt: "#FAF7F2",
} as const;

export const Fonts = {
  display:     "PlayfairDisplay_700Bold",
  displayItalic:"PlayfairDisplay_400Regular_Italic",
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
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },
} as const;
