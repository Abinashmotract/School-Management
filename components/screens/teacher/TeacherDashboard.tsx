import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.teacher.primary;

export function TeacherDashboard() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Welcome back, Prof. Sharma</Text>
        <Text style={styles.bannerSub}>Your students are waiting for you</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.dateText}>Friday, 27 March 2026</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { icon: 'people-outline' as const, n: '156', l: 'Students' },
          { icon: 'easel-outline' as const, n: '4', l: 'Classes' },
          { icon: 'list-outline' as const, n: '12', l: 'Pending' },
          { icon: 'checkmark-circle-outline' as const, n: '89%', l: 'Attendance' },
        ].map((s) => (
          <View key={s.l} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${primary}18` }]}>
              <Ionicons name={s.icon} size={22} color={primary} />
            </View>
            <View>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>My classes</Text>
      {[
        { name: 'Class 10 — Mathematics', sec: 'A & B', students: 48 },
        { name: 'Class 9 — Science', sec: 'A, B, C', students: 72 },
      ].map((c) => (
        <View key={c.name} style={styles.classCard}>
          <View style={[styles.classAccent, { backgroundColor: primary }]} />
          <View style={styles.classBody}>
            <Text style={styles.className}>{c.name}</Text>
            <Text style={styles.classMeta}>
              Section {c.sec} · {c.students} students
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Pending tasks</Text>
      {['Grade Class 10 assignment', 'Attendance Class 9', 'Weekly test — Class 8'].map((t) => (
        <View key={t} style={styles.taskRow}>
          <Ionicons name="time-outline" size={18} color="#F59E0B" />
          <Text style={styles.taskText}>{t}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { paddingBottom: 32 },
  banner: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
  },
  bannerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: { fontSize: 12, color: '#fff' },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statN: { fontSize: 20, fontWeight: '700', color: Neutrals.text },
  statL: { fontSize: 11, color: Neutrals.muted },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Neutrals.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  classCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Neutrals.card,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  classAccent: { width: 4 },
  classBody: { flex: 1, padding: 14 },
  className: { fontSize: 16, fontWeight: '700', color: Neutrals.text, marginBottom: 4 },
  classMeta: { fontSize: 12, color: Neutrals.muted },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  taskText: { fontSize: 14, color: Neutrals.text },
});
