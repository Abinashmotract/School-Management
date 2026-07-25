import { createThemedStyles } from '@/hooks/create-themed-styles';
import { usePortalScreenStyles } from '@/hooks/use-portal-screen-styles';
import React from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

const useLocalStyles = createThemedStyles((colors) => ({
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
}));

export default function ParentSettingsScreen() {
  const styles = { ...usePortalScreenStyles(), ...useLocalStyles() };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Child updates</Text>
        <Switch value />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Fee reminders</Text>
        <Switch value />
      </View>
    </ScrollView>
  );
}
