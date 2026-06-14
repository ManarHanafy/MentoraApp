import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';
import { OnboardingService, OnboardingQuestion } from '../services/onboardingService';

export function OnboardingScreen({ onComplete }: { onComplete?: () => void }): React.ReactElement {
  const { userName, completeOnboarding, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Onboarding Tour / Tutorial state
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);

   const TUTORIAL_SLIDES = [
    {
      title: language === 'ar' ? 'مرحباً بك في منتورا' : 'Welcome to Mentora',
      description: language === 'ar' 
        ? 'شريكك العلاجي المدعوم بالذكاء الاصطناعي، متواجد دائماً للاستماع إليك ومساعدتك على فهم وتفريغ مشاعرك في مساحة آمنة وسرية تماماً.'
        : 'Your AI therapeutic partner, always here to listen, support, and help you process your emotions in a safe, confidential space.',
      icon: (color: string) => (
        <Svg width={100} height={100} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} />
          <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'خارطة طريق مخصصة' : 'Personalized Roadmaps',
      description: language === 'ar'
        ? 'احصل على تمارين أسبوعية مخصصة ومصممة خصيصاً لأهدافك واحتياجاتك النفسية والصحية لبناء روتين علاجي متكامل.'
        : 'Receive tailored weekly exercises and therapeutic challenges designed specifically for your personal goals and mental wellbeing.',
      icon: (color: string) => (
        <Svg width={100} height={100} viewBox="0 0 24 24" fill="none">
          <Path d="M9 20L3 17V4L9 7L15 4L21 7V20L15 17L9 20Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 7V20" stroke={color} strokeWidth={1.5} />
          <Path d="M15 4V17" stroke={color} strokeWidth={1.5} />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'متابعة المزاج والمؤشرات' : 'Track Mood & Insights',
      description: language === 'ar'
        ? 'دون مشاعرك اليومية، واكتب مذكراتك، وراقب تحسن حالتك المزاجية من خلال تقارير وتحليلات ذكية ومفصلة.'
        : 'Track your feelings, write in your safe journal, and observe your emotional progress through intelligent, personalized insights.',
      icon: (color: string) => (
        <Svg width={100} height={100} viewBox="0 0 24 24" fill="none">
          <Path d="M3 3v18h18" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M18.5 7.5L13 13L9.5 9.5L5 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'راحة فورية وتهدئة' : 'Instant Relief & Calming',
      description: language === 'ar'
        ? 'تمارين تنفس موجهة ومؤقتات تركيز وتهدئة سريعة لمساعدتك في التغلب على التوتر والقلق في أي وقت وأي مكان.'
        : 'Access guided breathing sessions and focus timers built to instantly ground you and calm your mind whenever you feel overwhelmed.',
      icon: (color: string) => (
        <Svg width={100} height={100} viewBox="0 0 24 24" fill="none">
          <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke={color} strokeWidth={1.5} />
          <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    }
  ];

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
    const isQuestion9 = currentStep === 9 || question.questionId === 9;
    const isSingleChoice = !isQuestion9;
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
  const isQuestion9 = currentStep === 9 || question.questionId === 9;
  const isSingleChoice = !isQuestion9;

  if (showTutorial) {
    const slide = TUTORIAL_SLIDES[tutorialStep];
    const isLastSlide = tutorialStep === TUTORIAL_SLIDES.length - 1;

    return (
      <SafeAreaView style={s.safeArea}>
        <View style={[s.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
          {/* Top Row with Skip */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>Mentora Tour</Text>
            <TouchableOpacity onPress={() => setShowTutorial(false)}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, textDecorationLine: 'underline' }}>
                {language === 'ar' ? 'تخطي التعريف' : 'Skip Tour'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slide Content Card */}
          <View style={{
            flex: 1,
            backgroundColor: '#F8FAFC',
            borderRadius: 32,
            padding: 24,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#F1F5F9',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.02,
            shadowRadius: 12,
            elevation: 2
          }}>
            <View style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 4
            }}>
              {slide.icon(colors.primary)}
            </View>

            <Text style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#1E293B',
              textAlign: 'center',
              marginBottom: 16
            }}>
              {slide.title}
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 22,
              paddingHorizontal: 12
            }}>
              {slide.description}
            </Text>
          </View>

          {/* Indicators & Actions */}
          <View style={{ marginBottom: 30 }}>
            {/* Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {TUTORIAL_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === tutorialStep ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === tutorialStep ? colors.primary : '#E2E8F0'
                  }}
                />
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4
              }}
              onPress={() => {
                if (isLastSlide) {
                  setShowTutorial(false);
                } else {
                  setTutorialStep(prev => prev + 1);
                }
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                {isLastSlide 
                  ? (language === 'ar' ? 'ابدأ الاستبيان الآن 🚀' : 'Get Started 🚀')
                  : (language === 'ar' ? 'التالي ➔' : 'Next Step ➔')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={[s.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.headerTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[s.welcomeText, isRTL && s.rtlText]}>
              {t.onboarding.welcome}, {userName || 'Friend'}!
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
