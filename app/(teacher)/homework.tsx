import { ScreenShell } from '@/components/navigation/ScreenShell';
import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import type { HomeworkSubmission } from '@/lib/homework-api';
import {
  createHomework,
  fetchTeacherHomework,
  gradeHomework,
  type TeacherHomeworkAssignment,
} from '@/lib/teacher-homework-api';
import {
  fetchTeacherAllocations,
  type SubjectTeacherAllocation,
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
  TextInput,
  View,
} from 'react-native';

const primary = RoleColors.teacher.primary;

const useLocalStyles = createThemedStyles((colors) => ({
  content: { padding: 16, paddingBottom: 40 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  section: { fontSize: 17, fontWeight: '700', color: colors.text },
  link: { color: primary, fontWeight: '600' },
  form: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.input,
    marginBottom: 8,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: {
    marginTop: 8,
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
    backgroundColor: colors.input,
    marginRight: 8,
  },
  chipActive: { backgroundColor: `${primary}18` },
  chipText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  chipTextActive: { color: primary },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardMeta: { fontSize: 12, color: colors.muted, marginTop: 4 },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: primary,
    backgroundColor: `${primary}18`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submissions: { marginTop: 12, gap: 10 },
  emptySub: { color: colors.muted, fontSize: 13 },
  subRow: {
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 12,
  },
  subName: { fontSize: 14, fontWeight: '700', color: colors.text },
  subContent: { fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 20 },
  subStatus: { fontSize: 11, color: colors.muted, marginTop: 4, fontWeight: '700' },
  gradeBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  graded: { fontSize: 13, color: '#047857', marginTop: 6, fontWeight: '600' },
}));

type ClassOption = {
  key: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  subjectId?: string;
  subjectName?: string;
};

function buildClassOptions(allocations: SubjectTeacherAllocation[]): ClassOption[] {
  const map = new Map<string, ClassOption>();
  allocations.forEach((row) => {
    if (!row.classId || !row.sectionId) return;
    const key = `${row.classId}:${row.sectionId}:${row.subjectId || ''}`;
    map.set(key, {
      key,
      classId: row.classId,
      sectionId: row.sectionId,
      className: row.class?.name || row.classId,
      sectionName: row.section?.name || row.sectionId,
      subjectId: row.subjectId,
      subjectName: row.subject?.name,
    });
  });
  return [...map.values()];
}

export default function TeacherHomeworkScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TeacherHomeworkAssignment[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedClassKey, setSelectedClassKey] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, string>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const selectedClass = useMemo(
    () => classOptions.find((c) => c.key === selectedClassKey),
    [classOptions, selectedClassKey]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const allocations = await fetchTeacherAllocations();
      const options = buildClassOptions(allocations.subjectTeacher || []);
      setClassOptions(options);
      if (!selectedClassKey && options[0]) setSelectedClassKey(options[0].key);
      setRows(await fetchTeacherHomework());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load homework.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClassKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    if (!selectedClass || !title.trim()) {
      Alert.alert('Homework', 'Select a class and enter a title.');
      return;
    }
    setSubmitting(true);
    try {
      await createHomework({
        title: title.trim(),
        description: description.trim(),
        classId: selectedClass.classId,
        className: selectedClass.className,
        sectionId: selectedClass.sectionId,
        sectionName: selectedClass.sectionName,
        subjectId: selectedClass.subjectId,
        subjectName: selectedClass.subjectName,
        dueDate: dueDate.trim() || undefined,
      });
      Alert.alert('Created', 'Homework assignment published.');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not create homework.');
    } finally {
      setSubmitting(false);
    }
  };

  const onGrade = async (homeworkId: string, submission: HomeworkSubmission) => {
    const studentId = submission.studentId;
    if (!studentId) return;
    const marks = Number(gradeDrafts[`${homeworkId}:${studentId}`]);
    if (Number.isNaN(marks)) {
      Alert.alert('Grade', 'Enter valid marks.');
      return;
    }
    setSubmitting(true);
    try {
      await gradeHomework(homeworkId, {
        studentId,
        studentName: submission.studentName,
        marks,
        feedback: feedbackDrafts[`${homeworkId}:${studentId}`]?.trim(),
      });
      Alert.alert('Graded', 'Submission graded successfully.');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not grade submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell role="teacher" title="Homework" showBack showMenu>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
          }
        >
          <View style={styles.sectionRow}>
            <Text style={styles.section}>My assignments</Text>
            <Pressable onPress={() => setShowForm((v) => !v)}>
              <Text style={styles.link}>{showForm ? 'Cancel' : 'Assign new'}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.err}>{error}</Text> : null}

          {showForm ? (
            <View style={styles.form}>
              <Text style={styles.label}>Class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {classOptions.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[styles.chip, selectedClassKey === option.key && styles.chipActive]}
                    onPress={() => setSelectedClassKey(option.key)}
                  >
                    <Text style={[styles.chipText, selectedClassKey === option.key && styles.chipTextActive]}>
                      {option.className} · {option.sectionName}
                      {option.subjectName ? ` · ${option.subjectName}` : ''}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Assignment title" />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Instructions for students"
                multiline
              />
              <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="2026-07-30" />
              <Pressable
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                disabled={submitting}
                onPress={() => void onCreate()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish homework</Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {rows.length === 0 ? <Text style={styles.empty}>No homework assignments yet.</Text> : null}

          {rows.map((item) => {
            const open = expandedId === item.homeworkId;
            const submissions = item.submissions || [];
            return (
              <View key={item.homeworkId} style={styles.card}>
                <Pressable onPress={() => setExpandedId(open ? null : item.homeworkId)}>
                  <View style={styles.cardHead}>
                    <Ionicons name="document-text-outline" size={22} color={primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardMeta}>
                        {item.className || 'Class'} · {item.sectionName || 'Section'}
                        {item.dueDate ? ` · Due ${item.dueDate}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.badge}>{submissions.length} submissions</Text>
                  </View>
                </Pressable>

                {open ? (
                  <View style={styles.submissions}>
                    {submissions.length === 0 ? (
                      <Text style={styles.emptySub}>No submissions yet.</Text>
                    ) : (
                      submissions.map((sub) => {
                        const draftKey = `${item.homeworkId}:${sub.studentId}`;
                        return (
                          <View key={draftKey} style={styles.subRow}>
                            <Text style={styles.subName}>{sub.studentName || sub.studentId}</Text>
                            {sub.content ? <Text style={styles.subContent}>{sub.content}</Text> : null}
                            <Text style={styles.subStatus}>{sub.status || 'SUBMITTED'}</Text>
                            {sub.status !== 'GRADED' ? (
                              <>
                                <TextInput
                                  style={styles.input}
                                  placeholder="Marks"
                                  keyboardType="numeric"
                                  value={gradeDrafts[draftKey] || ''}
                                  onChangeText={(text) =>
                                    setGradeDrafts((prev) => ({ ...prev, [draftKey]: text }))
                                  }
                                />
                                <TextInput
                                  style={styles.input}
                                  placeholder="Feedback (optional)"
                                  value={feedbackDrafts[draftKey] || ''}
                                  onChangeText={(text) =>
                                    setFeedbackDrafts((prev) => ({ ...prev, [draftKey]: text }))
                                  }
                                />
                                <Pressable
                                  style={styles.gradeBtn}
                                  onPress={() => void onGrade(item.homeworkId, sub)}
                                >
                                  <Text style={styles.gradeBtnText}>Save grade</Text>
                                </Pressable>
                              </>
                            ) : (
                              <Text style={styles.graded}>
                                Marks: {sub.marks ?? '—'}
                                {sub.feedback ? ` · ${sub.feedback}` : ''}
                              </Text>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenShell>
  );
}

