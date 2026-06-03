import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon } from '../components/Icons';
import { useLanguage } from '../context/LanguageContext';
import { ExerciseService } from '../services/exerciseService';

const HeartOutline = ({ color = '#FFFFFF' }) => (
  <Text style={{ color, fontSize: 24 }}>♡</Text>
);

const PlayIcon = () => (
  <Text style={{ fontSize: 16 }}>▶</Text>
);

export function BreathingExerciseScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { language, isRTL } = useLanguage();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (countdown !== null && !isPaused) {
      const cycle = Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.4,
          duration: 4000,
          useNativeDriver: true
        }),
        Animated.delay(2000),
        Animated.timing(breathAnim, {
          toValue: 1.0,
          duration: 4000,
          useNativeDriver: true
        }),
        Animated.delay(2000)
      ]);
      Animated.loop(cycle).start();
    } else {
      breathAnim.stopAnimation();
    }
  }, [countdown, isPaused]);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0 && !isPaused) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setSessionFinished(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, isPaused]);

  return (
    <View style={s.container}>
      {/* Dark Header Background */}
      <View style={s.darkHeader}>
        <SafeAreaView>
          <View style={s.headerTop}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
               <ArrowLeftIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={s.headerActions}>
               <TouchableOpacity>
                  <HeartOutline />
               </TouchableOpacity>
            </View>
          </View>
          <View style={s.headerContent}>
             <Text style={s.headerTitle}>Mindful Breathing for Beginners</Text>
             <Text style={s.headerSubTitle}>5 min . breathing</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Floating Play Card */}
        <View style={s.floatingCard}>
           <View style={s.cardTopRow}>
              <Text style={{ fontSize: 32 }}>😮‍💨</Text>
              <View style={s.cardStats}>
                 <View style={s.statCol}>
                    <Text style={s.statLabel}>Duration</Text>
                    <Text style={s.statValue}>5 min</Text>
                 </View>
                 <View style={s.statCol}>
                    <Text style={s.statLabel}>Rating</Text>
                    <View style={s.ratingRow}>
                       <StarIcon size={12} color="#F59E0B" />
                       <Text style={[s.statValue, { color: '#F59E0B', marginLeft: 4 }]}>4.8</Text>
                    </View>
                 </View>
              </View>
           </View>
           
           {sessionFinished ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  style={[s.startNowBtn, { flex: 1, backgroundColor: colors.success }]} 
                  onPress={async () => {
                    setSessionFinished(false);
                    try {
                      await ExerciseService.saveCompletedExercise({
                        id: 'mindful-breathing-beginners',
                        description: 'A scientifically-proven breathing technique designed to calm your nervous system.',
                        name: 'Mindful Breathing for Beginners',
                        exerciseType: 'Breathing',
                        durationMinutes: 5,
                        difficulty: 'Easy',
                        instructions: 'Get Comfortable\nBreathe In (4 counts)',
                        isActive: true
                      });
                    } catch(e) {
                      console.log(e);
                    }
                    navigation.navigate('Exercises');
                  }}
                >
                  <Text style={[s.startNowText, { color: colors.white, marginLeft: 0 }]}>Done ✨</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[s.startNowBtn, { flex: 1, marginLeft: 10, backgroundColor: colors.white }]} 
                  onPress={() => {
                    setSessionFinished(false);
                    setCountdown(300);
                  }}
                >
                  <Text style={[s.startNowText, { color: colors.primary, marginLeft: 0 }]}>Repeat 🔄</Text>
                </TouchableOpacity>
              </View>
           ) : countdown !== null && countdown > 0 ? (
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>
                  {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                </Text>
              </View>
           ) : (
              <TouchableOpacity 
                style={s.startNowBtn} 
                onPress={() => {
                  setCountdown(300);
                  setSessionFinished(false);
                  setIsPaused(false);
                }}
              >
                <PlayIcon />
                <Text style={s.startNowText}>{language === 'ar' ? 'ابدأ الآن' : 'Start Now'}</Text>
              </TouchableOpacity>
           )}
        </View>

        {/* Overview section */}
        <Text style={s.sectionTitle}>{language === 'ar' ? 'نظرة عامة' : 'Overview'}</Text>
        <View style={s.overviewBox}>
           <Text style={s.overviewText}>
             A scientifically-proven breathing technique designed to calm your nervous system and reduce stress instantly. Used by athletes, military personnel, and wellness practitioners worldwide.
           </Text>
        </View>

        {/* How to Do It section */}
        <Text style={s.sectionTitle}>{language === 'ar' ? 'طريقة أداء التمرين' : 'How to Do It'}</Text>

        {[
          { title: language === 'ar' ? 'اتخذ وضعاً مريحاً' : 'Get Comfortable', desc: language === 'ar' ? 'اجلس أو استلقِ في وضع مريح. ضع يدًا على صدرك والأخرى على بطنك.' : 'Sit or lie down in a comfortable position. Place one hand on your chest and the other on your belly.', duration: language === 'ar' ? '30 ث' : '30 sec' },
          { title: language === 'ar' ? 'شهيق (4 عدات)' : 'Breathe In (4 counts)', desc: language === 'ar' ? 'استنشق الهواء ببطء من خلال أنفك لمدة 4 ثوانٍ. اشعر بارتفاع بطنك.' : 'Slowly inhale through your nose for 4 seconds. Feel your belly rise as you fill your lungs with air.', duration: language === 'ar' ? '4 ث' : '4 sec' },
          { title: language === 'ar' ? 'احبس النفس (2 عدات)' : 'Hold (2 counts)', desc: language === 'ar' ? 'احبس نفسك برفق لمدة ثانيتين. ابقَ هادئاً ومسترخياً.' : 'Hold your breath gently for 2 seconds. Stay relaxed and still — no tension.', duration: language === 'ar' ? '2 ث' : '2 sec' },
          { title: language === 'ar' ? 'زفير بطيء (4 عدات)' : 'Exhale Slowly (4 counts)', desc: language === 'ar' ? 'أخرج الهواء ببطء من خلال فمك لمدة 4 ثوانٍ. اشعر بانخفاض بطنك وزوال التوتر.' : 'Breathe out slowly through your mouth for 4 seconds. Feel your belly lower and release all tension.', duration: language === 'ar' ? '4 ث' : '4 sec' },
          { title: language === 'ar' ? 'راحة وتكرار' : 'Rest & Repeat', desc: language === 'ar' ? 'خذ راحة لثانيتين ثم كرر الدورة. كل دورة تهدئ جهازك العصبي أكثر.' : 'Rest for 2 seconds and repeat the cycle. Each round calms your nervous system further.', duration: language === 'ar' ? '2 ث' : '2 sec' },
        ].map((step, idx) => (
          <View key={idx} style={s.stepBox}>
            <View style={s.stepNumberCircle}>
              <Text style={s.stepNumberText}>{idx + 1}</Text>
            </View>
            <View style={s.stepContent}>
              <View style={s.stepTitleRow}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepDuration}>⏱ {step.duration}</Text>
              </View>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Interactive Breathing Session Timer Modal */}
      <Modal visible={countdown !== null} transparent={false} animationType="slide">
         {(() => {
            const totalDurationSeconds = 300;
            const elapsedSeconds = totalDurationSeconds - (countdown || 0);
            const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

            const accentColor = '#0EA5E9'; // sky blue
            const lightBg = '#F0F9FF';

            const breathSec = elapsedSeconds % 12;
            let breathStateText = language === 'ar' ? 'شهيق بلطف...' : 'Inhale gently...';
            let breathStateSub = language === 'ar' ? 'املأ رئتيك بالهواء الصافي' : 'Fill your lungs with fresh air';
            if (breathSec >= 4 && breathSec < 6) {
              breathStateText = language === 'ar' ? 'احبس نفسك...' : 'Hold your breath...';
              breathStateSub = language === 'ar' ? 'ابقَ هادئاً ومرتاحاً' : 'Remain calm and still';
            } else if (breathSec >= 6 && breathSec < 10) {
              breathStateText = language === 'ar' ? 'زفير بطيء...' : 'Exhale slowly...';
              breathStateSub = language === 'ar' ? 'أطلق كل التوتر والضغوطات' : 'Let go of all tension and worry';
            } else if (breathSec >= 10) {
              breathStateText = language === 'ar' ? 'احبس نفسك...' : 'Hold your breath...';
              breathStateSub = language === 'ar' ? 'تهيأ للدورة التالية' : 'Prepare for the next cycle';
            }

            return (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                {/* Header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: accentColor, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {language === 'ar' ? 'جلسة تنفس موجهة' : 'Breathing Session'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: '#F1F5F9'
                    }}
                    onPress={() => {
                      setCountdown(null);
                      setIsPaused(false);
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
                  {/* Title */}
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 12 }}>
                    Mindful Breathing for Beginners
                  </Text>

                  {/* Active Exercise experience container */}
                  <View style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    alignItems: 'center',
                    marginBottom: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1
                  }}>
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                      <Animated.View style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: lightBg,
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: [{ scale: breathAnim }],
                        borderWidth: 2,
                        borderColor: accentColor,
                        marginBottom: 24,
                        shadowColor: accentColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                      }}>
                        <View style={{
                          width: 90,
                          height: 90,
                          borderRadius: 45,
                          backgroundColor: accentColor,
                          opacity: 0.8,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Text style={{ fontSize: 44 }}>😮‍💨</Text>
                        </View>
                      </Animated.View>

                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 }}>
                        {breathStateText}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 12 }}>
                        {breathStateSub}
                      </Text>
                    </View>
                  </View>

                  {/* Exercise Instructions Step List — all steps visible, active step highlighted */}
                  {(() => {
                    const STEPS_EN = [
                      { title: 'Get Comfortable', desc: 'Sit or lie down in a comfortable position. Place one hand on your chest and the other on your belly.', duration: '30 sec' },
                      { title: 'Breathe In (4 counts)', desc: 'Slowly inhale through your nose for 4 seconds. Feel your belly rise as you fill your lungs with air.', duration: '4 sec' },
                      { title: 'Hold (2 counts)', desc: 'Hold your breath gently for 2 seconds. Stay relaxed and still — no tension.', duration: '2 sec' },
                      { title: 'Exhale Slowly (4 counts)', desc: 'Breathe out slowly through your mouth for 4 seconds. Feel your belly lower and release all tension.', duration: '4 sec' },
                      { title: 'Rest & Repeat', desc: 'Rest for 2 seconds and repeat the cycle. Each round calms your nervous system further.', duration: '2 sec' },
                    ];
                    const STEPS_AR = [
                      { title: 'اتخذ وضعاً مريحاً', desc: 'اجلس أو استلقِ في وضع مريح. ضع يدًا على صدرك والأخرى على بطنك.', duration: '30 ث' },
                      { title: 'شهيق (4 عدات)', desc: 'استنشق الهواء ببطء من خلال أنفك لمدة 4 ثوانٍ. اشعر بارتفاع بطنك.', duration: '4 ث' },
                      { title: 'احبس النفس (2 عدات)', desc: 'احبس نفسك برفق لمدة ثانيتين. ابقَ هادئاً ومسترخياً.', duration: '2 ث' },
                      { title: 'زفير بطيء (4 عدات)', desc: 'أخرج الهواء ببطء من خلال فمك لمدة 4 ثوانٍ. أحسس ببطنك ينخفض ويزول التوتر.', duration: '4 ث' },
                      { title: 'راحة وتكرار', desc: 'خذ راحة لثانيتين ثم كرر الدورة. كل دورة تهدئ جهازك العصبي أكثر.', duration: '2 ث' },
                    ];
                    const steps = language === 'ar' ? STEPS_AR : STEPS_EN;
                    // Each step is active for 60 seconds (300s total / 5 steps)
                    const activeStepIdx = Math.min(Math.floor(elapsedSeconds / 60), steps.length - 1);

                    return (
                      <View style={{ width: '100%', marginBottom: 24 }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 12, width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                          {language === 'ar' ? `الخطوة ${activeStepIdx + 1} من ${steps.length}` : `Step ${activeStepIdx + 1} of ${steps.length}`}
                        </Text>
                        {steps.map((step, idx) => {
                          const isActive = idx === activeStepIdx;
                          const isDone = idx < activeStepIdx;
                          return (
                            <View key={idx} style={{
                              flexDirection: isRTL ? 'row-reverse' : 'row',
                              backgroundColor: isActive ? lightBg : '#FFFFFF',
                              borderRadius: 12,
                              padding: 14,
                              marginBottom: 8,
                              borderWidth: isActive ? 1.5 : 1,
                              borderColor: isActive ? accentColor : '#E2E8F0',
                              alignItems: 'flex-start',
                              gap: 12,
                              opacity: isDone ? 0.45 : 1,
                            }}>
                              <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: isActive ? accentColor : (isDone ? '#D1FAE5' : '#F1F5F9'),
                                borderWidth: isActive ? 0 : 1,
                                borderColor: isDone ? '#10B981' : '#CBD5E1',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 2,
                              }}>
                                {isDone
                                  ? <Text style={{ fontSize: 13 }}>✓</Text>
                                  : <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? '#FFFFFF' : '#94A3B8' }}>{idx + 1}</Text>
                                }
                              </View>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <Text style={{ fontSize: 13, fontWeight: isActive ? '800' : '600', color: isActive ? '#1E293B' : '#64748B', textAlign: isRTL ? 'right' : 'left' }}>
                                    {step.title}
                                  </Text>
                                  <Text style={{ fontSize: 11, color: isActive ? accentColor : '#94A3B8', fontWeight: '600' }}>
                                    ⏱ {step.duration}
                                  </Text>
                                </View>
                                {isActive && (
                                  <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18, textAlign: isRTL ? 'right' : 'left' }}>
                                    {step.desc}
                                  </Text>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}

                  {/* Giant Integrated Timer & Progress bar console */}
                  <View style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    alignItems: 'center',
                    marginBottom: 30
                  }}>
                    {/* Time Counter */}
                    <Text style={{ fontSize: 36, fontWeight: '800', color: '#1E293B', letterSpacing: 2, marginBottom: 8 }}>
                      {Math.floor(countdown! / 60).toString().padStart(2, '0')}:{(countdown! % 60).toString().padStart(2, '0')}
                    </Text>

                    {/* Progress Percentage Indicator & Bar */}
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                      <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '700' }}>
                        {language === 'ar' ? 'مؤشر التقدم' : 'Progress'}
                      </Text>
                      <Text style={{ fontSize: 11, color: accentColor, fontWeight: '700' }}>
                        {progressPercent}%
                      </Text>
                    </View>
                    <View style={{
                      width: '100%',
                      height: 8,
                      backgroundColor: '#E2E8F0',
                      borderRadius: 4,
                      overflow: 'hidden',
                      marginBottom: 16
                    }}>
                      <View style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: accentColor,
                        borderRadius: 4
                      }} />
                    </View>

                    {/* Control Buttons (Pause/Resume & Cancel) */}
                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: isPaused ? '#10B981' : '#F59E0B',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onPress={() => setIsPaused(!isPaused)}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                          {isPaused 
                            ? (language === 'ar' ? 'استئناف' : 'Resume') 
                            : (language === 'ar' ? 'إيقاف مؤقت' : 'Pause')
                          }
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: '#EF4444',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onPress={() => {
                          setCountdown(null);
                          setIsPaused(false);
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                          {language === 'ar' ? 'إنهاء الجلسة' : 'End Session'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </SafeAreaView>
            );
         })()}
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  darkHeader: {
    backgroundColor: '#161B22',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 60, 
    paddingTop: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  headerActions: { padding: 8 },
  headerContent: { paddingHorizontal: 32, marginTop: 16, paddingRight: 60 },
  headerTitle: { ...typography.h3, color: '#FFFFFF', fontWeight: '700', marginBottom: 8, lineHeight: 32 },
  headerSubTitle: { ...typography.caption, color: '#94A3B8' },
  
  scrollContent: { flex: 1, paddingHorizontal: 24, marginTop: -40 },
  floatingCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardStats: { flexDirection: 'row' },
  statCol: { marginLeft: 24, alignItems: 'flex-start' },
  statLabel: { ...typography.caption, color: '#94A3B8', marginBottom: 4 },
  statValue: { ...typography.bodySmall, color: '#FFFFFF', fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  startNowBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  startNowText: { ...typography.body, color: '#161B22', fontWeight: '700', marginLeft: 8 },
  
  sectionTitle: { ...typography.h4, color: '#1E293B', fontWeight: '700', marginBottom: 16 },
  overviewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  overviewText: { ...typography.bodySmall, color: '#64748B', lineHeight: 22 },

  stepBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: { ...typography.bodySmall, fontWeight: '700', color: '#475569' },
  stepContent: { flex: 1 },
  stepTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepTitle: { ...typography.body, fontWeight: '700', color: '#1E293B' },
  stepDuration: { ...typography.caption, color: '#94A3B8' },
  stepDesc: { ...typography.bodySmall, color: '#64748B', lineHeight: 20 },
});

export default BreathingExerciseScreen;
