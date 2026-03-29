import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchPortalOverview,
  fetchTasks,
  type PortalOverview,
  type TaskRow,
} from '@/lib/student-portal-api';
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

function formatDue(d: string) {
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

export function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [o, t] = await Promise.all([
        fetchPortalOverview(),
        fetchTasks(),
      ]);
      setOverview(o);
      setTasks(t.slice(0, 5));
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
  const pending = tasks.filter((x) => x.myStatus !== 'submitted').length;

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

      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Welcome, {name}</Text>
        <Text style={styles.bannerSub}>
          {overview
            ? `${overview.className}${overview.sectionName ? ` · ${overview.sectionName}` : ''} · ${overview.session}`
            : 'Your learning journey'}
        </Text>
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
          { icon: 'book-outline' as const, n: String(tasks.length), l: 'Tasks' },
          { icon: 'alert-circle-outline' as const, n: String(pending), l: 'Pending' },
          { icon: 'school-outline' as const, n: overview?.medium || '—', l: 'Medium' },
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

      <Text style={styles.sectionTitle}>Upcoming tasks</Text>
      {tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks yet. Check the Tasks tab.</Text>
      ) : (
        tasks.map((a) => (
          <View key={a._id} style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: primary }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                {a.subjectName} — {a.title}
              </Text>
              <Text style={styles.cardMeta}>Due {formatDue(a.dueDate)}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.due}>{formatDue(a.dueDate)}</Text>
                <View
                  style={[
                    styles.badge,
                    a.myStatus === 'submitted' && styles.badgeDone,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {a.myStatus === 'submitted' ? 'Submitted' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
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
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
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
  dateText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Neutrals.card,
    padding: 14,
    borderRadius: 16,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statN: { fontSize: 18, fontWeight: '700', color: Neutrals.text },
  statL: { fontSize: 12, color: Neutrals.muted },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Neutrals.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  empty: {
    paddingHorizontal: 24,
    color: Neutrals.muted,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Neutrals.text,
    marginBottom: 4,
  },
  cardMeta: { fontSize: 12, color: Neutrals.muted, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  due: { fontSize: 12, color: Neutrals.muted },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDone: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Neutrals.text },
});
