import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { OnboardingService, OnboardingQuestion } from '../services/onboardingService';

export function OnboardingScreen({ onComplete }: { onComplete?: () => void }): React.ReactElement {
  const { userName, completeOnboarding, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await OnboardingService.getQuestions(language);
      setQuestions(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load onboarding questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [language]);

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#161B22" />
          <Text style={s.loadingText}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || questions.length === 0) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.centerContainer}>
          <Text style={s.errorText}>{error || 'No questions available.'}</Text>
          <TouchableOpacity style={s.retryButton} onPress={fetchQuestions}>
            <Text style={s.retryText}>{t.common.retry}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutButtonMargin} onPress={logout}>
            <Text style={s.logoutBtnText}>{t.profile.logOut}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const question = questions[currentStep - 1];
  const currentSelections = selections[question.questionId] || [];
  const hasAnsweredCurrent = currentSelections.length > 0;

  const handleToggle = (optId: number) => {
    const isSingleChoice = question.maxAllowedSelections === 1 || question.inputControlType?.toLowerCase() === 'radio';
    setSelections(prev => {
      const current = prev[question.questionId] || [];
      if (isSingleChoice) {
        if (current.includes(optId)) {
          return { ...prev, [question.questionId]: [] };
        }
        return { ...prev, [question.questionId]: [optId] };
      } else {
        const maxSelect = question.maxAllowedSelections || 999;
        if (current.includes(optId)) {
          return { ...prev, [question.questionId]: current.filter(id => id !== optId) };
        }
        if (current.length >= maxSelect) {
          return prev;
        }
        return { ...prev, [question.questionId]: [...current, optId] };
      }
    });
  };

  const handleNext = async () => {
    if (!hasAnsweredCurrent) {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Attention',
        isRTL ? 'يرجى الإجابة على السؤال أولاً للتمكن من المتابعة.' : 'Please answer the question first to proceed.'
      );
      return;
    }

    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step -> submit answers to backend
      try {
        setSubmitting(true);
        const formattedAnswers = questions.map(q => ({
          questionId: q.questionId,
          selectedOptionIds: selections[q.questionId] || []
        }));

        await OnboardingService.submitOnboarding(formattedAnswers, language);
        await completeOnboarding();
        if (onComplete) onComplete();
      } catch (err: any) {
        Alert.alert(
          isRTL ? 'خطأ' : 'Error',
          isRTL 
            ? 'فشل إرسال الإجابات. يرجى المحاولة مرة أخرى.' 
            : 'Failed to submit onboarding answers. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressWidth = `${(currentStep / questions.length) * 100}%`;
  const isSingleChoice = question.maxAllowedSelections === 1 || question.inputControlType?.toLowerCase() === 'radio';

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.headerTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[s.welcomeText, isRTL && s.rtlText]}>
              {t.onboarding.welcome}, {userName || 'Friend'}! 👋
            </Text>
            <TouchableOpacity onPress={logout} activeOpacity={0.7}>
              <Text style={s.logoutText}>{t.profile.logOut}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.headerTitle, isRTL && s.rtlText]}>{t.onboarding.letsKnowYou}</Text>

          <View style={s.progressRow}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: progressWidth as any }]} />
            </View>
          </View>
          <Text style={[s.stepText, isRTL && s.rtlText]}>
            {currentStep} {t.onboarding.stepOf} {questions.length}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {question.preQuestionDisclaimer ? (
            <Text style={[s.disclaimerText, isRTL && s.rtlText]}>{question.preQuestionDisclaimer}</Text>
          ) : null}
          
          <Text style={[s.questionTitle, isRTL && s.rtlText]}>{question.questionText}</Text>
          <Text style={[s.questionSubtitle, isRTL && s.rtlText]}>
            {isSingleChoice 
              ? (isRTL ? 'اختر إجابة واحدة' : 'Select a single option')
              : (isRTL ? `يمكنك اختيار حتى ${question.maxAllowedSelections || 'متعدد'} إجابات` : `Select up to ${question.maxAllowedSelections || 'multiple'} options`)
            }
          </Text>

          <View style={s.optionsContainer}>
            {question.responseOptions.map((opt) => {
              const isSelected = currentSelections.includes(opt.optionId);
              return (
                <TouchableOpacity
                  key={opt.optionId}
                  style={[s.optionRow, isRTL && { flexDirection: 'row-reverse' }]}
                  activeOpacity={0.7}
                  onPress={() => handleToggle(opt.optionId)}
                >
                  <View style={[s.optionLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[s.optionText, isRTL && s.rtlText]}>{opt.optionText}</Text>
                  </View>
                  <View style={[
                    s.checkbox, 
                    isSingleChoice && s.radioCheckbox,
                    isSelected && s.checkboxSelected
                  ]}>
                    {isSelected && (
                      isSingleChoice 
                        ? <View style={s.radioDot} /> 
                        : <Text style={s.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[s.footer, isRTL && { flexDirection: 'row-reverse' }]}>
          {currentStep > 1 ? (
            <TouchableOpacity onPress={handlePrev} disabled={submitting}>
              <Text style={[s.navText, submitting && { opacity: 0.5 }]}>{t.common.previous}</Text>
            </TouchableOpacity>
          ) : <View />}

          <TouchableOpacity 
            onPress={handleNext} 
            disabled={submitting || !hasAnsweredCurrent}
            style={[!hasAnsweredCurrent && { opacity: 0.4 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#1E293B" />
            ) : (
              <Text style={s.navText}>
                {currentStep === questions.length ? t.common.done : t.common.next}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B', fontWeight: '500' },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 20 },
  retryButton: { paddingVertical: 12, paddingHorizontal: 32, backgroundColor: '#161B22', borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  logoutButtonMargin: { marginTop: 16 },
  logoutBtnText: { color: '#64748B', fontSize: 15, textDecorationLine: 'underline' },

  header: { marginBottom: 30 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  welcomeText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  logoutText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  progressRow: { height: 8, marginBottom: 8 },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#161B22', borderRadius: 4 },
  stepText: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },

  content: { flex: 1 },
  disclaimerText: { fontSize: 13, color: '#EF4444', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, overflow: 'hidden', marginBottom: 16, fontWeight: '500' },
  questionTitle: { fontSize: 20, fontWeight: '700', color: '#161B22', textAlign: 'center', marginBottom: 8 },
  questionSubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', marginBottom: 30 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },

  optionsContainer: { paddingHorizontal: 8, marginBottom: 30 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionLeft: { flex: 1, paddingRight: 10 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  checkbox: {
    width: 22, height: 22,
    borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  radioCheckbox: {
    borderRadius: 11,
  },
  checkboxSelected: { backgroundColor: '#161B22', borderColor: '#161B22' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  navText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
});

export default OnboardingScreen;
