import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Modal, Linking, AppState, AppStateStatus, Alert, Animated } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon, ArrowRightIcon, ClockIcon, SearchIcon, LockIcon, CheckCircleSolidIcon, BrainIcon, JournalIcon } from '../components/Icons';
import { Exercise, ExerciseService } from '../services/exerciseService';
import { ChatService } from '../services/chatService';
import { useLanguage } from '../context/LanguageContext';
import { Leaf, Brain, Wind, Moon, Target, Waves, Users, Shield, Activity, Compass } from 'lucide-react-native';

// Vector Icon Replacements for Emojis
const HeartOutline = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const MeditationIcon = ({ size = 24, color = '#111827' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="5" r="2" />
    <Path d="m9 22 3-6 3 6M12 16V9M5 12h14" />
    <Path d="m17 10-2-3H9L7 10" />
  </Svg>
);

const VideoIcon = ({ size = 20, color = '#991B1B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <Path d="m8 21 4-4 4 4M12 17v4" />
    <Path d="m10 8 5 3-5 3V8z" fill={color} />
  </Svg>
);

const PlayIcon = ({ color = '#161B22', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M8 5v14l11-7z" />
  </Svg>
);

const LighthouseIcon = ({ size = 24, color = '#7C2D12' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v2M5 22h14M11 16h2M12 4v4M9 8h6M10 22l1.5-14h1L14 22" />
  </Svg>
);

const SeedlingIcon = ({ size = 24, color = '#111827' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22V12M12 12c0-2.8 2.2-5 5-5h4M12 14c0-3 2.2-5.5 5-5.5h2M12 14c0-3-2.2-5.5-5-5.5H3" />
  </Svg>
);

const getExerciseIcon = (type: string, color = '#475569') => {
  const t = type.toLowerCase();
  if (t.includes('breath')) return <MeditationIcon color={color} size={24} />;
  if (t.includes('cbt') || t.includes('cognitive') || t.includes('thought')) return <BrainIcon color={color} size={24} />;
  if (t.includes('sleep')) return <ClockIcon color={color} size={24} />;
  if (t.includes('mindful')) return <MeditationIcon color={color} size={24} />;
  if (t.includes('relax')) return <SeedlingIcon color={color} size={24} />;
  if (t.includes('safty') || t.includes('safety') || t.includes('social')) return <LighthouseIcon color={color} size={24} />;
  return <SeedlingIcon color={color} size={24} />;
};

// Phases & Roadmap Configuration
const ROADMAP_STRUCTURE = [
  {
    phaseId: 'awareness',
    title: 'Phase 1: Awareness',
    titleAr: 'المرحلة 1: الوعي الذاتي',
    description: 'Learn to notice and track your emotional states and patterns.',
    descriptionAr: 'تعلم كيفية ملاحظة وتتبع حالتك النفسية وأنماط تفكيرك.',
    exerciseCodes: ['Encourage_First_Checkin', 'Thought_Awareness_Daily', 'Reality_Check_Journal_Weekly']
  },
  {
    phaseId: 'thought_management',
    title: 'Phase 2: Thought Management',
    titleAr: 'المرحلة 2: إدارة الأفكار',
    description: 'Challenge cognitive distortions and adopt balanced thinking.',
    descriptionAr: 'تحدي التشوهات الإدراكية وتبني تفكير متوازن.',
    exerciseCodes: ['Thought_Record_Basics', 'Challenge_Questions', 'Balanced_Thinking', 'Evidence_For_Against']
  },
  {
    phaseId: 'behavior_change',
    title: 'Phase 3: Behavior Change',
    titleAr: 'المرحلة 3: تغيير السلوك',
    description: 'Build healthy routines, streaks, and lasting resilience.',
    descriptionAr: 'بناء عادات صحية، فترات تتبع، ومرونة نفسية مستدامة.',
    exerciseCodes: ['One_Exercise_Today', 'Daily_Reminder_Set', 'Exercise_Challenge', 'Streak_Goal_3_Days']
  }
];

// Exercise Stage Graphic Render for the Timer Overlay
function ExerciseStageGraphic({ type }: { type: string }): React.ReactElement {
  const cleanType = type.toLowerCase();
  
  if (cleanType.includes('breathing')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Defs>
          <LinearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity={0.6} />
            <Stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="40" fill="url(#breathGrad)" />
        <Circle cx="50" cy="50" r="30" fill="url(#breathGrad)" opacity={0.6} />
        <Circle cx="50" cy="50" r="20" fill="url(#breathGrad)" opacity={0.4} />
        <Path d="M50 20 A30 30 0 0 1 80 50 A30 30 0 0 1 50 80 A30 30 0 0 1 20 50 A30 30 0 0 1 50 20" stroke="#38BDF8" strokeWidth={2} strokeDasharray="4 4" />
      </Svg>
    );
  }

  if (cleanType.includes('sleep')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Circle cx="20" cy="30" r="1.5" fill="#FFFFFF" opacity={0.8} />
        <Circle cx="80" cy="20" r="2" fill="#FFFFFF" opacity={0.9} />
        <Circle cx="75" cy="70" r="1.5" fill="#FFFFFF" opacity={0.7} />
        <Circle cx="30" cy="80" r="2" fill="#FFFFFF" opacity={0.8} />
        <Path d="M40 30 Q65 30 65 55 Q65 75 45 75 Q60 70 58 50 Q56 35 40 30 Z" fill="#FDE047" />
        <Path d="M15 70 Q25 60 35 70 Q45 60 55 70 T75 70 L75 75 H15 Z" fill="#475569" opacity={0.5} />
      </Svg>
    );
  }

  if (cleanType.includes('cbt') || cleanType.includes('cognitive') || cleanType.includes('thought')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Rect x="15" y="35" width="25" height="25" rx="6" fill="#34D399" opacity={0.3} stroke="#34D399" strokeWidth={2} />
        <SvgText x="20" y="50" fill="#FFFFFF" fontSize="10" fontWeight="bold">Neg</SvgText>
        <Path d="M45 47 L60 47" stroke="#34D399" strokeWidth={3} strokeLinecap="round" />
        <Path d="M55 42 L60 47 L55 52" stroke="#34D399" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <Rect x="65" y="35" width="25" height="25" rx="6" fill="#059669" stroke="#34D399" strokeWidth={2} />
        <SvgText x="69" y="50" fill="#FFFFFF" fontSize="10" fontWeight="bold">Bal</SvgText>
        <Path d="M50 20 L52 25 L57 25 L53 28 L55 33 L50 30 L45 33 L47 28 L43 25 L48 25 Z" fill="#FBBF24" />
      </Svg>
    );
  }

  if (cleanType.includes('mindfulness')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Path d="M15 80 Q50 77 85 80" stroke="#C084FC" strokeWidth={2} fill="none" opacity={0.7} />
        <Path d="M25 85 Q50 83 75 85" stroke="#C084FC" strokeWidth={1} fill="none" opacity={0.4} />
        <Circle cx="50" cy="73" r="16" fill="#4B5563" />
        <Circle cx="50" cy="55" r="12" fill="#6B7280" />
        <Circle cx="50" cy="40" r="9" fill="#9CA3AF" />
        <Path d="M50 25 Q45 15 50 10 Q55 15 50 25" fill="#C084FC" opacity={0.8} />
        <Path d="M50 25 Q40 18 36 24 Q45 28 50 25" fill="#C084FC" opacity={0.6} />
        <Path d="M50 25 Q60 18 64 24 Q55 28 50 25" fill="#C084FC" opacity={0.6} />
      </Svg>
    );
  }

  if (cleanType.includes('relax') || cleanType.includes('relaxation')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Path d="M10 30 Q30 25 50 30 T90 30" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} fill="none" />
        <Path d="M10 45 Q30 40 50 45 T90 45" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} fill="none" />
        <Path d="M30 75 Q40 50 65 40 Q55 65 30 75" fill="#4ADE80" opacity={0.8} />
        <Path d="M45 60 Q60 45 75 40 Q65 55 45 60" fill="#4ADE80" opacity={0.6} />
        <Path d="M22 80 L78 35" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" />
      </Svg>
    );
  }

  if (cleanType.includes('social') || cleanType.includes('safety') || cleanType.includes('safty')) {
    return (
      <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
        <Path d="M10 80 C 30 83, 40 77, 60 80 C 80 83, 90 77, 100 80 L 100 90 L 10 90 Z" fill="#7C2D12" opacity={0.5} />
        <Path d="M50 25 L15 10 L10 25 Z" fill="#FEF08A" opacity={0.25} />
        <Path d="M50 25 L85 10 L90 25 Z" fill="#FEF08A" opacity={0.25} />
        <Path d="M43 75 L47 25 L53 25 L57 75 Z" fill="#FFFFFF" />
        <Rect x="42" y="70" width="16" height="5" fill="#EF4444" />
        <Rect x="44" y="50" width="12" height="5" fill="#EF4444" />
        <Rect x="46" y="30" width="8" height="5" fill="#EF4444" />
        <Rect x="47" y="20" width="6" height="5" fill="#FEF08A" />
        <Circle cx="50" cy="18" r="3" fill="#FBBF24" />
      </Svg>
    );
  }

  return (
    <Svg width={150} height={150} viewBox="0 0 100 100" style={{ marginBottom: 20 }}>
      <Circle cx="50" cy="50" r="30" stroke="#38BDF8" strokeWidth={1} strokeDasharray="3 3" />
      <Path d="M50 18 L59 36 L79 39 L65 53 L68 73 L50 63 L32 73 L35 53 L21 39 L41 36 Z" fill="#FBBF24" />
    </Svg>
  );
}

