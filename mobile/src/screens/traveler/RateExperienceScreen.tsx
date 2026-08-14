import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Card, Button, Field, BackButton } from "../../components/UI";
import { apiFetch, uploadFile } from "../../lib/api";

export default function RateExperienceScreen({ navigation, route }: any) {
  const { booking } = route.params;
  const exp = booking.experience ?? {};

  const [step, setStep] = useState<"rate" | "photos">("rate");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const submitReview = async () => {
    if (rating === 0) { setError("Please select a star rating"); return; }
    if (body.trim().length < 10) { setError("Review must be at least 10 characters"); return; }
    setSubmitting(true);
    setError(null);
    const { error: e } = await apiFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking.id,
        experienceId: booking.experienceId,
        targetUserId: exp.host?.id,
        rating,
        body: body.trim(),
      }),
    });
    setSubmitting(false);
    if (e) { setError(e); return; }
    setStep("photos");
  };

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (result.canceled) return;

    setUploading(true);
    const uploaded = await uploadFile(result.assets[0].uri, "event-photo");
    if (uploaded) {
      await apiFetch(`/api/experiences/${booking.experienceId}/photos`, {
        method: "POST",
        body: JSON.stringify({ url: uploaded.url, key: uploaded.key }),
      });
      setPhotos(prev => [...prev, { url: uploaded.url }]);
    }
    setUploading(false);
  };

  const finish = () => {
    route.params?.onDone?.();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{step === "rate" ? "Rate this experience" : "Share photos"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        {/* Experience summary */}
        <Card style={styles.expCard}>
          <View style={styles.expRow}>
            <View style={styles.expIcon}>
              <Text style={{ fontSize: 28 }}>{exp.emoji ?? "🌍"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.expTitle}>{exp.title ?? "Experience"}</Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}><Text style={styles.pillText}>📍 {exp.city}</Text></View>
                <View style={styles.pill}><Text style={styles.pillText}>{exp.emoji} {exp.category}</Text></View>
              </View>
            </View>
          </View>
        </Card>

        {step === "rate" ? (
          <>
            <Text style={styles.sectionTitle}>Your rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                  <Text style={[styles.star, n <= rating && styles.starActive]}>
                    {n <= rating ? "★" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label="Your review"
              placeholder="What did you love about this experience?"
              value={body}
              onChangeText={setBody}
              multiline
              rows={5}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button label="Submit review" onPress={submitReview} loading={submitting} />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Share photos from this experience</Text>
            <Text style={styles.helperText}>Your photos will be added to the shared gallery for everyone who attended.</Text>

            <View style={styles.photoGrid}>
              {photos.map((p, i) => (
                <Image key={i} source={{ uri: p.url }} style={styles.photoThumb} />
              ))}
              <TouchableOpacity style={styles.addPhotoTile} onPress={addPhoto} disabled={uploading} activeOpacity={0.7}>
                {uploading ? (
                  <ActivityIndicator color={Colors.clay} />
                ) : (
                  <>
                    <Text style={{ fontSize: 28 }}>＋</Text>
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Button label="Done" onPress={finish} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  title: { fontFamily: Fonts.display, fontSize: 18, color: Colors.ink },
  expCard: { padding: 14, marginBottom: Spacing.lg },
  expRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  expIcon: { width: 48, height: 48, backgroundColor: Colors.sand, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  expTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.ink, marginBottom: 6 },
  pillRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pill: { backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.ink },
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 10 },
  starsRow: { flexDirection: "row", gap: 10, marginBottom: Spacing.lg },
  star: { fontSize: 40, color: Colors.sand },
  starActive: { color: Colors.warning },
  errorText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.danger, marginBottom: Spacing.sm },
  helperText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginBottom: Spacing.md, lineHeight: 20 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: Spacing.lg },
  photoThumb: { width: 100, height: 100, borderRadius: Radius.md, backgroundColor: Colors.sand },
  addPhotoTile: { width: 100, height: 100, borderRadius: Radius.md, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.sand, borderStyle: "dashed", alignItems: "center", justifyContent: "center", ...Shadow.xs },
  addPhotoText: { fontFamily: Fonts.bodyMedium, fontSize: 11, color: Colors.muted, marginTop: 4 },
});
