import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, Spacing, Radius } from "../../theme";
import { Button } from "../../components/UI";

export default function ConfirmedScreen({ navigation, route }: any) {
  const { exp, bookingId, seats = 1 } = route?.params ?? {};
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={[Colors.ink, "#1A1208", "#0A0A0A"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Decorative ring */}
        <View style={styles.ring} />

        <View style={styles.content}>
          <Animated.View style={[styles.emojiWrap, { transform: [{ scale }], opacity }]}>
            <Text style={styles.emoji}>🎉</Text>
          </Animated.View>

          <Animated.View style={{ opacity, transform: [{ translateY: slideUp }] }}>
            <Text style={styles.heading}>You're in!</Text>
            <Text style={styles.sub}>
              Your seat is reserved. We'll confirm once the minimum group fills. You'll get a notification immediately.
            </Text>
          </Animated.View>

          {exp && (
            <Animated.View style={[styles.summaryCard, { opacity, transform: [{ translateY: slideUp }] }]}>
              <Text style={styles.summaryEmoji}>{exp.emoji}</Text>
              <Text style={styles.summaryTitle}>{exp.title}</Text>
              <Text style={styles.summaryMeta}>{exp.date} · {exp.time} · {exp.city}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                  <Text style={styles.summaryPillText}>{seats} seat{seats !== 1 ? "s" : ""}</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        <Animated.View style={[styles.footer, { opacity }]}>
          <Button
            label="Browse more experiences"
            variant="outline"
            onPress={() => navigation.navigate("Main", { screen: "Explore" })}
            style={{ borderColor: "rgba(245,240,232,0.25)" }}
          />
          <Button
            label="View my bookings →"
            onPress={() => navigation.navigate("Main", { screen: "Me" })}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe:     { flex: 1, paddingHorizontal: Spacing.lg },
  ring: {
    position: "absolute", width: 400, height: 400, borderRadius: 200,
    borderWidth: 1, borderColor: "rgba(184,151,106,0.1)",
    top: "10%", right: "-30%", pointerEvents: "none",
  } as any,
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  emojiWrap: {
    width: 96, height: 96, borderRadius: 30,
    backgroundColor: "rgba(245,240,232,0.08)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(245,240,232,0.12)",
  },
  emoji:   { fontSize: 48 },
  heading: { fontFamily: Fonts.display, fontSize: 44, color: Colors.paper, letterSpacing: -1, textAlign: "center" },
  sub: {
    fontFamily: Fonts.body, fontSize: 15, color: "rgba(245,240,232,0.48)",
    textAlign: "center", lineHeight: 24, maxWidth: 300, fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "rgba(245,240,232,0.06)", borderRadius: Radius.xl,
    padding: 22, alignItems: "center", gap: 8, width: "100%",
    borderWidth: 1, borderColor: "rgba(245,240,232,0.1)",
  },
  summaryEmoji: { fontSize: 30, marginBottom: 4 },
  summaryTitle: { fontFamily: Fonts.bodyMedium, fontSize: 16, color: Colors.paper, textAlign: "center" },
  summaryMeta:  { fontFamily: Fonts.body, fontSize: 13, color: "rgba(245,240,232,0.4)", textAlign: "center" },
  summaryRow:   { flexDirection: "row", gap: 8, marginTop: 4 },
  summaryPill:  { backgroundColor: "rgba(245,240,232,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  summaryPillAmt:{ backgroundColor: Colors.clay },
  summaryPillText:{ fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.paper },
  footer: { paddingBottom: Spacing.xl, gap: 0 },
});
