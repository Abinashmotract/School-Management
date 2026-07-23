import { ScreenShell } from '@/components/navigation/ScreenShell';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import { fetchStudentResults, type StudentResultRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

export default function StudentResultsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<StudentResultRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchStudentResults();
      setRows(response.results || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load results.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell role="student" title="My Results" showBack showMenu>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
          }
        >
          <Text style={styles.sub}>Exam marks and assessment records</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}

          {rows.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="ribbon-outline" size={28} color={Neutrals.muted} />
              <Text style={styles.emptyText}>No results published yet.</Text>
            </View>
          ) : null}

          {rows.map((row, index) => (
            <View key={String(row._id || row.examId || index)} style={styles.card}>
              <Text style={styles.title}>
                {row.examName || row.subjectName || row.subjectId || 'Exam'}
              </Text>
              <View style={styles.metaRow}>
                {row.marksObtained != null ? (
                  <Text style={styles.meta}>Marks: {String(row.marksObtained)}</Text>
                ) : null}
                {row.maxMarks != null ? (
                  <Text style={styles.meta}>Max: {String(row.maxMarks)}</Text>
                ) : null}
                {row.grade ? <Text style={styles.meta}>Grade: {row.grade}</Text> : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 16 },
  err: { color: '#B91C1C', marginBottom: 12 },
  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 48 },
  emptyText: { color: Neutrals.muted, textAlign: 'center' },
  card: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  meta: { fontSize: 13, color: Neutrals.muted, fontWeight: '600' },
});
