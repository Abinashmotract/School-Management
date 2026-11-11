import { ScreenShell } from "@/components/navigation/ScreenShell";
import { RoleColors } from "@/constants/school-theme";
import { usePortalScreenStyles } from "@/hooks/use-portal-screen-styles";
import { fetchStudentLibrary, type LibraryIssueRow } from "@/lib/student-portal-api";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";

const primary = RoleColors.student.primary;

export default function StudentLibraryScreen() {
  const styles = usePortalScreenStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LibraryIssueRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRows(await fetchStudentLibrary());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load library books.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell role="student" title="Library" showBack showMenu>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={primary} /></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        >
          <Text style={styles.sub}>Books issued to you</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {rows.length === 0 ? <Text style={styles.empty}>No library books are issued to you.</Text> : null}
          {rows.map((row) => (
            <View key={row.issueId} style={styles.cardBlock}>
              <Text style={styles.cardTitle}>{row.bookTitle}</Text>
              <Text style={styles.muted}>{row.status} · Due {row.dueDate || "—"}</Text>
              {row.returnDate ? <Text style={styles.muted}>Returned {row.returnDate}</Text> : null}
              {row.fineAmount ? <Text style={styles.muted}>Fine ₹{row.fineAmount}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