// التصنيفات الحقيقية من قاعدة بياناتك
const CATEGORIES = ['All', 'CBT', 'Breathing', 'Sleep', 'Behavioral', 'Relaxation', 'Social', 'Safety', 'Mindfulness'];

const TIPS = {
  All: {
    title: 'Exercise Benefits',
    points: ['Regular exercise improves mood', 'Reduces daily stress levels', 'Enhances mental clarity & focus']
  },
  CBT: {
    title: 'CBT Techniques',
    points: ['Identify negative thought patterns', 'Challenge your core beliefs', 'Practice cognitive restructuring']
  },
  Breathing: {
    title: 'Breathing Tips',
    points: ['Focus on slow, deep inhales', 'Exhale longer than you inhale', 'Relax your shoulders and jaw']
  },
  Sleep: {
    title: 'Sleep Hygiene',
    points: ['Maintain a consistent schedule', 'Limit screen time before bed', 'Create a cool, dark environment']
  },
  Behavioral: {
    title: 'Activity Focus',
    points: ['Set small, achievable goals', 'Schedule rewarding activities', 'Track your daily energy levels']
  },
  Relaxation: {
    title: 'Deep Relaxation',
    points: ['Try progressive muscle relaxation', 'Visualize a peaceful place', 'Let go of physical tension']
  },
  Social: {
    title: 'Connection',
    points: ['Reach out to a trusted friend', 'Share your feelings openly', 'Engage in community activities']
  },
  Safety: {
    title: 'Safety Planning',
    points: ['Identify your safe triggers', 'Keep support contacts ready', 'Follow your personalized plan']
  },
  Mindfulness: {
    title: 'Mindfulness Guide',
    points: ['Stay present in the moment', 'Observe without judgment', 'Focus on your bodily sensations']
  }
};

