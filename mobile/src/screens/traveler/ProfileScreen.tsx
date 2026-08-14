import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card, Logo } from "../../components/UI";
import { apiFetch, uploadImage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadedBookings, setLoadedBookings] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    const { data } = await apiFetch<any[]>("/api/bookings");
    if (data) setBookings(Array.isArray(data) ? data : []);
    setRefreshing(false);
    setLoadedBookings(true);
  }, []);

  React.useEffect(() => { onRefresh(); }, []);

  const [marketingOptIn, setMarketingOptIn] = useState(user?.marketingOptIn ?? true);

  React.useEffect(() => {
    if (user?.marketingOptIn !== undefined) setMarketingOptIn(user.marketingOptIn);
  }, [user?.marketingOptIn]);

  const toggleMarketingOptIn = async (value: boolean) => {
    setMarketingOptIn(value);
    await apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify({ marketingOptIn: value }) });
    await refreshUser();
  };

  const uploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const url = await uploadImage(result.assets[0].uri, "avatar");
    if (url) {
      await apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify({ image: url }) });
      await refreshUser();
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: async () => { await logout(); navigation.replace("Who"); } },
    ]);
  };

  const upcoming = bookings.filter(b => ["pending","confirmed"].includes(b.status));
  const past     = bookings.filter(b => ["completed","cancelled"].includes(b.status));
  const displayed = tab === "upcoming" ? upcoming : past;

  if (!user) return null;

  if (!loadedBookings) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={Colors.clay} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.clay} />}
      >
        {/* Header gradient */}
        <LinearGradient colors={[Colors.ink, "#1e1a14"]} style={styles.headerGrad}>
          <View style={styles.headerTop}>
            <Logo size={22} light />
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <TouchableOpacity onPress={uploadAvatar} style={styles.avatarWrapper} activeOpacity={0.85}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{(user.name ?? user.email)[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.avatarEdit}><Text style={{ fontSize: 12 }}>📷</Text></View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name ?? "Traveler"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusPill, user.status === "approved" ? styles.statusApproved : styles.statusPending]}>
              <Text style={styles.statusText}>{user.status === "approved" ? "✓ Verified member" : "⏳ Pending approval"}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Credits card */}
          <Card style={styles.creditsCard}>
            <View style={styles.creditsRow}>
              <View>
                <Text style={styles.creditsLabel}>Travel Credits</Text>
                <Text style={styles.creditsAmount}>€{user.travelCredits.toFixed(0)}</Text>
                <Text style={styles.creditsSub}>Earned from hosting</Text>
              </View>
              <Text style={{ fontSize: 40 }}>✈️</Text>
            </View>
            <View style={styles.creditsBarBg}>
              <View style={[styles.creditsBarFill, { width: `${Math.min(user.travelCredits / 500 * 100, 100)}%` }]} />
            </View>
            <Text style={styles.creditsBarLabel}>{user.travelCredits}/500 to next reward tier</Text>
          </Card>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Bookings", value: bookings.length },
              { label: "Countries", value: user.countriesVisited ?? 0 },
              { label: "Credits €", value: user.travelCredits.toFixed(0) },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            {[
              { icon: "🗺️", label: "Explore map", screen: "ExploreMap" },
              { icon: "🔔", label: "Notifications", screen: "Notifications" },
              { icon: "✨", label: "Host experience", screen: "CreateExperience" },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.screen)} style={styles.actionBtn}>
                <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {["upcoming","past"].map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t as any)} style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past trips (${past.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bookings list */}
          {displayed.length === 0 ? (
            <View style={styles.emptyTrips}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>{tab === "upcoming" ? "🎒" : "🌍"}</Text>
              <Text style={styles.emptyText}>{tab === "upcoming" ? "No upcoming trips yet" : "No past trips yet"}</Text>
              {tab === "upcoming" && (
                <TouchableOpacity onPress={() => navigation.navigate("Explore")} style={styles.exploreBtn}>
                  <Text style={styles.exploreBtnText}>Find an experience</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : displayed.map(b => (
            <Card key={b.id} style={styles.tripCard}>
              <View style={styles.tripRow}>
                <View style={styles.tripEmoji}>
                  <Text style={{ fontSize: 22 }}>{b.experience?.emoji ?? "🌍"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripTitle}>{b.experience?.title ?? "Experience"}</Text>
                  <Text style={styles.tripMeta}>{b.experience?.city} · {b.experience?.date}</Text>
                  <Text style={styles.tripPrice}>€{b.amountTotal}</Text>
                </View>
                <View style={[styles.tripBadge,
                  b.status === "confirmed" && styles.badgeGreen,
                  b.status === "pending" && styles.badgeAmber,
                  (b.status === "completed" || b.status === "cancelled") && styles.badgeGrey,
                ]}>
                  <Text style={[styles.tripBadgeText,
                    b.status === "confirmed" && { color: Colors.success },
                    b.status === "pending" && { color: Colors.warning },
                    b.status === "completed" && { color: Colors.muted },
                    b.status === "cancelled" && { color: Colors.danger },
                  ]}>
                    {b.status === "confirmed" ? "✓ Confirmed"
                      : b.status === "pending" ? "Pending"
                      : b.status === "completed" ? "Done"
                      : "Cancelled"}
                  </Text>
                </View>
              </View>

              {b.experience?.city || b.experience?.category ? (
                <View style={styles.tripPillRow}>
                  {b.experience?.city ? (
                    <View style={styles.tripPill}><Text style={styles.tripPillText}>📍 {b.experience.city}</Text></View>
                  ) : null}
                  {b.experience?.category ? (
                    <View style={styles.tripPill}><Text style={styles.tripPillText}>{b.experience.emoji} {b.experience.category}</Text></View>
                  ) : null}
                </View>
              ) : null}

              {b.status === "completed" && !b.review && (
                <TouchableOpacity
                  style={styles.rateCta}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("RateExperience", { booking: b, onDone: onRefresh })}
                >
                  <Text style={styles.rateCtaText}>Rate & share →</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))}

          {/* Preferences */}
          <Card style={styles.prefsCard}>
            <View style={styles.prefsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prefsTitle}>Marketing emails</Text>
                <Text style={styles.prefsSub}>Tips, announcements & offers from FreeSolo</Text>
              </View>
              <Switch
                value={marketingOptIn}
                onValueChange={toggleMarketingOptIn}
                trackColor={{ false: Colors.sand, true: Colors.clay }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerGrad: { paddingBottom: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  logoutBtn: { padding: 8 },
  logoutText: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: "rgba(247,244,238,0.5)" },
  avatarWrapper: { alignSelf: "center", marginBottom: 12, position: "relative" },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: Colors.clay },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: Colors.clay + "80" },
  avatarInitial: { fontFamily: Fonts.display, fontSize: 36, color: Colors.white },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, backgroundColor: Colors.white, borderRadius: 14, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  userName: { fontFamily: Fonts.display, fontSize: 24, color: Colors.paper, textAlign: "center", letterSpacing: -0.3 },
  userEmail: { fontFamily: Fonts.body, fontSize: 13, color: "rgba(247,244,238,0.45)", textAlign: "center", marginTop: 4 },
  statusRow: { alignItems: "center", marginTop: 12 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.full },
  statusApproved: { backgroundColor: "rgba(122,158,126,0.25)" },
  statusPending: { backgroundColor: "rgba(196,168,130,0.2)" },
  statusText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.paper },
  body: { paddingHorizontal: Spacing.lg },
  creditsCard: { marginTop: -14, padding: 20, marginBottom: Spacing.md, ...Shadow.md },
  creditsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  creditsLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.clay, marginBottom: 4 },
  creditsAmount: { fontFamily: Fonts.display, fontSize: 36, color: Colors.ink },
  creditsSub: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted },
  creditsBarBg: { height: 6, backgroundColor: Colors.sand, borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  creditsBarFill: { height: "100%", backgroundColor: Colors.clay, borderRadius: 3 },
  creditsBarLabel: { fontFamily: Fonts.body, fontSize: 10, color: Colors.muted },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: Spacing.md },
  statBox: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, alignItems: "center", ...Shadow.sm },
  statVal: { fontFamily: Fonts.display, fontSize: 22, color: Colors.ink },
  statLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: Spacing.lg },
  actionBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, alignItems: "center", gap: 6, ...Shadow.sm },
  actionLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.ink, textAlign: "center" },
  tabs: { flexDirection: "row", backgroundColor: Colors.sand, borderRadius: Radius.md, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: Radius.sm - 2 },
  tabActive: { backgroundColor: Colors.white, ...Shadow.sm },
  tabText: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.muted },
  tabTextActive: { color: Colors.ink },
  emptyTrips: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted, marginBottom: 16 },
  exploreBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.ink, borderRadius: 10 },
  exploreBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.paper },
  tripCard: { padding: 14, marginBottom: 10 },
  tripRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tripEmoji: { width: 44, height: 44, backgroundColor: Colors.sand, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tripTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  tripMeta: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 2 },
  tripPrice: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.clay, marginTop: 2 },
  tripBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeGreen: { backgroundColor: "#E8F5E9" }, badgeAmber: { backgroundColor: "#FFF8E1" }, badgeGrey: { backgroundColor: Colors.sand },
  tripBadgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 10 },
  tripPillRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 10 },
  tripPill: { backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tripPillText: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.ink },
  rateCta: { marginTop: 10, alignSelf: "flex-start", backgroundColor: Colors.ink, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  rateCtaText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.paper },
  prefsCard: { padding: 16, marginTop: 4, marginBottom: 10 },
  prefsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  prefsTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  prefsSub: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 2 },
});
