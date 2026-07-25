import { AttendanceStatusToggle } from '@/components/attendance/AttendanceStatusToggle';
import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import {
  countAttendanceSummary,
  formatAttendanceDate,
  localTodayYmd,
  shiftYmd,
  type QuickAttendanceStatus,
} from '@/lib/attendance-utils';
import {
  fetchClassAttendance,
  fetchTeacherAllocations,
  fetchTeacherStudents,
  saveClassAttendance,
  type TeacherStudentRow,
} from '@/lib/teacher-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

type ClassSection = { classId: string; sectionId: string; label: string; session?: string };

const useLocalStyles = createThemedStyles((colors, isDark) => ({
  content: { padding: 16, paddingBottom: 40 },
  infoBox: {
    backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF',
    borderColor: isDark ? '#1D4ED8' : '#BFDBFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: isDark ? '#BFDBFE' : '#1D4ED8' },
  infoText: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  dateNav: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  dateHint: { fontSize: 11, color: colors.muted, marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  bulkRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  bulkBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  bulkBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: { backgroundColor: `${primary}18` },
  chipText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  chipTextActive: { color: primary },
  studentRow: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  studentMeta: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700', color: colors.text },
  studentSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
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
}));

function studentName(row: TeacherStudentRow) {
  const basic = row.basicInformation || row.studentInformation?.basicInformation;
  return [basic?.firstName, basic?.middleName, basic?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || row.studentId || 'Student';
}

function studentId(row: TeacherStudentRow) {
  return row.studentId || row.studentInformation?.studentId || '';
}

function resolveSession(sections: ClassSection[], selected: ClassSection | null) {
  return selected?.session || sections.find((item) => item.session)?.session || '';
}

export default function TeacherAttendanceScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [date, setDate] = useState(localTodayYmd());
  const [session, setSession] = useState('');
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [marks, setMarks] = useState<Record<string, QuickAttendanceStatus>>({});

  const selected = useMemo(
    () => sections.find((s) => `${s.classId}:${s.sectionId}` === selectedKey) || null,
    [sections, selectedKey],
  );

  const summary = useMemo(() => countAttendanceSummary(marks), [marks]);
  const isToday = date === localTodayYmd();

  const loadSections = useCallback(async () => {
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      const map = new Map<string, ClassSection>();

      [...allocations.classTeacher, ...allocations.subjectTeacher].forEach((item) => {
        const classId = item.classId;
        const sectionId = item.sectionId;
        if (!classId || !sectionId) return;
        const label = [item.class?.name || item.classId, item.section?.name || item.sectionId]
          .filter(Boolean)
          .join(' · ');
        map.set(`${classId}:${sectionId}`, {
          classId,
          sectionId,
          label,
          session: item.session ? String(item.session) : undefined,
        });
      });

      const list = [...map.values()];
      setSections(list);
      setSelectedKey((current) => {
        if (current && list.some((item) => `${item.classId}:${item.sectionId}` === current)) {
          return current;
        }
        return list[0] ? `${list[0].classId}:${list[0].sectionId}` : '';
      });

      const sessionName =
        allocations.classTeacher[0]?.session ||
        allocations.subjectTeacher[0]?.session ||
        '';
      if (sessionName) setSession(String(sessionName));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load classes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadStudentsAndMarks = useCallback(async () => {
    if (!selected) return;
    setError(null);
    try {
      const activeSession = session || resolveSession(sections, selected);
      if (!activeSession) {
        setStudents([]);
        setMarks({});
        setError('Session not found for this class.');
        return;
      }
      if (!session) setSession(activeSession);

      const list = await fetchTeacherStudents(
        undefined,
        activeSession,
        selected.classId,
        selected.sectionId,
      );
      setStudents(list);

      const existing = await fetchClassAttendance({
        session: activeSession,
        date,
        classId: selected.classId,
        sectionId: selected.sectionId,
      });

      const records = existing.records || existing.rows || [];
      const next: Record<string, QuickAttendanceStatus> = {};
      list.forEach((row) => {
        const id = studentId(row);
        if (id) next[id] = 'present';
      });
      records.forEach((rec) => {
        const id = rec.personId || rec.studentId;
        if (!id || !rec.statusKey) return;
        if (rec.statusKey === 'absent') next[id] = 'absent';
        else if (rec.statusKey === 'late') next[id] = 'late';
        else next[id] = 'present';
      });
      setMarks(next);
    } catch (e) {
      setStudents([]);
      setMarks({});
      setError(e instanceof Error ? e.message : 'Could not load attendance.');
    }
  }, [selected, session, sections, date]);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (selected) {
      void loadStudentsAndMarks();
    }
  }, [selected, loadStudentsAndMarks]);

  const markAll = (status: QuickAttendanceStatus) => {
    setMarks((prev) => {
      const next = { ...prev };
      students.forEach((row) => {
        const id = studentId(row);
        if (id) next[id] = status;
      });
      return next;
    });
  };

  const onSave = async () => {
    if (!selected || !session) return;
    setSaving(true);
    try {
      const rows = students
        .map((row) => {
          const personId = studentId(row);
          return {
            personId,
            statusKey: marks[personId] || 'present',
            studentName: studentName(row),
          };
        })
        .filter((row) => row.personId);

      const result = await saveClassAttendance({
        session,
        date,
        classId: selected.classId,
        sectionId: selected.sectionId,
        rows,
      });

      Alert.alert('Saved', result.message || `Marked ${result.saved ?? rows.length} students.`);
      await loadStudentsAndMarks();
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
    <ScreenShell
      role="teacher"
      title="Mark Attendance"
      subtitle="Manual present / absent / late"
      showBack
      showMenu
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadSections().then(() => loadStudentsAndMarks());
            }}
          />
        }
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Manual attendance (like ERP admin)</Text>
          <Text style={styles.infoText}>
            Mark students as Present, Absent, or Late for the selected date. Check-in and check-out
            times are recorded separately by school devices or admin panel.
          </Text>
        </View>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        {sections.length === 0 ? (
          <Text style={styles.muted}>No class assigned to you yet.</Text>
        ) : (
          <>
            <Text style={styles.section}>Date</Text>
            <View style={styles.dateRow}>
              <Pressable style={styles.dateNav} onPress={() => setDate((current) => shiftYmd(current, -1))}>
                <Ionicons name="chevron-back" size={18} color={primary} />
              </Pressable>
              <Pressable style={styles.dateCenter} onPress={() => setDate(localTodayYmd())}>
                <Text style={styles.dateLabel}>{formatAttendanceDate(date)}</Text>
                <Text style={styles.dateHint}>{isToday ? 'Today · tap to reset' : 'Tap for today'}</Text>
              </Pressable>
              <Pressable style={styles.dateNav} onPress={() => setDate((current) => shiftYmd(current, 1))}>
                <Ionicons name="chevron-forward" size={18} color={primary} />
              </Pressable>
            </View>

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

            <View style={styles.summaryRow}>
              {[
                { label: 'Present', value: summary.present, color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Absent', value: summary.absent, color: '#DC2626', bg: '#FEE2E2' },
                { label: 'Late', value: summary.late, color: '#D97706', bg: '#FEF3C7' },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[styles.summaryCard, { backgroundColor: item.bg, borderColor: `${item.color}55` }]}
                >
                  <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={[styles.summaryLabel, { color: item.color }]}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.bulkRow}>
              <Pressable style={styles.bulkBtn} onPress={() => markAll('present')}>
                <Text style={styles.bulkBtnText}>All Present</Text>
              </Pressable>
              <Pressable style={styles.bulkBtn} onPress={() => markAll('absent')}>
                <Text style={styles.bulkBtnText}>All Absent</Text>
              </Pressable>
            </View>

            {students.length === 0 ? (
              <Text style={styles.muted}>No students found in this class.</Text>
            ) : (
              students.map((row) => {
                const id = studentId(row);
                const current = marks[id] || 'present';
                const roll = row.academicInformation?.rollNumber || row.rollNumber;
                return (
                  <View key={id} style={styles.studentRow}>
                    <View style={styles.studentMeta}>
                      <Text style={styles.studentName}>{studentName(row)}</Text>
                      <Text style={styles.studentSub}>
                        {roll ? `Roll ${roll}` : id}
                      </Text>
                    </View>
                    <AttendanceStatusToggle
                      value={current}
                      onChange={(status) => setMarks((prev) => ({ ...prev, [id]: status }))}
                    />
                  </View>
                );
              })
            )}

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
