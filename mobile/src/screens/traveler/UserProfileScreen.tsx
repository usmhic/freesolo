import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card, BackButton } from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function UserProfileScreen({ navigation, route }: any) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await apiFetch<any>(`/api/users/${userId}`);
      setProfile(data);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={Colors.clay} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><BackButton onPress={() => navigation.goBack()} /></View>
        <View style={styles.center}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🧳</Text>
          <Text style={styles.emptyText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initial = (profile.name ?? "?")[0]?.toUpperCase() ?? "?";
  const memberSince = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.profileHeader}>
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.name}>{profile.name ?? "Traveler"}</Text>
          {profile.role === "business" && (
            <View style={styles.hostPill}><Text style={styles.hostPillText}>Local host</Text></View>
          )}
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile.countriesVisited ?? 0}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{profile.portfolio.length}</Text>
              <Text style={styles.statLabel}>Experiences</Text>
            </View>
            {memberSince ? (
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{memberSince}</Text>
                <Text style={styles.statLabel}>Member since</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          {profile.portfolio.length === 0 ? (
            <View style={styles.emptyPortfolio}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🧳</Text>
              <Text style={styles.emptyText}>No completed experiences yet</Text>
            </View>
          ) : profile.portfolio.map((p: any) => (
            <Card key={p.bookingId} style={styles.portfolioCard}>
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>📍 {p.experience.city}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{p.experience.emoji} {p.experience.category}</Text>
                </View>
              </View>
              <Text style={styles.expTitle}>{p.experience.title}</Text>
              <Text style={styles.expDate}>
                {p.experience.date}{p.experience.country ? ` · ${p.experience.country}` : ""}
              </Text>

              {p.review ? (
                <View style={styles.reviewBlock}>
                  <Text style={styles.reviewStars}>
                    {"★".repeat(p.review.rating)}{"☆".repeat(5 - p.review.rating)}
                  </Text>
                  <Text style={styles.reviewBody}>{p.review.body}</Text>
                </View>
              ) : null}

              {p.photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                  {p.photos.map((photo: any) => (
                    <Image key={photo.id} source={{ uri: photo.url }} style={styles.photoThumb} />
                  ))}
                </ScrollView>
              ) : null}
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  profileHeader: { alignItems: "center", paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: Colors.clay, marginBottom: 12 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarInitial: { fontFamily: Fonts.display, fontSize: 36, color: Colors.white },
  name: { fontFamily: Fonts.display, fontSize: 24, color: Colors.ink, letterSpacing: -0.3, textAlign: "center" },
  hostPill: { marginTop: 8, backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  hostPillText: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.clay },
  bio: { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, textAlign: "center", marginTop: 10, lineHeight: 21, paddingHorizontal: Spacing.md },
  statsRow: { flexDirection: "row", gap: 10, marginTop: Spacing.lg, width: "100%" },
  statBox: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, alignItems: "center", ...Shadow.sm },
  statVal: { fontFamily: Fonts.display, fontSize: 20, color: Colors.ink },
  statLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 2 },
  body: { paddingHorizontal: Spacing.lg },
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 12 },
  emptyPortfolio: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted },
  portfolioCard: { padding: 16, marginBottom: 12 },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  pill: { backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.ink },
  expTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.ink },
  expDate: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 3, marginBottom: 10 },
  reviewBlock: { borderTopWidth: 1, borderTopColor: Colors.sand, paddingTop: 10, marginTop: 4 },
  reviewStars: { color: Colors.warning, fontSize: 13, marginBottom: 4 },
  reviewBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 20 },
  photoRow: { marginTop: 12 },
  photoThumb: { width: 100, height: 100, borderRadius: Radius.md, marginRight: 8, backgroundColor: Colors.sand },
});
