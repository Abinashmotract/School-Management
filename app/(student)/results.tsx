import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles, useThemeColors } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { fetchStudentResults, type StudentResultRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
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

          {Object.entries(rows.reduce<Record<string, StudentResultRow[]>>((groups, row) => {
            const key = row.examName || row.examId || 'Exam';
            groups[key] = groups[key] || [];
            groups[key].push(row);
            return groups;
          }, {})).map(([exam, subjects]) => {
            const obtained = subjects.reduce((sum, row) => sum + Number(row.marksObtained || 0), 0);
            const max = subjects.reduce((sum, row) => sum + Number(row.maxMarks || 0), 0);
            const percentage = max > 0 ? Math.round((obtained / max) * 10) / 10 : null;
            const report = [
              exam,
              percentage != null ? `Percentage: ${percentage}%` : '',
              ...subjects.map((row) => `${row.subjectName || row.subjectId}: ${row.marksObtained ?? '—'} / ${row.maxMarks ?? '—'}${row.grade ? ` (${row.grade})` : ''}`),
            ].filter(Boolean).join('\n');
            return (
              <View key={exam} style={styles.card}>
                <Text style={styles.cardTitle}>{exam}</Text>
                {percentage != null ? <Text style={styles.meta}>Percentage {percentage}%</Text> : null}
                {subjects.map((row, index) => (
                  <View key={String(row._id || index)} style={styles.metaRow}>
                    <Text style={styles.meta}>{row.subjectName || row.subjectId || 'Subject'}</Text>
                    <Text style={styles.meta}>{row.marksObtained ?? '—'} / {row.maxMarks ?? '—'}</Text>
                    {row.grade ? <Text style={styles.meta}>{row.grade}</Text> : null}
                  </View>
                ))}
                <Pressable onPress={() => void Share.share({ message: report })}>
                  <Text style={[styles.meta, { color: primary, marginTop: 8 }]}>Share report card</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
