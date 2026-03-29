import { Neutrals, RoleColors } from '@/constants/school-theme';
import { useAppSelector } from '@/store/hooks';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

function str(v: unknown): string {
  if (v == null) return '—';
  return String(v);
}

export default function StudentProfileScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const first = str(user?.firstName);
  const last = str(user?.lastName);
  const displayName =
    first !== '—' || last !== '—'
      ? `${first !== '—' ? first : ''} ${last !== '—' ? last : ''}`.trim()
      : 'Student';
  const initial = (first !== '—' ? first : 'S').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName || 'Student'}</Text>
        <Text style={styles.email}>{str(user?.email)}</Text>
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>
            Student · {str(user?.studentId ?? user?.username)}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>Account</Text>
      <InfoRow label="Admission No." value={str(user?.admissionNumber)} />
      <InfoRow label="Student ID" value={str(user?.studentId ?? user?.username)} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
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
  name: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  email: { fontSize: 14, color: Neutrals.muted, marginTop: 4 },
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
    color: Neutrals.muted,
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
  },
  label: { fontSize: 15, color: Neutrals.muted },
  value: { fontSize: 15, fontWeight: '600', color: Neutrals.text },
});
