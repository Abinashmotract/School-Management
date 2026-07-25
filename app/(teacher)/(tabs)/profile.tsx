import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { useAppSelector } from '@/store/hooks';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.teacher.primary;

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, fontWeight: '600', color: colors.text },
}));

function useStyles() {
  return { ...usePortalScreenStyles(), ...useProfileStyles() };
}

function str(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export default function TeacherProfileScreen() {
  const styles = useStyles();
  const user = useAppSelector((s) => s.auth.user);
  const displayName =
    [user?.title, user?.firstName, user?.middleName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Teacher';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{str(user?.email)}</Text>
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>
            {user?.isTeachingStaff ? 'Teaching Staff' : 'Teacher'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Employee ID</Text>
        <Text style={styles.value}>{str(user?.employeeId ?? user?.username)}</Text>
      </View>
      <InfoRow label="Username" value={str(user?.username)} />
      <InfoRow label="Designation" value={str(user?.designation)} />
      <InfoRow label="Department" value={str(user?.department)} />
      <InfoRow label="Phone" value={str(user?.phone ?? user?.contactNumber)} />
      <InfoRow label="Joining Date" value={str(user?.dateOfJoining)} />
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
