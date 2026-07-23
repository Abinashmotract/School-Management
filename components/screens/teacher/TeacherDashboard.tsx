import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchMyLeaves,
  fetchTeacherAllocations,
  fetchTeacherLessonPlans,
  fetchTeacherSchedule,
  fetchTeacherStudents,
  type TeacherAllocations,
  type TeacherScheduleSlot,
  type TeacherStudentRow,
} from '@/lib/teacher-portal-api';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

export function TeacherDashboard() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<TeacherAllocations>({
    classTeacher: [],
    subjectTeacher: [],
  });
  const [schedule, setSchedule] = useState<TeacherScheduleSlot[]>([]);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const allocationData = await fetchTeacherAllocations();
      setAllocations(allocationData);

      const [scheduleData, lessonPlans, leaveRows, studentRows] = await Promise.all([
        fetchTeacherSchedule(),
        fetchTeacherLessonPlans(),
        fetchMyLeaves().catch(() => []),
        fetchTeacherStudents(allocationData).catch(() => []),
      ]);

      setSchedule(scheduleData.slice(0, 5));
      setStudents(studentRows);
      setLessonCount(lessonPlans.length);
      setLeaveCount(leaveRows.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load teacher dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.muted}>Loading teacher dashboard...</Text>
      </View>
    );
  }

  const displayName =
    [user?.title, user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    'Teacher';
  const classCount = new Set(
    [...allocations.classTeacher, ...allocations.subjectTeacher]
      .map((x) => `${x.classId || ''}:${x.sectionId || ''}`)
      .filter(Boolean)
  ).size;

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
      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Welcome back, {displayName}</Text>
        <Text style={styles.bannerSub}>Your classes, lessons, and leave updates</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { icon: 'people-outline' as const, n: String(students.length), l: 'Students' },
          { icon: 'easel-outline' as const, n: String(classCount), l: 'Classes' },
          { icon: 'reader-outline' as const, n: String(lessonCount), l: 'Lessons' },
          { icon: 'medkit-outline' as const, n: String(leaveCount), l: 'Leaves' },
        ].map((s) => (
          <View key={s.l} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${primary}18` }]}>
              <Ionicons name={s.icon} size={22} color={primary} />
            </View>
            <View>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        {[
          { label: 'Attendance', icon: 'checkbox-outline' as const, href: '/(teacher)/attendance' },
          { label: 'Homework', icon: 'create-outline' as const, href: '/(teacher)/homework' },
          { label: 'Students', icon: 'people-outline' as const, href: '/(teacher)/(tabs)/students' },
          { label: 'Chat', icon: 'chatbubbles-outline' as const, href: '/(teacher)/(tabs)/chat' },
        ].map((action) => (
          <Pressable
            key={action.label}
            style={styles.actionCard}
            onPress={() => router.push(action.href as never)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${primary}18` }]}>
              <Ionicons name={action.icon} size={20} color={primary} />
            </View>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>My classes</Text>
      {[...allocations.classTeacher, ...allocations.subjectTeacher].slice(0, 4).map((c, idx) => {
        const subject = 'subject' in c ? c.subject?.name : '';
        return (
          <View key={`${c.classId}-${c.sectionId}-${idx}`} style={styles.classCard}>
            <View style={[styles.classAccent, { backgroundColor: primary }]} />
            <View style={styles.classBody}>
              <Text style={styles.className}>
                {c.class?.name || c.classId || 'Class'} {subject ? `- ${subject}` : ''}
              </Text>
              <Text style={styles.classMeta}>
                Section {c.section?.name || c.sectionId || '-'}
              </Text>
            </View>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Upcoming schedule</Text>
      {schedule.length === 0 ? (
        <Text style={styles.empty}>No timetable slots assigned.</Text>
      ) : schedule.map((t) => (
        <View key={t._id || `${t.day}-${t.startTime}-${t.classId}`} style={styles.taskRow}>
          <Ionicons name="time-outline" size={18} color={primary} />
          <Text style={styles.taskText}>
            {t.day || 'Day'} · {t.startTime || '--'}-{t.endTime || '--'} · {t.classId || 'Class'} {t.sectionId || ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Neutrals.bg,
    gap: 12,
    padding: 24,
  },
  muted: { color: Neutrals.muted, fontSize: 14 },
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { paddingBottom: 32 },
  errBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errText: { color: '#B91C1C', fontSize: 14 },
  banner: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
  },
  bannerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: { fontSize: 12, color: '#fff' },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statN: { fontSize: 20, fontWeight: '700', color: Neutrals.text },
  statL: { fontSize: 11, color: Neutrals.muted },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 12, fontWeight: '700', color: Neutrals.text, textAlign: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Neutrals.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  classCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  classAccent: { width: 4 },
  classBody: { flex: 1, padding: 14 },
  className: { fontSize: 16, fontWeight: '700', color: Neutrals.text, marginBottom: 4 },
  classMeta: { fontSize: 12, color: Neutrals.muted },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  taskText: { fontSize: 14, color: Neutrals.text },
  empty: { marginHorizontal: 20, color: Neutrals.muted },
});
