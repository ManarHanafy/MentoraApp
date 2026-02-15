import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
   marginTop:50,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.pageBottom,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  moodCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  moodEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  moodEmoji: {
    fontSize: 28,
  },
  sliderWrap: {
    marginBottom: spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sliderLabelText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textLight,
    borderWidth: 2,
    borderColor: colors.primary,
    top: -6,
  },
  moodLevelText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  needToSayTouch: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  needToSayText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  recCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  recStarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recStarIcon: {
    fontSize: 18,
    color: colors.white,
  },
  recTitle: {
    ...typography.h3,
    color: colors.white,
  },
  recDesc: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.95,
    marginBottom: spacing.lg,
  },
  startExerciseBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
  },
  startExerciseText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  startExerciseArrow: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityIconWrapOrange: {
    backgroundColor: '#FED7AA',
  },
  activityIconWrapBlue: {
    backgroundColor: '#BFDBFE',
  },
  activityIcon: {
    fontSize: 22,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  activityArrow: {
    ...typography.body,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    maxWidth: 400,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textMuted,
  },
  modalInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  trackMoodBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackMoodBtnText: {
    ...typography.button,
    color: colors.white,
  },
});
