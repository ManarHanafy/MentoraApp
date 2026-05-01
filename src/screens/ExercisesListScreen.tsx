import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Modal, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon } from '../components/Icons';
import { Exercise, ExerciseService } from '../services/exerciseService';

// Icons
const SearchIcon = () => <Text style={{ color: '#A0AEC0', fontSize: 16 }}>🔍</Text>;
const ClockIcon = () => <Text style={{ color: '#A0AEC0', fontSize: 12 }}>⏱</Text>;
const HeartOutline = () => <Text style={{ color: '#FFFFFF', fontSize: 24 }}>♡</Text>;
const PlayIcon = ({ color = '#161B22' }) => <Text style={{ fontSize: 16, color }}>▶</Text>;

// التصنيفات الحقيقية من قاعدة بياناتك
const CATEGORIES = ['All', 'CBT', 'Breathing', 'Sleep', 'Behavioral', 'Relaxation', 'Social', 'Safety', 'Mindfulness'];

const TIPS = {
  All: { title: '🌿 Wellness Journey', points: ['Stay consistent', 'Take deep breaths', 'Be kind to yourself'] },
  CBT: { title: '🧠 Cognitive Balance', points: ['Observe your thoughts', 'Challenge negative beliefs', 'Keep a thought record'] },
  Breathing: { title: '💨 Breathing Power', points: ['Calm your nervous system', 'Improve focus', 'Lower stress instantly'] },
  Sleep: { title: '😴 Better Sleep', points: ['Keep a steady schedule', 'No screens before bed', 'Peaceful environment'] },
  Behavioral: { title: '🎯 Behavioral Activation', points: ['Start with small steps', 'Track your activities', 'Celebrate small wins'] },
  Relaxation: { title: '🌊 Find Your Calm', points: ['Release muscle tension', 'Quiet your mind', 'Enjoy the peace'] },
  Social: { title: '🤝 Connection', points: ['Reach out to someone', 'Share your thoughts', 'Build social bonds'] },
  Safety: { title: '🛡️ Safety First', points: ['Create a safe space', 'Identify support contacts', 'Follow your plan'] },
  Mindfulness: { title: '🧘 Current Moment', points: ['Focus on now', 'Non-judgmental awareness', 'Gentle observation'] }
};

export function ExercisesListScreen(): React.ReactElement {
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setSessionFinished(true); // انتهى المؤقت
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [all, completed, suggested] = await Promise.all([
        ExerciseService.getAllExercises(),
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);
      setExercises(all);
      setHistory(completed);

      // الفلتر الذكي: اعرض التمرين المقترح فقط إذا لم يكتمل بعد
      const uncompletedSuggested = suggested.filter(s => !completed.some(c => c.id === s.id));

      if (uncompletedSuggested.length > 0 && !showHistoryOnly) {
        setSuggestedExercise(uncompletedSuggested[0]);
      } else {
        setSuggestedExercise(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onExerciseDone = async () => {
    if (suggestedExercise) {
      await ExerciseService.saveCompletedExercise(suggestedExercise);
    }
    setShowHistoryOnly(true);
    setSuggestedExercise(null);
    setSessionFinished(false);
    loadData();
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

  const filteredExercises = exercises.filter(ex => 
    (activeTab === 'All' || (ex.exerciseType && ex.exerciseType.includes(activeTab))) &&
    (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()))
  );

  const tipData = TIPS[activeTab as keyof typeof TIPS] || TIPS.All;

  // VIEW 1: TASK DETAIL (التمرين المقترح)
  if (suggestedExercise && !showHistoryOnly) {
    const ex = suggestedExercise;
    const hasTimer = ex.durationMinutes > 0;

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
             
             {/* منطق الأزرار بناءً على التايمر */}
             {sessionFinished ? (
               <View style={s.actionRow}>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, backgroundColor: colors.success }]} onPress={onExerciseDone}>
                    <Text style={[s.startNowText, { color: colors.white }]}>Done ✨</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.startNowBtn, { flex: 1, marginLeft: 10, backgroundColor: colors.white }]} onPress={onRepeat}>
                    <Text style={s.startNowText}>Repeat 🔄</Text>
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
                   <PlayIcon /><Text style={s.startNowText}>Start Now</Text>
                </TouchableOpacity>
             ) : (
                <TouchableOpacity style={[s.startNowBtn, { backgroundColor: colors.success }]} onPress={onExerciseDone}>
                   <Text style={[s.startNowText, { color: colors.white }]}>Done ✅</Text>
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
            <Text style={s.seeAllText}>Skipp to All Exercises</Text>
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

  // VIEW 2: FULL LIST (قائمة التمارين كاملة بعد الانتهاء منها)
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.listHeaderRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><ArrowLeftIcon size={24} color={colors.textPrimary} /></TouchableOpacity>
        <View style={s.searchContainer}><SearchIcon /><TextInput style={s.searchInput} placeholder="Search exercises..." value={search} onChangeText={setSearch}/></View>
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
        <Text style={s.tipsTitle}>{tipData.title}</Text>
        {tipData.points.map((pt, idx) => <Text key={idx} style={s.tipsPoint}>• {pt}</Text>)}
      </View>

      <ScrollView style={s.listContainer}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
          filteredExercises.length === 0 ? <Text style={s.emptyHint}>No exercises found on server.</Text> :
          filteredExercises.map((ex, idx) => (
            <TouchableOpacity key={`${ex.id}-${idx}`} style={s.exerciseCard} onPress={() => { setSuggestedExercise(ex); setShowHistoryOnly(false); setSessionFinished(false); }}>
              <View style={s.cardLeft}><View style={s.iconBox}><Text style={{fontSize: 24}}>🧘‍♂️</Text></View>
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
