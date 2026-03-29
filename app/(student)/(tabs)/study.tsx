import { Neutrals, RoleColors } from '@/constants/school-theme';
import { fetchSyllabus, type SyllabusRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

export default function StudentStudyScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<SyllabusRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchSyllabus();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load syllabus.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bySubject = useMemo(() => {
    const m = new Map<string, SyllabusRow[]>();
    for (const r of rows) {
      const k = r.subjectName || 'General';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return m;
  }, [rows]);

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
      <Text style={styles.title}>Syllabus</Text>
      <Text style={styles.sub}>Topics and resources for your class</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {rows.length === 0 && !error ? (
        <Text style={styles.empty}>No syllabus items yet. Your school will publish them here.</Text>
      ) : null}

      {[...bySubject.entries()].map(([subject, items]) => (
        <View key={subject} style={styles.group}>
          <Text style={styles.groupTitle}>{subject}</Text>
          {items.map((item) => (
            <View key={item._id} style={styles.card}>
              <Ionicons name="document-text-outline" size={22} color={primary} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={4}>
                    {item.description}
                  </Text>
                ) : null}
                {item.resourceUrl ? (
                  <Pressable
                    onPress={() => Linking.openURL(item.resourceUrl!)}
                    style={styles.linkRow}
                  >
                    <Text style={styles.link}>Open resource</Text>
                    <Ionicons name="open-outline" size={16} color={primary} />
                  </Pressable>
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
  empty: { color: Neutrals.muted, fontSize: 14 },
  group: { marginBottom: 20 },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Neutrals.text,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Neutrals.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Neutrals.text },
  cardDesc: { fontSize: 13, color: Neutrals.muted, marginTop: 6 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  link: { fontSize: 14, fontWeight: '600', color: primary },
});
