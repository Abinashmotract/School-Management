import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import { applyStudentLeave, fetchStudentLeaves, type StudentLeaveRow } from "@/lib/student-portal-api";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

const primary = RoleColors.student.primary;

export default function StudentLeaveScreen() {
  const styles = usePortalScreenStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<StudentLeaveRow[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await fetchStudentLeaves());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setSaving(true);
    try {
      await applyStudentLeave({ startDate: startDate.trim(), endDate: endDate.trim(), reason: reason.trim() });
      setStartDate("");
      setEndDate("");
      setReason("");
      await load();
      Alert.alert("Leave", "Your request was sent to the school.");
    } catch (e) {
      Alert.alert("Leave", e instanceof Error ? e.message : "Could not send the request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell role="student" title="Leave" showBack showMenu>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={primary} /></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        >
          <Text style={styles.sub}>Apply for leave. The school reviews each request.</Text>
          <TextInput style={input} placeholder="Start date YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
          <TextInput style={input} placeholder="End date YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
          <TextInput style={[input, { minHeight: 90 }]} placeholder="Reason" multiline value={reason} onChangeText={setReason} />
          <Pressable onPress={() => void submit()} disabled={saving} style={{ backgroundColor: primary, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 18 }}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Submit leave</Text>}
          </Pressable>
          {rows.length === 0 ? <Text style={styles.empty}>No leave requests yet.</Text> : null}
          {rows.map((row) => (
            <View key={row.requestId} style={styles.cardBlock}>
              <Text style={styles.cardTitle}>{row.startDate} to {row.endDate}</Text>
              <Text style={styles.muted}>{row.status}</Text>
              {row.reason ? <Text style={styles.body}>{row.reason}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#cbd5e1",
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  fontSize: 15,
};
