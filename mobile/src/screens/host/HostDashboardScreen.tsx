import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card, InfoBox, ProgressBar, ScreenHeader } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { isTrip, needsApproval, tripDays, whenLabel } from "../../lib/listing";
import { ListingCover } from "../../components/ListingCover";

interface HostedListing {
  listing: any;
  pendingRequests: number;
}

export default function HostDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<HostedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await apiFetch<HostedListing[]>("/api/hosting/listings");
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Reload whenever the tab regains focus, so new requests and new listings show up.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const approved = user?.status === "approved";
  const waiting = items.reduce((n, i) => n + i.pendingRequests, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.clay} />}
      >
        <ScreenHeader
          tag="Host"
          title={"Lead the\nnext one"}
          subtitle="Host a multi-day trip for a handful of vetted solo travelers — or a few hours at your venue."
        />

        {!approved ? (
          <InfoBox variant="warning">
            Hosting opens once your FreeSolo membership is approved.
          </InfoBox>
        ) : (
          <View style={styles.ctaRow}>
            <TouchableOpacity style={[styles.cta, styles.ctaPrimary]} activeOpacity={0.85}
              onPress={() => navigation.navigate("CreateExperience", { kind: "trip" })}>
              <Text style={styles.ctaEmoji}>🧭</Text>
              <Text style={[styles.ctaTitle, { color: Colors.paper }]}>Host a trip</Text>
              <Text style={[styles.ctaSub, { color: "rgba(245,240,232,0.7)" }]}>Several days, you pick the group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cta} activeOpacity={0.85}
              onPress={() => navigation.navigate("CreateExperience", { kind: "experience" })}>
              <Text style={styles.ctaEmoji}>✨</Text>
              <Text style={styles.ctaTitle}>Experience</Text>
              <Text style={styles.ctaSub}>A few hours at your venue</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Your listings{waiting > 0 ? ` · ${waiting} request${waiting !== 1 ? "s" : ""} waiting` : ""}
        </Text>

        {loading ? (
          <ActivityIndicator color={Colors.clay} style={{ marginTop: Spacing.lg }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🗺️</Text>
            <Text style={styles.emptyText}>Nothing hosted yet. Your trips and experiences will show up here.</Text>
          </View>
        ) : items.map(({ listing: l, pendingRequests }) => {
          const days = isTrip(l) ? tripDays(l) : null;
          const short = Math.max(0, l.minSeats - l.filledSeats);
          return (
            <TouchableOpacity key={l.id} activeOpacity={0.88}
              onPress={() => navigation.navigate("HostRequests", { experienceId: l.id, title: l.title })}>
              <Card style={styles.card}>
                <View style={styles.cardTop}>
                  <ListingCover listing={l} style={styles.icon} emojiSize={24} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kind}>{isTrip(l) ? `Trip${days ? ` · ${days} days` : ""}` : "Experience"}</Text>
                    <Text style={styles.title} numberOfLines={2}>{l.title}</Text>
                    <Text style={styles.meta}>{l.city} · {whenLabel(l)}</Text>
                  </View>
                  {pendingRequests > 0 && (
                    <View style={styles.badge}><Text style={styles.badgeText}>{pendingRequests}</Text></View>
                  )}
                </View>
                <ProgressBar filled={l.filledSeats} total={l.maxSeats} />
                <Text style={styles.foot}>
                  {l.filledSeats}/{l.maxSeats} going · {short > 0 ? `needs ${short} more to confirm` : "✓ confirmed"}
                  {needsApproval(l) ? " · you approve joins" : ""}
                  {l.status !== "active" ? ` · ${l.status}` : ""}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 100 },
  ctaRow: { flexDirection: "row", gap: 12, marginBottom: Spacing.lg },
  cta: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.sand, padding: 16, ...Shadow.sm },
  ctaPrimary: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  ctaEmoji: { fontSize: 26, marginBottom: 10 },
  ctaTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.ink },
  ctaSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 3, lineHeight: 16 },
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 10 },
  empty: { alignItems: "center", paddingVertical: Spacing.xl },
  emptyText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, textAlign: "center", lineHeight: 19 },
  card: { padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  icon: { width: 56, height: 56, borderRadius: Radius.md },
  kind: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: Colors.clay },
  title: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink, marginTop: 2 },
  meta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  badge: { minWidth: 26, height: 26, borderRadius: 13, backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.white },
  foot: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 6 },
});
