import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Modal, Linking, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon, ArrowRightIcon } from '../components/Icons';
import { Exercise, ExerciseService } from '../services/exerciseService';

// Icons
const SearchIcon = () => <Text style={{ color: '#A0AEC0', fontSize: 16 }}>🔍</Text>;
const ClockIcon = () => <Text style={{ color: '#A0AEC0', fontSize: 12 }}>⏱</Text>;
const HeartOutline = () => <Text style={{ color: '#FFFFFF', fontSize: 24 }}>♡</Text>;
const PlayIcon = ({ color = '#161B22' }) => <Text style={{ fontSize: 16, color }}>▶</Text>;

// التصنيفات الحقيقية من قاعدة بياناتك
const CATEGORIES = ['All', 'CBT', 'Breathing', 'Sleep', 'Behavioral', 'Relaxation', 'Social', 'Safety', 'Mindfulness'];

const TIPS = {
  All: {
    title: '🌿 Exercise Benefits',
    points: ['Regular exercise improves mood', 'Reduces daily stress levels', 'Enhances mental clarity & focus']
  },
  CBT: {
    title: '🧠 CBT Techniques',
    points: ['Identify negative thought patterns', 'Challenge your core beliefs', 'Practice cognitive restructuring']
  },
  Breathing: {
    title: '💨 Breathing Tips',
    points: ['Focus on slow, deep inhales', 'Exhale longer than you inhale', 'Relax your shoulders and jaw']
  },
  Sleep: {
    title: '😴 Sleep Hygiene',
    points: ['Maintain a consistent schedule', 'Limit screen time before bed', 'Create a cool, dark environment']
  },
  Behavioral: {
    title: '🎯 Activity Focus',
    points: ['Set small, achievable goals', 'Schedule rewarding activities', 'Track your daily energy levels']
  },
  Relaxation: {
    title: '🌊 Deep Relaxation',
    points: ['Try progressive muscle relaxation', 'Visualize a peaceful place', 'Let go of physical tension']
  },
  Social: {
    title: '🤝 Connection',
    points: ['Reach out to a trusted friend', 'Share your feelings openly', 'Engage in community activities']
  },
  Safety: {
    title: '🛡️ Safety Planning',
    points: ['Identify your safe triggers', 'Keep support contacts ready', 'Follow your personalized plan']
  },
  Mindfulness: {
    title: '🧘 Mindfulness Guide',
    points: ['Stay present in the moment', 'Observe without judgment', 'Focus on your bodily sensations']
  }
};

