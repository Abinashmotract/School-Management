import { Neutrals, RoleColors } from '@/constants/school-theme';
import { fetchActivities, type ActivityRow } from '@/lib/student-portal-api';
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

function formatRange(startsAt: string, endsAt?: string) {
  try {
    const s = new Date(startsAt);
    const e = endsAt ? new Date(endsAt) : null;
    const opt: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    if (e && e.getTime() !== s.getTime()) {
      return `${s.toLocaleString(undefined, opt)} – ${e.toLocaleString(undefined, opt)}`;
    }
    return s.toLocaleString(undefined, opt);
  } catch {
    return startsAt;
  }
}

export default function StudentActivitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ActivityRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchActivities();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load activities.');
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

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <Text style={styles.title}>Activities</Text>
      <Text style={styles.sub}>School events, sports, and programs</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {items.length === 0 && !error ? (
        <Text style={styles.empty}>No activities published yet.</Text>
      ) : null}

      {items.map((a) => (
        <View key={a._id} style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: `${primary}18` }]}>
            <Ionicons name="calendar-outline" size={24} color={primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{a.title}</Text>
            <Text style={styles.cardTime}>
              {formatRange(a.startsAt, a.endsAt)}
            </Text>
            {a.venue ? <Text style={styles.venue}>{a.venue}</Text> : null}
            {a.description ? (
              <Text style={styles.cardDesc}>{a.description}</Text>
            ) : null}
            {a.type ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{a.type}</Text>
              </View>
            ) : null}
          </View>
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
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  cardTime: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  venue: { fontSize: 13, color: primary, fontWeight: '600', marginTop: 4 },
  cardDesc: { fontSize: 14, color: Neutrals.muted, marginTop: 8 },
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
