import { Neutrals } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function StudentSettingsScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push notifications</Text>
        <Switch value />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <Switch value />
      </View>

      <Text style={styles.section}>Appearance</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: Neutrals.muted,
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Neutrals.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  label: { fontSize: 15, color: Neutrals.text },
});
