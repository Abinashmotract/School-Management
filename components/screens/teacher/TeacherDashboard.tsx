import { RoleColors } from '@/constants/school-theme';
import { useDashboardStyles } from '@/hooks/use-dashboard-styles';
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
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

export function TeacherDashboard() {
  const router = useRouter();
  const styles = useDashboardStyles();
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

      <View style={styles.statsWide}>
        {[
          { icon: 'people-outline' as const, n: String(students.length), l: 'Students' },
          { icon: 'easel-outline' as const, n: String(classCount), l: 'Classes' },
          { icon: 'reader-outline' as const, n: String(lessonCount), l: 'Lessons' },
          { icon: 'medkit-outline' as const, n: String(leaveCount), l: 'Leaves' },
        ].map((s) => (
          <View key={s.l} style={styles.statCardGrid}>
            <View style={[styles.statIconLarge, { backgroundColor: `${primary}18` }]}>
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
