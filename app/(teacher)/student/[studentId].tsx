import { ScreenShell } from '@/components/navigation/ScreenShell';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import { fetchTeacherHomework } from '@/lib/teacher-homework-api';
import {
  fetchTeacherAllocations,
  fetchTeacherStudents,
  type TeacherStudentRow,
} from '@/lib/teacher-portal-api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

function studentName(row: TeacherStudentRow) {
  const basic = row.basicInformation || row.studentInformation?.basicInformation;
  return (
    [basic?.firstName, basic?.middleName, basic?.lastName].filter(Boolean).join(' ').trim() ||
    row.studentId ||
    row.studentInformation?.studentId ||
    'Student'
  );
}

function studentId(row: TeacherStudentRow) {
  return row.studentId || row.studentInformation?.studentId || '';
}

export default function TeacherStudentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ studentId?: string }>();
  const targetId = String(params.studentId || '');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<TeacherStudentRow | null>(null);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [gradedCount, setGradedCount] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      const rows = await fetchTeacherStudents(allocations);
      const match = rows.find((row) => studentId(row) === targetId) || null;
      setStudent(match);

      const homework = await fetchTeacherHomework();
      const related = homework.flatMap((item) =>
        (item.submissions || []).filter((sub) => sub.studentId === targetId)
      );
      setHomeworkCount(related.length);
      setGradedCount(related.filter((sub) => sub.status === 'GRADED').length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load student.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const name = useMemo(() => (student ? studentName(student) : 'Student'), [student]);
  const academic = student?.academicInformation || student?.studentInformation?.academicInformation;
  const basic = student?.basicInformation || student?.studentInformation?.basicInformation;

  return (
    <ScreenShell role="teacher" title="Student" showBack showMenu>
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
          {error ? <Text style={styles.err}>{error}</Text> : null}
          {!student ? (
            <Text style={styles.empty}>Student not found in your allocated classes.</Text>
          ) : (
            <>
              <View style={styles.hero}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.meta}>
                    {academic?.admissionClass || 'Class'} · Section {academic?.admissionSection || '-'}
                  </Text>
                  <Text style={styles.meta}>
                    Roll {(academic as { rollNumber?: string })?.rollNumber || student.rollNumber || '-'} ·{' '}
                    {student.admissionNumber || student.studentInformation?.admissionNumber || ''}
                  </Text>
                </View>
              </View>

              <View style={styles.stats}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{homeworkCount}</Text>
                  <Text style={styles.statLabel}>Submissions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{gradedCount}</Text>
                  <Text style={styles.statLabel}>Graded</Text>
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Contact</Text>
                {basic?.phone ? <Text style={styles.panelRow}>Phone: {basic.phone}</Text> : null}
                {basic?.email ? <Text style={styles.panelRow}>Email: {basic.email}</Text> : null}
                {!basic?.phone && !basic?.email ? (
                  <Text style={styles.panelRow}>No contact details on file.</Text>
                ) : null}
              </View>

              <Pressable style={styles.actionBtn} onPress={() => router.push('/(teacher)/attendance' as never)}>
                <Ionicons name="checkbox-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Mark attendance</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={() => router.push('/(teacher)/homework' as never)}>
                <Ionicons name="create-outline" size={20} color={primary} />
                <Text style={styles.secondaryBtnText}>Review homework</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: primary },
  name: { fontSize: 20, fontWeight: '800', color: Neutrals.text },
  meta: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Neutrals.text },
  statLabel: { fontSize: 12, color: Neutrals.muted, marginTop: 4, fontWeight: '700' },
  panel: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  panelTitle: { fontSize: 15, fontWeight: '800', color: Neutrals.text, marginBottom: 8 },
  panelRow: { fontSize: 14, color: Neutrals.text, marginBottom: 4 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${primary}12`,
    borderRadius: 14,
    paddingVertical: 14,
  },
  secondaryBtnText: { color: primary, fontWeight: '800', fontSize: 15 },
});
