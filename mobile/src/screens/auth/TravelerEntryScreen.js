import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius, Shadow } from '../../theme';
import { Button, Divider } from '../../components/UI';

export default function TravelerEntryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.tag}>Join the community</Text>
          <Text style={styles.heading}>FreeSolo is{'\n'}<Text style={styles.italic}>personally vetted</Text></Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Our community is built on trust. Every member applies and is reviewed by the team — which keeps the quality of experiences exceptionally high.
          </Text>
        </View>

        <View style={styles.actions}>
          <Text style={styles.sectionLabel}>Already a member?</Text>
          <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />

          <Divider label="or" />

          <Button
            label="Apply to join"
            variant="outline"
            onPress={() => navigation.navigate('Apply')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
    marginBottom: Spacing.lg,
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  titleBlock: { marginBottom: Spacing.lg },
  tag: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.clay, marginBottom: 8,
  },
  heading: { fontFamily: Fonts.display, fontSize: 34, color: Colors.ink, lineHeight: 42, letterSpacing: -0.5 },
  italic: { fontStyle: 'italic' },
  infoBox: {
    backgroundColor: Colors.sand,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink, lineHeight: 22 },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11, letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.muted,
    marginBottom: 8,
  },
  actions: { flex: 1 },
});
