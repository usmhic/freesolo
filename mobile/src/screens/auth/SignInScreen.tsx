import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../../theme";
import { Field, Button, Divider } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const OTP_LENGTH = 6;

export default function SignInScreen({ navigation }: any) {
  const { requestOtp, verifyOtp, signInWithSocial } = useAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [social, setSocial] = useState<"google" | "apple" | null>(null);

  const handleSendCode = async () => {
    if (!email) return;
    setSending(true);
    const { error } = await requestOtp(email);
    setSending(false);
    if (error) {
      Alert.alert("Couldn't send the code", error);
      return;
    }
    setOtp("");
    setStep("otp");
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return;
    setVerifying(true);
    const { error } = await verifyOtp(email, otp);
    setVerifying(false);
    if (error) {
      Alert.alert("That code didn't work", error);
      return;
    }
    navigation.replace("TravelPlan");
  };

  const handleSocial = async (provider: "google" | "apple") => {
    setSocial(provider);
    const { error } = await signInWithSocial(provider);
    setSocial(null);
    if (error) {
      Alert.alert(`Couldn't continue with ${provider === "google" ? "Google" : "Apple"}`, error);
      return;
    }
    navigation.replace("TravelPlan");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.tag}>Welcome back</Text>
          <Text style={styles.heading}>Sign in to{"\n"}FreeSolo</Text>

          {step === "email" && (
            <>
              <Field
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                label={sending ? "Sending code…" : "Send sign-in code"}
                onPress={handleSendCode}
                loading={sending}
                disabled={!email}
              />
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={styles.helper}>
                We sent a {OTP_LENGTH}-digit code to {email}. It expires in 5 minutes.
              </Text>
              <Field
                label={`${OTP_LENGTH}-digit code`}
                placeholder="••••••"
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                keyboardType="numeric"
              />
              <Button
                label={verifying ? "Verifying…" : "Verify and sign in"}
                onPress={handleVerify}
                loading={verifying}
                disabled={otp.length !== OTP_LENGTH}
              />
              <TouchableOpacity
                onPress={() => { setStep("email"); setOtp(""); }}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

          <Divider label="or continue with" />

          <Button
            label={social === "google" ? "Redirecting…" : "Continue with Google"}
            variant="google"
            icon="G"
            loading={social === "google"}
            disabled={social !== null}
            onPress={() => handleSocial("google")}
          />
          <Button
            label={social === "apple" ? "Redirecting…" : "Continue with Apple"}
            variant="google"
            icon=""
            loading={social === "apple"}
            disabled={social !== null}
            onPress={() => handleSocial("apple")}
          />

          <TouchableOpacity onPress={() => navigation.navigate("Apply")} style={styles.footer}>
            <Text style={styles.footerText}>
              Not on FreeSolo yet?{" "}
              <Text style={styles.footerLink}>Apply to join</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 60 },
  backBtn: {
    width: 40, height: 40, backgroundColor: Colors.white,
    borderRadius: Radius.sm, alignItems: "center", justifyContent: "center",
    marginBottom: Spacing.xl, ...Shadow.sm,
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  tag: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11, letterSpacing: 1,
    textTransform: "uppercase", color: Colors.clay, marginBottom: 8,
  },
  heading: {
    fontFamily: Fonts.display, fontSize: 32, color: Colors.ink,
    lineHeight: 40, letterSpacing: -0.5, marginBottom: Spacing.xl,
  },
  helper: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted, marginBottom: Spacing.md, lineHeight: 19 },
  linkBtn: { alignItems: "center", marginTop: -Spacing.xs, marginBottom: Spacing.sm },
  linkText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.muted, textDecorationLine: "underline" },
  footer: { alignItems: "center", marginTop: Spacing.md },
  footerText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.muted },
  footerLink: { fontFamily: Fonts.bodySemiBold, color: Colors.ink, textDecorationLine: "underline" },
});
