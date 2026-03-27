import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.parent.primary;

export function ParentDashboard() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: primary }]}>
        <Text style={styles.bannerTitle}>Hello, Mrs. Sharma</Text>
        <Text style={styles.bannerSub}>Stay updated on Ankit&apos;s school life</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.dateText}>Friday, 27 March 2026</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { icon: 'school-outline' as const, n: '92%', l: 'Attendance' },
          { icon: 'ribbon-outline' as const, n: '85%', l: 'Avg. Score' },
          { icon: 'notifications-outline' as const, n: '3', l: 'Alerts' },
          { icon: 'calendar-outline' as const, n: '2', l: 'Events' },
        ].map((s) => (
          <View key={s.l} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${primary}22` }]}>
              <Ionicons name={s.icon} size={22} color={primary} />
            </View>
            <View>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actions}>
        {['Fee status', 'Report card', 'Meet teacher', 'Transport'].map((label) => (
          <View key={label} style={styles.actionPill}>
            <Text style={styles.actionText}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent updates</Text>
      {[
        'PTM scheduled for 5 April',
        'Annual day rehearsal — 4:00 PM',
        'Math assignment submitted',
      ].map((t) => (
        <View key={t} style={styles.updateRow}>
          <Ionicons name="ellipse" size={8} color={primary} />
          <Text style={styles.updateText}>{t}</Text>
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
    marginTop: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionPill: {
    backgroundColor: Neutrals.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Neutrals.border,
  },
  actionText: { fontSize: 13, fontWeight: '500', color: Neutrals.text },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  updateText: { fontSize: 14, color: Neutrals.muted },
});
