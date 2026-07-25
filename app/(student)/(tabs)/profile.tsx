import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import { fetchStudentProfile, type StudentProfile } from '@/lib/student-portal-api';
import { useAppSelector } from '@/store/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

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
    borderBottomColor: colors.border,
  },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, fontWeight: '600', color: colors.text },
}));

function useStyles() {
  return { ...usePortalScreenStyles(), ...useProfileStyles() };
}

function str(v: unknown): string {
  if (v == null) return '—';
  return String(v);
}

export default function StudentProfileScreen() {
  const styles = useStyles();
  const user = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProfile(await fetchStudentProfile());
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

  const basic = profile?.basicInformation;
  const academic = profile?.academicInformation;
  const first = str(basic?.firstName ?? user?.firstName);
  const last = str(basic?.lastName ?? user?.lastName);
  const displayName =
    first !== '—' || last !== '—'
      ? `${first !== '—' ? first : ''} ${last !== '—' ? last : ''}`.trim()
      : 'Student';
  const initial = (first !== '—' ? first : 'S').charAt(0).toUpperCase();

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
        <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName || 'Student'}</Text>
        <Text style={styles.email}>{str(basic?.email ?? user?.email)}</Text>
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>
            Student · {str(profile?.studentId ?? user?.username)}
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Text style={styles.section}>Account</Text>
      <InfoRow label="Admission No." value={str(profile?.admissionNumber ?? user?.admissionNumber)} />
      <InfoRow label="Student ID" value={str(profile?.studentId ?? user?.username)} />
      <InfoRow label="Roll No." value={str(academic?.rollNumber)} />
      <InfoRow label="Medium" value={str(academic?.mediumName ?? academic?.medium)} />
      <InfoRow label="Class" value={str(academic?.className ?? academic?.admissionClass)} />
      <InfoRow label="Section" value={str(academic?.sectionName ?? academic?.admissionSection)} />
      <InfoRow label="Session" value={str(academic?.session)} />
      <InfoRow label="Phone" value={str(basic?.phone ?? user?.contactNumber)} />

      <Text style={styles.section}>Parent / Guardian</Text>
      <InfoRow label="Father" value={str(profile?.parentInformation?.fatherName)} />
      <InfoRow label="Father Phone" value={str(profile?.parentInformation?.fatherPhone)} />
      <InfoRow label="Mother" value={str(profile?.parentInformation?.motherName)} />
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
