import { Neutrals, RoleColors } from '@/constants/school-theme';
import {
  fetchStudentHomework,
  submitHomework,
  type HomeworkAssignment,
} from '@/lib/homework-api';
import { fetchStudentProfile } from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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

const primary = RoleColors.student.primary;

export default function StudentHomeworkScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<HomeworkAssignment[]>([]);
  const [session, setSession] = useState<string>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile();
      const sess = profile.academicInformation?.session;
      setSession(sess);
      setRows(await fetchStudentHomework(sess));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load homework.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (homeworkId: string) => {
    const content = drafts[homeworkId]?.trim();
    if (!content) {
      Alert.alert('Homework', 'Write your answer before submitting.');
      return;
    }
    setSubmittingId(homeworkId);
    try {
      await submitHomework(homeworkId, { content });
      Alert.alert('Submitted', 'Your homework was submitted successfully.');
      setExpandedId(null);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not submit homework.');
    } finally {
      setSubmittingId(null);
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
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <Text style={styles.title}>Homework</Text>
      <Text style={styles.sub}>Assignments for your class{session ? ` · ${session}` : ''}</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}

      {rows.length === 0 ? (
        <Text style={styles.empty}>No active homework assignments.</Text>
      ) : null}

      {rows.map((item) => {
        const submitted = item.mySubmission?.status === 'SUBMITTED' || item.mySubmission?.status === 'GRADED';
        const open = expandedId === item.homeworkId;
        return (
          <View key={item.homeworkId} style={styles.card}>
            <Pressable onPress={() => setExpandedId(open ? null : item.homeworkId)}>
              <View style={styles.cardHead}>
                <Ionicons name="document-text-outline" size={22} color={primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.subjectName || 'Subject'}
                    {item.dueDate ? ` · Due ${item.dueDate}` : ''}
                  </Text>
                </View>
                <Text style={[styles.badge, submitted && styles.badgeDone]}>
                  {submitted ? 'Submitted' : 'Pending'}
                </Text>
              </View>
            </Pressable>

            {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

            {open && !submitted ? (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="Type your submission..."
                  value={drafts[item.homeworkId] || ''}
                  onChangeText={(text) =>
                    setDrafts((prev) => ({ ...prev, [item.homeworkId]: text }))
                  }
                />
                <Pressable
                  style={[styles.submitBtn, submittingId === item.homeworkId && { opacity: 0.6 }]}
                  disabled={submittingId === item.homeworkId}
                  onPress={() => void onSubmit(item.homeworkId)}
                >
                  {submittingId === item.homeworkId ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit homework</Text>
                  )}
                </Pressable>
              </View>
            ) : null}

            {submitted && item.mySubmission?.content ? (
              <Text style={styles.submittedText}>Your answer: {item.mySubmission.content}</Text>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Neutrals.bg },
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 16 },
  err: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: Neutrals.muted },
  card: {
    backgroundColor: Neutrals.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  cardMeta: { fontSize: 12, color: Neutrals.muted, marginTop: 4 },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeDone: { color: '#16A34A', backgroundColor: '#DCFCE7' },
  desc: { fontSize: 13, color: Neutrals.text, marginTop: 10, lineHeight: 20 },
  form: { marginTop: 12 },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Neutrals.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Neutrals.text,
    textAlignVertical: 'top',
    backgroundColor: Neutrals.bg,
  },
  submitBtn: {
    marginTop: 10,
    backgroundColor: primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  submittedText: { marginTop: 10, fontSize: 13, color: Neutrals.muted },
});
