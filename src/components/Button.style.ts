import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, MIN_TOUCH_TARGET } from '../theme';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: '#FFFFFF',
  },
  textSecondary: {
    color: colors.textPrimary,
  },
  textOutline: {
    color: colors.primary,
  },
});
