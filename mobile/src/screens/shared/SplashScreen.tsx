import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../theme";
import { useAuth } from "../../context/AuthContext";

const MIN_SPLASH_MS = 2600;

export default function SplashScreen({ navigation }: any) {
  const insets   = useSafeAreaInsets();
  const { isAuthenticated, loading } = useAuth();
  const opacity  = useRef(new Animated.Value(0)).current;
  const slideUp  = useRef(new Animated.Value(24)).current;
  const scale    = useRef(new Animated.Value(0.9)).current;
  const mountTime = useRef(Date.now()).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp,  { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(scale,    { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    const elapsed = Date.now() - mountTime;
    const wait = Math.max(MIN_SPLASH_MS - elapsed, 0);

    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
        navigation.replace(isAuthenticated ? "Main" : "Who")
      );
    }, wait);
    return () => clearTimeout(t);
  }, [loading, isAuthenticated]);

  return (
    <LinearGradient colors={[Colors.ink, "#1A1208", "#0A0A0A"]} style={styles.container}>
      {/* Decorative rings */}
      <View style={styles.ring1} />
      <View style={styles.ring2} />

      <Animated.View style={[styles.content, { opacity, transform: [{ translateY: slideUp }, { scale }] }]}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>F</Text>
        </View>

        <Text style={styles.wordmark}>
          Free<Text style={styles.wordmarkAccent}>Solo</Text>
        </Text>

        <View style={styles.taglineRow}>
          {["Meet.", "Explore.", "Experience."].map((w, i) => (
            <Text key={w} style={[styles.taglineWord, i === 1 && styles.taglineWordMid]}>{w}</Text>
          ))}
        </View>
      </Animated.View>

      {/* Dots */}
      <Animated.View style={[styles.dots, { opacity, bottom: insets.bottom + 32 }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: "center", justifyContent: "center" },
  ring1: {
    position: "absolute", width: 340, height: 340, borderRadius: 170,
    borderWidth: 1, borderColor: "rgba(184,151,106,0.08)",
    top: "25%", right: "-20%",
  },
  ring2: {
    position: "absolute", width: 260, height: 260, borderRadius: 130,
    borderWidth: 1, borderColor: "rgba(107,143,113,0.06)",
    bottom: "20%", left: "-15%",
  },
  content:   { alignItems: "center", gap: 16 },
  logoMark: {
    width: 76, height: 76, backgroundColor: Colors.paper,
    borderRadius: 22, alignItems: "center", justifyContent: "center",
    marginBottom: 8,
    shadowColor: Colors.clay, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  logoMarkText: {
    fontFamily: Fonts.displayItalic, fontSize: 42,
    color: Colors.ink, lineHeight: 48,
  },
  wordmark: {
    fontFamily: Fonts.display, fontSize: 44,
    color: Colors.paper, letterSpacing: -1,
  },
  wordmarkAccent: { fontStyle: "italic", color: Colors.clay },
  taglineRow:  { flexDirection: "row", gap: 8, marginTop: 4 },
  taglineWord: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: "rgba(245,240,232,0.38)", letterSpacing: 0.4 },
  taglineWordMid:{ color: Colors.clay },
  dots: { position: "absolute", flexDirection: "row", gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(245,240,232,0.18)" },
  dotActive: { width: 22, borderRadius: 3, backgroundColor: Colors.clay },
});
