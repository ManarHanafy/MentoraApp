import { StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.pageBottom,
  },
  welcomeText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressWrap: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    width: '100%',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  questionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  options: {
    marginBottom: spacing.xxl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionLabel: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  navWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  navBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navBtnNext: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  navBtnText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  navBtnTextDisabled: {
    color: colors.textMuted,
  },
});
