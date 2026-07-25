import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  colors: [string, string, ...string[]];
  style?: object;
  children?: React.ReactNode;
};

/** Lightweight gradient substitute without extra native dependency. */
export function LinearGradient({ colors, style, children }: Props) {
  const [start, end] = colors;
  return (
    <View style={[styles.base, { backgroundColor: start }, style]}>
      <View style={[styles.overlay, { backgroundColor: end, opacity: 0.42 }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
  },
});
