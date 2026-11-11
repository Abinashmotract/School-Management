import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { changeStudentPassword } from "@/lib/student-portal-api";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";

const primary = RoleColors.student.primary;

export default function StudentPasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await changeStudentPassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      Alert.alert("Password", "Your password was updated.");
    } catch (e) {
      Alert.alert("Password", e instanceof Error ? e.message : "Could not update the password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell role="student" title="Change password" showBack showMenu>
      <View style={{ padding: 20, gap: 10 }}>
        <TextInput secureTextEntry placeholder="Current password" value={oldPassword} onChangeText={setOldPassword} style={input} />
        <TextInput secureTextEntry placeholder="New password" value={newPassword} onChangeText={setNewPassword} style={input} />
        <Pressable onPress={() => void submit()} disabled={saving} style={{ backgroundColor: primary, borderRadius: 12, padding: 14, alignItems: "center" }}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Update password</Text>}
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#cbd5e1",
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
};
