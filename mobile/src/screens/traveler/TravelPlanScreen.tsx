import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing } from "../../theme";
import { Field, Button, Chip, ScreenHeader, Logo } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const INTERESTS = [
  "🎨 Art & Culture", "🍜 Food & Drink", "🥾 Outdoor & Nature",
  "🎵 Music & Nightlife", "📸 Photography", "🏛️ History",
  "🧘 Wellness", "🎭 Live Events", "🛖 Local Life", "📚 Learning",
];

// Maps a trip-plan interest onto the Explore feed's category filter chips
const INTEREST_TO_FILTER: Record<string, string> = {
  "🎨 Art & Culture": "art",
  "🍜 Food & Drink": "food",
  "🥾 Outdoor & Nature": "outdoor",
  "🎵 Music & Nightlife": "music",
  "📸 Photography": "photo",
  "🏛️ History": "history",
};

export default function TravelPlanScreen({ navigation }: any) {
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const toggle = (i: string) => setInterests(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  );

  const canContinue = !!(city.trim() && from && interests.length > 0);
  const initials = (user?.name ?? user?.email ?? "?")[0].toUpperCase();

  const goExplore = (exploreCity: string, filter?: string) => {
    navigation.navigate("Main", { screen: "Explore", params: { city: exploreCity, filter } });
  };

  const handleFindExperiences = () => {
    const filter = interests.map(i => INTEREST_TO_FILTER[i]).find(Boolean);
    goExplore(city.trim() || "Lisbon", filter);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Logo size={22} />
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          tag="Travel Plan"
          title={"Where are you\nheaded?"}
          subtitle="We'll find you experiences matched to your interests."
        />

        <Field
          label="City *"
          placeholder="e.g. Lisbon, Tokyo, Istanbul…"
          value={city}
          onChangeText={setCity}
        />

        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Field label="Arriving" placeholder="DD/MM/YYYY" value={from} onChangeText={setFrom} keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Leaving" placeholder="DD/MM/YYYY" value={to} onChangeText={setTo} keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <Text style={styles.label}>Your Interests * (pick any)</Text>
        <View style={styles.chips}>
          {INTERESTS.map(i => (
            <Chip key={i} label={i} active={interests.includes(i)} onPress={() => toggle(i)} />
          ))}
        </View>

        <Button
          label="Find Experiences →"
          onPress={handleFindExperiences}
          disabled={!canContinue}
        />
        <TouchableOpacity onPress={() => goExplore("Lisbon")} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontFamily: Fonts.display, fontSize: 15, color: Colors.paper },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  dateRow: { flexDirection: "row", gap: 12 },
  label: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8,
    textTransform: "uppercase", color: Colors.muted, marginBottom: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: Spacing.lg },
  skipBtn: { alignItems: "center", marginTop: -Spacing.xs, marginBottom: Spacing.sm },
  skipText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, textDecorationLine: "underline" },
});
