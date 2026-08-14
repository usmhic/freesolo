import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Logo } from "../../components/UI";

export default function WhoScreen({ navigation }: any) {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  const press = (anim: Animated.Value, cb: () => void) => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 0.97, useNativeDriver: true, tension: 300 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 300 }),
    ]).start(cb);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo size={26} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.heading}>I am a…</Text>
          <Text style={styles.sub}>
            Choose your path. Every FreeSolo journey starts here.
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          <Animated.View style={{ transform: [{ scale: scale1 }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => press(scale1, () => navigation.navigate("HowItWorks"))}
              style={styles.cardDark}
            >
              {/* Decorative blob */}
              <View style={styles.cardBlob} />
              <Text style={styles.cardEmoji}>🎒</Text>
              <Text style={styles.cardTitleLight}>Solo Traveler</Text>
              <Text style={styles.cardBodyLight}>
                Discover authentic experiences & meet like-minded people wherever you go
              </Text>
              <View style={styles.cardCta}>
                <Text style={styles.cardCtaText}>Get started</Text>
                <Text style={{ color: Colors.clay, fontSize: 18 }}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scale2 }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => press(scale2, () => navigation.navigate("BusinessOnboarding"))}
              style={styles.cardLight}
            >
              <Text style={styles.cardEmoji}>🏢</Text>
              <Text style={styles.cardTitleDark}>Business / Venue</Text>
              <Text style={styles.cardBodyDark}>
                Host experiences & reach curious travelers from around the world
              </Text>
              <View style={[styles.cardCta, { borderTopColor: Colors.sand }]}>
                <Text style={[styles.cardCtaText, { color: Colors.muted }]}>Register venue</Text>
                <Text style={{ color: Colors.muted, fontSize: 18 }}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our{" "}
          <Text style={styles.termsLink}>Terms</Text>
          {" "}& <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.paper },
  scrollContent: {
    flexGrow: 1, justifyContent: "center",
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl,
  },
  header:      { paddingVertical: Spacing.md },
  titleBlock:  { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.5,
    textTransform: "uppercase", color: Colors.clay, marginBottom: 10,
  },
  heading: {
    fontFamily: Fonts.display, fontSize: 44, color: Colors.ink,
    letterSpacing: -1, lineHeight: 50, marginBottom: 10,
  },
  sub: {
    fontFamily: Fonts.body, fontSize: 15, color: Colors.muted,
    lineHeight: 22,
  },
  cards: { gap: 14 },

  cardDark: {
    backgroundColor: Colors.ink, borderRadius: Radius.xl,
    padding: 28, overflow: "hidden", position: "relative",
    ...Shadow.lg,
  },
  cardBlob: {
    position: "absolute", width: 160, height: 160,
    borderRadius: 80, backgroundColor: Colors.clay,
    opacity: 0.08, right: -40, top: -40,
  },
  cardLight: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: 28, borderWidth: 1.5, borderColor: Colors.sand,
    ...Shadow.sm,
  },
  cardEmoji:      { fontSize: 30, marginBottom: 14 },
  cardTitleLight: { fontFamily: Fonts.display, fontSize: 26, color: Colors.paper, marginBottom: 8, letterSpacing: -0.3 },
  cardTitleDark:  { fontFamily: Fonts.display, fontSize: 26, color: Colors.ink, marginBottom: 8, letterSpacing: -0.3 },
  cardBodyLight:  { fontFamily: Fonts.body, fontSize: 14, color: "rgba(245,240,232,0.52)", lineHeight: 21 },
  cardBodyDark:   { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, lineHeight: 21 },
  cardCta: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(245,240,232,0.1)",
  },
  cardCtaText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.clay },

  terms:     { textAlign: "center", fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: Spacing.lg, lineHeight: 18 },
  termsLink: { color: Colors.ink, fontFamily: Fonts.bodyMedium },
});
