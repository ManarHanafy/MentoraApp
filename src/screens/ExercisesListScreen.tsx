import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon } from '../components/Icons';
import { Exercise, ExerciseService } from '../services/exerciseService';
import { NotificationService } from '../services/notificationService';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Clock, 
  Heart, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  Brain, 
  Wind, 
  Moon, 
  Target, 
  Waves, 
  Users, 
  Shield, 
  Activity, 
  Leaf 
} from 'lucide-react-native';

// Dynamic Category Icon helper
const CategoryIcon = ({ type, size = 20, color = colors.primary }: { type: string; size?: number; color?: string }) => {
  switch (type) {
    case 'CBT': return <Brain size={size} color={color} />;
    case 'Breathing': return <Wind size={size} color={color} />;
    case 'Sleep': return <Moon size={size} color={color} />;
    case 'Behavioral': return <Target size={size} color={color} />;
    case 'Relaxation': return <Waves size={size} color={color} />;
    case 'Social': return <Users size={size} color={color} />;
    case 'Safety': return <Shield size={size} color={color} />;
    case 'Mindfulness': return <Activity size={size} color={color} />;
    default: return <Leaf size={size} color={color} />;
  }
};

const CATEGORIES = ['All', 'CBT', 'Breathing', 'Sleep', 'Behavioral', 'Relaxation', 'Social', 'Safety', 'Mindfulness'];

const TIPS = {
  All: { title: 'Wellness Journey', points: ['Stay consistent', 'Take deep breaths', 'Be kind to yourself'] },
  CBT: { title: 'Cognitive Balance', points: ['Observe your thoughts', 'Challenge negative beliefs', 'Keep a thought record'] },
  Breathing: { title: 'Breathing Power', points: ['Calm your nervous system', 'Improve focus', 'Lower stress instantly'] },
  Sleep: { title: 'Better Sleep', points: ['Keep a steady schedule', 'No screens before bed', 'Peaceful environment'] },
  Behavioral: { title: 'Behavioral Activation', points: ['Start with small steps', 'Track your activities', 'Celebrate small wins'] },
  Relaxation: { title: 'Find Your Calm', points: ['Release muscle tension', 'Quiet your mind', 'Enjoy the peace'] },
  Social: { title: 'Connection', points: ['Reach out to someone', 'Share your thoughts', 'Build social bonds'] },
  Safety: { title: 'Safety First', points: ['Create a safe space', 'Identify support contacts', 'Follow your plan'] },
  Mindfulness: { title: 'Current Moment', points: ['Focus on now', 'Non-judgmental awareness', 'Gentle observation'] }
};

