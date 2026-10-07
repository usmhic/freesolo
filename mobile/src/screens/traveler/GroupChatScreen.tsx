import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null; host: boolean };
}

const POLL_MS = 5000;

export default function GroupChatScreen({ navigation, route }: any) {
  const { experienceId, title } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const cursor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // The API repeats a short overlap behind the cursor, so merge by id.
  const merge = useCallback((incoming: Message[]) => {
    if (incoming.length === 0) return;
    setMessages(prev => {
      const byId = new Map(prev.map(m => [m.id, m]));
      incoming.forEach(m => byId.set(m.id, m));
      const next = [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      cursor.current = next[next.length - 1].createdAt;
      return next;
    });
  }, []);

  const poll = useCallback(async () => {
    const after = cursor.current ? `?after=${encodeURIComponent(cursor.current)}` : "";
    const { data, error: e, status } = await apiFetch<Message[]>(`/api/experiences/${experienceId}/chat${after}`);
    if (e) {
      // No place in the group: stop asking every few seconds.
      if (status === 403 && timer.current) clearInterval(timer.current);
      setError(e); setLoading(false); return;
    }
    setError(null);
    merge(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [experienceId, merge]);

  useEffect(() => {
    poll();
    timer.current = setInterval(poll, POLL_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [poll]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const { data, error: e } = await apiFetch<Message>(`/api/experiences/${experienceId}/chat`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (e || !data) { setError(e ?? "Couldn't send"); return; }
    setDraft("");
    merge([data]);
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.author.id === user?.id;
    const prev = messages[index - 1];
    const showAuthor = !mine && prev?.author.id !== item.author.id;
    const time = new Date(item.createdAt);
    return (
      <View style={[styles.row, mine && styles.rowMine]}>
        {!mine && (
          <View style={styles.avatarSlot}>
            {showAuthor && (item.author.image ? (
              <Image source={{ uri: item.author.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{(item.author.name ?? "T")[0].toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ maxWidth: "78%" }}>
          {showAuthor && (
            <Text style={styles.author}>
              {item.author.name ?? "Traveler"}{item.author.host ? "  · host" : ""}
            </Text>
          )}
          <View style={[styles.bubble, mine ? styles.bubbleMine : item.author.host ? styles.bubbleHost : null]}>
            <Text style={[styles.body, mine && { color: Colors.paper }]}>{item.body}</Text>
          </View>
          {!isNaN(time.getTime()) && (
            <Text style={[styles.time, mine && { textAlign: "right" }]}>
              {time.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title ?? "Group chat"}</Text>
          <Text style={styles.headerSub}>Group chat · host and travelers with a place</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator color={Colors.clay} size="large" /></View>
        ) : error && messages.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🔒</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>👋</Text>
                <Text style={styles.emptyText}>Say hello to the group — plans, meeting points, who's bringing the snacks.</Text>
              </View>
            )}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Message the group…"
            placeholderTextColor={Colors.muted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || sending) && { opacity: 0.4 }]}
            disabled={!draft.trim() || sending}
            onPress={send}
          >
            {sending ? <ActivityIndicator color={Colors.paper} /> : <Text style={styles.sendText}>↑</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.sand },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  headerTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink },
  headerSub: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  list: { padding: Spacing.md, paddingBottom: Spacing.lg, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl, paddingTop: 80 },
  emptyText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, textAlign: "center", lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
  rowMine: { justifyContent: "flex-end" },
  avatarSlot: { width: 32, marginRight: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15 },
  avatarFallback: { backgroundColor: Colors.clay, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.white },
  author: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.muted, marginBottom: 3, marginLeft: 4 },
  bubble: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: Colors.sand },
  bubbleHost: { backgroundColor: "#F4ECDF", borderColor: Colors.clay },
  bubbleMine: { backgroundColor: Colors.ink, borderColor: Colors.ink, borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: 6 },
  body: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink, lineHeight: 20 },
  time: { fontFamily: Fonts.body, fontSize: 10, color: Colors.muted, marginTop: 3, marginHorizontal: 4 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: Spacing.sm, paddingHorizontal: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.sand, backgroundColor: Colors.white },
  input: { flex: 1, maxHeight: 120, minHeight: 42, backgroundColor: Colors.paper, borderRadius: Radius.lg, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontFamily: Fonts.body, fontSize: 14, color: Colors.ink },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center" },
  sendText: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.paper },
});
