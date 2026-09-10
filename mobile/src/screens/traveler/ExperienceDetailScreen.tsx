import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "../../components/Map";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Button, Card, ProgressBar } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function ExperienceDetailScreen({ navigation, route }: any) {
  const { experienceId } = route.params;
  const { user } = useAuth();
  const [exp, setExp] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: revData }] = await Promise.all([
        apiFetch(`/api/experiences/${experienceId}`),
        apiFetch(`/api/reviews?experienceId=${experienceId}`),
      ]);
      setExp(data);
      setReviews((revData as any) ?? []);
      setLoading(false);
    })();
  }, [experienceId]);

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}><ActivityIndicator color={Colors.clay} size="large" /></View>
    </SafeAreaView>
  );
  if (!exp) return null;

  const seatsLeft = exp.maxSeats - (exp.filledSeats ?? 0);
  const hostInitial = (exp.host?.name ?? "H")[0].toUpperCase();
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 52 }}>{exp.emoji}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Category pill */}
          <View style={styles.catPill}>
            <Text style={styles.catText}>{exp.category}</Text>
          </View>

          <Text style={styles.title}>{exp.title}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>📅 {exp.date}</Text>
            <Text style={styles.meta}>🕐 {exp.time}</Text>
            <Text style={styles.meta}>⏱ {exp.durationMins ?? 120}min</Text>
          </View>

          {/* Host card */}
          <Card style={styles.hostCard}>
            <TouchableOpacity
              style={styles.hostRow}
              activeOpacity={exp.host?.id ? 0.7 : 1}
              disabled={!exp.host?.id}
              onPress={() => navigation.navigate("UserProfile", { userId: exp.host.id })}
            >
              <View style={styles.hostAvatar}>
                <Text style={styles.hostAvatarText}>{hostInitial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hostName}>{exp.host?.name ?? "Local host"}</Text>
                <Text style={styles.hostSub}>Verified local host · {exp.city}</Text>
              </View>
              {avgRating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {avgRating}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card>

          {/* Seats */}
          <Card style={styles.seatsCard}>
            <View style={styles.seatsRow}>
              <View>
                <Text style={styles.seatsLabel}>Available seats</Text>
                <Text style={[styles.seatsNum, seatsLeft <= 2 && { color: Colors.terra }]}>{seatsLeft}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.seatsLabel}>Price per person</Text>
                <Text style={styles.priceNum}>€{exp.price}</Text>
              </View>
            </View>
            <ProgressBar filled={exp.filledSeats ?? 0} total={exp.maxSeats} warn={seatsLeft <= 2} />
            <Text style={styles.seatsSubtext}>{exp.filledSeats ?? 0}/{exp.maxSeats} spots filled · min {exp.minSeats} to confirm</Text>
          </Card>

          {/* Description */}
          <Text style={styles.sectionTitle}>About this experience</Text>
          <Text style={styles.description}>{exp.description}</Text>

          {/* Venue */}
          {exp.business && (
            <>
              <Text style={styles.sectionTitle}>Venue</Text>
              <Card style={styles.venueCard}>
                <Text style={styles.venueName}>{exp.business.name}</Text>
                <Text style={styles.venueAddress}>{exp.business.address}</Text>
              </Card>
            </>
          )}

          {/* MAP */}
          {exp.lat && exp.lng ? (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: exp.lat, longitude: exp.lng,
                    latitudeDelta: 0.01, longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                >
                  <Marker
                    coordinate={{ latitude: exp.lat, longitude: exp.lng }}
                    title={exp.business?.name ?? exp.title}
                  />
                </MapView>
              </View>
            </>
          ) : null}

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 3).map((r: any) => (
                <Card key={r.id} style={styles.reviewCard}>
                  <TouchableOpacity
                    style={styles.reviewHeader}
                    activeOpacity={r.author?.id ? 0.7 : 1}
                    disabled={!r.author?.id}
                    onPress={() => navigation.navigate("UserProfile", { userId: r.author.id })}
                  >
                    <View style={styles.reviewAvatar}>
                      <Text style={{ color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 12 }}>
                        {(r.author?.name ?? "A")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewAuthor}>{r.author?.name ?? "Traveler"}</Text>
                      <Text style={{ color: Colors.warning, fontSize: 12 }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.reviewBody}>{r.body}</Text>
                </Card>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <View style={styles.ctaPrice}>
          <Text style={styles.ctaPriceAmount}>€{exp.price}</Text>
          <Text style={styles.ctaPriceSub}>per person</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaBtn, seatsLeft === 0 && styles.ctaBtnDisabled]}
          disabled={seatsLeft === 0}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Booking", { exp })}
        >
          <Text style={styles.ctaBtnText}>{seatsLeft === 0 ? "Fully booked" : "Reserve a seat →"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { height: 220, backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center", position: "relative" },
  heroIcon: { alignItems: "center", justifyContent: "center" },
  backBtn: {
    position: "absolute", top: 16, left: 20,
    width: 40, height: 40, backgroundColor: Colors.white,
    borderRadius: Radius.sm, alignItems: "center", justifyContent: "center",
    ...Shadow.sm,
  },
  body: { padding: Spacing.lg },
  catPill: { alignSelf: "flex-start", backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  catText: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.muted },
  title: { fontFamily: Fonts.display, fontSize: 28, color: Colors.ink, lineHeight: 36, letterSpacing: -0.5, marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: Spacing.md },
  meta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted },
  hostCard: { padding: 14, marginBottom: 12 },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hostAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center" },
  hostAvatarText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
  hostName: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  hostSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  ratingBadge: { backgroundColor: "#FFF8E1", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  ratingText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.warning },
  seatsCard: { padding: 16, marginBottom: Spacing.lg },
  seatsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  seatsLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: Colors.muted, marginBottom: 4 },
  seatsNum: { fontFamily: Fonts.display, fontSize: 28, color: Colors.ink },
  priceNum: { fontFamily: Fonts.display, fontSize: 28, color: Colors.ink },
  seatsSubtext: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 6 },
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 10, marginTop: Spacing.md },
  description: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink, lineHeight: 24, marginBottom: Spacing.sm },
  venueCard: { padding: 14, marginBottom: Spacing.sm },
  venueName: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  venueAddress: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 3 },
  mapContainer: { borderRadius: Radius.lg, overflow: "hidden", height: 180, marginBottom: Spacing.md },
  map: { flex: 1 },
  reviewCard: { padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center" },
  reviewAuthor: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  reviewBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 20 },
  cta: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.sand, padding: Spacing.lg, flexDirection: "row", alignItems: "center", gap: 14, ...Shadow.md },
  ctaPrice: {},
  ctaPriceAmount: { fontFamily: Fonts.display, fontSize: 22, color: Colors.ink },
  ctaPriceSub: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted },
  ctaBtn: { flex: 1, height: 52, backgroundColor: Colors.ink, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  ctaBtnDisabled: { backgroundColor: Colors.muted },
  ctaBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.paper },
});
