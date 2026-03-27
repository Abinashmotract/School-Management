import { Neutrals, RoleColors } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const primary = RoleColors.parent.primary;

export default function ParentChildrenScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: `${primary}22` }]}>
          <Text style={[styles.avText, { color: primary }]}>A</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Ankit Sharma</Text>
          <Text style={styles.meta}>Class 10 · Section A</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </View>
      <Text style={styles.hint}>Link more children from settings when available.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Neutrals.card,
    padding: 16,
    borderRadius: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avText: { fontSize: 22, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: Neutrals.text },
  meta: { fontSize: 13, color: Neutrals.muted, marginTop: 2 },
  hint: { fontSize: 13, color: Neutrals.muted, marginTop: 16 },
});
