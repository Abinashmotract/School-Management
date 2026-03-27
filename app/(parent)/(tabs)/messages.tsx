import { Neutrals } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ParentMessagesScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {[
        { t: 'Class teacher', s: 'PTM reminder for next week', time: 'Today' },
        { t: 'Transport', s: 'Bus route delay 10 min', time: 'Yesterday' },
      ].map((m) => (
        <View key={m.t + m.time} style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{m.t}</Text>
            <Text style={styles.sub} numberOfLines={2}>
              {m.s}
            </Text>
          </View>
          <Text style={styles.time}>{m.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Neutrals.bg },
  content: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Neutrals.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: Neutrals.text },
  sub: { fontSize: 13, color: Neutrals.muted, marginTop: 4 },
  time: { fontSize: 11, color: '#94A3B8' },
});
