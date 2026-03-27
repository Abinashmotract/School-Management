import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.parent.primary;

export default function ParentAboutScreen() {
  return (
    <View style={styles.root}>
      <DrawerSubHeader title="About Us" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: primary }]}>
          <Ionicons name="school" size={48} color="#fff" />
          <Text style={styles.heroTitle}>SchoolApp for families</Text>
          <Text style={styles.heroSub}>
            Stay informed about classes, events, and your child&apos;s progress.
          </Text>
        </View>
        <Text style={styles.p}>
          We work with schools to keep communication clear and timely for parents and guardians.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Neutrals.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  p: { fontSize: 15, lineHeight: 22, color: Neutrals.muted },
});
