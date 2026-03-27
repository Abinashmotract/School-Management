import { Neutrals, RoleColors } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

export default function StudentProfileScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.avatarText, { color: primary }]}>A</Text>
        </View>
        <Text style={styles.name}>Ankit Sharma</Text>
        <Text style={styles.email}>ankit.sharma@school.com</Text>
        <View style={[styles.badge, { backgroundColor: `${primary}18` }]}>
          <Text style={[styles.badgeText, { color: primary }]}>Student · Class 10</Text>
        </View>
      </View>

      <Text style={styles.section}>Academic</Text>
      <InfoRow label="Class" value="10th Grade" />
      <InfoRow label="Section" value="A" />
      <InfoRow label="Roll No." value="24" />

      <Text style={styles.section}>School</Text>
      <InfoRow label="School" value="Delhi Public School" />
      <InfoRow label="Board" value="CBSE" />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: Neutrals.muted,
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Neutrals.border,
  },
  label: { fontSize: 15, color: Neutrals.muted },
  value: { fontSize: 15, fontWeight: '600', color: Neutrals.text },
});
