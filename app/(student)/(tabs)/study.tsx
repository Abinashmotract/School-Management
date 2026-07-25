import { RoleColors } from '@/constants/school-theme';
import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import {
  fetchLessonPlans,
  fetchStudentProfile,
  fetchStudyMaterials,
  toPortalOverview,
  type LessonPlanRow,
  type StudyMaterialRow,
} from '@/lib/student-portal-api';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

const primary = RoleColors.student.primary;

const useLocalStyles = createThemedStyles(() => ({
  link: { fontSize: 14, fontWeight: '600', color: primary },
}));

export default function StudentStudyScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LessonPlanRow[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialRow[]>([]);
  const [subtitle, setSubtitle] = useState('Lesson plans and resources for your class');

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await fetchStudentProfile();
      const [plans, studyMaterials] = await Promise.all([
        fetchLessonPlans(profile),
        fetchStudyMaterials(profile),
      ]);
      const overview = toPortalOverview(profile);
      setRows(plans);
      setMaterials(studyMaterials);
      setSubtitle(
        `${overview.className}${overview.sectionName ? ` · ${overview.sectionName}` : ''} · ${overview.session}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load syllabus.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bySubject = useMemo(() => {
    const m = new Map<string, LessonPlanRow[]>();
    for (const r of rows) {
      const k = r.subjectName || 'General';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return m;
  }, [rows]);

  const materialsBySubject = useMemo(() => {
    const m = new Map<string, StudyMaterialRow[]>();
    for (const item of materials) {
      const k = item.subjectName || 'General';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(item);
    }
    return m;
  }, [materials]);

  const resolveMaterialUrl = (item: StudyMaterialRow) => item.externalUrl || item.fileUrl || '';

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
      <Text style={styles.title}>Syllabus & Lesson Plan</Text>
      <Text style={styles.sub}>{subtitle}</Text>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {materials.length > 0 ? (
        <>
          <Text style={styles.sectionHeading}>Study Materials</Text>
          {[...materialsBySubject.entries()].map(([subject, items]) => (
            <View key={`material-${subject}`} style={styles.group}>
              <Text style={styles.groupTitle}>{subject}</Text>
              {items.map((item) => {
                const url = resolveMaterialUrl(item);
                return (
                  <View key={item.materialId || item.title} style={styles.card}>
                    <Ionicons name="folder-open-outline" size={22} color={primary} />
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{item.title || 'Study material'}</Text>
                      {item.type ? <Text style={styles.cardDesc}>{item.type}</Text> : null}
                      {url ? (
                        <Pressable onPress={() => Linking.openURL(url)} style={styles.linkRow}>
                          <Text style={styles.link}>Open material</Text>
                          <Ionicons name="open-outline" size={16} color={primary} />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.sectionHeading}>Lesson Plans</Text>

      {rows.length === 0 && materials.length === 0 && !error ? (
        <Text style={styles.empty}>No syllabus content yet. Your school will publish it here.</Text>
      ) : null}

      {rows.length === 0 && materials.length > 0 && !error ? (
        <Text style={styles.empty}>No lesson plans yet.</Text>
      ) : null}

      {[...bySubject.entries()].map(([subject, items]) => (
        <View key={subject} style={styles.group}>
          <Text style={styles.groupTitle}>{subject}</Text>
          {items.map((item) => (
            <View key={item.planId || item._id || item.topicName} style={styles.card}>
              <Ionicons name="document-text-outline" size={22} color={primary} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.topicName || 'Lesson'}</Text>
                {item.keyContent ? (
                  <Text style={styles.cardDesc} numberOfLines={4}>
                    {item.keyContent}
                  </Text>
                ) : null}
                {item.learningObjectives?.length ? (
                  <Text style={styles.cardDesc} numberOfLines={3}>
                    Objectives: {item.learningObjectives.join(', ')}
                  </Text>
                ) : null}
                {item.resources?.[0] ? (
                  <Pressable
                    onPress={() => Linking.openURL(item.resources![0])}
                    style={styles.linkRow}
                  >
                    <Text style={styles.link}>Open resource</Text>
                    <Ionicons name="open-outline" size={16} color={primary} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
