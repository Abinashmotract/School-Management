import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { resolveSchoolName } from "@/lib/drawer-profile";
import { fetchStudentProfile, toPortalOverview, type StudentProfile } from "@/lib/student-portal-api";
import { useAppSelector } from "@/store/hooks";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Share, Text, Pressable, View } from "react-native";

const primary = RoleColors.student.primary;

export default function StudentIdCardScreen() {
  const school = resolveSchoolName(useAppSelector((state) => state.auth.user));
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStudentProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenShell role="student" title="ID card" showBack showMenu>
        <ActivityIndicator color={primary} style={{ marginTop: 40 }} />
      </ScreenShell>
    );
  }

  const overview = profile ? toPortalOverview(profile) : null;
  const photo = profile?.basicInformation?.photo;
  const lines = [
    school || "School",
    overview?.studentName || "Student",
    `Admission: ${profile?.admissionNumber || "—"}`,
    `Class: ${overview?.className || "—"} ${overview?.sectionName || ""}`.trim(),
    `Roll: ${overview?.rollNumber || "—"}`,
    `Session: ${overview?.session || "—"}`,
  ];

  return (
    <ScreenShell role="student" title="ID card" showBack showMenu>
      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" }}>
          <View style={{ backgroundColor: primary, padding: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{school || "Student card"}</Text>
          </View>
          <View style={{ alignItems: "center", padding: 20, gap: 8 }}>
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: 96, height: 96, borderRadius: 48 }} />
            ) : (
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: `${primary}22`, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 32, fontWeight: "700", color: primary }}>{(overview?.studentName || "S").charAt(0)}</Text>
              </View>
            )}
            <Text style={{ fontSize: 20, fontWeight: "700" }}>{overview?.studentName}</Text>
            <Text>{lines[2]}</Text>
            <Text>{lines[3]}</Text>
            <Text>{lines[4]}</Text>
            <Text>{lines[5]}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => void Share.share({ message: lines.join("\n") })}
          style={{ marginTop: 16, backgroundColor: primary, borderRadius: 12, padding: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Share card details</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
