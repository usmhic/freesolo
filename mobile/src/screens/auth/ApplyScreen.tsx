import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Field, Button, InfoBox } from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function ApplyScreen({ navigation }: any) {
  const [form, setForm] = useState({ story: "", email: "", phone: "" });
  const [image, setImage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await apiFetch("/api/applications", {
      method: "POST",
      body: JSON.stringify({
        story: form.story,
        email: form.email,
        phone: form.phone,
        imageUrl: image ?? "",
      }),
    });
    setLoading(false);

    if (error) {
      Alert.alert("Submission failed", error);
      return;
    }
    navigation.navigate("Applied");
  };

  const canSubmit = form.story.length >= 80 && form.email && form.phone && image && emailSent;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.tag}>Application</Text>
        <Text style={styles.heading}>Tell us about{"\n"}your solo journey</Text>

        <InfoBox>
          We review every application personally. Share one real experience — where you went, what happened, why it mattered.
        </InfoBox>

        <Text style={styles.label}>Your Solo Travel Story *</Text>
        <Field
          placeholder="Describe one of your solo travel experiences. Where did you go? What did you discover? What made it authentic and memorable?"
          value={form.story}
          onChangeText={(t: string) => setForm((f) => ({ ...f, story: t }))}
          multiline
          rows={6}
        />
        <Text style={[styles.counter, form.story.length >= 80 && styles.counterOk]}>
          {form.story.length} / 80 min
        </Text>

        <Text style={styles.label}>Photo from that trip *</Text>
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
            <Text style={{ fontSize: 28 }}>📷</Text>
            <Text style={styles.uploadLabel}>Tap to upload</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.label, { marginTop: Spacing.md }]}>Email Address *</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(t: string) => setForm((f) => ({ ...f, email: t }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            onPress={() => setEmailSent(true)}
            style={[styles.verifyBtn, emailSent && styles.verifyBtnDone]}
          >
            <Text style={styles.verifyBtnText}>{emailSent ? "✓" : "Verify"}</Text>
          </TouchableOpacity>
        </View>
        {emailSent && <Text style={styles.verifyNote}>Check your inbox for the verification email</Text>}

        <Field
          label="Phone Number *"
          placeholder="+1 234 567 8900"
          value={form.phone}
          onChangeText={(t: string) => setForm((f) => ({ ...f, phone: t }))}
          keyboardType="phone-pad"
        />

        <Button label="Submit Application" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
        <Text style={styles.footer}>
          We review applications within 48 hours. The moment you're approved, we'll email you — then just open the app and sign in with this email.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 60 },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.white,
    borderRadius: Radius.sm, alignItems: "center", justifyContent: "center",
    marginBottom: Spacing.lg, ...Shadow.sm,
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  tag: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 1,
    textTransform: "uppercase", color: Colors.clay, marginBottom: 8,
  },
  heading: {
    fontFamily: Fonts.display, fontSize: 30, color: Colors.ink,
    lineHeight: 38, letterSpacing: -0.5, marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8,
    textTransform: "uppercase", color: Colors.muted, marginBottom: 6,
  },
  counter: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, textAlign: "right", marginTop: -8, marginBottom: Spacing.md },
  counterOk: { color: Colors.success },
  uploadBox: {
    borderWidth: 2, borderStyle: "dashed", borderColor: Colors.clay,
    borderRadius: Radius.md, height: 110,
    alignItems: "center", justifyContent: "center", gap: 6, marginBottom: Spacing.md,
  },
  uploadLabel: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.clay },
  imagePreview: { borderRadius: Radius.md, overflow: "hidden", height: 160, marginBottom: Spacing.md, position: "relative" },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute", top: 8, right: 8, width: 28, height: 28,
    borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  removeBtnText: { color: Colors.white, fontSize: 13 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  verifyBtn: {
    backgroundColor: Colors.ink, borderRadius: Radius.sm,
    paddingHorizontal: 14, height: 54, justifyContent: "center", marginBottom: Spacing.md,
  },
  verifyBtnDone: { backgroundColor: Colors.success },
  verifyBtnText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontSize: 13 },
  verifyNote: { fontFamily: Fonts.body, fontSize: 11, color: Colors.success, marginTop: -8, marginBottom: Spacing.md },
  footer: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, textAlign: "center", lineHeight: 18, marginTop: Spacing.sm },
});
