import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  childClassLabel,
  childDisplayName,
  fetchParentChildren,
  getSelectedChildId,
  resolveSelectedChild,
  setSelectedChildId,
  type ParentChild,
} from '@/lib/parent-portal-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

const primary = RoleColors.parent.primary;

export default function ParentChildrenScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const kids = await fetchParentChildren();
      setChildren(kids);

      const preferredId = await getSelectedChildId();
      const child = resolveSelectedChild(kids, preferredId);
      const nextId = child?.studentId || null;
      setSelectedId(nextId);

      if (child) {
        await setSelectedChildId(child.studentId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load children.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSelect = async (child: ParentChild) => {
    setSelectedId(child.studentId);
    await setSelectedChildId(child.studentId);
    router.push(`/(parent)/child/${child.studentId}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={styles.muted}>Loading children…</Text>
      </View>
    );
  }

  const selected = children.find((c) => c.studentId === selectedId) || null;

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

      {!children.length ? (
        <View style={styles.emptyBox}>
          <Ionicons name="people-outline" size={28} color={Neutrals.muted} />
          <Text style={styles.emptyTitle}>No children linked</Text>
          <Text style={styles.emptyText}>
            Ask your school admin to link your parent account to a student.
          </Text>
        </View>
      ) : (
        <>
          {children.map((child) => {
            const name = childDisplayName(child);
            const active = child.studentId === selectedId;
            return (
              <Pressable
                key={child.studentId}
                style={[
                  styles.card,
                  active && { borderColor: primary, borderWidth: 1.5 },
                ]}
                onPress={() => void onSelect(child)}
              >
                <View style={[styles.avatar, { backgroundColor: `${primary}22` }]}>
                  <Text style={[styles.avText, { color: primary }]}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.meta}>{childClassLabel(child)}</Text>
                  {child.admissionNumber ? (
                    <Text style={styles.meta}>Adm. {child.admissionNumber}</Text>
                  ) : null}
                  <Text style={styles.viewDetail}>View attendance, fees, results & timetable</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </Pressable>
            );
          })}

          {selected ? (
            <Pressable
              style={styles.openDetail}
              onPress={() => router.push(`/(parent)/child/${selected.studentId}`)}
            >
              <Ionicons name="open-outline" size={18} color={primary} />
              <Text style={styles.openDetailText}>Open {childDisplayName(selected)} details</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Neutrals.bg,
    gap: 10,
  },
  muted: { fontSize: 13, color: Neutrals.muted },
  err: { color: '#B91C1C', marginBottom: 12 },
  emptyBox: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: Neutrals.card,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  emptyText: { fontSize: 13, color: Neutrals.muted, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Neutrals.card,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: { fontSize: 22, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: Neutrals.text },
  meta: { fontSize: 13, color: Neutrals.muted, marginTop: 2 },
  viewDetail: { fontSize: 12, color: primary, marginTop: 6 },
  openDetail: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: `${primary}12`,
  },
  openDetailText: { color: primary, fontWeight: '600' },
});
