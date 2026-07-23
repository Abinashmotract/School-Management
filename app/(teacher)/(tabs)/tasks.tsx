import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  applyLeave,
  fetchLeaveBalance,
  fetchMyLeaves,
  fetchTeacherLessonPlans,
  type LeaveApplication,
} from '@/lib/teacher-portal-api';
import type { LessonPlanRow } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

type LeaveTypeBalance = {
  leaveTypeId?: string;
  leaveTypeName?: string;
  available?: number;
};

export default function TeacherTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<LessonPlanRow[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeBalance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const totalBalance = useMemo(
    () => leaveTypes.reduce((sum, row) => sum + Number(row.available || 0), 0),
    [leaveTypes]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const [lessonRows, leaveRows, leaveBalance] = await Promise.all([
        fetchTeacherLessonPlans(),
        fetchMyLeaves().catch(() => []),
        fetchLeaveBalance().catch(() => null),
      ]);
      setPlans(lessonRows);
      setLeaves(leaveRows);

      const balancesRaw = leaveBalance?.balances;
      const types: LeaveTypeBalance[] = Array.isArray(balancesRaw)
        ? balancesRaw
        : balancesRaw && typeof balancesRaw === 'object'
          ? Object.entries(balancesRaw).map(([leaveTypeId, available]) => ({
              leaveTypeId,
              available: Number(available),
            }))
          : [];
      setLeaveTypes(types);
      if (types[0]?.leaveTypeId && !leaveTypeId) {
        setLeaveTypeId(types[0].leaveTypeId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load teacher tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leaveTypeId]);

  useEffect(() => {
    load();
  }, [load]);

  const onApplyLeave = async () => {
    if (!leaveTypeId || !startDate || !endDate || !reason.trim()) {
      Alert.alert('Leave application', 'Fill leave type, dates, and reason.');
      return;
    }
    setSubmitting(true);
    try {
      await applyLeave({
        leaveTypeId,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        reason: reason.trim(),
      });
      Alert.alert('Submitted', 'Your leave application was submitted.');
      setShowForm(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not apply leave.');
    } finally {
      setSubmitting(false);
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

      <View style={styles.summary}>
        <Ionicons name="medkit-outline" size={24} color={primary} />
        <View>
          <Text style={styles.summaryValue}>{totalBalance || '—'}</Text>
          <Text style={styles.due}>Available leave balance</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Apply leave</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.link}>{showForm ? 'Cancel' : 'New application'}</Text>
        </Pressable>
      </View>

      {showForm ? (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Leave type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {leaveTypes.map((t) => (
              <Pressable
                key={t.leaveTypeId}
                style={[styles.chip, leaveTypeId === t.leaveTypeId && styles.chipActive]}
                onPress={() => setLeaveTypeId(t.leaveTypeId || '')}
              >
                <Text style={[styles.chipText, leaveTypeId === t.leaveTypeId && styles.chipTextActive]}>
                  {t.leaveTypeName || t.leaveTypeId} ({t.available ?? 0})
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.formLabel}>Start date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2026-07-18"
            autoCapitalize="none"
          />
          <Text style={styles.formLabel}>End date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2026-07-20"
            autoCapitalize="none"
          />
          <Text style={styles.formLabel}>Reason</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for leave"
            multiline
          />
          <Pressable
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            disabled={submitting}
            onPress={() => void onApplyLeave()}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit leave</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.section}>Lesson Plans</Text>
      {plans.length === 0 ? <Text style={styles.empty}>No lesson plans assigned.</Text> : null}
      {plans.map((x) => (
        <View key={x.planId || x._id || x.topicName} style={styles.row}>
          <Ionicons name="reader-outline" size={22} color={primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{x.topicName || 'Lesson'}</Text>
            <Text style={styles.due}>
              {x.className || x.classId || 'Class'} · {x.subjectName || x.subjectId || 'Subject'} · {x.status || 'active'}
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Leave Applications</Text>
      {leaves.length === 0 ? <Text style={styles.empty}>No leave applications found.</Text> : null}
      {leaves.map((x) => (
        <View key={x.applicationId || `${x.fromDate}-${x.toDate}`} style={styles.row}>
          <Ionicons name="calendar-outline" size={22} color={primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{x.leaveTypeId || 'Leave'}</Text>
            <Text style={styles.due}>
              {(x as { startDate?: string }).startDate || x.fromDate || '--'} to{' '}
              {(x as { endDate?: string }).endDate || x.toDate || '--'} · {x.status || 'pending'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted, marginBottom: 10 },
  section: { fontSize: 17, fontWeight: '700', color: Neutrals.text, marginVertical: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: primary, fontWeight: '600' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${primary}12`,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  summaryValue: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Neutrals.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: { fontSize: 14, fontWeight: '600', color: Neutrals.text },
  due: { fontSize: 12, color: Neutrals.muted, marginTop: 4 },
  form: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  formLabel: { fontSize: 12, fontWeight: '700', color: Neutrals.muted, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: Neutrals.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Neutrals.text,
    backgroundColor: Neutrals.bg,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: {
    marginTop: 14,
    backgroundColor: primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Neutrals.bg,
    marginRight: 8,
  },
  chipActive: { backgroundColor: `${primary}18` },
  chipText: { fontSize: 12, color: Neutrals.muted, fontWeight: '600' },
  chipTextActive: { color: primary },
});
