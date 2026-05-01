import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography } from '../theme';
import { Exercise, ExerciseService } from '../services/exerciseService';
import * as Notifications from 'expo-notifications';

// إعداد التنبيهات للعمل في الخلفية
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Props {
  exercise: Exercise;
  onComplete: () => void;
}

export const CurrentExerciseCard: React.FC<Props> = ({ exercise, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(exercise.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // تشغيل المؤقت فوراً إذا كان هناك وقت
    if (exercise.durationMinutes > 0) {
      setIsActive(true);
    } else {
      setIsFinished(true); // إذا لم يكن هناك وقت، يظهر زر "Done" مباشرة
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exercise]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // إرسال تنبيه إذا كان المؤقت يعمل والمستخدم خرج من التطبيق
  const scheduleReminder = async () => {
    if (isActive && timeLeft > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Mentora: Don't miss your session!",
          body: `You still have ${Math.ceil(timeLeft / 60)} minutes left in your ${exercise.name} exercise.`,
        },
        trigger: { seconds: 120 }, // تنبيه بعد دقيقتين كمثال
      });
    }
  };

  const handleDone = async () => {
    await ExerciseService.saveCompletedExercise(exercise);
    onComplete();
  };

  const handleRepeat = () => {
    setTimeLeft(exercise.durationMinutes * 60);
    setIsActive(true);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>{exercise.name}</Text>
          <Text style={s.subtitle}>{exercise.exerciseType} • {exercise.difficulty}</Text>
        </View>
        {exercise.durationMinutes > 0 && (
          <View style={s.timerBadge}>
            <Text style={s.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        )}
      </View>

      <Text style={s.desc}>{exercise.description}</Text>

      {isFinished ? (
        <View style={s.actionRow}>
          <TouchableOpacity style={s.doneBtn} onPress={handleDone}>
            <Text style={s.btnText}>Done ✨</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.repeatBtn} onPress={handleRepeat}>
            <Text style={s.repeatText}>Repeat 🔄</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.progressContainer}>
           <View style={[s.progressBar, { width: `${(1 - timeLeft / (exercise.durationMinutes * 60)) * 100}%` }]} />
        </View>
      )}

      {showInstructions && (
        <View style={s.instructions}>
          <Text style={s.instrTitle}>How to Perform:</Text>
          <Text style={s.instrText}>{exercise.instructions}</Text>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  desc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  repeatBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  repeatText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  instructions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  instrTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instrText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
