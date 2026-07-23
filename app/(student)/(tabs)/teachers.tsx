import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchStudentProfile,
  fetchStudentTeachers,
  type StudentSubjectTeacher,
  type StudentTeacherProfile,
  type StudentTeachersResponse,
} from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

function detail(value?: string) {
  return value && value.trim() ? value : '—';
}

function initials(name?: string) {
  return (name || 'T')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function StudentTeachersScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentTeachersResponse | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile();
      setData(await fetchStudentTeachers(profile.academicInformation?.session));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load teachers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const subjectTeachers = useMemo(() => data?.subjectTeachers || [], [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Teachers</Text>
          <Text style={styles.sub}>Class teacher and subject-wise faculty</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: `${primary}18` }]}>
          <Ionicons name="people-outline" size={24} color={primary} />
        </View>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Text style={styles.section}>Class teacher</Text>
      {data?.classTeacher ? (
        <TeacherCard teacher={data.classTeacher} badge="Class Teacher" />
      ) : (
        <Text style={styles.empty}>Class teacher is not assigned yet.</Text>
      )}

      {data?.substituteClassTeacher ? (
        <TeacherCard teacher={data.substituteClassTeacher} badge="Substitute" />
      ) : null}

      <Text style={styles.section}>Subject teachers</Text>
      {subjectTeachers.length === 0 && !error ? (
        <Text style={styles.empty}>Subject teachers are not assigned yet.</Text>
      ) : null}

      {subjectTeachers.map((item) => (
        <SubjectTeacherCard
          key={`${item.subjectId}-${item.teacher?.username || item.teacherRole}`}
          item={item}
        />
      ))}
    </ScrollView>
  );
}

function TeacherCard({
  teacher,
  badge,
}: {
  teacher: StudentTeacherProfile;
  badge?: string;
}) {
  return (
    <View style={styles.teacherCard}>
      <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
        <Text style={[styles.avatarText, { color: primary }]}>{initials(teacher.name)}</Text>
      </View>
      <View style={styles.teacherBody}>
        <View style={styles.teacherTop}>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.teacherMeta}>
          {detail(teacher.designation)}{teacher.department ? ` · ${teacher.department}` : ''}
        </Text>
        <InfoRow icon="ribbon-outline" text={`Specialization: ${detail(teacher.specialization)}`} />
        <InfoRow icon="school-outline" text={`Qualification: ${detail(teacher.qualification)}`} />
        <InfoRow icon="call-outline" text={`Phone: ${detail(teacher.phone)}`} />
        <InfoRow icon="mail-outline" text={`Email: ${detail(teacher.email)}`} />
      </View>
    </View>
  );
}

function SubjectTeacherCard({ item }: { item: StudentSubjectTeacher }) {
  const teacher = item.teacher;
  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View>
          <Text style={styles.subjectName}>{item.subjectName || item.subjectId}</Text>
          <Text style={styles.subjectMeta}>
            {item.subjectCode ? `${item.subjectCode} · ` : ''}{item.teacherRole || 'primary'} teacher
          </Text>
        </View>
        <View style={[styles.subjectIcon, { backgroundColor: `${primary}18` }]}>
          <Ionicons name="book-outline" size={20} color={primary} />
        </View>
      </View>
      {teacher ? (
        <TeacherCard teacher={teacher} />
      ) : (
        <Text style={styles.empty}>Teacher details are not available.</Text>
      )}
    </View>
  );
}

function InfoRow({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color={Neutrals.muted} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginTop: 4 },
  err: { color: '#B91C1C', marginBottom: 12 },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: Neutrals.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 10,
  },
  empty: { color: Neutrals.muted, fontSize: 14, marginBottom: 12 },
  teacherCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '900' },
  teacherBody: { flex: 1 },
  teacherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'flex-start',
  },
  teacherName: { flex: 1, fontSize: 16, fontWeight: '800', color: Neutrals.text },
  teacherMeta: { fontSize: 13, color: primary, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#3730A3', fontSize: 10, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { flex: 1, fontSize: 12, color: Neutrals.muted },
  subjectCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Neutrals.border,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subjectName: { fontSize: 16, fontWeight: '800', color: Neutrals.text },
  subjectMeta: { fontSize: 12, color: Neutrals.muted, marginTop: 2 },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
