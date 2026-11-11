import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import { fetchExamSchedule, fetchStudentProfile, type ExamScheduleRow } from "@/lib/student-portal-api";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";

const primary = RoleColors.student.primary;

function when(row: ExamScheduleRow) {
  const date = row.date ? new Date(row.date).toLocaleDateString() : "Date to be announced";
  const time = [row.startTime, row.endTime].filter(Boolean).join(" – ");
  return time ? `${date} · ${time}` : date;
}

export default function StudentExamsScreen() {
  const styles = usePortalScreenStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ExamScheduleRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile().catch(() => null);
      setRows(await fetchExamSchedule(profile?.academicInformation?.session));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the exam dates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell role="student" title="Exam dates" showBack showMenu>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={primary} /></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        >
          <Text style={styles.sub}>Date sheet for your class</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {rows.length === 0 ? <Text style={styles.empty}>No exam dates published yet.</Text> : null}
          {rows.map((row) => (
            <View key={row.scheduleId || `${row.examId}-${row.subjectName}-${row.date}`} style={styles.cardBlock}>
              <Text style={styles.cardTitle}>{row.subjectName || "Subject"}</Text>
              <Text style={styles.muted}>{row.examName}</Text>
              <Text style={styles.body}>{when(row)}</Text>
              {row.venue ? <Text style={styles.muted}>Venue: {row.venue}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
