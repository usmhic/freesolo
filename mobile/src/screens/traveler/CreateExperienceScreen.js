import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../theme';
import { Field, Button, Chip, ScreenHeader, InfoBox } from '../../components/UI';
import { apiFetch } from '../../lib/api';

const CATEGORIES = [
  '🎨 Art & Culture', '🍜 Food & Drink', '🥾 Outdoor',
  '🎵 Music', '📸 Photography', '🏛️ History',
  '🧘 Wellness', '📚 Learning',
];

const EMOJIS = ['🏺', '🎵', '📸', '🍜', '🥾', '🏛️', '🎨', '🧘', '🌄', '🎭', '🛖', '📚'];

export default function CreateExperienceScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    businessId: '', date: '', time: '',
    minSeats: '4', maxSeats: '8', price: '',
    emoji: '🌍',
  });
  const [venues, setVenues]       = useState([]);
  const [venuesLoading, setVL]    = useState(true);
  const [loading, setLoading]     = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadVenues = useCallback(async () => {
    setVL(true);
    const { data } = await apiFetch('/api/users/me');
    const approved = (data?.businesses ?? []).filter(b => b.status === 'approved');
    setVenues(approved);
    if (approved.length === 1) set('businessId', approved[0].id);
    setVL(false);
  }, []);

  useEffect(() => { loadVenues(); }, [loadVenues]);

  const selectedVenue = venues.find(v => v.id === form.businessId);
  const canSubmit = form.title && form.category && form.businessId && form.date && form.time && form.price && !loading;

  const handleCreate = async () => {
    if (!selectedVenue) return;
    setLoading(true);
    const { error } = await apiFetch('/api/experiences', {
      method: 'POST',
      body: JSON.stringify({
        businessId:   form.businessId,
        title:        form.title,
        description:  form.description,
        category:     form.category.replace(/^\S+\s*/, ''), // strip leading emoji
        emoji:        form.emoji,
        city:         selectedVenue.city,
        date:         form.date,
        time:         form.time,
        minSeats:     parseInt(form.minSeats, 10) || 4,
        maxSeats:     parseInt(form.maxSeats, 10) || 8,
        price:        parseFloat(form.price) || 0,
      }),
    });
    setLoading(false);
    if (error) { Alert.alert('Could not create experience', error); return; }
    Alert.alert('Experience created', 'Your experience is live and ready for bookings.', [
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Experience</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          tag="Host"
          title={'Share your\ncity'}
          subtitle="Only certified local members can create experiences."
        />

        <InfoBox>
          You earn FreeSolo travel credits when travelers book your experience — redeemable when you travel.
        </InfoBox>

        {/* Emoji picker */}
        <Text style={styles.label}>Pick an icon</Text>
        <View style={styles.emojiRow}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => set('emoji', e)}
              style={[styles.emojiBtn, form.emoji === e && styles.emojiBtnActive]}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Experience Title *" placeholder="e.g. Old City Pottery Morning" value={form.title} onChangeText={v => set('title', v)} />
        <Field label="Description *" placeholder="What will travelers do? What makes this authentic?" value={form.description} onChangeText={v => set('description', v)} multiline rows={4} />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} active={form.category === c} onPress={() => set('category', c)} />
          ))}
        </View>

        <Text style={styles.label}>Venue *</Text>
        {venuesLoading ? (
          <ActivityIndicator color={Colors.clay} style={{ marginBottom: Spacing.md }} />
        ) : venues.length === 0 ? (
          <InfoBox variant="warning">
            You don't have an approved venue yet. Register one first — your experience will need to be hosted at an approved venue.
          </InfoBox>
        ) : (
          <View style={styles.chips}>
            {venues.map(v => (
              <Chip key={v.id} label={`${v.name} · ${v.city}`} active={form.businessId === v.id} onPress={() => set('businessId', v.id)} />
            ))}
          </View>
        )}
        {selectedVenue?.address && (
          <Text style={styles.venueAddress}>📍 {selectedVenue.address}, {selectedVenue.city}</Text>
        )}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Date *" placeholder="DD/MM/YYYY" value={form.date} onChangeText={v => set('date', v)} keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Time *" placeholder="HH:MM" value={form.time} onChangeText={v => set('time', v)} keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Min Seats" placeholder="4" value={form.minSeats} onChangeText={v => set('minSeats', v)} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Max Seats" placeholder="8" value={form.maxSeats} onChangeText={v => set('maxSeats', v)} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Price (€) *" placeholder="25" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" />
          </View>
        </View>

        <Button label="Create Experience" onPress={handleCreate} disabled={!canSubmit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.white,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  headerTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  label: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.muted, marginBottom: 8,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  emojiBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.sand,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiBtnActive: { borderColor: Colors.ink, backgroundColor: Colors.sand },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: 10 },
  venueAddress: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: -4, marginBottom: Spacing.md },
});