export function ExercisesScreen({ route }: any): React.ReactElement {
  const navigation = useNavigation<any>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [suggestedExercise, setSuggestedExercise] = useState<Exercise | null>(null);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [isAiSession, setIsAiSession] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [route?.params])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [countdown, suggestedExercise]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' && countdown !== null && countdown > 0 && suggestedExercise) {
      // Send notification when leaving with an active timer
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Session Paused 🧘",
          body: `Don't forget to finish your ${suggestedExercise.name}. You have ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')} left!`,
        },
        trigger: null, // send immediately
      });
    }
  };

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0 && !isPaused) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsPaused(false);
      setSessionFinished(true); // انتهى المؤقت
    }
    return () => clearTimeout(timer);
  }, [countdown, isPaused]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [all, completed, suggested] = await Promise.all([
        ExerciseService.getAllExercises(),
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);

      // Library only shows your completed/saved progress!
      const safeCompleted = completed || [];
      const uniqueCompleted = Array.from(new Map(safeCompleted.map(item => [item.id, item])).values());
      setExercises(uniqueCompleted);
      setHistory(uniqueCompleted);

      // Show suggested exercise if requested (we take the first pending exercise from the queue)
      const pendingQueue = suggested || [];

      if (route?.params?.openSuggested === true && !showHistoryOnly) {
        let ex = route.params.exerciseToStart;
        if (!ex && pendingQueue.length > 0) ex = pendingQueue[0];
        
        if (ex && !suggestedExercise) {
          // Enrich with library details if missing or generic
          if (ex.exerciseCode) {
            const details = ExerciseService.getExerciseDetailsByCode(ex.exerciseCode);
            ex = { ...ex, ...details };
          }
          setSuggestedExercise(ex);
          setIsAiSession(true);
          if (route?.params?.exerciseToStart) {
             navigation.setParams({ exerciseToStart: null });
          }
        }
      } else if (!showHistoryOnly && pendingQueue.length > 0 && !suggestedExercise) {
        let ex = pendingQueue[0];
        if (ex.exerciseCode) {
           const details = ExerciseService.getExerciseDetailsByCode(ex.exerciseCode);
           ex = { ...ex, ...details };
        }
        setSuggestedExercise(ex);
        setIsAiSession(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onExerciseDone = async () => {
    if (suggestedExercise) {
      const currentEx = suggestedExercise;
      const queueId = (currentEx as any).queueId || currentEx.id;

      // 1. Find matching instance if we don't have a queueId (notification case)
      let finalQueueId = queueId;
      if (!(currentEx as any).queueId) {
        const allSuggested = await ExerciseService.getSuggestedExercises();
        const inQueue = (allSuggested || []).find(ex =>
          ex.id == currentEx.id ||
          (ex.exerciseCode && ex.exerciseCode == currentEx.exerciseCode)
        );
        if (inQueue && inQueue.queueId) {
          finalQueueId = inQueue.queueId;
        }
      }

      // 2. Save progress
      await ExerciseService.saveCompletedExercise(currentEx);
      await ExerciseService.removeSuggestedExercise(finalQueueId);

      // 3. Reset UI state
      navigation.setParams({ exerciseToStart: null });
      setCountdown(null);
      setSessionFinished(false);

      // 4. Reload all data
      const [all, completed, suggested] = await Promise.all([
        ExerciseService.getAllExercises(),
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);

      const safeSuggested = suggested || [];
      const safeCompleted = completed || [];
      const uniqueCompleted = Array.from(new Map(safeCompleted.map(item => [item.id, item])).values());

      setExercises(all || uniqueCompleted);
      setHistory(uniqueCompleted);

      // 5. Flow transition
      if (safeSuggested.length > 0 && isAiSession) {
        setSuggestedExercise(safeSuggested[0]);
      } else {
        setSuggestedExercise(null);
        setIsAiSession(false);
        setShowHistoryOnly(true);
      }
    }
  };

  const onRepeat = () => {
    setSessionFinished(false);
    if (suggestedExercise) {
      setCountdown(suggestedExercise.durationMinutes * 60);
    }
  };

  const openLinkIfAny = (text: string) => {
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/g);
    if (urlMatch && urlMatch.length > 0) {
      Linking.openURL(urlMatch[0]).catch(err => console.error("Couldn't load page", err));
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const exType = (ex.exerciseType || '').toLowerCase();
    const exName = (ex.name || '').toLowerCase();
    const tab = activeTab.toLowerCase();

    if (tab === 'all') return (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));

    // Flexible matching for categories
    const isMatched = exType.includes(tab) ||
      exName.includes(tab) ||
      (tab === 'cbt' && (exType.includes('cognitive') || exName.includes('cbt')));

    return isMatched && (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));
  });

  const tipData = TIPS[activeTab as keyof typeof TIPS] || TIPS.All;

  // VIEW 1: TASK DETAIL (التمرين المقترح)
  if (suggestedExercise && !showHistoryOnly) {
    const ex = suggestedExercise;
    // Show timer for any exercise that has a duration defined
    const hasTimer = (ex.durationMinutes || 0) > 0;

    // Generate a pseudo-random rating based on exercise ID
    const getRating = (id: any) => {
      const seed = (typeof id === 'string' ? id.length : id) || 5;
      return (4.5 + (seed % 5) / 10).toFixed(1);
    };

    return (
      <View style={s.container}>
        <View style={s.darkHeader}>
          <SafeAreaView>
            <View style={s.headerTop}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <ArrowLeftIcon size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={s.headerActions}><TouchableOpacity><HeartOutline /></TouchableOpacity></View>
            </View>
            <View style={s.headerContent}>
              <Text style={s.headerTitle}>{ex.name}</Text>
              <Text style={s.headerSubTitle}>{ex.durationMinutes} min . {ex.exerciseType}</Text>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.floatingCard}>
            <View style={s.cardTopRow}>
              <Text style={{ fontSize: 32 }}>🧘‍♂️</Text>
              <View style={s.cardStats}>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>Duration</Text>
                  <Text style={s.statValue}>{ex.durationMinutes || 5} min</Text>
                </View>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>Rating</Text>
                  <View style={s.ratingRow}>
                    <StarIcon size={12} color="#F59E0B" /><Text style={[s.statValue, { color: '#F59E0B', marginLeft: 4 }]}>{getRating(ex.id)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* منطق الأزرار يظهر فقط إذا كانت التمرينة قادمة من الـ AI */}
            {isAiSession ? (
              sessionFinished ? (
                <View style={s.actionRow}>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, backgroundColor: colors.success }]} onPress={onExerciseDone}>
                    <Text style={[s.startNowText, { color: colors.white }]}>Done ✨</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, marginLeft: 10, backgroundColor: colors.white }]} onPress={onRepeat}>
                    <Text style={s.startNowText}>Repeat 🔄</Text>
                  </TouchableOpacity>
                </View>
              ) : countdown !== null && countdown > 0 ? (
                <View style={s.timerContainer}>
                  <Text style={s.timerCountdown}>
                    {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                  </Text>
                  <View style={s.timerControls}>
                    <TouchableOpacity 
                      style={[s.timerControlBtn, { backgroundColor: isPaused ? colors.success : '#F59E0B' }]} 
                      onPress={() => setIsPaused(!isPaused)}
                    >
                      <Text style={s.timerControlText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[s.timerControlBtn, { backgroundColor: '#EF4444' }]} 
                      onPress={() => { setCountdown(null); setIsPaused(false); }}
                    >
                      <Text style={s.timerControlText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : hasTimer ? (
                <TouchableOpacity style={s.startNowBtn} onPress={() => setCountdown(ex.durationMinutes * 60)}>
                  <PlayIcon /><Text style={s.startNowText}>Start Timer ({ex.durationMinutes} min)</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.startNowBtn, { backgroundColor: colors.success }]} onPress={onExerciseDone}>
                  <Text style={[s.startNowText, { color: colors.white }]}>Done ✅</Text>
                </TouchableOpacity>
              )
            ) : (
              <View style={{ height: 20 }} />
            )}
          </View>

          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.overviewBox}>
            <Text style={s.overviewText}>
              {ex.description || 'A personalized wellness exercise to help you feel better.'}
            </Text>
          </View>

          {ex.instructions ? (
            <>
              <Text style={s.sectionTitle}>How to Do It</Text>


              {ex.instructions.split(/(?:\n|->|\. )/).filter(s => s.trim().length > 3).map((step, idx) => {
                const isLink = step.includes('http');
                const cleanStep = step.trim().replace(/^\d+[\.\-]\s*/, '');
                return (
                  <TouchableOpacity key={idx} style={s.stepBox} activeOpacity={isLink ? 0.7 : 1} onPress={() => isLink ? openLinkIfAny(cleanStep) : null}>
                    <View style={s.stepNumberCircle}><Text style={s.stepNumberText}>{idx + 1}</Text></View>
                    <View style={s.stepContent}>
                      <Text style={[s.stepDesc, isLink && { color: colors.primary, textDecorationLine: 'underline' }]}>
                        {cleanStep}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : null}

          <TouchableOpacity style={s.seeAllBtn} onPress={() => setShowHistoryOnly(true)}>
            <Text style={s.seeAllText}>Skip to All Exercises</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal visible={countdown !== null} transparent animationType="fade">
          <View style={s.countdownOverlay}>
            <Text style={s.countdownText}>{Math.floor(countdown! / 60)}:{String(countdown! % 60).padStart(2, '0')}</Text>
            <Text style={s.countdownSubText}>{isPaused ? 'Paused' : 'Focus and breathe...'}</Text>
            {isPaused ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[s.cancelBtn, { backgroundColor: colors.success }]} onPress={() => setIsPaused(false)}><Text style={s.cancelText}>Resume</Text></TouchableOpacity>
                <TouchableOpacity style={[s.cancelBtn, { backgroundColor: '#f44' }]} onPress={() => { setCountdown(null); setIsPaused(false); }}><Text style={s.cancelText}>Close</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.cancelBtn} onPress={() => setIsPaused(true)}><Text style={s.cancelText}>Pause / Stop</Text></TouchableOpacity>
            )}
          </View>
        </Modal>
      </View>
    );
  }

  // VIEW 2: FULL LIST (قائمة التمارين كاملة بعد الانتهاء منها)
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.listHeaderRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><ArrowLeftIcon size={24} color={colors.textPrimary} /></TouchableOpacity>
        <View style={s.searchContainer}><SearchIcon /><TextInput style={s.searchInput} placeholder="Search exercises..." value={search} onChangeText={setSearch} /></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
        <View style={s.tabsContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[s.tabPill, activeTab === cat && s.tabPillActive]} onPress={() => setActiveTab(cat)}>
              <Text style={[s.tabText, activeTab === cat && s.tabTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Dynamic Wellness Card with Conditional Styles */}
      <View style={[
        s.featuredCard,
        activeTab === 'All' ? s.featuredCardLarge : s.featuredCardSmall
      ]}>
        <View style={s.featuredHeader}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>{tipData.title.split(' ')[0]}</Text>
          <Text style={s.featuredHeaderText}>{activeTab === 'All' ? 'Wellness Tip' : `${activeTab} Guide`}</Text>
        </View>
        <Text style={s.featuredTitle}>{tipData.title.split(' ').slice(1).join(' ')}</Text>
        <View style={{ marginTop: 8 }}>
          {tipData.points.map((pt, idx) => (
            <Text key={idx} style={activeTab === 'All' ? s.featuredDesc : s.featuredDescSmall}>• {pt}</Text>
          ))}
        </View>
      </View>

      {/* Thin line separator for specific categories */}
      {activeTab !== 'All' && <View style={s.separatorLine} />}

      <ScrollView style={s.listContainer}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
          filteredExercises.length === 0 ? <Text style={s.emptyHint}>No exercises.</Text> :
            filteredExercises.map((ex, idx) => (
              <TouchableOpacity
                key={`${ex.id}-${idx}`}
                style={s.exerciseCard}
                onPress={() => {
                  setSuggestedExercise(ex);
                  setIsAiSession(true);
                  setShowHistoryOnly(false);
                  setSessionFinished(false);
                  setCountdown(null);
                }}
              >
                <View style={s.cardLeft}><View style={s.iconBox}><Text style={{ fontSize: 24 }}>🧘‍♂️</Text></View>
                  <View style={s.cardBody}><Text style={s.cardTitle}>{ex.name}</Text><Text style={s.cardDesc} numberOfLines={1}>{ex.description}</Text>
                    <View style={s.metaRow}><ClockIcon /><Text style={s.metaText}>{ex.durationMinutes}m</Text>
                      {history.some(h => h.id === ex.id) && <View style={s.doneTag}><Text style={s.doneTagText}>COMPLETED</Text></View>}
                      <View style={s.typeTag}><Text style={s.typeTagText}>{ex.exerciseType}</Text></View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  darkHeader: { backgroundColor: '#161B22', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingBottom: 60, paddingTop: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  headerContent: { paddingHorizontal: 32, marginTop: 16 },
  headerTitle: { ...typography.h3, color: '#FFFFFF', fontWeight: '700' },
  headerSubTitle: { ...typography.caption, color: '#94A3B8' },
  scrollContent: { flex: 1, paddingHorizontal: 24, marginTop: -40 },
  floatingCard: { backgroundColor: '#2D3748', borderRadius: 16, padding: 20, marginBottom: 32, elevation: 8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardStats: { flexDirection: 'row' },
  statCol: { marginLeft: 24 },
  statLabel: { ...typography.caption, color: '#94A3B8' },
  statValue: { ...typography.bodySmall, color: '#FFFFFF', fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timerContainer: { alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, padding: 16 },
  timerCountdown: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  timerControls: { flexDirection: 'row', gap: 12 },
  timerControlBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 12, minWidth: 100, alignItems: 'center' },
  timerControlText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  startNowBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, minWidth: 120 },
  startNowText: { ...typography.body, color: '#161B22', fontWeight: '700', marginLeft: 8 },
  sectionTitle: { ...typography.h4, color: '#1E293B', fontWeight: '700', marginBottom: 16 },
  overviewBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 32, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  overviewText: { ...typography.bodySmall, color: '#64748B', lineHeight: 22 },
  stepBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row' },
  stepNumberCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stepNumberText: { ...typography.bodySmall, fontWeight: '700', color: '#475569' },
  stepContent: { flex: 1 },
  stepTitle: { ...typography.body, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  stepDesc: { ...typography.bodySmall, color: '#64748B', lineHeight: 20 },
  listHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, paddingTop: 22 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, ...typography.bodySmall, color: colors.textPrimary },
  tabsScroll: { maxHeight: 50, marginBottom: 20 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center' },
  tabPill: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 8 },
  tabPillActive: { backgroundColor: '#111827' },
  tabText: { ...typography.bodySmall, fontWeight: '600', color: '#475569' },
  tabTextActive: { color: colors.white },
  featuredCard: { marginHorizontal: 20, borderRadius: 24, elevation: 4 },
  featuredCardLarge: { backgroundColor: '#111827', padding: 24, marginBottom: 24 },
  featuredCardSmall: { backgroundColor: '#374151', paddingHorizontal: 24, paddingVertical: 14, marginBottom: 16 },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featuredHeaderText: { ...typography.caption, color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  featuredTitle: { ...typography.h4, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 12 },
  featuredDesc: { ...typography.body, color: '#D1D5DB', marginBottom: 8, lineHeight: 26 },
  featuredDescSmall: { ...typography.bodySmall, color: '#D1D5DB', marginBottom: 6, lineHeight: 22 },
  separatorLine: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 40, marginBottom: 24, opacity: 0.5 },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#F8FAFC' },
  cardLeft: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary },
  cardDesc: { ...typography.caption, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { ...typography.caption, color: colors.textSecondary, marginLeft: 4, marginRight: 12 },
  doneTag: { backgroundColor: colors.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  doneTagText: { fontSize: 8, color: colors.success, fontWeight: 'bold' },
  typeTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeTagText: { fontSize: 8, color: colors.textSecondary, fontWeight: 'bold' },
  seeAllBtn: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, alignItems: 'center', marginTop: 8 },
  seeAllText: { color: colors.primary, fontWeight: 'bold' },
  countdownOverlay: { flex: 1, backgroundColor: 'rgba(22, 27, 34, 0.95)', justifyContent: 'center', alignItems: 'center' },
  countdownText: { fontSize: 80, fontWeight: '800', color: '#FFFFFF' },
  countdownSubText: { ...typography.h4, color: '#94A3B8' },
  cancelBtn: { padding: 12, backgroundColor: '#334155', borderRadius: 24, marginTop: 40 },
  cancelText: { color: '#FFFFFF' },
  emptyHint: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  backBtn: { padding: 8 },
  headerActions: { padding: 8 }
});

export default ExercisesScreen;
