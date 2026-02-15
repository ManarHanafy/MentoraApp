import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export function MoodCheckInScreen(): React.ReactElement {
  return (
    <View style={s.container}>
      <Text style={s.title}>Mood check-in</Text>
      <Text style={s.subtitle}>How are you feeling?</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textMuted },
});

export default MoodCheckInScreen;
