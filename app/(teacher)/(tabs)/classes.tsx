import { Neutrals, RoleColors } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.teacher.primary;

export default function TeacherClassesScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {[
        { n: 'Class 10 — Mathematics', d: 'Sections A & B' },
        { n: 'Class 9 — Science', d: 'Sections A, B, C' },
        { n: 'Class 8 — Mathematics', d: 'Section A' },
      ].map((c) => (
        <View key={c.n} style={styles.card}>
          <View style={[styles.accent, { backgroundColor: primary }]} />
          <View style={styles.body}>
            <Text style={styles.name}>{c.n}</Text>
            <Text style={styles.meta}>{c.d}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 16 },
  name: { fontSize: 16, fontWeight: '700', color: Neutrals.text },
  meta: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
});
