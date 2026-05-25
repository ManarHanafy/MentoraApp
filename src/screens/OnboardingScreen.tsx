import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function OnboardingScreen({ onComplete }: { onComplete?: () => void }): React.ReactElement {
  const { userName, completeOnboarding } = useAuth();
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, string[]>>({});

  const questions = t.onboarding.questions;
  const question = questions[currentStep - 1];

  const handleToggle = (optId: string) => {
    setSelections(prev => {
      const current = prev[currentStep] || [];
      if (current.includes(optId)) {
        return { ...prev, [currentStep]: current.filter(id => id !== optId) };
      }
      return { ...prev, [currentStep]: [...current, optId] };
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressWidth = `${(currentStep / 4) * 100}%`;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <Text style={[s.welcomeText, isRTL && s.rtlText]}>
            {t.onboarding.welcome}, {userName || 'Friend'}! 👋
          </Text>
          <Text style={[s.headerTitle, isRTL && s.rtlText]}>{t.onboarding.letsKnowYou}</Text>

          <View style={s.progressRow}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: progressWidth as any }]} />
            </View>
          </View>
          <Text style={[s.stepText, isRTL && s.rtlText]}>
            {currentStep} {t.onboarding.stepOf} 4
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          <Text style={[s.questionTitle, isRTL && s.rtlText]}>{question.title}</Text>
          <Text style={[s.questionSubtitle, isRTL && s.rtlText]}>{t.onboarding.selectBest}</Text>

          <View style={s.optionsContainer}>
            {question.options.map((opt, idx) => {
              const optId = String(idx + 1);
              const isSelected = (selections[currentStep] || []).includes(optId);
              return (
                <TouchableOpacity
                  key={optId}
                  style={[s.optionRow, isRTL && { flexDirection: 'row-reverse' }]}
                  activeOpacity={0.7}
                  onPress={() => handleToggle(optId)}
                >
                  <View style={[s.optionLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[s.optionIcon, isRTL && { marginRight: 0, marginLeft: 12 }]}>{opt.icon}</Text>
                    <Text style={[s.optionText, isRTL && s.rtlText]}>{opt.text}</Text>
                  </View>
                  <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                    {isSelected && <Text style={s.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[s.footer, isRTL && { flexDirection: 'row-reverse' }]}>
          {currentStep > 1 ? (
            <TouchableOpacity onPress={handlePrev}>
              <Text style={s.navText}>{t.common.previous}</Text>
            </TouchableOpacity>
          ) : <View />}

          <TouchableOpacity onPress={handleNext}>
            <Text style={s.navText}>{t.common.next}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },

  header: { marginBottom: 40 },
  welcomeText: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  progressRow: { height: 8, marginBottom: 8 },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#161B22', borderRadius: 4 },
  stepText: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },

  content: { flex: 1 },
  questionTitle: { fontSize: 20, fontWeight: '700', color: '#161B22', textAlign: 'center', marginBottom: 8 },
  questionSubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', marginBottom: 40 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },

  optionsContainer: { paddingHorizontal: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { fontSize: 24, marginRight: 12 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  checkbox: {
    width: 22, height: 22,
    borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: '#161B22', borderColor: '#161B22' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  navText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
});

export default OnboardingScreen;
