import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card } from "../../components/UI";
import { apiFetch } from "../../lib/api";

interface JoinRequest {
  id: string;
  status: string;
  seats: number;
  message: string | null;
  createdAt: string;
  traveler: {
    id: string; name: string | null; image: string | null; bio: string | null;
    countriesVisited: number; memberSince: string;
  };
}

export default function HostRequestsScreen({ navigation, route }: any) {
  const { experienceId, title } = route.params;
  const [rows, setRows] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await apiFetch<JoinRequest[]>(`/api/hosting/listings/${experienceId}/requests`);
    if (error) Alert.alert("Couldn't load requests", error);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
    setRefreshing(false);
  }, [experienceId]);

  useEffect(() => { load(); }, [load]);

  const decide = async (row: JoinRequest, action: "approve" | "decline") => {
    setBusy(row.id);
    const { error } = await apiFetch(`/api/hosting/requests/${row.id}/${action}`, { method: "POST", body: "{}" });
    setBusy(null);
    if (error) { Alert.alert("Something went wrong", error); return; }
    load();
  };

  const confirmDecline = (row: JoinRequest) =>
    Alert.alert("Decline request?", `${row.traveler.name ?? "This traveler"} will be told the group has been filled another way.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Decline", style: "destructive", onPress: () => decide(row, "decline") },
    ]);

  const requests = rows.filter(r => r.status === "requested");
  const group = rows.filter(r => r.status !== "requested");

  const Person = ({ r, children }: { r: JoinRequest; children?: React.ReactNode }) => {
    const since = new Date(r.traveler.memberSince);
    return (
      <Card style={styles.card}>
        <TouchableOpacity style={styles.personRow} activeOpacity={0.7}
          onPress={() => navigation.navigate("UserProfile", { userId: r.traveler.id })}>
          {r.traveler.image ? (
            <Image source={{ uri: r.traveler.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{(r.traveler.name ?? "T")[0].toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{r.traveler.name ?? "FreeSolo member"}</Text>
            <Text style={styles.meta}>
              ✓ verified · {r.traveler.countriesVisited} countries
              {!isNaN(since.getTime()) ? ` · member since ${since.toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : ""}
            </Text>
          </View>
          {r.status !== "requested" && (
            <Text style={[styles.status, r.status === "confirmed" && { color: Colors.success }]}>
              {r.status === "confirmed" ? "✓ Confirmed" : "Holding seat"}
            </Text>
          )}
        </TouchableOpacity>
        {r.traveler.bio ? <Text style={styles.bio}>{r.traveler.bio}</Text> : null}
        {r.message ? <Text style={styles.message}>“{r.message}”</Text> : null}
        {children}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title ?? "Your group"}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("GroupChat", { experienceId, title })} style={styles.viewBtn}>
          <Text style={styles.viewText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ExperienceDetail", { experienceId })} style={styles.viewBtn}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.clay} size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.clay} />}
        >
          <Text style={styles.sectionTitle}>Asking to join ({requests.length})</Text>
          {requests.length === 0 ? (
            <Text style={styles.empty}>No one waiting right now. You'll get a notification when someone asks.</Text>
          ) : requests.map(r => (
            <Person key={r.id} r={r}>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} disabled={busy === r.id} onPress={() => confirmDecline(r)}>
                  <Text style={styles.btnGhostText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnPrimary]} disabled={busy === r.id} onPress={() => decide(r, "approve")}>
                  {busy === r.id
                    ? <ActivityIndicator color={Colors.paper} />
                    : <Text style={styles.btnPrimaryText}>Welcome aboard</Text>}
                </TouchableOpacity>
              </View>
            </Person>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>The group ({group.length})</Text>
          {group.length === 0
            ? <Text style={styles.empty}>Nobody has a seat yet.</Text>
            : group.map(r => <Person key={r.id} r={r} />)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  headerTitle: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.sand },
  viewText: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.ink },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 10, marginTop: Spacing.sm },
  empty: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 19 },
  card: { padding: 14, marginBottom: 10 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
  name: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  meta: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 2 },
  status: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.warning },
  bio: { fontFamily: Fonts.body, fontSize: 13, color: Colors.ink, marginTop: 10, lineHeight: 19 },
  message: { fontFamily: Fonts.displayItalic, fontSize: 14, color: Colors.ink, marginTop: 10, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, height: 44, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: Colors.ink },
  btnPrimaryText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.paper },
  btnGhost: { borderWidth: 1.5, borderColor: Colors.sand },
  btnGhostText: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
});
