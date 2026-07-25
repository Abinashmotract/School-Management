import { RoleColors } from '@/constants/school-theme';
import { useDashboardStyles } from '@/hooks/use-dashboard-styles';
import {
  fetchStudentAttendance,
  fetchLessonPlans,
  fetchStudentProfile,
  fetchTimetable,
  toPortalOverview,
  type AttendanceStatusKey,
  type LessonPlanRow,
  type PortalOverview,
  type StudentAttendanceResponse,
  type StudentProfile,
  type TimetableSlot,
} from '@/lib/student-portal-api';
import { formatTimeRange12h } from '@/lib/timetable-format';
import {
  attendanceStatusColor,
  attendanceStatusLabel,
  localTodayYmd,
} from '@/lib/attendance-utils';
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

const primary = RoleColors.student.primary;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

function formatDate(d?: string) {
  if (!d) return 'No date';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
}

function todayKey() {
  return localTodayYmd();
}

function formatSlot(slot: TimetableSlot) {
  return formatTimeRange12h(slot.startTime, slot.endTime);
}

function money(value: unknown) {
  const n = Number(value || 0);
  return n ? `₹${n.toLocaleString('en-IN')}` : '—';
}

function statusLabel(status?: AttendanceStatusKey) {
  return attendanceStatusLabel(status);
}

function statusColor(status?: AttendanceStatusKey) {
  return attendanceStatusColor(status);
}

function attendanceRate(attendance: StudentAttendanceResponse | null) {
  const rows = attendance?.records || [];
  const marked = rows.filter((r) => r.statusKey && r.statusKey !== 'not_marked');
  if (!marked.length) return 0;
  const attended = marked.filter((r) =>
    ['present', 'late', 'half_day', 'quarter_day'].includes(r.statusKey),
  ).length;
  return Math.round((attended / marked.length) * 100);
}

