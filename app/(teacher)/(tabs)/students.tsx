import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import {
  fetchTeacherAllocations,
  fetchTeacherStudents,
  type TeacherStudentRow,
} from '@/lib/teacher-portal-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: { fontSize: 18, fontWeight: '700', color: primary },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
}));

function studentName(row: TeacherStudentRow) {
  const basic = row.basicInformation || row.studentInformation?.basicInformation;
  return [basic?.firstName, basic?.middleName, basic?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || row.studentId || row.studentInformation?.studentId || 'Student';
}

function studentId(row: TeacherStudentRow) {
  return row.studentId || row.studentInformation?.studentId || '';
}

export default function TeacherStudentsScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TeacherStudentRow[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      setRows(await fetchTeacherStudents(allocations));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load students.');
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
      {rows.length === 0 && !error ? (
        <Text style={styles.empty}>No students found for your allocated classes.</Text>
      ) : null}
      {rows.map((row) => {
        const name = studentName(row);
        const id = studentId(row);
        const academic = row.academicInformation;
        return (
        <Pressable
          key={id || name}
          style={styles.row}
          onPress={() => {
            if (id) router.push(`/(teacher)/student/${encodeURIComponent(id)}` as never);
          }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avText}>{name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>
              {academic?.admissionClass || 'Class'} · Section {academic?.admissionSection || '-'}
            </Text>
            <Text style={styles.meta}>
              Roll {academic?.rollNumber || row.rollNumber || '-'} · {row.admissionNumber || row.studentInformation?.admissionNumber || ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>
        );
      })}
    </ScrollView>
  );
}
