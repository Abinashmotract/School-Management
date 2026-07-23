import { ScreenShell } from '@/components/navigation/ScreenShell';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchClassAttendance,
  fetchTeacherAllocations,
  fetchTeacherStudents,
  saveClassAttendance,
  type AttendanceMarkRow,
  type TeacherStudentRow,
} from '@/lib/teacher-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

type ClassSection = { classId: string; sectionId: string; label: string };

const STATUS_OPTIONS = [
  { key: 'present' as const, label: 'Present', color: '#16A34A' },
  { key: 'absent' as const, label: 'Absent', color: '#DC2626' },
  { key: 'late' as const, label: 'Late', color: '#D97706' },
  { key: 'leave' as const, label: 'Leave', color: '#6366F1' },
];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function studentName(row: TeacherStudentRow) {
  const basic = row.basicInformation || row.studentInformation?.basicInformation;
  return [basic?.firstName, basic?.middleName, basic?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || row.studentId || 'Student';
}

export default function TeacherAttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [date] = useState(todayYmd());
  const [session, setSession] = useState('');
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceMarkRow['statusKey']>>({});

  const selected = useMemo(
    () => sections.find((s) => `${s.classId}:${s.sectionId}` === selectedKey) || null,
    [sections, selectedKey]
  );

  const loadSections = useCallback(async () => {
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      const map = new Map<string, ClassSection>();

      [...allocations.classTeacher, ...allocations.subjectTeacher].forEach((item) => {
        const classId = item.classId;
        const sectionId = item.sectionId;
        if (!classId || !sectionId) return;
        const label = [
          item.class?.name || item.classId,
          item.section?.name || item.sectionId,
        ]
          .filter(Boolean)
          .join(' · ');
        map.set(`${classId}:${sectionId}`, { classId, sectionId, label });
      });

      const list = [...map.values()];
      setSections(list);
      if (list.length && !selectedKey) {
        setSelectedKey(`${list[0].classId}:${list[0].sectionId}`);
      }

      const sessionName =
        allocations.classTeacher[0]?.session ||
        allocations.subjectTeacher[0]?.session ||
        '';
      if (sessionName) setSession(String(sessionName));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load classes.');
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  const loadStudentsAndMarks = useCallback(async () => {
    if (!selected) return;
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      let activeSession = session;
      const rows = await fetchTeacherStudents(allocations, activeSession || undefined);
      if (!activeSession) {
        activeSession =
          rows[0]?.academicInformation?.session ||
          rows[0]?.studentInformation?.academicInformation?.session ||
          '';
        if (activeSession) setSession(activeSession);
      }

      const filtered = rows.filter((row) => {
        const academic = row.academicInformation || row.studentInformation?.academicInformation;
        const cls = academic?.admissionClass;
        const sec = academic?.admissionSection;
        return cls === selected.classId && sec === selected.sectionId;
      });
      const list = filtered.length ? filtered : rows;
      setStudents(list);

      if (!activeSession) return;

      const existing = await fetchClassAttendance({
        session: activeSession,
        date,
        classId: selected.classId,
        sectionId: selected.sectionId,
      }).catch(() => null);

      const records = existing?.rows || existing?.records || [];
      const next: Record<string, AttendanceMarkRow['statusKey']> = {};
      list.forEach((row) => {
        const id = row.studentId || row.studentInformation?.studentId || '';
        if (id) next[id] = 'present';
      });
      records.forEach((rec) => {
        const id = rec.personId || (rec as { studentId?: string }).studentId;
        if (id && rec.statusKey) next[id] = rec.statusKey;
      });
      setMarks(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load attendance.');
    }
  }, [selected, session, date]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (selected) {
      void loadStudentsAndMarks();
    }
  }, [selected, loadStudentsAndMarks]);

  const onSave = async () => {
    if (!selected || !session) return;
    setSaving(true);
    try {
      const rows: AttendanceMarkRow[] = students.map((row) => {
        const personId = row.studentId || row.studentInformation?.studentId || '';
        return {
          personId,
          statusKey: marks[personId] || 'present',
          studentName: studentName(row),
        };
      }).filter((r) => r.personId);

      const result = await saveClassAttendance({
        session,
        date,
        classId: selected.classId,
        sectionId: selected.sectionId,
        rows,
      });

      Alert.alert('Saved', result.message || `Marked ${result.saved ?? rows.length} students.`);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenShell role="teacher" title="Mark Attendance" showBack showMenu>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell role="teacher" title="Mark Attendance" subtitle={`Date: ${date}`} showBack showMenu>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.err}>{error}</Text> : null}

      {sections.length === 0 ? (
        <Text style={styles.muted}>No class assigned to you yet.</Text>
      ) : (
        <>
          <Text style={styles.section}>Class & section</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {sections.map((sec) => {
              const key = `${sec.classId}:${sec.sectionId}`;
              const active = key === selectedKey;
              return (
                <Pressable
                  key={key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedKey(key)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{sec.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {students.map((row) => {
            const id = row.studentId || row.studentInformation?.studentId || '';
            const current = marks[id] || 'present';
            return (
              <View key={id} style={styles.studentRow}>
                <Text style={styles.studentName}>{studentName(row)}</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.key}
                      style={[
                        styles.statusBtn,
                        current === opt.key && { backgroundColor: `${opt.color}22`, borderColor: opt.color },
                      ]}
                      onPress={() => setMarks((prev) => ({ ...prev, [id]: opt.key }))}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          current === opt.key && { color: opt.color, fontWeight: '700' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}

          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving || !students.length}
            onPress={() => void onSave()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save attendance</Text>
              </>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  err: { color: '#B91C1C', marginBottom: 10 },
  muted: { color: Neutrals.muted },
  section: { fontSize: 13, fontWeight: '700', color: Neutrals.muted, marginBottom: 8, textTransform: 'uppercase' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Neutrals.card,
    marginRight: 8,
  },
  chipActive: { backgroundColor: `${primary}18` },
  chipText: { fontSize: 13, color: Neutrals.muted, fontWeight: '600' },
  chipTextActive: { color: primary },
  studentRow: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  studentName: { fontSize: 15, fontWeight: '600', color: Neutrals.text, marginBottom: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Neutrals.border,
  },
  statusBtnText: { fontSize: 12, color: Neutrals.muted },
  saveBtn: {
    marginTop: 8,
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
