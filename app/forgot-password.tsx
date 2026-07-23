import {
  resetForgotPassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "@/lib/auth-api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "username" | "otp" | "password";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [validator, setValidator] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSendOtp = async () => {
    if (!username.trim()) {
      Alert.alert("Forgot password", "Enter your username or student ID.");
      return;
    }
    setBusy(true);
    try {
      await sendForgotPasswordOtp(username.trim());
      Alert.alert("OTP sent", "Check your registered email or phone for the OTP.");
      setStep("otp");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Forgot password", "Enter the OTP you received.");
      return;
    }
    setBusy(true);
    try {
      const token = await verifyForgotPasswordOtp(username.trim(), otp.trim());
      setValidator(token);
      setStep("password");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Invalid OTP.");
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!password || password.length < 6) {
      Alert.alert("Forgot password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Forgot password", "Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetForgotPassword(validator, password);
      Alert.alert("Password updated", "You can now sign in with your new password.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#000" />
        <Text style={styles.backText}>Back to sign in</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.sub}>
          {step === "username"
            ? "Enter your account username or student ID"
            : step === "otp"
              ? "Enter the OTP sent to your registered contact"
              : "Choose a new password"}
        </Text>

        {step === "username" ? (
          <>
            <Text style={styles.label}>Username / Student ID</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="your@school.com or student ID"
              placeholderTextColor="#999"
            />
            <Pressable style={styles.btn} disabled={busy} onPress={() => void onSendOtp()}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
            </Pressable>
          </>
        ) : null}

        {step === "otp" ? (
          <>
            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              placeholder="6-digit code"
              placeholderTextColor="#999"
            />
            <Pressable style={styles.btn} disabled={busy} onPress={() => void onVerifyOtp()}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
            </Pressable>
          </>
        ) : null}

        {step === "password" ? (
          <>
            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 6 characters"
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Re-enter password"
              placeholderTextColor="#999"
            />
            <Pressable style={styles.btn} disabled={busy} onPress={() => void onReset()}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset password</Text>}
            </Pressable>
          </>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  back: { flexDirection: "row", alignItems: "center", gap: 8, padding: 20 },
  backText: { fontSize: 15, fontWeight: "600", color: "#000" },
  content: { paddingHorizontal: 22, paddingTop: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 8 },
  sub: { fontSize: 15, color: "#666", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  btn: {
    backgroundColor: "#000",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    minHeight: 52,
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
