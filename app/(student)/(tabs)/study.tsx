import { Neutrals } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StudentStudyScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Study</Text>
      <Text style={styles.sub}>Materials, notes, and assignments</Text>
      {['Mathematics', 'Science', 'English', 'Social Studies'].map((s) => (
        <View key={s} style={styles.row}>
          <Ionicons name="folder-outline" size={22} color="#3B82F6" />
          <Text style={styles.rowText}>{s}</Text>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  sub: { fontSize: 14, color: Neutrals.muted, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Neutrals.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '500', color: Neutrals.text },
});
