import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../theme';
import { Card, ProgressBar, Logo } from '../../components/UI';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function BusinessDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [business, setBusiness]     = useState(null);
  const [stats, setStats]           = useState(null);
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [pending, setPending]       = useState(false); // no venue yet, or awaiting approval

  const load = useCallback(async () => {
    setError(null);
    const me = await apiFetch('/api/users/me');
    const mine = (me.data?.businesses ?? [])[0];
    if (!mine) { setBusiness(null); setPending(true); setLoading(false); setRefreshing(false); return; }
    if (mine.status !== 'approved') {
      setBusiness(mine); setPending(true); setLoading(false); setRefreshing(false); return;
    }
    setPending(false);
    const { data, error: e } = await apiFetch(`/api/businesses/${mine.id}/dashboard`);
    if (e) { setError(e); setLoading(false); setRefreshing(false); return; }
    setBusiness(data.business);
    setStats(data.stats);
    setBookings(data.upcoming);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };
  const initials = (business?.name ?? user?.name ?? user?.email ?? '?')[0].toUpperCase();

  const STATS = stats ? [
    { label: 'Revenue', value: `€${stats.revenue.toFixed(0)}`, sub: 'This month' },
    { label: 'Live', value: `${stats.liveExperiences}`, sub: 'Experiences' },
    { label: 'Travelers', value: `${stats.travelers}`, sub: 'Total' },
  ] : [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.clay} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (pending) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>{business ? '⏳' : '🏢'}</Text>
          <Text style={styles.emptyTitle}>{business ? `${business.name} is in review` : 'No venue yet'}</Text>
          <Text style={styles.emptyBody}>
            {business
              ? "We'll notify you as soon as it's approved — usually within 3 business days."
              : 'Register your venue to start hosting experiences and tracking bookings here.'}
          </Text>
          {!business && (
            <TouchableOpacity onPress={() => navigation.navigate('BusinessOnboarding')} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Register your venue</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load dashboard</Text>
          <Text style={styles.emptyBody}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Logo size={22} />
          <Text style={styles.venueName}>{business?.name}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.clay} />}
      >
        <Text style={styles.heading}>Dashboard</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Upcoming Experiences</Text>

        {bookings.length === 0 ? (
          <Text style={styles.emptyInline}>No upcoming experiences yet — create one to start taking bookings.</Text>
        ) : null}

        {/* Booking cards */}
        {bookings.map(b => {
          const isConfirmed = b.status === 'confirmed';
          const seatsLeft = b.total - b.filled;
          return (
            <Card key={b.id} style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <View style={styles.bookingLeft}>
                  <View style={styles.emojiBox}>
                    <Text style={{ fontSize: 20 }}>{b.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle}>{b.title}</Text>
                    <Text style={styles.bookingMeta}>{b.date} · {b.time}</Text>
                  </View>
                </View>
                <View style={[styles.badge, isConfirmed ? styles.badgeGreen : styles.badgeAmber]}>
                  <Text style={[styles.badgeText, isConfirmed ? styles.badgeTextGreen : styles.badgeTextAmber]}>
                    {isConfirmed ? '✓ Confirmed' : 'Pending'}
                  </Text>
                </View>
              </View>

              <ProgressBar filled={b.filled} total={b.total} warn={!isConfirmed && seatsLeft > 2} />

              <View style={styles.bookingFooter}>
                <Text style={styles.seatsText}>
                  {b.filled}/{b.total} seats filled
                </Text>
                {!isConfirmed && (
                  <Text style={styles.seatsNeeded}>needs {seatsLeft} more to confirm</Text>
                )}
              </View>
            </Card>
          );
        })}

        {/* Revenue split reminder */}
        <Card style={styles.splitCard}>
          <Text style={styles.splitTitle}>Revenue Split</Text>
          {[
            ['Your venue', '70%', Colors.sage],
            ['Host travel credit', '10%', Colors.clay],
            ['FreeSolo fee', '20%', Colors.muted],
          ].map(([label, pct, color]) => (
            <View key={label} style={styles.splitRow}>
              <View style={[styles.splitDot, { backgroundColor: color }]} />
              <Text style={styles.splitLabel}>{label}</Text>
              <Text style={styles.splitPct}>{pct}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
  },
  venueName: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 3 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.display, fontSize: 16, color: Colors.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: Spacing.xl },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.ink, textAlign: 'center', marginBottom: 4 },
  emptyBody:  { fontFamily: Fonts.body, fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  emptyInline:{ fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, lineHeight: 20, marginBottom: Spacing.md },
  actionBtn: { marginTop: 16, backgroundColor: Colors.ink, borderRadius: Radius.full, paddingHorizontal: 22, paddingVertical: 12 },
  actionBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.paper },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  heading: { fontFamily: Fonts.display, fontSize: 28, color: Colors.ink, marginBottom: Spacing.lg, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: 14, alignItems: 'center', ...Shadow.sm,
  },
  statValue: { fontFamily: Fonts.display, fontSize: 22, color: Colors.ink },
  statSub: { fontFamily: Fonts.body, fontSize: 10, color: Colors.muted, marginTop: 2 },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.muted, marginBottom: Spacing.sm,
  },
  bookingCard: { marginBottom: 12, padding: 16 },
  bookingTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  bookingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  emojiBox: {
    width: 40, height: 40, backgroundColor: Colors.sand,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  bookingTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink, lineHeight: 20 },
  bookingMeta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#E8F5E9' },
  badgeAmber: { backgroundColor: '#FFF8E1' },
  badgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.3 },
  badgeTextGreen: { color: Colors.success },
  badgeTextAmber: { color: Colors.warning },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  seatsText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted },
  seatsNeeded: { fontFamily: Fonts.body, fontSize: 11, color: Colors.terra },
  splitCard: { marginTop: Spacing.sm, padding: 16, marginBottom: 40 },
  splitTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink, marginBottom: 12 },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  splitDot: { width: 8, height: 8, borderRadius: 4 },
  splitLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, flex: 1 },
  splitPct: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink },
});
