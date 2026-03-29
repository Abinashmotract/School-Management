import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { getLoginEndpoint } from "@/lib/auth-api";
import { useAppDispatch } from "@/store/hooks";
import {
  clearLoginError,
  enterDemoRole,
  loginStudent,
} from "@/store/slices/authSlice";
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

const roles: {
  id: AppRole;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { id: "student", label: "Student", icon: "school-outline" },
  { id: "parent", label: "Parent", icon: "people-outline" },
  { id: "teacher", label: "Teacher", icon: "easel-outline" },
];

const rolePaths: Record<AppRole, string> = {
  student: "/(student)/(tabs)",
  parent: "/(parent)/(tabs)",
  teacher: "/(teacher)/(tabs)",
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    dispatch(clearLoginError());

    if (selectedRole === "student") {
      if (!studentId.trim() || !password) {
        Alert.alert("Sign in", "Enter Student ID and password.");
        return;
      }
      setBusy(true);
      const action = await dispatch(
        loginStudent({
          studentId: studentId.trim(),
          password,
        })
      );
      setBusy(false);
      if (loginStudent.fulfilled.match(action)) {
        router.replace("/(student)/(tabs)" as never);
      } else if (loginStudent.rejected.match(action)) {
        const msg =
          typeof action.payload === "string"
            ? action.payload
            : "Sign in failed.";
        Alert.alert("Sign in failed", msg);
      }
      return;
    }

    dispatch(enterDemoRole(selectedRole));
    router.replace(rolePaths[selectedRole] as never);
  };

  const idLabel = selectedRole === "student" ? "Student ID" : "Email";
  const idPlaceholder =
    selectedRole === "student" ? "e.g. TENANT-ABC-010120" : "hello@example.com";
  const idKeyboard =
    selectedRole === "student" ? "default" : "email-address";

  return (
    <KeyboardAvoidingView
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to your account</Text>

          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleRow}>
            {roles.map((r) => {
              const active = selectedRole === r.id;
              const c = RoleColors[r.id];
              return (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    dispatch(clearLoginError());
                    setSelectedRole(r.id);
                  }}
                  style={[
                    styles.roleChip,
                    active && {
                      borderColor: c.primary,
                      backgroundColor: `${c.primary}12`,
                    },
                  ]}
                >
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={active ? c.primary : "#666"}
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      active && { color: c.primary },
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{idLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={idPlaceholder}
            placeholderTextColor="#999"
            keyboardType={idKeyboard}
            autoCapitalize="none"
            autoCorrect={false}
            value={studentId}
            onChangeText={setStudentId}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, busy && styles.primaryBtnDisabled]}
            onPress={() => void onSignIn()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in →</Text>
            )}
          </Pressable>

          <View style={styles.demo}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#666" />
            <Text style={styles.demoText}>
              {selectedRole === "student"
                ? `Students: Student ID + admission password. API: ${getLoginEndpoint()}`
                : "Demo: any email/password · role controls the app"}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
  },
  sub: {
    fontSize: 15,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    justifyContent: "center",
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
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
  forgot: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  primaryBtn: {
    backgroundColor: "#000",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  demoText: {
    flex: 1,
    fontSize: 11,
    color: "#666",
  },
});
