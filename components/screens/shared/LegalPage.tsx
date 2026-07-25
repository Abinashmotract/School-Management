import { createThemedStyles } from '@/hooks/create-themed-styles';
import React from 'react';
import { ScrollView, Text } from 'react-native';

type Props = {
  title?: string;
  paragraphs: string[];
};

const useLegalPageStyles = createThemedStyles((colors) => ({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 12,
  },
}));

export function LegalPage({ title, paragraphs }: Props) {
  const styles = useLegalPageStyles();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.p}>
          {p}
        </Text>
      ))}
    </ScrollView>
  );
}
