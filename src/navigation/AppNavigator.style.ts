import { StyleSheet } from 'react-native';
import { colors, typography, spacing, MIN_TOUCH_TARGET } from '../theme';

export const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    height: 72,
    minHeight: MIN_TOUCH_TARGET + spacing.lg,
  },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', minHeight: MIN_TOUCH_TARGET },
  tabIcon: { fontSize: 24, marginBottom: 2 },
  tabIconFilled: { fontWeight: 'bold' },
  tabLabel: { ...typography.caption, color: colors.textMuted },
  tabLabelFocused: { color: colors.primary, fontWeight: '600' },
});
