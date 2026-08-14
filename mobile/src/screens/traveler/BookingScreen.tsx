import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Button, Card, ProgressBar, InfoBox } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function BookingScreen({ navigation, route }: any) {
  const { exp } = route.params;
  const { user, isAuthenticated } = useAuth();
  const [seats, setSeats] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const seatsLeft = (exp.availableSeats ?? exp.maxSeats - (exp.filledSeats ?? 0));
  const total = exp.price * seats;
  const venueCut  = (total * 0.7).toFixed(2);
  const hostCut   = (total * 0.1).toFixed(2);
  const feesCut   = (total * 0.2).toFixed(2);

  const handleBook = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign in required", "You need to be signed in to book.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
      ]);
      return;
    }

    setLoading(true);
    // Create payment intent
    const { data, error } = await apiFetch<{ clientSecret: string; bookingId: string }>("/api/stripe/payment-intent", {
      method: "POST",
      body: JSON.stringify({ experienceId: exp.id, seats }),
    });
    setLoading(false);

    if (error) { Alert.alert("Booking failed", error); return; }

    // Navigate to payment screen
    navigation.navigate("Payment", {
      clientSecret: data?.clientSecret,
      bookingId: data?.bookingId,
      exp,
      seats,
      total,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve seats</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Experience summary */}
        <Card style={styles.expCard}>
          <View style={styles.expRow}>
            <View style={styles.expEmoji}><Text style={{ fontSize: 28 }}>{exp.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.expTitle}>{exp.title}</Text>
              <Text style={styles.expMeta}>{exp.date} · {exp.time} · {exp.city}</Text>
              <Text style={styles.expHost}>by {exp.host?.name ?? "Local host"}</Text>
            </View>
          </View>
          <ProgressBar filled={exp.filledSeats ?? 0} total={exp.maxSeats} warn={seatsLeft <= 2} />
          <Text style={styles.seatsText}>{exp.filledSeats ?? 0}/{exp.maxSeats} filled</Text>
        </Card>

        {/* Seat selector */}
        <Text style={styles.label}>Number of seats</Text>
        <View style={styles.seatSelector}>
          {[1,2,3,4].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => n <= seatsLeft && setSeats(n)}
              style={[styles.seatBtn, seats === n && styles.seatBtnActive, n > seatsLeft && styles.seatBtnDisabled]}
              disabled={n > seatsLeft}
            >
              <Text style={[styles.seatBtnText, seats === n && styles.seatBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.label}>Note for host (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Tell the host a bit about yourself…"
          placeholderTextColor={Colors.muted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />

        {/* Price breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Price breakdown</Text>
          {[
            [`€${exp.price} × ${seats} seat${seats !== 1 ? "s" : ""}`, `€${total.toFixed(2)}`],
            ["Venue (70%)", `€${venueCut}`],
            ["Host credit (10%)", `€${hostCut}`],
            ["FreeSolo fee (20%)", `€${feesCut}`],
          ].map(([label, val], i) => (
            <View key={i} style={[styles.breakdownRow, i === 0 && styles.breakdownRowTop]}>
              <Text style={i === 0 ? styles.breakdownLabelBold : styles.breakdownLabel}>{label}</Text>
              <Text style={i === 0 ? styles.breakdownValBold : styles.breakdownVal}>{val}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total charged</Text>
            <Text style={styles.totalVal}>€{total.toFixed(2)}</Text>
          </View>
        </Card>

        <InfoBox variant="warning">
          Your card is only charged once {exp.minSeats} travelers confirm. If the experience doesn't fill within 48h, you get a full refund automatically.
        </InfoBox>

        <Button
          label={`Continue to payment · €${total.toFixed(2)}`}
          onPress={handleBook}
          loading={loading}
        />
        <Button label="Maybe later" variant="outline" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.white, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center", ...Shadow.sm },
  backArrow: { fontSize: 18, color: Colors.ink },
  headerTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60 },
  expCard: { padding: 16, marginBottom: Spacing.lg },
  expRow: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 },
  expEmoji: { width: 52, height: 52, backgroundColor: Colors.ink, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  expTitle: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.ink, lineHeight: 20 },
  expMeta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginTop: 2 },
  expHost: { fontFamily: Fonts.body, fontSize: 12, color: Colors.clay, marginTop: 2 },
  seatsText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted, marginTop: 6 },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 8, marginTop: 4 },
  seatSelector: { flexDirection: "row", gap: 10, marginBottom: Spacing.md },
  seatBtn: { width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.sand, alignItems: "center", justifyContent: "center" },
  seatBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  seatBtnDisabled: { opacity: 0.3 },
  seatBtnText: { fontFamily: Fonts.bodyMedium, fontSize: 16, color: Colors.ink },
  seatBtnTextActive: { color: Colors.paper },
  noteInput: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.sand, borderRadius: Radius.md, padding: Spacing.md, fontFamily: Fonts.body, fontSize: 14, color: Colors.ink, height: 90, textAlignVertical: "top", marginBottom: Spacing.md },
  breakdownCard: { padding: 16, marginBottom: 12 },
  breakdownTitle: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink, marginBottom: 12 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  breakdownRowTop: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.sand, marginBottom: 8 },
  breakdownLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  breakdownLabelBold: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  breakdownVal: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  breakdownValBold: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.ink },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: Colors.sand, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink },
  totalVal: { fontFamily: Fonts.display, fontSize: 20, color: Colors.ink },
});