export function ExercisesScreen({ route }: any): React.ReactElement {
  const navigation = useNavigation<any>();
  const { language, isRTL } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<Exercise[]>([]);
  const [pendingQueue, setPendingQueue] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [suggestedExercise, setSuggestedExercise] = useState<Exercise | null>(null);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [isAiSession, setIsAiSession] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const breathAnim = React.useRef(new Animated.Value(1)).current;
  // Prevents loadData() from overriding an exercise that was specifically chosen
  // via navigation params (e.g. from the HomeScreen notification queue)
  const exerciseSetFromParamsRef = React.useRef(false);

  useEffect(() => {
    if (countdown !== null && !isPaused && ((suggestedExercise?.exerciseType || '').toLowerCase().includes('breath') || (suggestedExercise?.name || '').toLowerCase().includes('breath'))) {
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
  }, [countdown, isPaused, suggestedExercise]);

  useFocusEffect(
    useCallback(() => {
      ChatService.checkAndFinalizeTimeout().then(() => {
        loadData();
      }).catch(() => {
        loadData();
      });
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
          title: "Session Paused",
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

  useEffect(() => {
    if (route?.params?.category) {
      setActiveTab(route.params.category);
      setShowHistoryOnly(true);
      navigation.setParams({ category: undefined });
    }
  }, [route?.params?.category]);

  useEffect(() => {
    if (route?.params?.openSuggested === true) {
      setShowHistoryOnly(false);
      setSessionFinished(false);
      setCountdown(null);
      
      (async () => {
        try {
          const suggested = await ExerciseService.getSuggestedExercises();
          const safeSuggested = suggested || [];
          let ex = route?.params?.exerciseToStart;
          if (!ex && safeSuggested.length > 0) ex = safeSuggested[0];
          
          if (ex) {
            if (ex.exerciseCode) {
              const details = await ExerciseService.getExerciseDetailsFromServer(ex.exerciseCode);
              ex = { ...ex, ...details };
            }
            // Mark that exercise was set from params — loadData should not override it
            exerciseSetFromParamsRef.current = true;
            setSuggestedExercise(ex);
            setIsAiSession(true);
            // Clear the flag after 3s (enough time for loadData to finish)
            setTimeout(() => { exerciseSetFromParamsRef.current = false; }, 3000);
          }
        } catch (err) {
          console.warn('Failed to handle openSuggested in useEffect', err);
        }
      })();

      try {
        navigation.setParams({ openSuggested: undefined, exerciseToStart: null });
      } catch (_) {}
    }
  }, [route?.params?.openSuggested, route?.params?.exerciseToStart]);


  const loadData = async (triggerSync = true) => {
    setLoading(true);
    try {
      const [completed, suggested] = await Promise.all([
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);

      const safeCompleted = completed || [];
      const uniqueCompleted = Array.from(new Map(safeCompleted.map(item => [item.id, item])).values());
      const safeSuggested = suggested || [];
      
      // Filter out suggested exercises that are already completed to avoid duplicate items
      const suggestedNotInCompleted = ExerciseService.filterActiveSuggestions(safeSuggested, uniqueCompleted);
      
      // Combine completed and active suggested exercises as the AI exercises list
      const aiExercises = [...uniqueCompleted, ...suggestedNotInCompleted];
      
      setExercises(aiExercises);
      setHistory(uniqueCompleted);
      setPendingQueue(suggestedNotInCompleted);

      if (route?.params?.openSuggested === true) {
        setShowHistoryOnly(false);
        setSessionFinished(false);
        setCountdown(null);
        let ex = route.params.exerciseToStart;
        if (!ex && suggestedNotInCompleted.length > 0) ex = suggestedNotInCompleted[0];
        
        if (ex) {
          // Enrich with library details if missing or generic
          if (ex.exerciseCode) {
            const details = await ExerciseService.getExerciseDetailsFromServer(ex.exerciseCode);
            ex = { ...ex, ...details };
          }
          setSuggestedExercise(ex);
          setIsAiSession(true);
          if (route?.params?.exerciseToStart) {
             try { navigation.setParams({ exerciseToStart: null }); } catch (_) {}
          }
        }
        try { navigation.setParams({ openSuggested: undefined }); } catch (_) {}
      } else if (
        !showHistoryOnly &&
        suggestedNotInCompleted.length > 0 &&
        !suggestedExercise &&
        !exerciseSetFromParamsRef.current &&
        !route?.params?.openRoadmap &&
        !route?.params?.category
      ) {
        let ex = suggestedNotInCompleted[0];
        if (ex.exerciseCode) {
           const details = await ExerciseService.getExerciseDetailsFromServer(ex.exerciseCode);
           ex = { ...ex, ...details };
        }
        setSuggestedExercise(ex);
        setIsAiSession(true);
      }

      // Background Restore Sync
      if (triggerSync) {
        ExerciseService.restoreUserData().then(async () => {
          const freshCompleted = await ExerciseService.getCompletedExercises();
          const freshSuggested = await ExerciseService.getSuggestedExercises();
          const hasCompletedChanged = freshCompleted.length !== safeCompleted.length;
          const hasSuggestedChanged = freshSuggested.length !== safeSuggested.length;
          if (hasCompletedChanged || hasSuggestedChanged) {
            loadData(false);
          }
        }).catch((err) => {
          console.warn('[ExercisesScreen] Background restoreUserData failed:', err);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      if (route?.params?.openRoadmap === true) {
        setShowRoadmapModal(true);
        setShowHistoryOnly(true);
        navigation.setParams({ openRoadmap: undefined });
      }
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

      const completedIndex = pendingQueue.findIndex(ex =>
        ex.queueId == finalQueueId ||
        ex.id == currentEx.id ||
        (ex.exerciseCode && ex.exerciseCode == currentEx.exerciseCode)
      );

      // 2. Save progress
      await ExerciseService.saveCompletedExercise(currentEx);
      await ExerciseService.removeSuggestedExercise(finalQueueId);

      // 3. Reset UI state
      try { navigation.setParams({ exerciseToStart: null }); } catch (_) {}
      setCountdown(null);
      setSessionFinished(false);

      // 4. Reload all data
      const [completed, suggested] = await Promise.all([
        ExerciseService.getCompletedExercises(),
        ExerciseService.getSuggestedExercises()
      ]);

      const safeSuggested = suggested || [];
      const safeCompleted = completed || [];
      const uniqueCompleted = Array.from(new Map(safeCompleted.map(item => [item.id, item])).values());
      const suggestedNotInCompleted = ExerciseService.filterActiveSuggestions(safeSuggested, uniqueCompleted);
      const aiExercises = [...uniqueCompleted, ...suggestedNotInCompleted];

      setExercises(aiExercises);
      setHistory(uniqueCompleted);
      setPendingQueue(suggestedNotInCompleted);

      // 5. Flow transition
      if (suggestedNotInCompleted.length > 0 && isAiSession) {
        let nextEx = suggestedNotInCompleted[0];
        if (completedIndex >= 0 && completedIndex < suggestedNotInCompleted.length) {
          nextEx = suggestedNotInCompleted[completedIndex];
        }
        if (nextEx.exerciseCode) {
          const details = await ExerciseService.getExerciseDetailsFromServer(nextEx.exerciseCode);
          nextEx = { ...nextEx, ...details };
        }
        setSuggestedExercise(nextEx);
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

  const startRoadmapExercise = async (code: string) => {
    setLoading(true);
    try {
      const details = await ExerciseService.getExerciseDetailsFromServer(code);
      const exerciseObj: Exercise = {
        id: code,
        name: details.name || code,
        description: details.description || '',
        exerciseType: details.exerciseType || 'General',
        durationMinutes: details.durationMinutes || 5,
        difficulty: details.difficulty || 'Medium',
        instructions: details.instructions || '',
        isActive: true,
        exerciseCode: code,
        goals: details.goals,
        frequency: details.frequency,
        researchBasis: details.researchBasis,
        tips: details.tips,
        videoUrl: details.videoUrl,
        videoTitle: details.videoTitle
      };
      setShowRoadmapModal(false);
      setSuggestedExercise(exerciseObj);
      setIsAiSession(true);
      setShowHistoryOnly(false);
      setSessionFinished(false);
      setCountdown(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = async (ex: Exercise) => {
    setLoading(true);
    try {
      const code = ex.exerciseCode || String(ex.id);
      const details = await ExerciseService.getExerciseDetailsFromServer(code);
      setSuggestedExercise({ ...ex, ...details });
      setIsAiSession(true);
      setShowHistoryOnly(false);
      setSessionFinished(false);
      setCountdown(null);
    } catch (err) {
      console.warn('Error selecting exercise:', err);
      setSuggestedExercise(ex);
      setIsAiSession(true);
      setShowHistoryOnly(false);
      setSessionFinished(false);
      setCountdown(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const exType = (ex.exerciseType || '').toLowerCase().trim();
    const tab = activeTab.toLowerCase().trim();

    if (tab === 'all') return (ex.name && ex.name.toLowerCase().includes(search.toLowerCase()));

    // Strict category filtering: match strictly against exerciseType to prevent name-based leakage
    let isMatched = false;
    if (tab === 'cbt') {
      isMatched = exType === 'cbt' || exType.includes('cognitive') || exType.includes('cbt');
    } else {
      isMatched = exType === tab || exType.includes(tab);
    }

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
              <Text style={s.headerSubTitle}>{ex.durationMinutes > 0 ? `${ex.durationMinutes} min` : 'Done Directly'} . {ex.exerciseType}</Text>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.floatingCard}>
            <View style={s.cardTopRow}>
              <MeditationIcon size={36} color={colors.primary} />
              <View style={s.cardStats}>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>Duration</Text>
                  <Text style={s.statValue}>{ex.durationMinutes > 0 ? `${ex.durationMinutes} min` : 'Done Directly'}</Text>
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
              ) : (hasTimer && ((ex.exerciseType || '').toLowerCase().includes('breath') || (ex.name || '').toLowerCase().includes('breath'))) ? (
                <TouchableOpacity 
                  style={[s.startNowBtn, { backgroundColor: colors.primary, flexDirection: 'row', gap: 6 }]} 
                  onPress={() => setCountdown(ex.durationMinutes * 60)}
                >
                  <PlayIcon color="#FFF" />
                  <Text style={[s.startNowText, { color: '#FFF' }]}>{language === 'ar' ? 'جلسة تنفس موجهة' : 'Guided Breathing'}</Text>
                </TouchableOpacity>
              ) : hasTimer ? (
                <TouchableOpacity style={s.startNowBtn} onPress={() => setCountdown(ex.durationMinutes * 60)}>
                  <PlayIcon /><Text style={s.startNowText}>{language === 'ar' ? `بدء المؤقت (${ex.durationMinutes} د)` : `Start Timer (${ex.durationMinutes} min)`}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.startNowBtn, { backgroundColor: colors.success }]} onPress={onExerciseDone}>
                  <Text style={[s.startNowText, { color: colors.white }]}>{language === 'ar' ? 'إكمال التمرين' : 'Complete Exercise'}</Text>
                </TouchableOpacity>
              )
            ) : (
              <View style={{ height: 20 }} />
            )}
          </View>

          <Text style={s.sectionTitle}>{language === 'ar' ? 'نظرة عامة' : 'Overview'}</Text>
          <View style={s.overviewBox}>
            <Text style={s.overviewText}>
              {ex.description || (language === 'ar' ? 'تمرين صحي مخصص لمساعدتك على الشعور بالتحسن.' : 'A personalized wellness exercise to help you feel better.')}
            </Text>
          </View>

          {/* Goals Section */}
          {ex.goals && ex.goals.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>{language === 'ar' ? 'الأهداف' : 'Goals'}</Text>
              <View style={s.goalsContainer}>
                {ex.goals.map((goal: string, idx: number) => (
                  <View key={idx} style={s.goalTag}>
                    <Text style={s.goalTagText}>• {goal}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Research Basis Section */}
          {ex.researchBasis ? (
            <View style={s.researchBox}>
              <Text style={s.researchTitle}>{language === 'ar' ? 'الأساس العلمي' : 'Evidence Base'}</Text>
              <Text style={s.researchText}>{ex.researchBasis}</Text>
            </View>
          ) : null}

          {/* Tutorial / Steps Section */}
          {ex.instructions ? (
            <>
              <Text style={s.sectionTitle}>{language === 'ar' ? 'طريقة أداء التمرين' : 'How to Do It'}</Text>
              {ex.instructions.split(/(?:\n|->)/).filter(s => s.trim().length > 2).map((step, idx) => {
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

          {/* Tips Section */}
          {ex.tips ? (
            <View style={s.tipsBox}>
              <Text style={s.tipsTitle}>{language === 'ar' ? 'نصيحة الخبراء' : 'Pro Tip'}</Text>
              <Text style={s.tipsText}>{ex.tips}</Text>
            </View>
          ) : null}

          {/* Video Section */}
          {ex.videoUrl ? (
            <TouchableOpacity 
              style={s.videoButton} 
              onPress={() => Linking.openURL(ex.videoUrl as string).catch(err => console.error("Could not open video URL", err))}
            >
              <VideoIcon size={20} color="#991B1B" />
              <View style={{ width: 8 }} />
              <Text style={s.videoButtonText} numberOfLines={1}>
                {ex.videoTitle || (language === 'ar' ? 'مشاهدة الفيديو التوضيحي' : 'Watch Video Tutorial')}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={s.seeAllBtn} onPress={() => setShowHistoryOnly(true)}>
            <Text style={s.seeAllText}>Skip to All Exercises</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal visible={countdown !== null} transparent={false} animationType="slide">
          {(() => {
            const exType = (suggestedExercise?.exerciseType || '').toLowerCase();
            const exName = suggestedExercise?.name || '';
            const instructions = suggestedExercise?.instructions || '';
            const totalDurationSeconds = (suggestedExercise?.durationMinutes || 5) * 60;
            const elapsedSeconds = totalDurationSeconds - (countdown || 0);
            const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

            // Split instructions into visual steps
            const stepItems = instructions.split(/(?:\n|->)/).filter(s => s.trim().length > 2).map(s => s.trim().replace(/^\d+[\.\-]\s*/, ''));

            // Choose theme color based on exercise category (keeping existing colors & branding)
            let accentColor: string = colors.primary; // default brand color
            let lightBg = '#F8FAFC';
            const isRTL = language === 'ar';
            
            if (exType.includes('breath')) {
              accentColor = '#0EA5E9'; // sky blue
              lightBg = '#F0F9FF';
            } else if (exType.includes('sleep')) {
              accentColor = '#6366F1'; // indigo
              lightBg = '#EEF2FF';
            } else if (exType.includes('cbt') || exType.includes('cognitive')) {
              accentColor = '#10B981'; // emerald
              lightBg = '#ECFDF5';
            } else if (exType.includes('mindful')) {
              accentColor = '#8B5CF6'; // purple
              lightBg = '#F5F3FF';
            } else if (exType.includes('relax')) {
              accentColor = '#22C55E'; // green
              lightBg = '#F0FDF4';
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
                      {suggestedExercise?.exerciseType || 'Exercise Session'}
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
                  {/* Title & Static Instructions */}
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 12 }}>
                    {exName}
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
                    {/* Render different dynamic visuals based on exercise type */}
                    {(() => {
                      if (exType.includes('breath') || exName.toLowerCase().includes('breath')) {
                        // 1. BREATHING FLOW (with pulsing animation)
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
                                {getExerciseIcon('breathing', '#FFFFFF')}
                              </View>
                            </Animated.View>

                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 }}>
                              {breathStateText}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 12 }}>
                              {breathStateSub}
                            </Text>
                          </View>
                        );
                      } else if (exType.includes('mindful')) {
                        // 2. MINDFULNESS FLOW (guidance texts)
                        const mindfulnessPromptsEn = [
                          "Observe the flow of your natural breath without trying to change it.",
                          "Notice the physical sensations of your body resting on the chair.",
                          "Let any thoughts float away like clouds in a wide blue sky.",
                          "Bring your awareness back to the physical touch of the cool air.",
                          "Allow yourself to simply be in this present moment, free of judgment."
                        ];
                        const mindfulnessPromptsAr = [
                          "راقب تدفق أنفاسك الطبيعية دون محاولة تغييرها.",
                          "انتبه للأحاسيس الجسدية أثناء جلوسك أو استلقائك.",
                          "دع أي أفكار تطرأ تتلاشى كالسحب في سماء زرقاء واسعة.",
                          "أعد وعيك إلى الشعور بملامسة الهواء الخارجي لبشرتك.",
                          "اسمح لنفسك بأن تكون موجوداً في هذه اللحظة الحالية فقط، دون إطلاق أحكام."
                        ];
                        const promptIdx = Math.floor(elapsedSeconds / 15) % mindfulnessPromptsEn.length;
                        const activePrompt = language === 'ar' ? mindfulnessPromptsAr[promptIdx] : mindfulnessPromptsEn[promptIdx];

                        return (
                          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <View style={{
                              width: 80,
                              height: 80,
                              borderRadius: 40,
                              backgroundColor: lightBg,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 20,
                              borderWidth: 1,
                              borderColor: accentColor
                            }}>
                              {getExerciseIcon('mindfulness', accentColor)}
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                              {language === 'ar' ? 'توجيهات اليقظة الذهنية' : 'Mindful Guidance'}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#1E293B', fontWeight: '600', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 }}>
                              "{activePrompt}"
                            </Text>
                          </View>
                        );
                      } else if (exType.includes('relax')) {
                        // 3. RELAXATION FLOW (steps list with active highlight)
                        const relaxationStepsEn = [
                          "Relax your face. Tense your jaw and forehead for 5s, then completely relax.",
                          "Drop your shoulders. Rotate them slowly, release all tightness.",
                          "Relax your arms and hands. Let your fingers rest loosely by your side.",
                          "Take deep abdominal breaths, expanding your stomach and chest.",
                          "Relax your legs and feet. Let your entire body sink deeply into the floor."
                        ];
                        const relaxationStepsAr = [
                          "أرخِ وجهك. شد فكك وجبهتك لمدة 5 ثوانٍ، ثم استرخِ تماماً.",
                          "أنزل كتفيك. دورهما ببطء، وتخلص من كل شد وعقد عضلية.",
                          "أرخِ ذراعيك ويديك. دع أصابعك ترتاح بمرونة واسترخاء تام.",
                          "خذ أنفاساً عميقة من البطن، مع توسيع معدتك وصدرك.",
                          "أرخِ ساقيك وقدميك. دع جسمك بالكامل يغرق في استرخاء عميق."
                        ];
                        const stepIdx = Math.floor(elapsedSeconds / 30) % relaxationStepsEn.length;
                        const currentStepEn = relaxationStepsEn[stepIdx];
                        const currentStepAr = relaxationStepsAr[stepIdx];

                        return (
                          <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: accentColor, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
                              {language === 'ar' ? `الخطوة ${stepIdx + 1} من 5` : `Step ${stepIdx + 1} of 5`}
                            </Text>
                            
                            {/* Relaxation steps listing */}
                            {relaxationStepsEn.map((stepEn, idx) => {
                              const isActive = idx === stepIdx;
                              const stepText = language === 'ar' ? relaxationStepsAr[idx] : stepEn;
                              return (
                                <View key={idx} style={{
                                  backgroundColor: isActive ? lightBg : '#FFFFFF',
                                  borderRadius: 12,
                                  padding: 12,
                                  marginBottom: 8,
                                  borderWidth: 1.5,
                                  borderColor: isActive ? accentColor : '#F1F5F9',
                                  opacity: isActive ? 1 : 0.4
                                }}>
                                  <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? '#1E293B' : '#64748B', textAlign: isRTL ? 'right' : 'left' }}>
                                    {stepText}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      } else {
                        // 4. CBT / GENERAL FLOW (thought challenging prompts)
                        const cbtPromptsEn = [
                          "Identify: What automatic thought is running through your mind right now?",
                          "Examine: What objective evidence supports this thought? What contradicts it?",
                          "Distortion check: Are you jumping to conclusions or catastrophizing?",
                          "Reframing: How would you advise a close friend facing this same situation?",
                          "Balanced View: Formulate a more realistic, balanced perspective based on the facts."
                        ];
                        const cbtPromptsAr = [
                          "تحديد الفكرة: ما هي الفكرة التلقائية التي تدور في ذهنك حالياً؟",
                          "فحص الأدلة: ما هي الأدلة الموضوعية التي تدعم هذه الفكرة؟ وما الأدلة التي تنفيها؟",
                          "مراجعة التشوهات: هل تقوم بالقفز إلى الاستنتاجات أو تضخيم الأمور؟",
                          "إعادة التأطير: كيف تنصح صديقاً مقرباً يمر بنفس هذا الموقف تماماً؟",
                          "منظور متوازن: صغ وجهة نظر أكثر واقعية وتوازناً بناءً على الحقائق المتاحة."
                        ];
                        const promptIdx = Math.floor(elapsedSeconds / 20) % cbtPromptsEn.length;
                        const activePrompt = language === 'ar' ? cbtPromptsAr[promptIdx] : cbtPromptsEn[promptIdx];

                        return (
                          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <View style={{
                              width: 80,
                              height: 80,
                              borderRadius: 40,
                              backgroundColor: lightBg,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 20,
                              borderWidth: 1,
                              borderColor: accentColor
                            }}>
                              {getExerciseIcon(suggestedExercise?.exerciseType || '', accentColor)}
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                              {language === 'ar' ? 'التحليل المعرفي والسلوكي' : 'CBT Thought Reframing'}
                            </Text>
                            <Text style={{ fontSize: 15, color: '#1E293B', fontWeight: '700', textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 }}>
                              {activePrompt}
                            </Text>
                          </View>
                        );
                      }
                    })()}
                  </View>

                  {/* Exercise Instructions Step List (Integrated nicely at the bottom) */}
                  <View style={{ width: '100%', marginBottom: 24 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 12, width: '100%', textAlign: isRTL ? 'right' : 'left' }}>
                      {language === 'ar' ? 'طريقة أداء هذا التمرين:' : 'How to Practice:'}
                    </Text>
                    {stepItems.slice(0, 3).map((step, idx) => (
                      <View key={idx} style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        alignItems: 'center',
                        gap: 12
                      }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: lightBg,
                          borderWidth: 1,
                          borderColor: accentColor,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: accentColor }}>{idx + 1}</Text>
                        </View>
                        <Text style={{ flex: 1, fontSize: 13, color: '#475569', textAlign: isRTL ? 'right' : 'left' }}>
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>

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
                    <View style={{ height: 6, width: '100%', backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                      <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: accentColor }} />
                    </View>

                    {/* Controls */}
                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: isPaused ? '#10B981' : '#F59E0B',
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onPress={() => setIsPaused(!isPaused)}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                          {isPaused ? (language === 'ar' ? 'استئناف' : 'Resume') : (language === 'ar' ? 'إيقاف مؤقت' : 'Pause')}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#EF4444',
                          paddingVertical: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onPress={() => {
                          setCountdown(null);
                          setIsPaused(false);
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                          {language === 'ar' ? 'إغلاق' : 'Close'}
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

  // If first-time user and there are no suggested or completed exercises, show the empty state screen
  const hasUserExercises = history.length > 0 || pendingQueue.length > 0;

  if (!loading && !hasUserExercises) {
    return (
      <SafeAreaView style={[s.safeArea, { backgroundColor: '#F8FAFC' }]}>
        <View style={[s.listHeaderRow, { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 12, paddingHorizontal: 20 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><ArrowLeftIcon size={24} color={colors.textPrimary} /></TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginLeft: 12 }}>
            {language === 'ar' ? 'التمارين العلاجية' : 'Therapeutic Exercises'}
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#F1F5F9',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2
          }}>
            <LockIcon size={32} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 12 }}>
            {language === 'ar' ? 'ابدأ رحلتك لتفعيل التمارين' : 'Unlock Your Exercises'}
          </Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 10 }}>
            {language === 'ar'
              ? 'مساحة تمارينك فارغة حالياً. ابدأ الدردشة مع المساعد الذكي أو سجل يومياتك للحصول على تمارين مخصصة تناسب احتياجاتك الحالية.'
              : 'Your exercise space is currently empty. Start a conversation with your AI Companion or write a journal entry to get personalized exercises tailored for you.'}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              marginBottom: 12,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4
            }}
            onPress={() => navigation.navigate('Main', { screen: 'Chat' })}
          >
            <BrainIcon color={colors.white} size={20} />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
              {language === 'ar' ? 'تحدث مع المساعد الذكي' : 'Chat with AI Companion'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 24,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              borderWidth: 1.5,
              borderColor: '#E2E8F0'
            }}
            onPress={() => navigation.navigate('Main', { screen: 'Journal' })}
          >
            <JournalIcon color={colors.textPrimary} size={18} focused={true} />
            <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 15 }}>
              {language === 'ar' ? 'سجل تدوين جديد' : 'Write a Journal Entry'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
          {CATEGORIES.map(cat => {
            let label = cat;
            if (language === 'ar') {
              const m: Record<string, string> = {
                'All': 'الكل',
                'CBT': 'سلوكي معرفي',
                'Breathing': 'تنفس',
                'Sleep': 'نوم',
                'Behavioral': 'سلوكي',
                'Relaxation': 'استرخاء',
                'Social': 'اجتماعي',
                'Safety': 'سلامة',
                'Mindfulness': 'يقظة ذهنية'
              };
              label = m[cat] || cat;
            }
            return (
              <TouchableOpacity key={cat} style={[s.tabPill, activeTab === cat && s.tabPillActive]} onPress={() => setActiveTab(cat)}>
                <Text style={[s.tabText, activeTab === cat && s.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView style={s.listContainer}>
        {/* Dynamic Wellness Card with Conditional Styles */}
        <View style={[
          s.featuredCard,
          activeTab === 'All' ? s.featuredCardLarge : s.featuredCardSmall,
          { marginHorizontal: 0 }
        ]}>
          <View style={s.featuredHeader}>
            {(() => {
              const iconSize = 24;
              let iconColor = '#FFFFFF';
              switch(activeTab) {
                case 'CBT': iconColor = '#10B981'; break;      // emerald green
                case 'Breathing': iconColor = '#0EA5E9'; break;    // sky blue
                case 'Sleep': iconColor = '#6366F1'; break;        // indigo
                case 'Behavioral': iconColor = '#F43F5E'; break;   // rose
                case 'Relaxation': iconColor = '#34D399'; break;   // mint
                case 'Social': iconColor = '#FB7185'; break;       // coral pink
                case 'Safety': iconColor = '#EF4444'; break;       // red
                case 'Mindfulness': iconColor = '#A78BFA'; break;  // purple
                default: iconColor = '#34D399'; break;             // mint leaf
              }

              const iconStyle = isRTL ? { marginLeft: 8 } : { marginRight: 8 };

              switch(activeTab) {
                case 'CBT': return <Brain size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Breathing': return <Wind size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Sleep': return <Moon size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Behavioral': return <Target size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Relaxation': return <Waves size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Social': return <Users size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Safety': return <Shield size={iconSize} color={iconColor} style={iconStyle} />;
                case 'Mindfulness': return <Activity size={iconSize} color={iconColor} style={iconStyle} />;
                default: return <Leaf size={iconSize} color={iconColor} style={iconStyle} />;
              }
            })()}
            <Text style={[s.featuredHeaderText, isRTL && { textAlign: 'right' }]}>
              {activeTab === 'All'
                ? (language === 'ar' ? 'نصيحة الصحة النفسية اليومية' : 'Wellness Tip')
                : (language === 'ar' ? `دليل ${activeTab === 'CBT' ? 'العلاج المعرفي السلوكي' : activeTab === 'Breathing' ? 'تمارين التنفس' : activeTab === 'Sleep' ? 'تحسين النوم' : activeTab === 'Behavioral' ? 'العلاج السلوكي' : activeTab === 'Relaxation' ? 'الاسترخاء العميق' : activeTab === 'Social' ? 'التواصل الاجتماعي' : activeTab === 'Safety' ? 'خطة السلامة' : activeTab === 'Mindfulness' ? 'اليقظة الذهنية' : activeTab}` : `${activeTab} Guide`)}
            </Text>
          </View>
          <Text style={[s.featuredTitle, isRTL && { textAlign: 'right' }]}>{tipData.title}</Text>
          <View style={{ marginTop: 8 }}>
            {tipData.points.map((pt, idx) => (
              <Text key={idx} style={[activeTab === 'All' ? s.featuredDesc : s.featuredDescSmall, isRTL && { textAlign: 'right' }]}>• {pt}</Text>
            ))}
          </View>
        </View>

        {/* Thin line separator for specific categories */}
        {activeTab !== 'All' && <View style={[s.separatorLine, { marginHorizontal: 20 }]} />}
        {activeTab === 'All' && !loading && (() => {
          const completedCount = history.length;
          const activeSuggested = pendingQueue.filter(s => 
            !history.some(c => c.id === s.id || (c.exerciseCode && c.exerciseCode === s.exerciseCode))
          );
          const totalCount = completedCount + activeSuggested.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <View style={{
              backgroundColor: '#1E293B',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              shadowColor: '#1E293B',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {language === 'ar' ? 'تقدم خارطة الطريق' : 'ROADMAP PROGRESS'}
                </Text>
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>{progressPercent}%</Text>
                </View>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 }}>
                {language === 'ar' ? 'خارطة طريق الصحة النفسية' : 'Mental Wellness Roadmap'}
              </Text>
              {/* Progress Bar */}
              <View style={{ height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#10B981' }} />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 6
                }}
                onPress={() => setShowRoadmapModal(true)}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>
                  {language === 'ar' ? 'عرض خارطة الطريق الكاملة' : 'View Full Roadmap'}
                </Text>
                <ArrowRightIcon size={14} color="#1E293B" />
              </TouchableOpacity>
            </View>
          );
        })()}

        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
          filteredExercises.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleSolidIcon size={48} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                {language === 'ar' ? 'لا توجد تمارين مكتملة بعد' : 'No completed exercises yet'}
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>
                {language === 'ar'
                  ? 'التمارين التي تكملها من خلال التوصيات ستظهر هنا. ابدأ محادثة أو سجل تدوينة للحصول على توصيتك الأولى!'
                  : 'Exercises you complete through AI recommendations will appear here. Start a chat or write a journal entry to get your first suggestion!'}
              </Text>
            </View>
          ) :
            filteredExercises.map((ex, idx) => (
              <TouchableOpacity
                key={`${ex.id}-${idx}`}
                style={s.exerciseCard}
                onPress={() => handleSelectExercise(ex)}
              >
                <View style={s.cardLeft}>
                  <View style={s.iconBox}>
                    {getExerciseIcon(ex.exerciseType, colors.primary)}
                  </View>
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

      {/* FULL ROADMAP PROGRESS TIMELINE MODAL */}
      <Modal visible={showRoadmapModal} animationType="slide" transparent={false}>
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
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B' }}>
              {language === 'ar' ? 'خارطة طريق التمارين' : 'Exercise Roadmap'}
            </Text>
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#F1F5F9'
              }}
              onPress={() => setShowRoadmapModal(false)}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Description card */}
            <View style={{
              backgroundColor: '#EFF6FF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#DBEAFE',
              marginBottom: 24
            }}>
              <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
                {language === 'ar'
                  ? 'تابع تقدمك خطوة بخطوة. أكمل تمارين كل مرحلة لفتح التمارين المتقدمة التالية وتعزيز صحتك النفسية.'
                  : 'Track your mental wellness progress step-by-step. Complete exercises in each phase to unlock the next level and build psychological resilience.'}
              </Text>
            </View>

            {/* Stages / Phases timeline */}
            {(() => {
              // Helper: format a timestamp as a human-readable day label
              const formatDayLabel = (ts?: string | number): string => {
                if (!ts) return '';
                const date = new Date(typeof ts === 'string' ? ts : Number(ts));
                if (isNaN(date.getTime())) return '';
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterdayStart = new Date(todayStart.getTime() - 86400000);
                const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                if (dayStart.getTime() === todayStart.getTime()) {
                  return language === 'ar' ? 'اليوم' : 'Today';
                } else if (dayStart.getTime() === yesterdayStart.getTime()) {
                  return language === 'ar' ? 'أمس' : 'Yesterday';
                } else {
                  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                }
              };

              const dynamicPhases = [];
              
              if (history.length > 0) {
                dynamicPhases.push({
                  phaseId: 'completed_milestones',
                  title: language === 'ar' ? 'المرحلة 1: الإنجازات المكتملة' : 'Phase 1: Completed Milestones',
                  titleAr: 'المرحلة 1: الإنجازات المكتملة',
                  description: language === 'ar' ? 'التمارين المقترحة من الذكاء الاصطناعي التي أكملتها بنجاح.' : 'AI-recommended exercises you have successfully completed.',
                  descriptionAr: 'التمارين المقترحة من الذكاء الاصطناعي التي أكملتها بنجاح.',
                  exercises: history
                });
              }
              
              const activeSuggested = pendingQueue.filter(s => 
                !history.some(c => c.id === s.id || (c.exerciseCode && c.exerciseCode === s.exerciseCode))
              );
              
              if (activeSuggested.length > 0) {
                const phaseNum = dynamicPhases.length + 1;
                dynamicPhases.push({
                  phaseId: 'active_recommendations',
                  title: language === 'ar' ? `المرحلة ${phaseNum}: التوصيات النشطة` : `Phase ${phaseNum}: Active Recommendations`,
                  titleAr: `المرحلة ${phaseNum}: التوصيات النشطة`,
                  description: language === 'ar' ? 'تمارين مخصصة اقترحها الذكاء الاصطناعي بناءً على حالتك النفسية الحالية.' : 'Personalized exercises recommended by the AI based on your current emotional state.',
                  descriptionAr: 'تمارين مخصصة اقترحها الذكاء الاصطناعي بناءً على حالتك النفسية الحالية.',
                  exercises: activeSuggested
                });
              }

              if (dynamicPhases.length === 0) {
                return (
                  <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleSolidIcon size={48} color={colors.primary} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                      {language === 'ar' ? 'خارطة الطريق فارغة حالياً' : 'Roadmap is Currently Empty'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>
                      {language === 'ar'
                        ? 'ابدأ التحدث مع رفيقك الذكاء الاصطناعي أو اكتب تدوينات يومية للحصول على تمارين مخصصة وبناء خارطة طريقك.'
                        : 'Start talking with your AI companion or write journal entries to get personalized exercises and build your roadmap.'}
                    </Text>
                  </View>
                );
              }

              return dynamicPhases.map((phase, phaseIdx) => (
                <View key={phase.phaseId} style={{ marginBottom: 28 }}>
                  {/* Phase header */}
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    marginBottom: 16
                  }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 4, textAlign: isRTL ? 'right' : 'left' }}>
                      {language === 'ar' ? phase.titleAr : phase.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16, textAlign: isRTL ? 'right' : 'left' }}>
                      {language === 'ar' ? phase.descriptionAr : phase.description}
                    </Text>
                  </View>

                  {/* Exercises list in this phase */}
                  <View style={{ paddingLeft: 8 }}>
                    {phase.exercises.map((ex, itemIdx) => {
                      const isCompleted = phase.phaseId === 'completed_milestones';
                      // All active suggested exercises are interactive (no locked state)
                      const isActive = phase.phaseId === 'active_recommendations';
                      const isFirstActive = isActive && itemIdx === 0;

                      const name = ex.name || 'AI Suggested Exercise';
                      const duration = ex.durationMinutes || 5;
                      const type = ex.exerciseType || 'General';

                      const dayLabel = isCompleted
                        ? formatDayLabel((ex as any).completedAt)
                        : formatDayLabel((ex as any).suggestedAt);

                      return (
                        <View key={`${ex.id}-${itemIdx}`} style={[{ flexDirection: 'row', minHeight: 100 }, isRTL && { flexDirection: 'row-reverse' }]}>
                          {/* Timeline Left Line Column */}
                          <View style={[{ alignItems: 'center' }, isRTL ? { marginLeft: 16 } : { marginRight: 16 }]}>
                            <View style={{
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              backgroundColor: isCompleted ? '#10B981' : (isFirstActive ? '#3B82F6' : '#93C5FD'),
                              borderWidth: isFirstActive ? 4 : (isActive ? 2 : 0),
                              borderColor: isFirstActive ? '#DBEAFE' : (isActive ? '#BFDBFE' : 'transparent'),
                              justifyContent: 'center',
                              alignItems: 'center',
                              zIndex: 2
                            }}>
                              {isCompleted ? (
                                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                              ) : (
                                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFFFFF' }} />
                              )}
                            </View>
                            {/* Line connecting nodes */}
                            {!(phaseIdx === dynamicPhases.length - 1 && itemIdx === phase.exercises.length - 1) && (
                              <View style={{
                                width: 2,
                                flex: 1,
                                backgroundColor: isCompleted ? '#10B981' : '#BFDBFE',
                                marginVertical: 4
                              }} />
                            )}
                          </View>

                          {/* Exercise Card Body */}
                          <View style={{ flex: 1, paddingBottom: 16 }}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                setShowRoadmapModal(false);
                                handleSelectExercise(ex);
                              }}
                              style={[{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 16,
                                padding: 14,
                                borderWidth: 1.5,
                                borderColor: isCompleted ? '#D1FAE5' : (isFirstActive ? '#3B82F6' : '#BFDBFE'),
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.04,
                                shadowRadius: 6,
                                elevation: 2,
                              }, isRTL && { alignItems: 'flex-end' }]}
                            >
                              {/* Day label pill - top right */}
                              {dayLabel ? (
                                <View style={[{
                                  flexDirection: isRTL ? 'row-reverse' : 'row',
                                  justifyContent: isRTL ? 'flex-start' : 'flex-end',
                                  marginBottom: 8
                                }]}>
                                  <View style={{
                                    backgroundColor: isCompleted ? '#D1FAE5' : '#EFF6FF',
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 20,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 3
                                  }}>
                                    <Text style={{ fontSize: 9, color: isCompleted ? '#065F46' : '#1D4ED8' }}>📅</Text>
                                    <Text style={{
                                      fontSize: 10,
                                      fontWeight: '700',
                                      color: isCompleted ? '#065F46' : '#1D4ED8'
                                    }}>
                                      {dayLabel}
                                    </Text>
                                  </View>
                                </View>
                              ) : null}

                              {/* Top row: icon + info */}
                              <View style={[{ flexDirection: 'row', alignItems: 'center' }, isRTL && { flexDirection: 'row-reverse' }]}>
                                <View style={[{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20,
                                  backgroundColor: isCompleted ? '#D1FAE5' : '#EBF5FF',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }, isRTL ? { marginLeft: 12 } : { marginRight: 12 }]}>
                                  {getExerciseIcon(type, isCompleted ? '#10B981' : '#3B82F6')}
                                </View>

                                <View style={{ flex: 1 }}>
                                  {/* Name row */}
                                  <View style={[{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }, isRTL && { flexDirection: 'row-reverse' }]}>
                                    {isCompleted && (
                                      <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                                    )}
                                    <Text style={{
                                      fontSize: 14,
                                      fontWeight: '700',
                                      color: '#1E293B',
                                      flexShrink: 1
                                    }} numberOfLines={1}>
                                      {name}
                                    </Text>
                                    {!isCompleted && (
                                      <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>
                                        ({duration} {language === 'ar' ? 'دق' : 'min'})
                                      </Text>
                                    )}
                                  </View>
                                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
                                    {type}
                                  </Text>
                                </View>

                                {/* Status Tag (completed only) */}
                                {isCompleted && (
                                  <View style={[{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }, isRTL ? { marginRight: 8 } : { marginLeft: 8 }]}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#065F46' }}>
                                      {language === 'ar' ? 'مكتمل' : 'Done ✓'}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Start Exercise button for active suggestions */}
                              {!isCompleted && (
                                <View style={{ marginTop: 12 }}>
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: isFirstActive ? '#3B82F6' : '#93C5FD',
                                      paddingHorizontal: 14,
                                      paddingVertical: 9,
                                      borderRadius: 10,
                                      alignSelf: isRTL ? 'flex-start' : 'flex-end',
                                      flexDirection: isRTL ? 'row-reverse' : 'row',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                    onPress={() => {
                                      setShowRoadmapModal(false);
                                      handleSelectExercise(ex);
                                    }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                                      {language === 'ar' ? 'ابدأ التمرين' : 'Start Exercise'}
                                    </Text>
                                    <ArrowRightIcon color="#FFFFFF" size={10} />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ));
            })()}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  goalsContainer: { flexDirection: 'column', gap: 6, marginBottom: 24 },
  goalTag: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  goalTagText: { ...typography.bodySmall, color: '#334155', fontWeight: '500' },
  researchBox: { backgroundColor: '#F0FDFA', borderLeftWidth: 4, borderLeftColor: '#0D9488', padding: 16, borderRadius: 12, marginBottom: 24 },
  researchTitle: { fontSize: 14, fontWeight: '700', color: '#0F766E', marginBottom: 4 },
  researchText: { ...typography.caption, color: '#115E59', lineHeight: 18 },
  tipsBox: { backgroundColor: '#FFFBEB', borderLeftWidth: 4, borderLeftColor: '#D97706', padding: 16, borderRadius: 12, marginVertical: 20 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#B45309', marginBottom: 4 },
  tipsText: { ...typography.bodySmall, color: '#78350F', lineHeight: 20 },
  videoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, padding: 16, marginVertical: 12, justifyContent: 'center' },
  videoButtonText: { ...typography.bodySmall, color: '#991B1B', fontWeight: '700', flex: 1 },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 4 },
  metaText: { ...typography.caption, color: colors.textSecondary, marginLeft: 4, marginRight: 8 },
  doneTag: { backgroundColor: colors.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  doneTagText: { fontSize: 8, color: colors.success, fontWeight: 'bold' },
  typeTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, maxWidth: 140, flexShrink: 1 },
  typeTagText: { fontSize: 8, color: colors.textSecondary, fontWeight: 'bold', flexShrink: 1 },
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
