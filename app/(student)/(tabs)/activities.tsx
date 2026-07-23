import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchStudentProfile,
  fetchTimetable,
  type TimetableSlot,
} from '@/lib/student-portal-api';
import { formatTimeRange12h, groupSlotsByDay } from '@/lib/timetable-format';
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

export default function StudentActivitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TimetableSlot[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile();
      const data = await fetchTimetable(profile);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load timetable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => groupSlotsByDay(items), [items]);

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
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <Text style={styles.title}>Timetable</Text>
      <Text style={styles.sub}>Weekly class schedule with subject and teacher details</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {grouped.length === 0 && !error ? (
        <Text style={styles.empty}>No timetable slots published yet.</Text>
      ) : null}

      {grouped.map((group) => (
        <View key={group.day} style={styles.dayBlock}>
          <Text style={styles.dayTitle}>{group.label}</Text>
          {group.items.map((a) => (
            <View key={a._id || `${group.day}-${a.startTime}-${a.subjectId}`} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: `${primary}18` }]}>
                <Ionicons name="time-outline" size={22} color={primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{a.subjectName || a.subjectId || 'Subject'}</Text>
                <Text style={styles.cardTime}>{formatTimeRange12h(a.startTime, a.endTime)}</Text>
                {a.teacherName || a.teacherUsername ? (
                  <Text style={styles.venue}>Teacher: {a.teacherName || a.teacherUsername}</Text>
                ) : null}
                {a.roomId ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Room {a.roomId}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 16 },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted },
  dayBlock: { marginBottom: 18 },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Neutrals.text,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  cardTime: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  venue: { fontSize: 13, color: primary, fontWeight: '600', marginTop: 4 },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#3730A3' },
});
