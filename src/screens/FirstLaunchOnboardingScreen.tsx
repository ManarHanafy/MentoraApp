import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme';
import { useLanguage } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScreenProps {
  onComplete: () => void;
}

export function FirstLaunchOnboardingScreen({ onComplete }: ScreenProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState(0);
  const { language, isRTL } = useLanguage();

  const SCREENS = [
    {
      title: language === 'ar' ? 'مرحباً بك في منتورا' : 'Welcome to Mentora',
      description: language === 'ar'
        ? 'مساحتك الشخصية لتتبع المشاعر، وبناء عادات صحية، وتحسين صحتك النفسية.'
        : 'Your personal space to track emotions, build healthy habits, and improve your mental well-being.',
      icon: (color: string) => (
        <Svg width={180} height={180} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#111827" stopOpacity={0.9} />
            </LinearGradient>
          </Defs>
          {/* Sun */}
          <Circle cx="50" cy="30" r="12" fill="#FBBF24" opacity={0.85} />
          {/* Mountains/Hills */}
          <Path d="M10 80 Q35 45 60 80" fill="url(#grad1)" opacity={0.6} />
          <Path d="M40 80 Q65 55 90 80" fill="url(#grad1)" opacity={0.9} />
          {/* Small growing sprout */}
          <Path d="M50 55 Q48 45 42 45 Q47 48 50 52 Q53 48 58 45 Q52 45 50 55" fill="#10B981" />
          <Rect x="49" y="55" width="2" height="15" fill="#10B981" rx={1} />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'تتبع حالتك المزاجية' : 'Track Your Mood',
      description: language === 'ar'
        ? 'سجل كيف تشعر كل يوم واكتشف الأنماط في رحلتك النفسية والمشاعرية.'
        : 'Record how you feel each day and discover patterns in your emotional journey.',
      icon: (color: string) => (
        <Svg width={180} height={180} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#2563EB" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#10B981" stopOpacity={0.8} />
            </LinearGradient>
          </Defs>
          {/* Glowing background circles */}
          <Circle cx="50" cy="50" r="40" stroke="url(#grad2)" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.5} />
          {/* Line graph representing emotional tracking */}
          <Path d="M20 70 L38 45 L56 60 L80 30" stroke="url(#grad2)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          {/* Highlighted dots */}
          <Circle cx="20" cy="70" r="4" fill="#6B7280" />
          <Circle cx="38" cy="45" r="4" fill="#10B981" />
          <Circle cx="56" cy="60" r="4" fill="#F59E0B" />
          <Circle cx="80" cy="30" r="6" fill="#2563EB" />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'تحدث مع رفيقك الذكي' : 'Talk with Your AI Companion',
      description: language === 'ar'
        ? 'دردش في أي وقت للحصول على الدعم، التوجيه، واقتراحات مخصصة لصحتك النفسية.'
        : 'Chat anytime for support, guidance, and personalized mental wellness suggestions.',
      icon: (color: string) => (
        <Svg width={180} height={180} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#4F46E5" stopOpacity={0.9} />
            </LinearGradient>
          </Defs>
          {/* Chat Bubble 1 */}
          <Path d="M20 30 H65 C70 30 74 34 74 39 V58 C74 63 70 67 65 67 H45 L32 78 V67 H20 C15 67 11 63 11 58 V39 C11 34 15 30 20 30 Z" fill="url(#grad3)" opacity={0.85} />
          {/* Brain / Sparks Inside */}
          <Circle cx="35" cy="48" r="3" fill="#FFFFFF" />
          <Circle cx="45" cy="48" r="3" fill="#FFFFFF" />
          <Circle cx="55" cy="48" r="3" fill="#FFFFFF" />
          {/* Sparkles of AI intelligence */}
          <Path d="M72 24 L74 20 L76 24 L80 26 L76 28 L74 32 L72 28 L68 26 Z" fill="#FBBF24" />
          <Path d="M84 45 L85 42 L86 45 L89 46 L86 47 L85 50 L84 47 L81 46 Z" fill="#FBBF24" />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'انمو من خلال الممارسة' : 'Grow Through Practice',
      description: language === 'ar'
        ? 'أكمل التمارين الموجهة وأنشطة التدوين المصممة لتعزيز مرونتك النفسية.'
        : 'Complete guided exercises and journaling activities designed to strengthen emotional resilience.',
      icon: (color: string) => (
        <Svg width={180} height={180} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#111827" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#374151" stopOpacity={0.95} />
            </LinearGradient>
          </Defs>
          {/* Journal book */}
          <Rect x="25" y="20" width="46" height="60" rx="6" fill="url(#grad4)" />
          {/* Binding ring elements */}
          <Rect x="20" y="28" width="8" height="4" rx="2" fill="#ACACAC" />
          <Rect x="20" y="42" width="8" height="4" rx="2" fill="#ACACAC" />
          <Rect x="20" y="56" width="8" height="4" rx="2" fill="#ACACAC" />
          <Rect x="20" y="70" width="8" height="4" rx="2" fill="#ACACAC" />
          {/* Internal leaves or text lines */}
          <Rect x="35" y="32" width="26" height="4" rx="1" fill="#FFFFFF" opacity={0.3} />
          <Rect x="35" y="44" width="26" height="4" rx="1" fill="#FFFFFF" opacity={0.3} />
          <Rect x="35" y="56" width="26" height="4" rx="1" fill="#FFFFFF" opacity={0.3} />
          {/* Pencil/Sprout crossing */}
          <Path d="M78 28 L64 74 L58 76 L60 70 L74 24 Z" fill="#10B981" />
        </Svg>
      )
    },
    {
      title: language === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to Begin?',
      description: language === 'ar'
        ? 'ابدأ رحلتك نحو عقلية أكثر صحة وتوازناً وسلاماً.'
        : 'Start your journey toward a healthier and more balanced mindset.',
      icon: (color: string) => (
        <Svg width={180} height={180} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#10B981" stopOpacity={0.9} />
            </LinearGradient>
          </Defs>
          {/* Concentric paths/rings */}
          <Circle cx="50" cy="50" r="35" stroke="url(#grad5)" strokeWidth={1} strokeDasharray="3 3" />
          {/* Winding path to a star */}
          <Path d="M25 80 Q35 55 50 55 T75 25" stroke="url(#grad5)" strokeWidth={4} strokeLinecap="round" fill="none" />
          {/* The glowing destination star */}
          <Path d="M75 14 L77 20 L83 20 L78 24 L80 30 L75 26 L70 30 L72 24 L67 20 L73 20 Z" fill="#FBBF24" />
        </Svg>
      )
    }
  ];

  const current = SCREENS[currentStep];
  const isLast = currentStep === SCREENS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header Row */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.appName}>Mentora</Text>
        <TouchableOpacity style={styles.skipBtn} onPress={onComplete} activeOpacity={0.7}>
          <Text style={styles.skipText}>{language === 'ar' ? 'تخطي' : 'Skip'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View style={styles.slideCard}>
        <View style={styles.iconContainer}>
          {current.icon(colors.primary)}
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </View>

      {/* Footer Area with Dots & Actions */}
      <View style={styles.footer}>
        {/* Progress dots indicator */}
        <View style={[styles.dotsContainer, isRTL && { flexDirection: 'row-reverse' }]}>
          {SCREENS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentStep === i ? styles.activeDot : null
              ]}
            />
          ))}
        </View>

        {/* Buttons Row */}
        <View style={[styles.btnRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backText}>{language === 'ar' ? 'السابق' : 'Back'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>
              {isLast
                ? (language === 'ar' ? 'ابدأ الآن' : 'Get Started')
                : (language === 'ar' ? 'التالي' : 'Next')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  slideCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#111827',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  primaryBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 36,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default FirstLaunchOnboardingScreen;
