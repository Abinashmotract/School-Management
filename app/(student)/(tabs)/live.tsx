import { Neutrals } from '@/constants/school-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function StudentLiveScreen() {
  return (
    <View style={styles.root}>
      <Ionicons name="videocam-outline" size={64} color={Neutrals.muted} />
      <Text style={styles.title}>Live classes</Text>
      <Text style={styles.sub}>Join when your teacher starts a session</Text>
      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>Join next class</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Neutrals.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '700', color: Neutrals.text, marginTop: 16 },
  sub: { fontSize: 14, color: Neutrals.muted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  btn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
