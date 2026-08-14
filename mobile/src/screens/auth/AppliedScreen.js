import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing } from '../../theme';
import { Button } from '../../components/UI';

export default function AppliedScreen({ navigation }) {
  return (
    <LinearGradient colors={[Colors.ink, '#1a1a1a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.heading}>Application{'\n'}Received</Text>
          <Text style={styles.body}>
            We review every story personally. Expect a response within 48 hours. Keep an eye on your inbox.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            label="Back to Home"
            variant="outline"
            onPress={() => navigation.navigate('Who')}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 72, marginBottom: 8 },
  heading: {
    fontFamily: Fonts.display, fontSize: 36,
    color: Colors.paper, textAlign: 'center',
    lineHeight: 44, letterSpacing: -0.5,
  },
  body: {
    fontFamily: Fonts.body, fontSize: 15,
    color: 'rgba(247,244,238,0.5)',
    textAlign: 'center', lineHeight: 24,
    maxWidth: 280,
  },
  footer: { paddingBottom: Spacing.xl },
});
