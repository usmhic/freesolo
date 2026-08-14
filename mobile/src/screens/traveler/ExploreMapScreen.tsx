import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { apiFetch } from "../../lib/api";

const { height } = Dimensions.get("window");

export default function ExploreMapScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 38.7169, longitude: -9.1399,
    latitudeDelta: 0.08, longitudeDelta: 0.08,
  });
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Lisbon");

  useEffect(() => {
    (async () => {
      // Try to get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setRegion(r => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
        // Reverse geocode
        const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (geocode[0]?.city) setCity(geocode[0].city);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await apiFetch<any>(`/api/experiences?city=${encodeURIComponent(city)}`);
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      // Filter experiences that have coordinates
      setExperiences(list);
      setLoading(false);
    })();
  }, [city]);

  const CATEGORIES = ["All","🎨 Art","🍜 Food","🎵 Music","📸 Photo","🥾 Outdoor"];
  const [filter, setFilter] = useState("All");

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {experiences.map((exp: any) => (
          exp.lat && exp.lng ? (
            <Marker
              key={exp.id}
              coordinate={{ latitude: exp.lat, longitude: exp.lng }}
              onPress={() => setSelected(exp)}
            >
              <View style={[styles.pin, selected?.id === exp.id && styles.pinSelected]}>
                <Text style={styles.pinEmoji}>{exp.emoji}</Text>
                <Text style={styles.pinPrice}>€{exp.price}</Text>
              </View>
            </Marker>
          ) : null
        ))}
      </MapView>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={["top", "left", "right"]}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <Text style={styles.searchText}>📍 {city}</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === "granted") {
                const loc = await Location.getCurrentPositionAsync({});
                mapRef.current?.animateToRegion({ ...region, latitude: loc.coords.latitude, longitude: loc.coords.longitude });
              }
            }}
            style={styles.locBtn}
          >
            <Text style={{ fontSize: 18 }}>📍</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} onPress={() => setFilter(c)} style={[styles.filterChip, filter === c && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === c && styles.filterTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Selected experience card */}
      {selected && (
        <View style={styles.selectedCard}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
            <Text style={{ fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <View style={styles.selectedRow}>
            <View style={styles.selectedEmoji}><Text style={{ fontSize: 26 }}>{selected.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedTitle}>{selected.title}</Text>
              <Text style={styles.selectedMeta}>{selected.date} · {selected.time}</Text>
              <Text style={styles.selectedHost}>by {selected.host?.name ?? "Local host"}</Text>
            </View>
            <View>
              <Text style={styles.selectedPrice}>€{selected.price}</Text>
              <Text style={{ fontSize: 10, color: Colors.muted, textAlign: "center" }}>/person</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.selectedBtn}
            onPress={() => navigation.navigate("ExperienceDetail", { experienceId: selected.id })}
          >
            <Text style={styles.selectedBtnText}>View experience →</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.clay} size="small" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: Spacing.md },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.md },
  searchBox: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12, ...Shadow.sm },
  searchText: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  locBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  filterRow: { paddingVertical: 6, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.white, ...Shadow.sm },
  filterChipActive: { backgroundColor: Colors.ink },
  filterText: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.ink },
  filterTextActive: { color: Colors.paper },
  pin: { backgroundColor: Colors.white, borderRadius: 16, padding: 8, alignItems: "center", ...Shadow.md, borderWidth: 1.5, borderColor: Colors.sand },
  pinSelected: { borderColor: Colors.ink, transform: [{ scale: 1.1 }] },
  pinEmoji: { fontSize: 16 },
  pinPrice: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.ink, marginTop: 2 },
  selectedCard: { position: "absolute", bottom: 20, left: 16, right: 16, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 18, ...Shadow.lg },
  closeBtn: { position: "absolute", top: 14, right: 14, width: 28, height: 28, backgroundColor: Colors.sand, borderRadius: 14, alignItems: "center", justifyContent: "center", zIndex: 1 },
  selectedRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  selectedEmoji: { width: 52, height: 52, backgroundColor: Colors.ink, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  selectedTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink, lineHeight: 20 },
  selectedMeta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  selectedHost: { fontFamily: Fonts.body, fontSize: 12, color: Colors.clay, marginTop: 2 },
  selectedPrice: { fontFamily: Fonts.display, fontSize: 22, color: Colors.ink },
  selectedBtn: { backgroundColor: Colors.ink, borderRadius: Radius.md, padding: 14, alignItems: "center" },
  selectedBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.paper },
  loadingOverlay: { position: "absolute", top: 120, left: "50%", backgroundColor: Colors.white, borderRadius: 20, padding: 10, ...Shadow.sm },
});
