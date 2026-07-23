import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchTeacherAllocations,
  fetchTeacherSchedule,
  type TeacherAllocations,
  type TeacherScheduleSlot,
} from '@/lib/teacher-portal-api';
import { formatTimeRange12h, groupSlotsByDay } from '@/lib/timetable-format';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

export default function TeacherClassesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<TeacherAllocations>({
    classTeacher: [],
    subjectTeacher: [],
  });
  const [schedule, setSchedule] = useState<TeacherScheduleSlot[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [a, s] = await Promise.all([
        fetchTeacherAllocations(),
        fetchTeacherSchedule(),
      ]);
      setAllocations(a);
      setSchedule(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load classes.');
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  const rows = [
    ...allocations.classTeacher.map((x) => ({ ...x, role: 'Class Teacher' })),
    ...allocations.subjectTeacher.map((x) => ({ ...x, role: x.subject?.name || 'Subject Teacher' })),
  ];

  const scheduleByDay = useMemo(() => groupSlotsByDay(schedule), [schedule]);

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
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {rows.length === 0 ? (
        <Text style={styles.empty}>No class or subject allocations found.</Text>
      ) : null}
      {rows.map((c, idx) => (
        <View key={`${c.classId}-${c.sectionId}-${idx}`} style={styles.card}>
          <View style={[styles.accent, { backgroundColor: primary }]} />
          <View style={styles.body}>
            <Text style={styles.name}>
              {c.class?.name || c.classId || 'Class'} · {c.role}
            </Text>
            <Text style={styles.meta}>Section {c.section?.name || c.sectionId || '-'}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Timetable</Text>
      {schedule.length === 0 ? (
        <Text style={styles.empty}>No timetable slots assigned.</Text>
      ) : scheduleByDay.map((group) => (
        <View key={group.day} style={styles.dayBlock}>
          <Text style={styles.dayHeading}>{group.label}</Text>
          {group.items.map((slot) => (
            <View key={slot._id || `${slot.day}-${slot.startTime}-${slot.classId}`} style={styles.slot}>
              <Text style={styles.name}>{formatTimeRange12h(slot.startTime, slot.endTime)}</Text>
              <Text style={styles.meta}>
                {slot.classId || 'Class'} · {slot.sectionId || '-'} · {slot.subjectId || 'Subject'}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted, marginBottom: 12 },
  section: { fontSize: 17, fontWeight: '700', color: Neutrals.text, marginTop: 10, marginBottom: 10 },
  dayBlock: { marginBottom: 12 },
  dayHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Neutrals.text,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 16 },
  name: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  meta: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  slot: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
});
