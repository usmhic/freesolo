import React from "react";
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet,
  ViewStyle, TextStyle,
} from "react-native";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../theme";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "google";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
}

interface FieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  rows?: number;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric" | "numbers-and-punctuation";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: ViewStyle;
}

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface ProgressBarProps {
  filled: number;
  total: number;
  warn?: boolean;
}

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: "neutral" | "warning" | "success";
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
// `light` = sitting on a dark (ink) background, so use the logo-dark mark
// (which carries its own dark backing) and light wordmark text — and vice versa.
export function Logo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  const color = light ? Colors.paper : Colors.ink;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image
        source={light ? require("../../assets/logo-dark.png") : require("../../assets/logo.png")}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="cover"
      />
      <Text style={{
        fontFamily: Fonts.display,
        fontSize: size * 0.88,
        color,
        letterSpacing: -0.5,
      }}>FreeSolo</Text>
    </View>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ label, onPress, variant = "primary", disabled = false, loading = false, icon, style }: ButtonProps) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isGhost   = variant === "ghost";
  const isGoogle  = variant === "google";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        isOutline && styles.btnOutline,
        isGhost   && styles.btnGhost,
        isGoogle  && styles.btnGoogle,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.paper : Colors.ink} size="small" />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon ? <Text style={{ fontSize: 16 }}>{icon}</Text> : null}
          <Text style={[
            styles.btnText,
            isPrimary             && styles.btnTextPrimary,
            (isOutline || isGhost || isGoogle) && styles.btnTextDark,
          ]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label, placeholder, value, onChangeText,
  multiline = false, rows = 4,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "sentences",
  style,
}: FieldProps) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        multiline={multiline}
        numberOfLines={multiline ? rows : 1}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[
          styles.field,
          multiline && { height: rows * 24 + 20, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active && styles.chipActive]}
      disabled={!onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, Shadow.sm, style]}>{children}</View>;
}

// ─── ScreenHeader ─────────────────────────────────────────────────────────────
interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  tag?: string;
}
export function ScreenHeader({ title, subtitle, tag }: ScreenHeaderProps) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {tag    ? <Text style={styles.tag}>{tag}</Text>           : null}
      {title  ? <Text style={styles.heading}>{title}</Text>     : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ filled, total, warn = false }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: warn ? Colors.terra : Colors.clay }]} />
    </View>
  );
}

// ─── InfoBox ──────────────────────────────────────────────────────────────────
export function InfoBox({ children, variant = "neutral" }: InfoBoxProps) {
  const bg     = variant === "warning" ? "#FFF8E1" : variant === "success" ? "#E8F5E9" : Colors.sand;
  const border = variant === "warning" ? Colors.warning : variant === "success" ? Colors.success : Colors.clay;
  return (
    <View style={[styles.infoBox, { backgroundColor: bg, borderLeftColor: border }]}>
      {typeof children === "string"
        ? <Text style={styles.infoText}>{children}</Text>
        : children}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label ? <Text style={styles.dividerText}>{label}</Text> : null}
      <View style={styles.dividerLine} />
    </View>
  );
}

// ─── BackButton ───────────────────────────────────────────────────────────────
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn} activeOpacity={0.7}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  btnPrimary:  { backgroundColor: Colors.ink },
  btnOutline:  { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.ink },
  btnGhost:    { backgroundColor: Colors.sand },
  btnGoogle:   { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.sand, ...Shadow.sm },
  btnDisabled: { opacity: 0.4 },
  btnText:        { fontFamily: Fonts.bodySemiBold, fontSize: 15, letterSpacing: 0.2 },
  btnTextPrimary: { color: Colors.paper },
  btnTextDark:    { color: Colors.ink },

  field: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.sand,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.muted,
    marginBottom: 6,
  },

  chip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.sand, backgroundColor: Colors.white, marginRight: 8, marginBottom: 8 },
  chipActive:    { backgroundColor: Colors.ink, borderColor: Colors.ink },
  chipText:      { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  chipTextActive:{ color: Colors.paper },

  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, overflow: "hidden" },

  tag:      { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: Colors.clay, marginBottom: 8 },
  heading:  { fontFamily: Fonts.display, fontSize: 32, color: Colors.ink, lineHeight: 40, letterSpacing: -0.5 },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, lineHeight: 22, marginTop: 6 },

  progressTrack: { backgroundColor: Colors.sand, borderRadius: 4, height: 4, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 4 },

  infoBox:  { borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, marginBottom: Spacing.md },
  infoText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.ink, lineHeight: 20 },

  divider:     { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.sand },
  dividerText: { fontSize: 12, color: Colors.muted, fontFamily: Fonts.body },

  backBtn:   { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  backArrow: { fontSize: 18, color: Colors.ink },
});
