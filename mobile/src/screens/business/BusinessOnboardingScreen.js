import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../theme';
import { Field, Button, Chip, ScreenHeader, InfoBox } from '../../components/UI';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const VENUE_TYPES = [
  'Museum', 'Restaurant', 'Gallery', 'Studio',
  'Bar & Music', 'Outdoor', 'Workshop', 'Café', 'Market', 'Other',
];

export default function BusinessOnboardingScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: '', address: '', city: '',
    maps: '', tripadvisor: '', instagram: '', description: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Not signed in — registering a venue requires an account (the API call is auth-gated)
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.gateBody}>
          <ScreenHeader tag="Business Access" title={'Sign in to\nregister your venue'} />
          <InfoBox>
            FreeSolo venues are managed by verified members. Sign in (or apply to join) and come back here to list your venue.
          </InfoBox>
          <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
          <Button label="Apply to join" variant="outline" onPress={() => navigation.navigate('Apply')} />
        </View>
      </SafeAreaView>
    );
  }

  const steps = [
    {
      tag: 'Venue Info',
      title: 'Tell us about\nyour venue',
      valid: form.name && form.type && form.address && form.city,
    },
    {
      tag: 'Online Presence',
      title: 'Help travelers\nfind you',
      valid: true,
    },
  ];

  const current = steps[step];

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await apiFetch('/api/businesses', {
      method: 'POST',
      body: JSON.stringify({
        name:        form.name,
        type:        form.type,
        address:     form.address,
        city:        form.city,
        mapsLink:    form.maps,
        tripadvisor: form.tripadvisor,
        instagram:   form.instagram,
        description: form.description,
      }),
    });
    setLoading(false);
    if (error) { Alert.alert('Could not submit venue', error); return; }
    Alert.alert(
      'Submitted for review',
      "We'll notify you once your venue is approved — usually within 3 business days.",
      [{ text: 'OK', onPress: () => navigation.navigate('BusinessDashboard') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => step === 0 ? navigation.goBack() : setStep(s => s - 1)}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader tag={current.tag} title={current.title} />

        {step === 0 && (
          <>
            <Field label="Venue Name *" placeholder="e.g. The Old Print House" value={form.name} onChangeText={v => set('name', v)} />
            <Field label="City *" placeholder="e.g. Lisbon, Tokyo, Berlin…" value={form.city} onChangeText={v => set('city', v)} />
            <Field label="Street Address *" placeholder="Street, number, postcode" value={form.address} onChangeText={v => set('address', v)} />

            <Text style={styles.label}>Venue Type *</Text>
            <View style={styles.chips}>
              {VENUE_TYPES.map(t => (
                <Chip key={t} label={t} active={form.type === t} onPress={() => set('type', t)} />
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <InfoBox>
              Adding your listings helps travelers trust your venue before booking. At least one link is recommended.
            </InfoBox>
            <Field label="Google Maps Link" placeholder="https://maps.google.com/…" value={form.maps} onChangeText={v => set('maps', v)} autoCapitalize="none" />
            <Field label="TripAdvisor Link" placeholder="https://tripadvisor.com/…" value={form.tripadvisor} onChangeText={v => set('tripadvisor', v)} autoCapitalize="none" />
            <Field label="Instagram (optional)" placeholder="@yourvenue" value={form.instagram} onChangeText={v => set('instagram', v)} autoCapitalize="none" />
            <Field label="Short Description" placeholder="What makes your venue special? What kind of experience can solo travelers expect?" value={form.description} onChangeText={v => set('description', v)} multiline rows={4} />
          </>
        )}

        {step < 1 ? (
          <Button label="Continue →" onPress={() => setStep(s => s + 1)} disabled={!current.valid} />
        ) : (
          <Button label="Submit for Review" onPress={handleSubmit} loading={loading} />
        )}

        {step === 1 && (
          <Text style={styles.reviewNote}>
            FreeSolo reviews all venues before approval. You'll be notified within 3 business days.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.white,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.sand },
  dotActive: { width: 20, borderRadius: 3, backgroundColor: Colors.ink },
  dotDone: { backgroundColor: Colors.clay },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  gateBody: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center', gap: Spacing.md },
  label: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.muted, marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  reviewNote: {
    fontFamily: Fonts.body, fontSize: 12, color: Colors.muted,
    textAlign: 'center', lineHeight: 18, marginTop: 4,
  },
});
