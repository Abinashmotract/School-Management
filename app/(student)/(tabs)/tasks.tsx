import { Neutrals, RoleColors } from '@/constants/school-theme';
import { completeTask, fetchTasks, type TaskRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

function formatDue(d: string) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export default function StudentTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (t: TaskRow) => {
    setBusyId(t._id);
    try {
      await completeTask(t._id);
      await load();
    } catch (e) {
      Alert.alert(
        'Could not submit',
        e instanceof Error ? e.message : 'Try again.'
      );
    } finally {
      setBusyId(null);
    }
  };

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
      <Text style={styles.title}>Tasks</Text>
      <Text style={styles.sub}>Assignments and homework</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {tasks.length === 0 && !error ? (
        <Text style={styles.empty}>No tasks assigned.</Text>
      ) : null}

      {tasks.map((t) => {
        const done = t.myStatus === 'submitted';
        return (
          <View key={t._id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardSubject}>{t.subjectName}</Text>
              <Text style={styles.cardMeta}>Due {formatDue(t.dueDate)}</Text>
            </View>
            <Text style={styles.cardTitle}>{t.title}</Text>
            {t.description ? (
              <Text style={styles.cardDesc}>{t.description}</Text>
            ) : null}
            {done ? (
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.doneText}>Submitted</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.btn, busyId === t._id && styles.btnDisabled]}
                onPress={() => onSubmit(t)}
                disabled={busyId === t._id}
              >
                {busyId === t._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Mark as submitted</Text>
                )}
              </Pressable>
            )}
          </View>
        );
      })}
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
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardSubject: { fontSize: 12, fontWeight: '700', color: primary, textTransform: 'uppercase' },
  cardMeta: { fontSize: 12, color: Neutrals.muted },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Neutrals.text },
  cardDesc: { fontSize: 14, color: Neutrals.muted, marginTop: 8 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  doneText: { color: '#059669', fontWeight: '600' },
  btn: {
    marginTop: 14,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700' },
});
