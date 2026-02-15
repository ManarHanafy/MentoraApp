import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export function ChatScreen(): React.ReactElement {
  return (
    <View style={s.container}>
      <Text style={s.title}>Chat</Text>
      <Text style={s.subtitle}>Your conversations</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textMuted },
});

export default ChatScreen;
