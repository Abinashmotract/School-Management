import type { AppRole } from "@/constants/school-theme";
import { RoleColors } from "@/constants/school-theme";
import { LinearGradient } from "@/components/ui/LinearGradient";
import { getLoginEndpoint } from "@/lib/auth-api";
import { useAppTheme } from "@/providers/AppThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import {
  clearLoginError,
  loginParent,
  loginStudent,
  loginTeacher,
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
  const { colors, isDark } = useAppTheme();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [busy, setBusy] = useState(false);
  const accent = RoleColors[selectedRole];

  const onSignIn = async () => {
    dispatch(clearLoginError());

    if (!studentId.trim() || !password) {
      const who =
        selectedRole === "student"
          ? "Student ID and password"
          : selectedRole === "parent"
            ? "parent username/email and password"
            : "staff username/email and password";
      Alert.alert("Sign in", `Enter ${who}.`);
      return;
    }

    setBusy(true);

    if (selectedRole === "student") {
      const action = await dispatch(
        loginStudent({
          studentId: studentId.trim(),
          password,
        })
      );
      setBusy(false);
      if (loginStudent.fulfilled.match(action)) {
        router.replace(rolePaths.student as never);
      } else if (loginStudent.rejected.match(action)) {
        const msg =
          typeof action.payload === "string"
            ? action.payload
            : "Sign in failed.";
        Alert.alert("Sign in failed", msg);
      }
      return;
    }

    if (selectedRole === "parent") {
      const action = await dispatch(
        loginParent({
          username: studentId.trim(),
          password,
        })
      );
      setBusy(false);
      if (loginParent.fulfilled.match(action)) {
        router.replace(rolePaths.parent as never);
      } else if (loginParent.rejected.match(action)) {
        const msg =
          typeof action.payload === "string"
            ? action.payload
            : "Sign in failed.";
        Alert.alert("Sign in failed", msg);
      }
      return;
    }

    const action = await dispatch(
      loginTeacher({
        username: studentId.trim(),
        password,
      })
    );
    setBusy(false);

    if (loginTeacher.fulfilled.match(action)) {
      router.replace(rolePaths.teacher as never);
    } else if (loginTeacher.rejected.match(action)) {
      const msg =
        typeof action.payload === "string" ? action.payload : "Sign in failed.";
      Alert.alert("Sign in failed", msg);
    }
  };

  const idLabel =
    selectedRole === "student"
      ? "Student ID"
      : selectedRole === "parent"
        ? "Parent username / email"
        : "Staff username / email";
  const idPlaceholder =
    selectedRole === "student"
      ? "e.g. TENANT-ABC-010120"
      : selectedRole === "parent"
        ? "parent@school.com"
        : "teacher@school.com";
  const idKeyboard =
    selectedRole === "student" ? "default" : "email-address";

  const demoHint =
    selectedRole === "student"
      ? `Students: Student ID + admission password. API: ${getLoginEndpoint()}`
      : selectedRole === "parent"
        ? `Parents: username/email + password (role PARENT). API: ${getLoginEndpoint()}`
        : `Teachers: staff username/email + password. API: ${getLoginEndpoint()}`;

  return (
    <KeyboardAvoidingView
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.bg },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[accent.primary, accent.gradientEnd]}
        style={[styles.hero, { marginTop: 12 }]}
      >
        <View style={styles.heroIcon}>
          <Ionicons name="school" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSub}>Sign in to your school portal</Text>
      </LinearGradient>

      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.muted }]}>I am a</Text>
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
                    {
                      borderColor: active ? c.primary : colors.border,
                      backgroundColor: active ? `${c.primary}${isDark ? "33" : "14"}` : colors.input,
                    },
                  ]}
                >
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={active ? c.primary : colors.muted}
                  />
                  <Text
                    style={[
                      styles.roleChipText,
                      { color: active ? c.primary : colors.muted },
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>{idLabel}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={idPlaceholder}
            placeholderTextColor={colors.muted}
            keyboardType={idKeyboard}
            autoCapitalize="none"
            autoCorrect={false}
            value={studentId}
            onChangeText={setStudentId}
          />

          <Text style={[styles.label, { color: colors.muted }]}>Password</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.forgot} onPress={() => router.push("/forgot-password" as never)}>
            <Text style={[styles.forgotText, { color: accent.primary }]}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[
              styles.primaryBtn,
              { backgroundColor: accent.primary, shadowColor: accent.primaryDark },
              busy && styles.primaryBtnDisabled,
            ]}
            onPress={() => void onSignIn()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </Pressable>

          <View style={[styles.demo, { backgroundColor: colors.input }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.muted} />
            <Text style={[styles.demoText, { color: colors.muted }]}>{demoHint}</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    marginHorizontal: 18,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSub: {
    marginTop: 6,
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
    minHeight: 54,
    justifyContent: "center",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    padding: 12,
    borderRadius: 14,
  },
  demoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