export function StudentDashboard() {
  const router = useRouter();
  const styles = useDashboardStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [plans, setPlans] = useState<LessonPlanRow[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceResponse | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const student = await fetchStudentProfile();
      const [p, s, a] = await Promise.all([
        fetchLessonPlans(student),
        fetchTimetable(student),
        fetchStudentAttendance(student.academicInformation?.session, 90).catch(() => null),
      ]);
      setProfile(student);
      setOverview(toPortalOverview(student));
      setPlans(p);
      setSlots(s);
      setAttendance(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.muted}>Loading your dashboard…</Text>
      </View>
    );
  }

  const name = overview?.studentName || 'Student';
  const feesTotal = profile?.feesInformation?.totalAmount;
  const today = todayKey();
  const todayAttendance = attendance?.records.find((r) => r.date === today);
  const rate = attendanceRate(attendance);
  const currentDay = new Date().toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
  const todaySlots = slots.filter((slot) => String(slot.day || '').toLowerCase() === currentDay);
  const displaySlots = (todaySlots.length ? todaySlots : slots).slice(0, 3);
  const scheduleTitle = todaySlots.length ? "Today's timetable" : 'Upcoming timetable';
  const nextLesson = plans.find((p) => p.status !== 'completed') || plans[0];
  const fees = profile?.feesInformation;
  const quickActions: { label: string; icon: IconName; href: string; tone: string }[] = [
    { label: 'Attendance', icon: 'calendar-outline', href: '/(student)/(tabs)/attendance', tone: '#DBEAFE' },
    { label: 'Homework', icon: 'create-outline', href: '/(student)/(tabs)/homework', tone: '#FEF3C7' },
    { label: 'Results', icon: 'ribbon-outline', href: '/(student)/results', tone: '#FCE7F3' },
    { label: 'Notices', icon: 'megaphone-outline', href: '/(student)/notices', tone: '#E0E7FF' },
    { label: 'Study Plan', icon: 'book-outline', href: '/(student)/(tabs)/study', tone: '#EDE9FE' },
    { label: 'Fees', icon: 'cash-outline', href: '/(student)/(tabs)/tasks', tone: '#DCFCE7' },
  ];
  const topStats: { icon: IconName; value: string; label: string; tint: string }[] = [
    { icon: 'analytics-outline', value: `${rate}%`, label: 'Attendance', tint: '#16A34A' },
    { icon: 'time-outline', value: String(todaySlots.length || slots.length), label: 'Classes', tint: primary },
    { icon: 'reader-outline', value: String(plans.length), label: 'Lessons', tint: '#7C3AED' },
    { icon: 'cash-outline', value: money(feesTotal), label: 'Fees', tint: '#EA580C' },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.heroWrap}>
        <View style={[styles.banner, { backgroundColor: primary }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Good day</Text>
              <Text style={styles.bannerTitle}>Welcome, {name}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.bannerSub}>
            {overview
              ? `${overview.className}${overview.sectionName ? ` · ${overview.sectionName}` : ''} · ${overview.session}`
              : 'Your learning journey'}
          </Text>
          <View style={styles.heroMeta}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color="#fff" />
              <Text style={styles.dateText}>{formatDate(today)}</Text>
            </View>
            {overview?.rollNumber ? (
              <View style={styles.dateBadge}>
                <Ionicons name="id-card-outline" size={14} color="#fff" />
                <Text style={styles.dateText}>Roll {overview.rollNumber}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        {topStats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${s.tint}18` }]}>
              <Ionicons name={s.icon} size={22} color={s.tint} />
            </View>
            <View>
              <Text style={styles.statN}>{s.value}</Text>
              <Text style={styles.statL}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(action.href as never)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.tone }]}>
              <Ionicons name={action.icon} size={20} color={primary} />
            </View>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>
            Today at a glance
          </Text>
          <Text style={styles.panelHint}>{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</Text>
        </View>
        <View style={styles.glanceRow}>
          <View style={styles.glanceItem}>
            <Ionicons name="checkmark-circle-outline" size={22} color={statusColor(todayAttendance?.statusKey)} />
            <View>
              <Text style={styles.glanceLabel}>Attendance</Text>
              <Text style={[styles.glanceValue, { color: statusColor(todayAttendance?.statusKey) }]}>
                {statusLabel(todayAttendance?.statusKey)}
              </Text>
            </View>
          </View>
          <View style={styles.glanceItem}>
            <Ionicons name="book-outline" size={22} color={primary} />
            <View>
              <Text style={styles.glanceLabel}>Next lesson</Text>
              <Text style={styles.glanceValue} numberOfLines={1}>
                {nextLesson?.topicName || nextLesson?.subjectName || 'No lesson'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <SectionHeader
        title={scheduleTitle}
        action="View timetable"
        onPress={() => router.push('/(student)/(tabs)/activities' as never)}
        styles={styles}
        accentColor={primary}
      />
      {displaySlots.length === 0 ? (
        <Text style={styles.empty}>No timetable slots published yet.</Text>
      ) : (
        displaySlots.map((slot) => (
          <View key={slot._id || `${slot.day}-${slot.startTime}-${slot.subjectId}`} style={styles.scheduleCard}>
            <View style={[styles.timeIcon, { backgroundColor: `${primary}16` }]}>
              <Ionicons name="time-outline" size={20} color={primary} />
            </View>
            <View style={styles.scheduleBody}>
              <Text style={styles.cardTitle}>{slot.subjectName || slot.subjectId || 'Subject'}</Text>
              <Text style={styles.cardMeta}>
                {slot.day || 'Day'} · {formatSlot(slot)}
              </Text>
              {slot.teacherName || slot.teacherUsername ? (
                <Text style={styles.cardMeta}>Teacher: {slot.teacherName || slot.teacherUsername}</Text>
              ) : null}
            </View>
          </View>
        ))
      )}

      <View style={styles.feesCard}>
        <View>
          <Text style={styles.feesLabel}>Fees summary</Text>
          <Text style={styles.feesValue}>{money(feesTotal)}</Text>
          <Text style={styles.feesMeta}>
            {fees?.paymentMode ? `Payment mode: ${fees.paymentMode}` : 'Payment information'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(student)/(tabs)/tasks' as never)} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Open</Text>
        </Pressable>
      </View>

      <SectionHeader
        title="Current study plan"
        action="View all"
        onPress={() => router.push('/(student)/(tabs)/study' as never)}
        styles={styles}
        accentColor={primary}
      />
      {plans.length === 0 ? (
        <Text style={styles.empty}>No lesson plans published for your class yet.</Text>
      ) : (
        plans.slice(0, 4).map((a) => (
          <View key={a.planId || a._id || a.topicName} style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: primary }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                {a.subjectName || 'Subject'} - {a.topicName || 'Lesson'}
              </Text>
              <Text style={styles.cardMeta}>{a.keyContent || (a.teacherName ? `By ${a.teacherName}` : 'Lesson plan')}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.due}>{formatDate(a.startDate)}</Text>
                <View style={[styles.badge, a.status === 'completed' && styles.badgeDone]}>
                  <Text style={styles.badgeText}>{a.status || 'active'}</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
  styles,
  accentColor,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  styles: ReturnType<typeof useDashboardStyles>;
  accentColor: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={[styles.sectionAction, { color: accentColor }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
