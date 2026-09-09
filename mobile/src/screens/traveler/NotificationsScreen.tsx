import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { apiFetch } from "../../lib/api";
import { Logo } from "../../components/UI";

const NOTIF_ICONS: Record<string, string> = {
  booking_confirmed: "🎉",
  booking_pending: "⏳",
  experience_full: "🔥",
  new_review: "⭐",
  welcome: "🌍",
  application_reviewed: "📋",
  business_status: "🏢",
  experience_status: "⚠️",
  event_photo_shared: "📸",
  experience_completed: "🏁",
  marketing: "📣",
  admin_message: "📢",
};

interface Notif {
  id: string; type: string; title: string;
  body: string; read: boolean; createdAt: string; data?: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await apiFetch<Notif[]>("/api/notifications");
    if (data) setNotifs(Array.isArray(data) ? data : []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const openNotif = (item: Notif) => {
    if (!item.read) markRead(item.id);
    let data: Record<string, any> = {};
    try { data = item.data ? JSON.parse(item.data) : {}; } catch { /* ignore */ }

    switch (item.type) {
      case "new_review":
        if (data.authorId) navigation.navigate("UserProfile", { userId: data.authorId });
        break;
      case "event_photo_shared":
      case "experience_completed":
        if (data.experienceId) navigation.navigate("ExperienceDetail", { experienceId: data.experienceId });
        break;
      default:
        break;
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 70 }} />}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.clay} size="large" /></View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.clay} />}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openNotif(item)}
              style={[styles.notifRow, !item.read && styles.notifRowUnread]}
              activeOpacity={0.85}
            >
              <View style={[styles.notifIcon, !item.read && styles.notifIconUnread]}>
                <Text style={{ fontSize: 20 }}>{NOTIF_ICONS[item.type] ?? "📌"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  backArrow: { fontSize: 18, color: Colors.ink },
  title: { fontFamily: Fonts.display, fontSize: 18, color: Colors.ink },
  markAll: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.clay },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 8, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.muted },
  notifRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, ...Shadow.sm },
  notifRowUnread: { backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: Colors.clay + "30" },
  notifIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.sand, alignItems: "center", justifyContent: "center" },
  notifIconUnread: { backgroundColor: Colors.clay + "20" },
  notifTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.muted, marginBottom: 3 },
  notifTitleUnread: { color: Colors.ink },
  notifBody: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 18 },
  notifTime: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.clay, marginTop: 4 },
});
