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

const EMOJIS = {
  trip:       ['🧭', '🏝️', '🏔️', '🚐', '⛺', '🌋', '🏜️', '🛶', '🚂', '🌄', '🐋', '🍷'],
  experience: ['🏺', '🎵', '📸', '🍜', '🥾', '🏛️', '🎨', '🧘', '🌄', '🎭', '🛖', '📚'],
};

const INCLUDED = ['🛏️ Accommodation', '🚐 Local transport', '🍳 Breakfasts', '🍽️ Some dinners', '🎟️ Activities & entry fees', '🧭 Host guiding'];

// Matches the API's MAX_GROUP_SIZE — FreeSolo groups stay small on purpose.
const MAX_GROUP = 12;

export default function CreateExperienceScreen({ navigation, route }) {
  const initialKind = route?.params?.kind === 'experience' ? 'experience' : 'trip';
  const [kind, setKind] = useState(initialKind);
  const isTrip = kind === 'trip';
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    businessId: '', city: '', date: '', endDate: '', time: '',
    minSeats: '4', maxSeats: '8', price: '',
    emoji: EMOJIS[initialKind][0],
    // Trips are vetted by default; venue experiences keep instant booking.
    joinPolicy: initialKind === 'trip' ? 'approval' : 'instant',
  });
  const [days, setDays]           = useState([{ title: '', description: '' }]);
  const [included, setIncluded]   = useState([]);
  const [venues, setVenues]       = useState([]);
  const [venuesLoading, setVL]    = useState(true);
  const [loading, setLoading]     = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadVenues = useCallback(async () => {
    setVL(true);
    const { data } = await apiFetch('/api/hosting/venues');
    const approved = (Array.isArray(data) ? data : []).filter(b => b.status === 'approved');
    setVenues(approved);
    if (approved.length === 1) set('businessId', approved[0].id);
    setVL(false);
  }, []);

  useEffect(() => { loadVenues(); }, [loadVenues]);

  const switchKind = (next) => {
    setKind(next);
    setForm(f => ({
      ...f,
      emoji: EMOJIS[next][0],
      joinPolicy: next === 'trip' ? 'approval' : 'instant',
    }));
  };

  const selectedVenue = venues.find(v => v.id === form.businessId);
  const city = isTrip ? form.city.trim() : selectedVenue?.city;
  const filledDays = days.filter(d => d.title.trim());

  const canSubmit = form.title && form.category && form.date && form.time && form.price && city && !loading
    && (isTrip ? form.endDate && filledDays.length > 0 : form.businessId);

  const setDay = (i, k, v) => setDays(ds => ds.map((d, idx) => idx === i ? { ...d, [k]: v } : d));
  const toggleIncluded = (item) => setIncluded(list =>
    list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

  const handleCreate = async () => {
    const minSeats = parseInt(form.minSeats, 10) || 4;
    const maxSeats = parseInt(form.maxSeats, 10) || 8;
    if (minSeats > maxSeats) { Alert.alert('Check group size', 'The minimum can’t be larger than the maximum.'); return; }
    if (maxSeats > MAX_GROUP) { Alert.alert('Keep it small', `FreeSolo groups cap at ${MAX_GROUP} travelers.`); return; }

    setLoading(true);
    const { error } = await apiFetch('/api/experiences', {
      method: 'POST',
      body: JSON.stringify({
        kind,
        businessId:   isTrip ? (form.businessId || null) : form.businessId,
        title:        form.title,
        description:  form.description,
        category:     form.category.replace(/^\S+\s*/, ''), // strip leading emoji
        emoji:        form.emoji,
        city,
        date:         form.date,
        endDate:      isTrip ? form.endDate : null,
        time:         form.time,
        minSeats,
        maxSeats,
        price:        parseFloat(form.price) || 0,
        itinerary:    isTrip ? filledDays.map(d => ({ title: d.title.trim(), description: d.description.trim() || null })) : [],
        included:     isTrip ? included.map(i => i.replace(/^\S+\s*/, '')) : [],
        joinPolicy:   form.joinPolicy,
      }),
    });
    setLoading(false);
    if (error) { Alert.alert(`Could not create ${isTrip ? 'trip' : 'experience'}`, error); return; }
    Alert.alert(
      isTrip ? 'Trip published 🧭' : 'Experience created',
      form.joinPolicy === 'approval'
        ? 'It’s live. You’ll get a notification for each traveler who asks to join.'
        : 'It’s live and ready for bookings.',
      [{ text: 'Done', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isTrip ? 'Host a trip' : 'Host an experience'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          tag="Host"
          title={isTrip ? 'Plan it once,\ngo together' : 'Share your\ncity'}
          subtitle={isTrip
            ? 'A few days, a small group of vetted solo travelers, and you leading the way.'
            : 'A few hours at your venue for a small group of travelers.'}
        />

        {/* Kind switch */}
        <View style={styles.segment}>
          {[
            { id: 'trip', label: '🧭  Multi-day trip' },
            { id: 'experience', label: '✨  Experience' },
          ].map(k => (
            <TouchableOpacity key={k.id} onPress={() => switchKind(k.id)} style={[styles.segmentBtn, kind === k.id && styles.segmentBtnActive]}>
              <Text style={[styles.segmentText, kind === k.id && styles.segmentTextActive]}>{k.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <InfoBox>
          FreeSolo doesn’t take payment — travelers settle with you directly. Only approved members can see who’s going or ask to join.
        </InfoBox>

        {/* Emoji picker */}
        <Text style={styles.label}>Pick an icon</Text>
        <View style={styles.emojiRow}>
          {EMOJIS[kind].map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => set('emoji', e)}
              style={[styles.emojiBtn, form.emoji === e && styles.emojiBtnActive]}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          label={isTrip ? 'Trip name *' : 'Experience title *'}
          placeholder={isTrip ? 'e.g. Azores island hop' : 'e.g. Old City Pottery Morning'}
          value={form.title}
          onChangeText={v => set('title', v)}
        />
        <Field
          label="Description *"
          placeholder={isTrip ? 'The vibe, the pace, who this trip is for…' : 'What will travelers do? What makes this authentic?'}
          value={form.description}
          onChangeText={v => set('description', v)}
          multiline
          rows={4}
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} active={form.category === c} onPress={() => set('category', c)} />
          ))}
        </View>

        {isTrip ? (
          <Field label="Destination *" placeholder="e.g. São Miguel, Azores" value={form.city} onChangeText={v => set('city', v)} />
        ) : (
          <>
            <Text style={styles.label}>Venue *</Text>
            {venuesLoading ? (
              <ActivityIndicator color={Colors.clay} style={{ marginBottom: Spacing.md }} />
            ) : venues.length === 0 ? (
              <InfoBox variant="warning">
                You don't have an approved venue yet. Register one first — experiences are hosted at an approved venue. Trips don’t need one.
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
          </>
        )}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label={isTrip ? 'Starts *' : 'Date *'} placeholder="DD/MM/YYYY" value={form.date} onChangeText={v => set('date', v)} keyboardType="numbers-and-punctuation" />
          </View>
          {isTrip && (
            <View style={{ flex: 1 }}>
              <Field label="Ends *" placeholder="DD/MM/YYYY" value={form.endDate} onChangeText={v => set('endDate', v)} keyboardType="numbers-and-punctuation" />
            </View>
          )}
          <View style={{ flex: isTrip ? 0.8 : 1 }}>
            <Field label={isTrip ? 'Meet at *' : 'Time *'} placeholder="HH:MM" value={form.time} onChangeText={v => set('time', v)} keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        {isTrip && (
          <>
            <Text style={styles.label}>Itinerary *</Text>
            {days.map((d, i) => (
              <View key={i} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>Day {i + 1}</Text>
                  {days.length > 1 && (
                    <TouchableOpacity onPress={() => setDays(ds => ds.filter((_, idx) => idx !== i))}>
                      <Text style={styles.dayRemove}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Field placeholder="e.g. Arrive · sunset at Sete Cidades" value={d.title} onChangeText={v => setDay(i, 'title', v)} />
                <Field placeholder="Details (optional)" value={d.description} onChangeText={v => setDay(i, 'description', v)} multiline rows={2} />
              </View>
            ))}
            <TouchableOpacity onPress={() => setDays(ds => [...ds, { title: '', description: '' }])} style={styles.addDay}>
              <Text style={styles.addDayText}>＋ Add day {days.length + 1}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>What the price covers</Text>
            <View style={styles.chips}>
              {INCLUDED.map(i => (
                <Chip key={i} label={i} active={included.includes(i)} onPress={() => toggleIncluded(i)} />
              ))}
            </View>
          </>
        )}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Min group" placeholder="4" value={form.minSeats} onChangeText={v => set('minSeats', v)} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={`Max (≤${MAX_GROUP})`} placeholder="8" value={form.maxSeats} onChangeText={v => set('maxSeats', v)} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Price (€) *" placeholder={isTrip ? '640' : '25'} value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>Who gets in</Text>
        {[
          { id: 'approval', title: 'I approve each traveler', body: 'Travelers send a short intro; you pick your group. Recommended for trips.' },
          { id: 'instant', title: 'Instant join', body: 'Any approved member can take a seat straight away.' },
        ].map(p => (
          <TouchableOpacity key={p.id} onPress={() => set('joinPolicy', p.id)} style={[styles.policy, form.joinPolicy === p.id && styles.policyActive]} activeOpacity={0.85}>
            <View style={[styles.radio, form.joinPolicy === p.id && styles.radioActive]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.policyTitle}>{p.title}</Text>
              <Text style={styles.policyBody}>{p.body}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Button label={isTrip ? 'Publish trip' : 'Create experience'} onPress={handleCreate} disabled={!canSubmit} loading={loading} />
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
  segment: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.sand, padding: 4, marginBottom: Spacing.md,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.ink },
  segmentText: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  segmentTextActive: { color: Colors.paper },
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
  dayCard: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.sand,
    padding: 12, paddingBottom: 0, marginBottom: 10,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.clay },
  dayRemove: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, textDecorationLine: 'underline' },
  addDay: {
    borderWidth: 1.5, borderColor: Colors.sand, borderStyle: 'dashed', borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center', marginBottom: Spacing.md,
  },
  addDayText: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  policy: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.sand,
    padding: 14, marginBottom: 10,
  },
  policyActive: { borderColor: Colors.ink },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.sand, marginTop: 2 },
  radioActive: { borderColor: Colors.ink, backgroundColor: Colors.ink },
  policyTitle: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  policyBody: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2, lineHeight: 17 },
});
