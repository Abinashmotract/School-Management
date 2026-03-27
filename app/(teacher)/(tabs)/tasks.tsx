import { Neutrals } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TeacherTasksScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {[
        { t: 'Grade Mathematics assignment', d: 'Due today' },
        { t: 'Take attendance — Class 9', d: 'Pending' },
        { t: 'Create weekly test — Class 8', d: 'Due tomorrow' },
      ].map((x) => (
        <View key={x.t} style={styles.row}>
          <Ionicons name="time-outline" size={22} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{x.t}</Text>
            <Text style={styles.due}>{x.d}</Text>
          </View>
          <Pressable style={styles.btn}>
            <Text style={styles.btnText}>Open</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
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
  due: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  btn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
