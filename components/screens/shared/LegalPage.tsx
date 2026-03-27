import { Neutrals } from '@/constants/school-theme';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  paragraphs: string[];
};

export function LegalPage({ title, paragraphs }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.p}>
          {p}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Neutrals.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Neutrals.text,
    marginBottom: 16,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: Neutrals.muted,
    marginBottom: 12,
  },
});
