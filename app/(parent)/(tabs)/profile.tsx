import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import {
  childDisplayName,
  fetchParentMe,
  type ParentChild,
  type ParentProfile,
} from '@/lib/parent-portal-api';
import { useAppSelector } from '@/store/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.parent.primary;

const useProfileStyles = createThemedStyles((colors) => ({
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.muted, marginTop: 4 },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  label: { fontSize: 15, color: colors.muted, flexShrink: 1 },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
}));

function useStyles() {
  return { ...usePortalScreenStyles(), ...useProfileStyles() };
}

function str(v: unknown): string {
  if (v == null || v === '') return '—';
  return String(v);
}

export default function ParentProfileScreen() {
  const styles = useStyles();
  const user = useAppSelector((s) => s.auth.user);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const me = await fetchParentMe();
      setParent(me.parent);
      setChildren(me.children || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile.');
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

  const displayName =
    parent?.parentName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    str(user?.username) ||
    'Parent';
  const initial = displayName.charAt(0).toUpperCase();
  const email = str(user?.email);
  const username = parent?.username || str(user?.username);
  const phone = parent?.parentPhone || str(user?.contactNumber ?? user?.phone);

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
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${primary}22` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        {email !== '—' ? <Text style={styles.email}>{email}</Text> : null}
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>Parent / Guardian</Text>
        </View>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Text style={styles.section}>Account</Text>
      <InfoRow label="Username" value={username} />
      <InfoRow label="Phone" value={phone} />
      <InfoRow
        label="Linked"
        value={parent?.linked ? 'Yes' : 'No'}
      />
      <InfoRow
        label="Children"
        value={String(parent?.studentCount ?? children.length)}
      />

      <Text style={styles.section}>Linked students</Text>
      {!children.length ? (
        <Text style={styles.muted}>No students linked to this account.</Text>
      ) : (
        children.map((child) => (
          <InfoRow
            key={child.studentId}
            label={childDisplayName(child)}
            value={[child.className, child.section].filter(Boolean).join(' · ') || child.studentId}
          />
        ))
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