export function ExercisesListScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [suggestedExercise, setSuggestedExercise] = useState<Exercise | null>(null);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 200);
  }, []);

  useEffect(() => {
    // If a specific exercise was passed from the notification/home queue, open it directly
    const exerciseToStart: Exercise | undefined = route?.params?.exerciseToStart;
    if (exerciseToStart) {
      const code = exerciseToStart.exerciseCode || String(exerciseToStart.id);
      const localDetails = ExerciseService.getExerciseDetailsByCode(code);
      setSuggestedExercise({ ...exerciseToStart, ...localDetails });
      setShowHistoryOnly(false);
      // Enrich in background
      ExerciseService.getExerciseDetailsFromServer(code)
        .then(details => setSuggestedExercise(prev => prev ? { ...prev, ...details } : null))
        .catch(() => {});
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  // Reload data every time screen comes into focus (handles cross-device restore)
  useFocusEffect(
    useCallback(() => {
      // Don't override the exerciseToStart param on focus
      if (!route?.params?.exerciseToStart) {
        loadData(false, true);
      }
    }, [])
  );

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setSessionFinished(true);
      // Fire mood log reminder notification when timer finishes
      NotificationService.sendMoodLogReminderNotification(language === 'ar').catch(() => {});
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const loadData = async (showLoading = true, triggerSync = true) => {
    if (showLoading) setLoading(true);
    try {
      // Use instant local data for exercises list - no network wait
      const all = ExerciseService.getAllExercises();
      const [completed, suggested] = await Promise.all([
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);
      setExercises(all);
      setHistory(completed);

      const uncompletedSuggested = ExerciseService.filterActiveSuggestions(suggested, completed);

      if (uncompletedSuggested.length > 0 && !showHistoryOnly) {
        const firstEx = uncompletedSuggested[0];
        const code = firstEx.exerciseCode || String(firstEx.id);
        // Show the exercise immediately with local data
        const localDetails = ExerciseService.getExerciseDetailsByCode(code);
        setSuggestedExercise({ ...firstEx, ...localDetails });
        if (showLoading) setLoading(false);
        // Then enrich with server details in background
        ExerciseService.getExerciseDetailsFromServer(code).then(details => {
          setSuggestedExercise(prev => prev ? { ...prev, ...details } : null);
        }).catch(() => {});
        if (triggerSync) {
          triggerBackgroundSync(completed, suggested);
        }
        return; // Already cleared loading
      } else {
        setSuggestedExercise(null);
      }

      if (triggerSync) {
        triggerBackgroundSync(completed, suggested);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerBackgroundSync = (oldCompleted: any[], oldSuggested: any[]) => {
    ExerciseService.restoreUserData().then(async () => {
      const freshCompleted = await ExerciseService.getCompletedExercises();
      const freshSuggested = await ExerciseService.getSuggestedExercises();
      const hasCompletedChanged = freshCompleted.length !== oldCompleted.length;
      const hasSuggestedChanged = freshSuggested.length !== oldSuggested.length;
      if (hasCompletedChanged || hasSuggestedChanged) {
        loadData(false, false);
      }
    }).catch(() => {});
  };

  const onExerciseDone = async () => {
    const completedEx = suggestedExercise;
    setSessionFinished(false);

    if (completedEx) {
      const queueId = (completedEx as any).queueId || completedEx.id;

      // Get current list of active suggestions
      const completed = await ExerciseService.getCompletedExercises();
      const suggested = await ExerciseService.getSuggestedExercises();
      const uncompletedSuggested = ExerciseService.filterActiveSuggestions(suggested, completed);

      // Find completed index
      const completedIndex = uncompletedSuggested.findIndex(ex =>
        ex.queueId == queueId ||
        ex.id == completedEx.id ||
        (ex.exerciseCode && ex.exerciseCode == completedEx.exerciseCode)
      );

      // Save and remove
      await ExerciseService.saveCompletedExercise(completedEx).catch(() => {});
      await ExerciseService.removeSuggestedExercise(queueId).catch(() => {});

      // Reload fresh lists
      const freshCompleted = await ExerciseService.getCompletedExercises();
      const freshSuggested = await ExerciseService.getSuggestedExercises();
      const freshUncompleted = ExerciseService.filterActiveSuggestions(freshSuggested, freshCompleted);

      setExercises(ExerciseService.getAllExercises());
      setHistory(freshCompleted);

      // Transition to next suggestion or show history
      if (freshUncompleted.length > 0 && !showHistoryOnly) {
        let nextEx = freshUncompleted[0];
        if (completedIndex >= 0 && completedIndex < freshUncompleted.length) {
          nextEx = freshUncompleted[completedIndex];
        }
        const code = nextEx.exerciseCode || String(nextEx.id);
        const localDetails = ExerciseService.getExerciseDetailsByCode(code);
        setSuggestedExercise({ ...nextEx, ...localDetails });

        // Enrich in background
        ExerciseService.getExerciseDetailsFromServer(code).then(details => {
          setSuggestedExercise(prev => prev ? { ...prev, ...details } : null);
        }).catch(() => {});
      } else {
        setSuggestedExercise(null);
        setShowHistoryOnly(true);
      }
    } else {
      setSuggestedExercise(null);
      setShowHistoryOnly(true);
    }
  };

  const handleSelectExercise = async (ex: Exercise) => {
    // Show exercise immediately with local data (no spinner)
    const code = ex.exerciseCode || String(ex.id);
    const localDetails = ExerciseService.getExerciseDetailsByCode(code);
    setSuggestedExercise({ ...ex, ...localDetails });
    setShowHistoryOnly(false);
    setSessionFinished(false);
    setCountdown(null);
    // Enrich with server details in background (no spinner)
    ExerciseService.getExerciseDetailsFromServer(code).then(details => {
      setSuggestedExercise(prev => prev ? { ...prev, ...details } : null);
    }).catch(() => {});
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

  const filteredExercises = useMemo(() => exercises.filter(ex =>
    (activeTab === 'All' || (ex.exerciseType && ex.exerciseType.includes(activeTab))) &&
    (ex.name && ex.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  ), [exercises, activeTab, debouncedSearch]);

  const tipData = TIPS[activeTab as keyof typeof TIPS] || TIPS.All;

  // VIEW 1: TASK DETAIL
  if (suggestedExercise && !showHistoryOnly) {
    const ex = suggestedExercise;
    const hasTimer = ex.durationMinutes > 0;

    return (
      <View style={s.container}>
        <View style={[s.darkHeader, { paddingTop: Math.max(insets.top, 8) }]}>
          <View style={s.headerTop}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
               <ArrowLeftIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={s.headerActions}>
              <TouchableOpacity>
                <Heart size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.headerContent}>
             <Text style={s.headerTitle}>{ex.name}</Text>
             <Text style={s.headerSubTitle}>{ex.durationMinutes} min . {ex.exerciseType}</Text>
          </View>
        </View>

        <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.floatingCard}>
             <View style={s.cardTopRow}>
                <CategoryIcon type={ex.exerciseType} size={36} color="#FFFFFF" />
                <View style={s.cardStats}>
                   <View style={s.statCol}>
                      <Text style={s.statLabel}>Duration</Text>
                      <Text style={s.statValue}>{ex.durationMinutes} min</Text>
                   </View>
                   <View style={s.statCol}>
                      <Text style={s.statLabel}>Rating</Text>
                      <View style={s.ratingRow}>
                         <StarIcon size={12} color="#F59E0B" /><Text style={[s.statValue, { color: '#F59E0B', marginLeft: 4 }]}>4.9</Text>
                      </View>
                   </View>
                </View>
             </View>
             
             {sessionFinished ? (
               <View style={s.actionRow}>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, backgroundColor: colors.success }]} onPress={onExerciseDone}>
                     <Text style={[s.startNowText, { color: colors.white }]}>{language === 'ar' ? 'تم' : 'Done'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, marginLeft: 10, backgroundColor: colors.white }]} onPress={onRepeat}>
                     <Text style={s.startNowText}>{language === 'ar' ? 'تكرار' : 'Repeat'}</Text>
                  </TouchableOpacity>
               </View>
             ) : countdown !== null && countdown > 0 ? (
                  <View style={[s.startNowBtn, { backgroundColor: '#1E293B', borderWidth: 0 }]}>
                     <Text style={[s.startNowText, { color: '#FFF' }]}>
                        {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                     </Text>
                  </View>
             ) : hasTimer ? (
                 <TouchableOpacity style={s.startNowBtn} onPress={() => setCountdown(ex.durationMinutes * 60)}>
                    <Play size={16} color="#161B22" /><Text style={s.startNowText}>{language === 'ar' ? 'ابدأ الآن' : 'Start Now'}</Text>
                 </TouchableOpacity>
             ) : (
                 <TouchableOpacity style={[s.startNowBtn, { backgroundColor: colors.success }]} onPress={onExerciseDone}>
                    <Text style={[s.startNowText, { color: colors.white }]}>{language === 'ar' ? 'إكمال التمرين' : 'Complete Exercise'}</Text>
                 </TouchableOpacity>
             )}
          </View>

          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.overviewBox}><Text style={s.overviewText}>{ex.description}</Text></View>

          <Text style={s.sectionTitle}>How to Do It</Text>
          {ex.instructions?.split('\n') ? ex.instructions.split('\n').filter(Boolean).map((step, idx) => {
            const isLink = step.includes('http');
            return (
              <TouchableOpacity key={idx} style={s.stepBox} activeOpacity={isLink ? 0.7 : 1} onPress={() => isLink ? openLinkIfAny(step) : null}>
                <View style={s.stepNumberCircle}><Text style={s.stepNumberText}>{idx + 1}</Text></View>
                <View style={s.stepContent}>
                  <Text style={s.stepTitle}>{step.split(':')[0] || 'Step'}</Text>
                  <Text style={[s.stepDesc, isLink && { color: colors.primary, textDecorationLine: 'underline' }]}>
                    {step.split(':')[1] || step}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }) : <Text style={s.overviewText}>Follow the instructions provided by your AI guide.</Text>}
          
          <TouchableOpacity style={s.seeAllBtn} onPress={() => setShowHistoryOnly(true)}>
            <Text style={s.seeAllText}>Skip to All Exercises</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal visible={countdown !== null} transparent animationType="fade">
           <View style={s.countdownOverlay}>
              <Text style={s.countdownText}>{Math.floor(countdown! / 60)}:{String(countdown! % 60).padStart(2, '0')}</Text>
              <Text style={s.countdownSubText}>Focus and breathe...</Text>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setCountdown(null)}><Text style={s.cancelText}>Cancel</Text></TouchableOpacity>
           </View>
        </Modal>
      </View>
    );
  }

  // VIEW 2: FULL LIST
  return (
    <View style={[s.safeArea, { paddingTop: insets.top }]}>
      <View style={s.listHeaderRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.searchContainer}>
          <Search size={18} color="#A0AEC0" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search exercises..." value={search} onChangeText={handleSearchChange}/>
        </View>
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

      <View style={s.tipsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CategoryIcon type={activeTab} size={20} color="#FCD34D" />
          <Text style={[s.tipsTitle, { marginBottom: 0, marginLeft: 8 }]}>{tipData.title}</Text>
        </View>
        {tipData.points.map((pt, idx) => <Text key={idx} style={s.tipsPoint}>• {pt}</Text>)}
      </View>

      <ScrollView style={s.listContainer}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
          filteredExercises.length === 0 ? <Text style={s.emptyHint}>No exercises found on server.</Text> :
          filteredExercises.map((ex, idx) => (
            <TouchableOpacity key={`${ex.id}-${idx}`} style={s.exerciseCard} onPress={() => handleSelectExercise(ex)}>
              <View style={s.cardLeft}>
                <View style={s.iconBox}>
                  <CategoryIcon type={ex.exerciseType} size={22} color={colors.primary} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{ex.name}</Text>
                  <Text style={s.cardDesc} numberOfLines={1}>{ex.description}</Text>
                  <View style={s.metaRow}>
                    <Clock size={12} color="#A0AEC0" />
                    <Text style={s.metaText}>{ex.durationMinutes}m</Text>
                    {history.some(h => h.id === ex.id) && <View style={s.doneTag}><Text style={s.doneTagText}>COMPLETED</Text></View>}
                    <View style={s.typeTag}><Text style={s.typeTagText}>{ex.exerciseType}</Text></View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
  tipsCard: { backgroundColor: '#2D3748', marginHorizontal: 20, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 20 },
  tipsTitle: { ...typography.body, fontWeight: '700', color: '#FCD34D', marginBottom: 8 },
  tipsPoint: { ...typography.caption, color: '#E2E8F0', marginBottom: 4 },
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

export default ExercisesListScreen;
