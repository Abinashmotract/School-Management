import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.student.primary;

export function StudentDashboard() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Welcome back, Ankit!</Text>
        <Text style={styles.bannerSub}>Ready to continue your learning journey?</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.dateText}>Friday, 27 March 2026</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { icon: 'book-outline' as const, n: '6', l: 'Active Subjects' },
          { icon: 'list-outline' as const, n: '4', l: 'Assignments' },
          { icon: 'stats-chart-outline' as const, n: '85%', l: 'Attendance' },
          { icon: 'star-outline' as const, n: '92%', l: 'Avg. Score' },
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

      <Text style={styles.sectionTitle}>Upcoming assignments</Text>
      {[
        { t: 'Mathematics — Quadratic Equations', d: 'Due tomorrow', s: 'Pending' },
        { t: 'Science — Chemical Reactions', d: 'Due in 2 days', s: 'Pending' },
      ].map((a) => (
        <View key={a.t} style={styles.card}>
          <View style={[styles.cardAccent, { backgroundColor: primary }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{a.t}</Text>
            <Text style={styles.cardMeta}>{a.d}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.due}>{a.d}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{a.s}</Text>
              </View>
            </View>
          </View>
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
    marginBottom: 8,
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
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
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
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Neutrals.text, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: primary, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  due: { fontSize: 12, color: '#EF4444' },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
});
