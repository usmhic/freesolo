import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card, ProgressBar, Logo } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const FILTERS = [
  { id: "all",     label: "All",       emoji: "✦" },
  { id: "art",     label: "Art",       emoji: "🎨" },
  { id: "food",    label: "Food",      emoji: "🍜" },
  { id: "music",   label: "Music",     emoji: "🎵" },
  { id: "photo",   label: "Photo",     emoji: "📸" },
  { id: "outdoor", label: "Outdoor",   emoji: "🥾" },
  { id: "history", label: "History",   emoji: "🏛️" },
];

interface Experience {
  id: string; emoji: string; title: string; city: string;
  date: string; time: string; category: string; price: number;
  filledSeats: number; maxSeats: number; minSeats: number;
  host: { id: string; name: string }; business: { name: string };
  status: string;
}

export default function FeedScreen({ navigation, route }: any) {
  const { city = "Lisbon", filter: initialFilter } = route?.params ?? {};
  const { user } = useAuth();
  const [filter, setFilter]       = useState(initialFilter ?? "all");
  const [experiences, setExp]     = useState<Experience[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const headerAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const cat = filter === "all" ? "" : FILTERS.find(f => f.id === filter)?.label ?? "";
    const { data, error: e } = await apiFetch<any>(`/api/experiences?city=${encodeURIComponent(city)}${cat ? `&category=${encodeURIComponent(cat)}` : ""}`);
    setLoading(false);
    if (e) { setError(e); setExp([]); return; }
    const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
    setExp(list);
  }, [city, filter]);

  useEffect(() => { load(); }, [load]);

  const displayed = experiences.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (user?.name ?? user?.email ?? "?")[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerCity}>{city}</Text>
          <Text style={styles.headerTitle}>Experiences</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.mapBtn} onPress={() => navigation.navigate("ExploreMap")}>
            <Text style={{ fontSize: 18 }}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate("Me")}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search experiences…"
            placeholderTextColor={Colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: Colors.muted, fontSize: 16, paddingLeft: 8 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filters ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.id} onPress={() => setFilter(f.id)} style={[styles.filterChip, filter === f.id && styles.filterChipActive]}>
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[styles.filterLabel, filter === f.id && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Feed ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.clay} size="large" />
          <Text style={styles.loadingText}>Finding experiences…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load experiences</Text>
          <Text style={styles.emptyBody}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyTitle}>Nothing found</Text>
              <Text style={styles.emptyBody}>Try a different city or filter</Text>
            </View>
          )}
          renderItem={({ item: exp }) => {
            const seatsLeft = exp.maxSeats - exp.filledSeats;
            const hot       = seatsLeft <= 2;
            const pct       = Math.min((exp.filledSeats / exp.maxSeats) * 100, 100);
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate("ExperienceDetail", { experienceId: exp.id, exp })}
              >
                <View style={styles.expCard}>
                  {hot && (
                    <LinearGradient
                      colors={["rgba(220,38,38,0.06)", "transparent"]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={styles.expTop}>
                    <View style={[styles.expIcon, hot && styles.expIconHot]}>
                      <Text style={{ fontSize: 24 }}>{exp.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.expTitle} numberOfLines={2}>{exp.title}</Text>
                      <Text style={styles.expMeta}>{exp.date} · {exp.time}</Text>
                    </View>
                    <View style={styles.expPriceBox}>
                      <Text style={styles.expPrice}>€{exp.price}</Text>
                      <Text style={styles.expPriceSub}>/person</Text>
                    </View>
                  </View>

                  {/* Host + venue */}
                  <View style={styles.hostRow}>
                    <TouchableOpacity
                      style={styles.hostIdentity}
                      activeOpacity={exp.host?.id ? 0.6 : 1}
                      disabled={!exp.host?.id}
                      onPress={() => navigation.navigate("UserProfile", { userId: exp.host.id })}
                    >
                      <View style={styles.hostBubble}>
                        <Text style={styles.hostBubbleText}>{exp.host?.name?.[0] ?? "H"}</Text>
                      </View>
                      <Text style={styles.hostName}>{exp.host?.name ?? "Local host"}</Text>
                    </TouchableOpacity>
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedText}>✓ verified</Text>
                    </View>
                    <Text style={styles.seatsRight}>{exp.filledSeats}/{exp.maxSeats}</Text>
                  </View>

                  {/* Progress */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: hot ? Colors.danger : Colors.clay }]} />
                    </View>
                  </View>

                  {hot && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotText}>🔥 Only {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left!</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerCity:  { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, fontWeight: "500" },
  headerTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.ink, letterSpacing: -0.5, marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 10, alignItems: "center" },
  mapBtn:  { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  avatarBtn: { width: 40, height: 40, backgroundColor: Colors.ink, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText:{ fontFamily: Fonts.display, fontSize: 16, color: Colors.paper },

  searchRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: Colors.sand, gap: 8 },
  searchIcon:  { fontSize: 15 },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.ink, padding: 0 },

  filterRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.sand, backgroundColor: Colors.white },
  filterChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  filterEmoji: { fontSize: 14 },
  filterLabel: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  filterLabelActive: { color: Colors.paper },

  list:   { paddingHorizontal: Spacing.lg, paddingBottom: 80, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: Spacing.xl },
  loadingText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted },
  retryBtn: { marginTop: 14, backgroundColor: Colors.ink, borderRadius: Radius.full, paddingHorizontal: 22, paddingVertical: 12 },
  retryText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.paper },
  empty:      { paddingTop: 80, alignItems: "center", gap: 8 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.ink },
  emptyBody:  { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, textAlign: "center" },

  expCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: 18, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.sand,
    ...Shadow.sm,
  },
  expTop:   { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  expIcon:  { width: 50, height: 50, backgroundColor: Colors.sand, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  expIconHot: { backgroundColor: "#FEF2F2" },
  expTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink, lineHeight: 21, flex: 1 },
  expMeta:  { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 3 },
  expPriceBox: { alignItems: "flex-end", minWidth: 50 },
  expPrice:    { fontFamily: Fonts.display, fontSize: 21, color: Colors.ink },
  expPriceSub: { fontFamily: Fonts.body, fontSize: 10, color: Colors.muted },

  hostRow:    { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  hostIdentity: { flexDirection: "row", alignItems: "center", gap: 7 },
  hostBubble: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center" },
  hostBubbleText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.white },
  hostName:   { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  verifiedTag:{ backgroundColor: "#E8F5E9", borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText:{ fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.success },
  seatsRight: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginLeft: "auto" },

  progressRow:   { marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: Colors.sand, borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 2 },

  hotBadge: { marginTop: 6, alignSelf: "flex-start", backgroundColor: "#FEF2F2", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  hotText:  { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.danger },
});
