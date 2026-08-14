import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Button, Card, InfoBox } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

// CardField's `cardStyle` prop uses Stripe's own style shape (textColor,
// placeholderColor, …), which isn't compatible with StyleSheet.create's
// ViewStyle/TextStyle typing — kept as a plain object.
const cardFieldInputStyle = {
  backgroundColor: Colors.sand,
  textColor: Colors.ink,
  placeholderColor: Colors.muted,
  borderRadius: Radius.sm,
  fontSize: 14,
};

const METHODS = [
  { id: "card",   label: "Credit / Debit Card", icon: "💳", enabled: true },
  { id: "apple",  label: "Apple Pay",           icon: "",  enabled: false },
  { id: "google", label: "Google Pay",          icon: "G",  enabled: false },
] as const;

export default function PaymentScreen({ navigation, route }: any) {
  const { clientSecret, bookingId, exp, seats, total } = route.params;
  const { user } = useAuth();
  const { confirmPayment } = useStripe();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"card" | "apple" | "google">("card");
  const [cardComplete, setCardComplete] = useState(false);

  const handlePay = async () => {
    if (!cardComplete) {
      Alert.alert("Card details incomplete", "Please enter your full card details.");
      return;
    }

    setProcessing(true);
    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: "Card",
      paymentMethodData: {
        billingDetails: { email: user?.email },
      },
    });
    setProcessing(false);

    if (error) {
      Alert.alert("Payment failed", error.message);
      return;
    }

    if (paymentIntent?.status === "Succeeded" || paymentIntent?.status === "Processing") {
      navigation.replace("Confirmed", { exp, bookingId, seats, total });
    } else {
      Alert.alert("Payment incomplete", `Payment status: ${paymentIntent?.status ?? "unknown"}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>{exp.emoji}</Text>
          <Text style={styles.summaryTitle}>{exp.title}</Text>
          <Text style={styles.summaryMeta}>{seats} seat{seats !== 1 ? "s" : ""} · {exp.date}</Text>
          <View style={styles.summaryPrice}>
            <Text style={styles.summaryPriceLabel}>Total</Text>
            <Text style={styles.summaryPriceVal}>€{total.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Payment methods */}
        <Text style={styles.label}>Payment method</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => m.enabled && setMethod(m.id)}
              disabled={!m.enabled}
              style={[
                styles.methodRow,
                method === m.id && styles.methodRowActive,
                !m.enabled && styles.methodRowDisabled,
              ]}
            >
              <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>{m.label}</Text>
              {m.enabled ? (
                <View style={[styles.radio, method === m.id && styles.radioActive]}>
                  {method === m.id && <View style={styles.radioDot} />}
                </View>
              ) : (
                <View style={styles.soonPill}>
                  <Text style={styles.soonText}>Coming soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Stripe card field */}
        {method === "card" && (
          <Card style={styles.cardFieldCard}>
            <Text style={styles.cardFieldNote}>
              🔒 Powered by Stripe — your card details are encrypted and never stored on FreeSolo servers.
            </Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={cardFieldInputStyle}
              style={styles.cardField}
              onCardChange={(details) => setCardComplete(details.complete)}
            />
          </Card>
        )}

        <InfoBox variant="warning">
          Your card is pre-authorized but only charged once {exp.minSeats} travelers confirm. Full refund if the experience doesn't fill.
        </InfoBox>

        <Button
          label={processing ? "Processing…" : `Pay €${total.toFixed(2)}`}
          onPress={handlePay}
          loading={processing}
          disabled={!cardComplete}
        />

        <View style={styles.secureRow}>
          <Text style={styles.secureText}>🔒 Secured by Stripe · 256-bit SSL</Text>
        </View>
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
  summaryCard: { padding: 20, marginBottom: Spacing.lg, alignItems: "center" },
  summaryEmoji: { fontSize: 36, marginBottom: 8 },
  summaryTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.ink, textAlign: "center", marginBottom: 4 },
  summaryMeta: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginBottom: 16 },
  summaryPrice: { flexDirection: "row", justifyContent: "space-between", width: "100%", borderTopWidth: 1, borderTopColor: Colors.sand, paddingTop: 12 },
  summaryPriceLabel: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink },
  summaryPriceVal: { fontFamily: Fonts.display, fontSize: 22, color: Colors.ink },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: Colors.muted, marginBottom: 8 },
  methods: { marginBottom: Spacing.md, gap: 8 },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.sand },
  methodRowActive: { borderColor: Colors.ink },
  methodRowDisabled: { opacity: 0.5 },
  methodLabel: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.muted },
  methodLabelActive: { color: Colors.ink },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.sand, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: Colors.ink },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.ink },
  soonPill: { backgroundColor: Colors.sand, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  soonText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  cardFieldCard: { padding: 16, marginBottom: Spacing.md },
  cardFieldNote: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, marginBottom: 4, lineHeight: 18 },
  cardField: { width: "100%", height: 50, marginVertical: 8 },
  secureRow: { alignItems: "center", marginTop: 8 },
  secureText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.muted },
});
