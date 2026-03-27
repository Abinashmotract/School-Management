import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

const blocks = [
  {
    title: 'Academic',
    items: ['Timetable', 'Study materials', 'Assignments', 'Exam schedule', 'Attendance'],
  },
  { title: 'Learning', items: ['Video lectures', 'Quizzes', 'Digital library'] },
  { title: 'Communication', items: ['Teacher messages', 'Announcements', 'Forums'] },
];

export default function StudentAccessScreen() {
  return (
    <View style={styles.root}>
      <DrawerSubHeader title="My Access" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {blocks.map((b) => (
          <View key={b.title} style={styles.card}>
            <Text style={styles.cardTitle}>{b.title}</Text>
            {b.items.map((item) => (
              <View key={item} style={styles.itemRow}>
                <Ionicons name="checkmark-circle" size={18} color={primary} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Neutrals.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Neutrals.text, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  itemText: { fontSize: 15, color: Neutrals.text },
});
