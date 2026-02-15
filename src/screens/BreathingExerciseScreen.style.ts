import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark background for immersion
    },
    content: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingTop: spacing.xl, // safe area
    },
    backBtn: {
        padding: spacing.xs,
    },
    backText: {
        fontSize: 24,
        color: colors.white,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.white,
    },
    placeholder: {
        width: 24,
    },
    illustration: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    illustrationIcon: {
        fontSize: 80,
    },
    title: {
        ...typography.h2,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.body,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: spacing.xl * 2,
        paddingHorizontal: spacing.lg,
    },
    startBtn: {
        backgroundColor: colors.white,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl * 2,
        borderRadius: borderRadius.full,
        width: '100%',
        alignItems: 'center',
    },
    startBtnText: {
        ...typography.button,
        color: colors.primary,
        fontSize: 18,
    },
    // Active State
    activeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleWrap: {
        width: width * 0.8,
        height: width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    breathingCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        position: 'absolute',
    },
    instructionText: {
        ...typography.h2,
        color: colors.white,
        marginTop: spacing.xl,
        textAlign: 'center',
    },
    timerText: {
        ...typography.h4,
        color: 'rgba(255,255,255,0.6)',
        marginTop: spacing.sm,
    },
    stopBtn: {
        marginTop: spacing.xl * 2,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: borderRadius.full,
    },
    stopBtnText: {
        ...typography.button,
        color: colors.white,
    }
});
