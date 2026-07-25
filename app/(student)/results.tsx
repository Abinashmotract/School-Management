import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles, useThemeColors } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { fetchStudentResults, type StudentResultRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 48 },
  emptyText: { color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  meta: { fontSize: 13, color: colors.muted, fontWeight: '600' },
}));

export default function StudentResultsScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const { colors } = useThemeColors();
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
              <Ionicons name="ribbon-outline" size={28} color={colors.muted} />
              <Text style={styles.emptyText}>No results published yet.</Text>
            </View>
          ) : null}

          {rows.map((row, index) => (
            <View key={String(row._id || row.examId || index)} style={styles.card}>
              <Text style={styles.cardTitle}>
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
