import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Button, BackButton } from "../../components/UI";

const { width } = Dimensions.get("window");

const STEPS = [
  {
    icon: "🌍", color: "#B8976A",
    title: "Your city,\nyour expertise",
    body: "You live somewhere amazing. Become a local host and share it — hidden galleries, secret markets, sunrise hikes. Your knowledge is someone else's dream trip.",
  },
  {
    icon: "🤝", color: "#6B8F71",
    title: "Real people,\nreal experiences",
    body: "Every member is personally vetted. No bots, no tourists. Just curious, authentic people who travel to connect — not to Instagram.",
  },
  {
    icon: "💳", color: "#4A7FA5",
    title: "Pre-pay,\nshow up together",
    body: "Seats confirm only once the minimum group commits. FreeSolo holds the reservation — you settle with the venue directly, on the day.",
  },
  {
    icon: "✈️", color: "#B8976A",
    title: "Hosts open\ntheir own city",
    body: "Register a venue, publish an experience, and meet travelers who chose your city. FreeSolo brings you the group; you run the day.",
  },
];

export default function HowItWorksScreen({ navigation }: any) {
  const [step, setStep]   = useState(0);
  const fadeAnim          = useRef(new Animated.Value(1)).current;
  const slideAnim         = useRef(new Animated.Value(0)).current;
  const current           = STEPS[step];
  const isLast            = step === STEPS.length - 1;

  const goTo = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <TouchableOpacity onPress={() => navigation.navigate("TravelerEntry")}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Step content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Icon blob */}
        <View style={[styles.iconWrap, { shadowColor: current.color }]}>
          <View style={[styles.iconBg, { backgroundColor: `${current.color}18` }]}>
            <Text style={styles.icon}>{current.icon}</Text>
          </View>
        </View>

        <View style={styles.stepNumRow}>
          {STEPS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.heading}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {isLast ? (
          <Button label="Get started →" onPress={() => navigation.navigate("TravelerEntry")} />
        ) : (
          <Button label="Next →" onPress={() => goTo(step + 1)} />
        )}
        {step > 0 && (
          <Button label="Back" variant="ghost" onPress={() => goTo(step - 1)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  skip:   { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.muted },

  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: "center" },
  iconWrap: {
    alignSelf: "flex-start", marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  iconBg:  { width: 88, height: 88, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center" },
  icon:    { fontSize: 40 },

  stepNumRow: { flexDirection: "row", gap: 7, marginBottom: Spacing.xl },
  dot:       { height: 5, width: 22, borderRadius: 3, backgroundColor: Colors.sand },
  dotActive: { backgroundColor: Colors.ink, width: 32 },

  heading: {
    fontFamily: Fonts.display, fontSize: 38, color: Colors.ink,
    lineHeight: 46, marginBottom: Spacing.md, letterSpacing: -0.8,
    
  },
  body: {
    fontFamily: Fonts.body, fontSize: 16, color: Colors.muted,
    lineHeight: 26, fontWeight: "500",
  },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
});
