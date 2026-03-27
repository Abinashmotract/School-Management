import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { Neutrals } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function TeacherSettingsScreen() {
  return (
    <View style={styles.root}>
      <DrawerSubHeader title="Settings" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Class alerts</Text>
          <Switch value />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submission reminders</Text>
          <Switch value />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Neutrals.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: Neutrals.muted,
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
