import { Neutrals, RoleColors } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.teacher.primary;

export default function TeacherProfileScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>P</Text>
        </View>
        <Text style={styles.name}>Prof. R. Sharma</Text>
        <Text style={styles.email}>prof.sharma@school.com</Text>
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>Teacher · Mathematics</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Employee ID</Text>
        <Text style={styles.value}>TCH-2048</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: Neutrals.text },
  email: { fontSize: 14, color: Neutrals.muted, marginTop: 4 },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
  },
  label: { fontSize: 15, color: Neutrals.muted },
  value: { fontSize: 15, fontWeight: '600', color: Neutrals.text },
});
