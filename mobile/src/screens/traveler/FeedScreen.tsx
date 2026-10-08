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
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Logo } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { isTrip, needsApproval, tripDays, whenLabel } from "../../lib/listing";
import { ListingCover } from "../../components/ListingCover";

const KINDS = [
  { id: "all",        label: "Everything",     title: "Explore" },
  { id: "trip",       label: "🧭 Trips",       title: "Group trips" },
  { id: "experience", label: "✨ Experiences", title: "Experiences" },
] as const;
type KindId = typeof KINDS[number]["id"];

const FILTERS = [
  { id: "all",     label: "Any topic", emoji: "✦" },
  { id: "art",     label: "Art",       emoji: "🎨" },
  { id: "food",    label: "Food",      emoji: "🍜" },
  { id: "music",   label: "Music",     emoji: "🎵" },
  { id: "photo",   label: "Photo",     emoji: "📸" },
  { id: "outdoor", label: "Outdoor",   emoji: "🥾" },
  { id: "history", label: "History",   emoji: "🏛️" },
];

interface Experience {
  id: string; kind: string; emoji: string; title: string; city: string;
  date: string; endDate: string | null; time: string; category: string; price: number; joinPolicy: string;
  coverImage: string | null;
  filledSeats: number; maxSeats: number; minSeats: number;
  host: { id: string; name: string }; business: { name: string };
  status: string;
}

export default function FeedScreen({ navigation, route }: any) {
  const { city = "Lisbon", filter: initialFilter } = route?.params ?? {};
  const { user } = useAuth();
  const [filter, setFilter]       = useState(initialFilter ?? "all");
  const [kind, setKind]           = useState<KindId>("all");
  const [experiences, setExp]     = useState<Experience[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const headerAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const cat = filter === "all" ? "" : FILTERS.find(f => f.id === filter)?.label ?? "";
    const { data, error: e } = await apiFetch<any>(`/api/experiences?city=${encodeURIComponent(city)}${cat ? `&category=${encodeURIComponent(cat)}` : ""}${kind !== "all" ? `&kind=${kind}` : ""}`);
    setLoading(false);
    if (e) { setError(e); setExp([]); return; }
    const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
    setExp(list);
  }, [city, filter, kind]);

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
          <Text style={styles.headerCity}>{city ? `📍 ${city}` : "Leaving soon"}</Text>
          <Text style={styles.headerTitle}>{KINDS.find(k => k.id === kind)?.title}</Text>
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

      {/* ── Trips / experiences ── */}
      <View style={styles.kindRow}>
        {KINDS.map(k => (
          <TouchableOpacity key={k.id} onPress={() => setKind(k.id)} style={[styles.kindBtn, kind === k.id && styles.kindBtnActive]}>
            <Text style={[styles.kindText, kind === k.id && styles.kindTextActive]}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={kind === "trip" ? "Search trips…" : "Search experiences…"}
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
          <Text style={styles.loadingText}>{kind === "trip" ? "Finding trips…" : "Finding experiences…"}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load listings</Text>
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
              <Text style={styles.emptyBody}>
                {kind === "trip" ? "No trips leaving from here yet — or host the first one." : "Try a different city or filter"}
              </Text>
            </View>
          )}
          renderItem={({ item: exp }) => {
            const seatsLeft = exp.maxSeats - exp.filledSeats;
            const hot       = seatsLeft <= 2;
            const pct       = Math.min((exp.filledSeats / exp.maxSeats) * 100, 100);
            const trip      = isTrip(exp);
            const days      = trip ? tripDays(exp) : null;
            const short     = Math.max(0, exp.minSeats - exp.filledSeats);
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate("ExperienceDetail", { experienceId: exp.id, exp })}
              >
                <View style={styles.card}>
                  <ListingCover listing={exp} style={styles.cardCover} emojiSize={52}>
                    <View style={styles.coverRow}>
                      <View style={styles.kindPill}>
                        <Text style={styles.kindPillText}>
                          {trip ? `Trip${days ? ` · ${days} days` : ""}` : "Experience"}
                        </Text>
                      </View>
                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>€{exp.price}</Text>
                      </View>
                    </View>
                  </ListingCover>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardMeta}>📅 {whenLabel(exp)}  ·  📍 {exp.city}</Text>
                    <Text style={styles.cardTitle} numberOfLines={2}>{exp.title}</Text>

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
                        <Text style={styles.hostName} numberOfLines={1}>{exp.host?.name ?? "Local host"}</Text>
                      </TouchableOpacity>
                      {needsApproval(exp) && (
                        <View style={styles.vettedTag}>
                          <Text style={styles.vettedText}>🛡 host picks</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: hot ? Colors.terra : Colors.clay }]} />
                    </View>
                    <View style={styles.seatsRow}>
                      <Text style={styles.seatsText}>{exp.filledSeats}/{exp.maxSeats} going</Text>
                      <Text style={[styles.seatsText, hot && styles.seatsHot]}>
                        {seatsLeft <= 0 ? "Group is full"
                          : short > 0 ? `${short} more to confirm`
                          : hot ? `Only ${seatsLeft} left`
                          : "Confirmed ✓"}
                      </Text>
                    </View>
                  </View>
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

  kindRow: {
    flexDirection: "row", marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, padding: 4,
    backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.sand,
  },
  kindBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: Radius.sm },
  kindBtnActive: { backgroundColor: Colors.ink },
  kindText: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  kindTextActive: { color: Colors.paper },

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


  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, overflow: "hidden", borderWidth: 1, borderColor: Colors.sand, ...Shadow.sm },
  cardCover: { height: 168 },
  coverRow: { flexDirection: "row", justifyContent: "space-between", padding: 12 },
  kindPill: { backgroundColor: "rgba(0,0,0,0.55)", borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  kindPillText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: Colors.white },
  pricePill: { backgroundColor: "rgba(255,255,255,0.94)", borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  pricePillText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink },
  cardBody: { padding: 16, paddingTop: 14 },
  cardMeta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  cardTitle: { fontFamily: Fonts.display, fontSize: 19, lineHeight: 25, color: Colors.ink, marginTop: 4, marginBottom: 12, letterSpacing: -0.2 },
  seatsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  seatsText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted },
  seatsHot: { fontFamily: Fonts.bodySemiBold, color: Colors.terra },
  hostRow:    { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  hostIdentity: { flexDirection: "row", alignItems: "center", gap: 7 },
  hostBubble: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center" },
  hostBubbleText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.white },
  hostName:   { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, flexShrink: 1 },
  vettedTag:  { marginLeft: "auto", backgroundColor: Colors.sand, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  vettedText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.ink },

  progressTrack: { height: 4, backgroundColor: Colors.sand, borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 2 },

});
