import { Neutrals } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TeacherStudentsScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {['Ankit Sharma', 'Priya Singh', 'Rohan Mehta'].map((name) => (
        <View key={name} style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avText}>{name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>Class 10 · Section A</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  name: { fontSize: 16, fontWeight: '600', color: Neutrals.text },
  meta: { fontSize: 12, color: Neutrals.muted, marginTop: 2 },
});
