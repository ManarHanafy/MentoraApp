import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './OnboardingScreen.style';
import { HIT_SLOP } from '../theme';
import { useAuth } from '../context/AuthContext';

const TOTAL_STEPS = 4;

const STEPS: Array<{
  question: string;
  options: Array<{ emoji: string; label: string }>;
}> = [
  {
    question: 'What brings you here today? Select the option that best describes you',
    options: [
      { emoji: '😔', label: 'Feeling down or depressed' },
      { emoji: '😟', label: 'Feeling anxious or worried' },
      { emoji: '😴', label: 'Having trouble sleeping' },
      { emoji: '⭐', label: 'Just checking my wellbeing' },
    ],
  },
  {
    question: 'How often do you feel stressed? Select the option that best describes you',
    options: [
      { emoji: '📅', label: 'Rarely' },
      { emoji: '📆', label: 'Sometimes' },
      { emoji: '📈', label: 'Often' },
      { emoji: '🔥', label: 'Almost always' },
    ],
  },
  {
    question: 'What would help you most right now? Select the option that best describes you',
    options: [
      { emoji: '🧘', label: 'Relaxation and mindfulness' },
      { emoji: '💬', label: 'Talking to someone' },
      { emoji: '📝', label: 'Journaling my thoughts' },
      { emoji: '📊', label: 'Tracking my mood' },
    ],
  },
  {
    question: "What's your main goal with MindCheck? Select the option that best describes you",
    options: [
      { emoji: '📈', label: 'Track my mental health' },
      { emoji: '🎯', label: 'Understand my symptoms' },
      { emoji: '💪', label: 'Improve my wellbeing' },
      { emoji: '🆘', label: 'Get help and support' },
    ],
  },
];

export interface OnboardingScreenProps {
  onComplete?: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps): React.ReactElement {
  const { userName, completeOnboarding } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const stepNumber = stepIndex + 1;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const isFirstStep = stepIndex === 0;

  const handleNext = async (): Promise<void> => {
    if (isLastStep) {
      await completeOnboarding();
      onComplete?.();
      return;
    }
    setSelectedOption(null);
    setStepIndex((i) => i + 1);
  };

  const handlePrevious = (): void => {
    if (!isFirstStep) {
      setSelectedOption(null);
      setStepIndex((i) => i - 1);
    }
  };

  const displayName = userName || 'Manar';

  return (
    <View style={styles.container} accessibilityLabel="Onboarding">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcomeText}>
          Welcome, {displayName}! 👋
        </Text>
        <Text style={styles.sectionTitle}>Let's get to know you</Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(stepNumber / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stepNumber} out of {TOTAL_STEPS}
          </Text>
        </View>

        <Text style={styles.questionText}>{step.question}</Text>

        <View style={styles.options}>
          {step.options.map((opt) => {
            const isSelected = selectedOption === opt.label;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => setSelectedOption(opt.label)}
                activeOpacity={0.8}
                style={styles.optionRow}
                hitSlop={HIT_SLOP}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navWrap}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={styles.navBtn}
            disabled={isFirstStep}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Previous"
          >
            <Text style={[styles.navBtnText, isFirstStep && styles.navBtnTextDisabled]}>
              {isFirstStep ? 'Previous' : '<< Previous'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navBtn, styles.navBtnNext]}
            disabled={step.options.length > 0 && !selectedOption}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={isLastStep ? 'Finish' : 'Next'}
          >
            <Text
              style={[
                styles.navBtnText,
                (step.options.length > 0 && !selectedOption) && styles.navBtnTextDisabled,
              ]}
            >
              Next {'>>>'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default OnboardingScreen;
