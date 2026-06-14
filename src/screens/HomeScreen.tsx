import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components';
import { BellIcon, StarIcon, ArrowRightIcon, BrainIcon, InsightsIcon, TrophyIcon, FireIcon, JournalIcon } from '../components/Icons';
import { colors, typography } from '../theme';
import { styles } from './HomeScreen.style';
import { ExerciseService } from '../services/exerciseService';
import { MoodService } from '../services/moodService';
import { ChatService } from '../services/chatService';
import { ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config/env';
import { Frown, Meh, Smile, Laugh } from 'lucide-react-native';

// Sad -> Happy vector icons mapping
const MOOD_ICONS = [
  { component: Frown, color: '#EF4444' },
  { component: Meh, color: '#F59E0B' },
  { component: Smile, color: '#10B981' },
  { component: Smile, color: '#059669' },
  { component: Laugh, color: '#047857' }
];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2 - 32;

// Greeting is now done inside the component using translation keys

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { userName, email } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [moodLevel, setMoodLevel] = useState(3);
  const [saySomethingVisible, setSaySomethingVisible] = useState(false);
  const [moodMessage, setMoodMessage] = useState('');

  // Mood Cooldown State
  const [moodCooldownExpiry, setMoodCooldownExpiry] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Queue State
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);
  const [stats, setStats] = useState({ avgMood: '3.8', exercisesDone: '0', journalCount: '0', chatCount: '0' });

  // In-app Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const moodCardRef = useRef<View>(null);
  const recCardRef = useRef<View>(null);
  const [moodCardLayout, setMoodCardLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [recCardLayout, setRecCardLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const measureComponents = () => {
    if (moodCardRef.current) {
      moodCardRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setMoodCardLayout({ x, y, width, height });
        }
      });
    }
    if (recCardRef.current) {
      recCardRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setRecCardLayout({ x, y, width, height });
        }
      });
    }
  };

  useEffect(() => {
    if (email) {
      const userTutorialKey = `@mentora_tutorial_done_${email.trim().toLowerCase()}`;
      AsyncStorage.getItem(userTutorialKey).then((val) => {
        if (val !== 'true') {
          setShowTutorial(true);
        } else {
          setShowTutorial(false);
        }
      });
    }
  }, [email]);

  useEffect(() => {
    if (showTutorial) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      const timer = setTimeout(measureComponents, 300);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  useEffect(() => {
    if (showTutorial) {
      measureComponents();
    }
  }, [tutorialStep, showTutorial]);

  const handleNextStep = async () => {
    if (tutorialStep === 5) {
      if (email) {
        const userTutorialKey = `@mentora_tutorial_done_${email.trim().toLowerCase()}`;
        await AsyncStorage.setItem(userTutorialKey, 'true');
      }
      await AsyncStorage.setItem('@mentora_tutorial_done', 'true');
      setShowTutorial(false);
    } else {
      setTutorialStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const handleSkipTutorial = async () => {
    if (email) {
      const userTutorialKey = `@mentora_tutorial_done_${email.trim().toLowerCase()}`;
      await AsyncStorage.setItem(userTutorialKey, 'true');
    }
    await AsyncStorage.setItem('@mentora_tutorial_done', 'true');
    setShowTutorial(false);
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} د` : `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return language === 'ar' ? `منذ ${diffHrs} ساعة` : `${diffHrs}h ago`;
    return new Date(timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const displayName = userName || 'Friend';
  const h = new Date().getHours();
  const greeting = h < 12 ? t.home.goodMorning : h < 17 ? t.home.goodAfternoon : t.home.goodEvening;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reload data every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      // Run initial check
      ChatService.checkAndFinalizeTimeout().then((finalized) => {
        if (finalized) loadData();
      });
      loadData();

      // Check mood cooldown on focus
      const checkMoodCooldown = async () => {
        try {
          const userEmail = email ? email.trim().toLowerCase() : '';
          const key = `@mentora_mood_cooldown_expiry_${userEmail}`;
          const stored = await AsyncStorage.getItem(key);
          if (stored) {
            const expiry = parseInt(stored, 10);
            if (expiry > Date.now()) {
              setMoodCooldownExpiry(expiry);
              setCooldownRemaining(Math.ceil((expiry - Date.now()) / 1000));
            } else {
              await AsyncStorage.removeItem(key);
              setMoodCooldownExpiry(null);
              setCooldownRemaining(0);
            }
          } else {
            setMoodCooldownExpiry(null);
            setCooldownRemaining(0);
          }
        } catch (e) {
          console.warn('Failed to load mood cooldown', e);
        }
      };
      checkMoodCooldown();

      // Poll every 45s for the session-complete flag set by ChatScreen.finalizeChat (optimized for battery and memory)
      pollingRef.current = setInterval(async () => {
        // Run timeout check first
        await ChatService.checkAndFinalizeTimeout();

        const alertKey = await ChatService.getUserKey('@session_complete_alert');
        const flag = await AsyncStorage.getItem(alertKey);
        if (flag) {
          await AsyncStorage.removeItem(alertKey);
          await loadData(); // refresh pendingQueue in UI

          if (flag === 'exercises') {
            Alert.alert(
              'Session Complete',
              'Mentora has suggested new exercises based on your conversation.',
              [
                {
                  text: 'View Exercises',
                  onPress: () => (navigation as any).navigate('Exercises', { openSuggested: true }),
                },
                { text: 'Later', style: 'cancel' },
              ]
            );
          } else if (flag === 'none') {
            Alert.alert(
              'Session Ended',
              'Your conversation session has been completed and summarized.',
              [{ text: 'OK' }]
            );
          }
        }
      }, 45000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }, [email])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (moodCooldownExpiry) {
      const updateTimer = async () => {
        const diff = Math.ceil((moodCooldownExpiry - Date.now()) / 1000);
        if (diff <= 0) {
          setMoodCooldownExpiry(null);
          setCooldownRemaining(0);
          try {
            const userEmail = email ? email.trim().toLowerCase() : '';
            const key = `@mentora_mood_cooldown_expiry_${userEmail}`;
            await AsyncStorage.removeItem(key);
          } catch (e) {}
        } else {
          setCooldownRemaining(diff);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [moodCooldownExpiry, email]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  const loadData = async () => {
    try {
      const completed = await ExerciseService.getCompletedExercises();
      setRecentHistory(completed.reverse());
      
      const suggestedRes = await ExerciseService.getSuggestedExercises();
      setPendingQueue(suggestedRes || []);

      // Fetch Trend for Avg Mood
      const token = await ExerciseService.getAuthToken();
      const trendRes = await fetch(`${API_BASE_URL}/Journals/trend?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let moodScore = '3.8';
      if (trendRes.ok) {
        const data = await trendRes.json();
        const stressTrend = data.find((t: any) => t.parameter === 'str');
        if (stressTrend && stressTrend.points.length > 0) {
           const latestVal = stressTrend.points[stressTrend.points.length - 1].value;
           moodScore = ((20 - latestVal) / 4).toFixed(1);
        }
      }

      // Fetch journal count
      let journalCount = '0';
      try {
        const journalRes = await fetch(`${API_BASE_URL}/Journals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (journalRes.ok) {
          const journalData = await journalRes.json();
          const entries = Array.isArray(journalData) ? journalData : (journalData.entries || journalData.items || []);
          journalCount = entries.length.toString();
        }
      } catch (_) {}

      // Fetch chat message count
      let chatCount = '0';
      try {
        const chats = await ChatService.getRecentChats(10);
        if (chats && chats.length > 0) {
          const total = chats.reduce((sum: number, c: any) => sum + (c.messageCount || c.messagesCount || 0), 0);
          chatCount = total > 0 ? total.toString() : chats.length.toString();
        }
      } catch (_) {}

      setStats({
        avgMood: moodScore,
        exercisesDone: completed.length.toString(),
        journalCount,
        chatCount,
      });

    } catch(e) {}
  };

  const closeSaySomething = (): void => {
    setSaySomethingVisible(false);
    setMoodMessage('');
  };

  const handleEmojiPress = async (level: number) => {
    setMoodLevel(level);
    try {
      await MoodService.submitMood(level, '');
      // Open the modal automatically so they can add text and get exercises
      setSaySomethingVisible(true);
    } catch (e) {
      console.error('Failed to send immediate mood update', e);
    }
  };

  const trackMood = async (): Promise<void> => {
    if (!moodMessage.trim() && moodLevel === 3) {
      closeSaySomething();
      return;
    }

    setIsSubmittingMood(true);
    try {
      const result = await MoodService.submitMood(moodLevel, moodMessage);
      
      // Set 1-hour cooldown
      const duration = 60 * 60 * 1000; // 1 hour in ms
      const expiry = Date.now() + duration;
      const userEmail = email ? email.trim().toLowerCase() : '';
      const key = `@mentora_mood_cooldown_expiry_${userEmail}`;
      await AsyncStorage.setItem(key, String(expiry));
      setMoodCooldownExpiry(expiry);
      setCooldownRemaining(Math.ceil(duration / 1000));

      if (result.exercises && result.exercises.length > 0) {
        Alert.alert(
          t.home.moodTracked,
          t.home.moodTrackedMsg.replace('%d', String(result.exercises.length)),
          [{ text: t.common.ok, onPress: () => loadData() }]
        );
      } else {
        Alert.alert(t.common.success, t.home.moodTrackedSuccess);
        loadData();
      }
      closeSaySomething();
    } catch (e: any) {
      Alert.alert(t.common.error, e.message || t.home.moodFailed);
    } finally {
      setIsSubmittingMood(false);
    }
  };

  const fillWidth = (moodLevel / 5) * 100;
  const thumbLeft = Math.max(0, Math.min(TRACK_WIDTH - 18, (moodLevel / 5) * TRACK_WIDTH - 9));

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Home screen"
    >
      <View style={styles.topBar}>
        <Text style={styles.greeting}>{greeting}, {displayName}</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifications(true)} accessibilityLabel="Notifications">
          <BellIcon color={colors.textPrimary} size={24} />
          {pendingQueue.length > 0 && (
              <View style={{position: 'absolute', top: -2, right: -2, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems:'center', justifyContent:'center'}}>
                 <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>{pendingQueue.length}</Text>
              </View>
          )}
        </TouchableOpacity>
      </View>

      {/* --- Notifications Modal --- */}
      <Modal visible={showNotifications} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '85%', padding: 18, width: '94%', maxWidth: 440, borderRadius: 24, flexDirection: 'column' }]}>
               <View style={styles.modalCardHeader}>
                  <Text style={[styles.modalCardTitle, { fontWeight: '800', fontSize: 20 }]}>
                     {language === 'ar' ? 'التنبيهات والأنشطة' : 'Notifications & Updates'}
                  </Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowNotifications(false)}>
                     <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
               </View>

               {(() => {
                  // Dynamic Roadmap calculation:
                  const completedCount = recentHistory.length;
                  const activeSuggested = pendingQueue.filter(s => 
                     !recentHistory.some(c => c.id === s.id || (c.exerciseCode && c.exerciseCode === s.exerciseCode))
                  );
                  const totalCount = completedCount + activeSuggested.length;
                  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const currentSuggested = activeSuggested.length > 0 ? activeSuggested[0] : null;

                  const getCategoryLabel = (category: string) => {
                     if (language === 'ar') {
                        switch(category) {
                           case 'exercise_reminder': return 'تذكير بالتمارين';
                           case 'completed': return 'تمرين مكتمل';
                           case 'new_unlocked': return 'فتح تمرين جديد';
                           case 'journal_reminder': return 'تذكير التدوين';
                           case 'progress': return 'تحديث التقدم';
                           case 'streak': return 'إنجاز التتبع';
                           case 'inactive_resume': return 'استئناف المسار';
                           default: return 'تنبيه';
                        }
                     } else {
                        switch(category) {
                           case 'exercise_reminder': return 'Exercise Reminder';
                           case 'completed': return 'Exercise Completed';
                           case 'new_unlocked': return 'New Exercise Unlocked';
                           case 'journal_reminder': return 'Journal Reminder';
                           case 'progress': return 'Progress Update';
                           case 'streak': return 'Streak Achievement';
                           case 'inactive_resume': return 'Resume Journey';
                           default: return 'Notification';
                        }
                     }
                  };

                  const getCategoryIcon = (category: string) => {
                     let bgColor = '#EFF6FF';
                     let strokeColor = '#3B82F6';
                     let icon: React.ReactNode;

                     if (category === 'exercise_reminder') {
                        bgColor = '#FEF3C7';
                        strokeColor = '#D97706';
                        icon = (
                           <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                              <Circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth={2} />
                              <Path d="M12 6v6l4 2" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                           </Svg>
                        );
                     } else if (category === 'completed') {
                        bgColor = '#DCFCE7';
                        strokeColor = '#15803D';
                        icon = (
                           <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                              <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              <Path d="M22 4L12 14.01l-3-3" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                           </Svg>
                        );
                     } else if (category === 'new_unlocked') {
                        bgColor = '#F5F3FF';
                        strokeColor = '#7C3AED';
                        icon = (
                           <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                              <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={strokeColor} strokeWidth={2} />
                              <Path d="M7 11V7a5 5 0 0 1 9.9-1" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
                           </Svg>
                        );
                     } else if (category === 'journal_reminder') {
                        bgColor = '#FFFBEB';
                        strokeColor = '#D97706';
                        icon = <JournalIcon color={strokeColor} size={18} focused={true} />;
                     } else if (category === 'streak') {
                        bgColor = '#FEE2E2';
                        strokeColor = '#EF4444';
                        icon = <FireIcon color={strokeColor} size={18} />;
                     } else if (category === 'progress') {
                        bgColor = '#E0F2FE';
                        strokeColor = '#0284C7';
                        icon = <InsightsIcon color={strokeColor} size={18} />;
                     } else if (category === 'inactive_resume') {
                        bgColor = '#F1F5F9';
                        strokeColor = '#475569';
                        icon = <BrainIcon color={strokeColor} size={18} />;
                     } else {
                        bgColor = '#F1F5F9';
                        strokeColor = '#475569';
                        icon = <BrainIcon color={strokeColor} size={18} />;
                     }

                     return { bgColor, strokeColor, icon };
                  };

                  // Generate notifications dynamically
                  const notificationsList: any[] = [];
                  
                  // 1. Suggested Exercises as Reminders
                  pendingQueue.forEach((item, idx) => {
                     notificationsList.push({
                        id: `queue-${item.queueId || item.id || idx}`,
                        category: 'exercise_reminder',
                        title: item.name,
                        body: language === 'ar' 
                           ? `تمرين مقترح من الذكاء الاصطناعي: ${item.description || 'تمرين مخصص لك'}`
                           : `AI Suggested Exercise: ${item.description || 'A personalized exercise for you.'}`,
                        timeGroup: 'today',
                        timeText: language === 'ar' ? 'الآن' : 'Just now',
                        actionText: language === 'ar' ? 'ابدأ التمرين' : 'Start Exercise',
                        onPress: () => {
                           setShowNotifications(false);
                           (navigation as any).navigate('Exercises', { openSuggested: true, exerciseToStart: item });
                        }
                     });
                  });

                  // 2. Completed Exercises
                  recentHistory.slice(0, 5).forEach((ex, idx) => {
                     notificationsList.push({
                        id: `completed-${ex.id || idx}`,
                        category: 'completed',
                        title: ex.name,
                        body: language === 'ar'
                           ? `عمل رائع! لقد أكملت هذا التمرين بنجاح.`
                           : `Great job! You successfully completed this exercise.`,
                        timeGroup: idx === 0 ? 'today' : 'yesterday',
                        timeText: idx === 0 
                           ? (language === 'ar' ? 'اليوم' : 'Today') 
                           : (language === 'ar' ? 'أمس' : 'Yesterday'),
                        actionText: language === 'ar' ? 'عرض خارطة الطريق' : 'View Roadmap',
                        onPress: () => {
                           setShowNotifications(false);
                           (navigation as any).navigate('Exercises', { openRoadmap: true });
                        }
                     });
                  });

                  // 3. Daily reminder if queue is empty
                  if (pendingQueue.length === 0) {
                     notificationsList.push({
                        id: 'notif-daily-reminder',
                        category: 'exercise_reminder',
                        title: language === 'ar' ? 'تذكير بالتمارين اليومية' : 'Daily Exercise Reminder',
                        body: language === 'ar' ? 'ابدأ محادثة أو سجل تدوينة للحصول على تمارين مخصصة.' : 'Start a chat or write a journal entry to receive personalized wellness exercises.',
                        timeGroup: 'today',
                        timeText: language === 'ar' ? 'منذ ١٠ دقائق' : '10 min ago',
                        actionText: language === 'ar' ? 'افتح المحادثة' : 'Open Chat',
                        onPress: () => {
                           setShowNotifications(false);
                           (navigation as any).navigate('Main', { screen: 'Chat' });
                        }
                     });
                  }

                  // 4. Streak achievements (dynamic)
                  if (recentHistory.length >= 1) {
                     notificationsList.push({
                        id: 'notif-streak',
                        category: 'streak',
                        title: language === 'ar' ? 'إنجاز التتبع اليومي!' : 'Streak Achievement!',
                        body: language === 'ar' ? 'مبروك! لقد حافظت على تتبع صحي ونشاط مستمر.' : 'Congratulations! You kept a wellness streak and stayed active.',
                        timeGroup: 'this_week',
                        timeText: language === 'ar' ? 'هذا الأسبوع' : 'This Week',
                        actionText: language === 'ar' ? 'عرض التقدم' : 'View Progress',
                        onPress: () => {
                           setShowNotifications(false);
                           (navigation as any).navigate('Main', { screen: 'Insights' });
                        }
                     });
                  }

                  // 5. Weekly Progress summary (dynamic)
                  if (recentHistory.length > 0) {
                     notificationsList.push({
                        id: 'notif-progress',
                        category: 'progress',
                        title: language === 'ar' ? 'تحديث التقدم الأسبوعي' : 'Weekly Progress Update',
                        body: language === 'ar' 
                           ? `لقد أكملت ${recentHistory.length} تمارين هذا الأسبوع. استمر في هذا الأداء الرائع!`
                           : `You have completed ${recentHistory.length} exercises this week. Keep up the excellent work!`,
                        timeGroup: 'this_week',
                        timeText: language === 'ar' ? 'هذا الأسبوع' : 'This Week',
                        actionText: language === 'ar' ? 'عرض التقدم' : 'View Progress',
                        onPress: () => {
                           setShowNotifications(false);
                           (navigation as any).navigate('Main', { screen: 'Insights' });
                        }
                     });
                  }

                  const todayNotifs = notificationsList.filter(n => n.timeGroup === 'today');
                  const yesterdayNotifs = notificationsList.filter(n => n.timeGroup === 'yesterday');
                  const thisWeekNotifs = notificationsList.filter(n => n.timeGroup === 'this_week');

                  const renderNotificationItem = (item: any) => {
                     const { bgColor, strokeColor, icon } = getCategoryIcon(item.category);
                     return (
                        <View key={item.id} style={{
                           backgroundColor: '#FFFFFF',
                           borderRadius: 16,
                           padding: 14,
                           marginBottom: 12,
                           borderWidth: 1,
                           borderColor: '#F1F5F9',
                           shadowColor: '#000',
                           shadowOffset: { width: 0, height: 1 },
                           shadowOpacity: 0.02,
                           shadowRadius: 4,
                           elevation: 1
                        }}>
                           <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                              <View style={[
                                 {
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: bgColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0'
                                 },
                                 isRTL ? { marginLeft: 12 } : { marginRight: 12 }
                              ]}>
                                 {icon}
                              </View>
                              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                 <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 9, fontWeight: '800', color: strokeColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                       {getCategoryLabel(item.category)}
                                    </Text>
                                 </View>
                                 <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', width: '100%', alignItems: 'baseline', marginBottom: 4 }}>
                                    <Text style={{ fontWeight: '700', fontSize: 13, color: '#1E293B', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                       {item.title}
                                    </Text>
                                    <Text style={{ color: '#94A3B8', fontSize: 9, fontWeight: '500' }}>
                                       {item.timeText}
                                    </Text>
                                 </View>
                                 <Text style={{ color: '#64748B', fontSize: 11, lineHeight: 16, textAlign: isRTL ? 'right' : 'left', marginBottom: 10 }}>
                                    {item.body}
                                 </Text>

                                 {/* Action button */}
                                 <TouchableOpacity
                                    style={{
                                       backgroundColor: colors.primary,
                                       paddingHorizontal: 12,
                                       paddingVertical: 6,
                                       borderRadius: 8,
                                       alignSelf: isRTL ? 'flex-start' : 'flex-end',
                                       flexDirection: isRTL ? 'row-reverse' : 'row',
                                       alignItems: 'center',
                                       gap: 4
                                    }}
                                    onPress={item.onPress}
                                 >
                                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                                       {item.actionText}
                                    </Text>
                                    <ArrowRightIcon color="#FFFFFF" size={10} />
                                 </TouchableOpacity>
                              </View>
                           </View>
                        </View>
                     );
                  };

                  return (
                     <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', marginTop: 10, flexGrow: 1, flexShrink: 1 }}>
                        {/* Compact Progress Summary Card */}
                        <View style={{
                           backgroundColor: '#EFF6FF',
                           borderRadius: 16,
                           padding: 14,
                           borderWidth: 1,
                           borderColor: '#DBEAFE',
                           marginBottom: 16
                        }}>
                           <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                 <Text style={{ fontSize: 11, color: '#1E40AF', fontWeight: '600' }}>
                                    {language === 'ar' ? 'نسبة إكمال المسار النفسي' : 'Wellness Journey Progress'}
                                 </Text>
                                 <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E3A8A', marginTop: 2 }}>
                                    {completionPercent}%
                                 </Text>
                              </View>
                              <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                 <Text style={{ fontSize: 10, fontWeight: '700', color: '#1E40AF' }}>
                                    {completedCount} / {totalCount || 1} {language === 'ar' ? 'تمارين' : 'Done'}
                                 </Text>
                              </View>
                           </View>

                           {/* Progress Bar */}
                           <View style={{ height: 5, backgroundColor: '#E2E8F0', borderRadius: 2.5, overflow: 'hidden', marginBottom: 10 }}>
                              <View style={{ width: `${completionPercent}%`, height: '100%', backgroundColor: colors.primary }} />
                           </View>

                           <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                                 <Text style={{ fontSize: 9, color: '#64748B' }}>
                                    {language === 'ar' ? 'التمرين الحالي:' : 'Current Exercise:'}
                                 </Text>
                                 <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155', marginTop: 1 }} numberOfLines={1}>
                                    {currentSuggested ? currentSuggested.name : (language === 'ar' ? 'اكتملت خارطة الطريق' : 'Journey Completed')}
                                 </Text>
                              </View>

                              <TouchableOpacity
                                 style={{
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 6,
                                    alignSelf: 'flex-end'
                                 }}
                                 onPress={() => {
                                    setShowNotifications(false);
                                    (navigation as any).navigate('Exercises', { openRoadmap: true });
                                 }}
                              >
                                 <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                                    {language === 'ar' ? 'عرض خارطة الطريق' : 'View Roadmap'}
                                 </Text>
                              </TouchableOpacity>
                           </View>
                        </View>

                        {notificationsList.length === 0 ? (
                           <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                              <BellIcon size={48} color="#94A3B8" />
                              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12, marginBottom: 4 }}>
                                 {language === 'ar' ? 'لا توجد إشعارات جديدة' : 'No New Notifications'}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 }}>
                                 {language === 'ar' ? 'سوف تظهر التذكيرات والأنشطة وتوصيات الذكاء الاصطناعي هنا.' : 'Your daily reminders, updates, and AI recommendations will appear here.'}
                              </Text>
                           </View>
                        ) : (
                           <>
                              {/* TODAY SECTION */}
                              {todayNotifs.length > 0 && (
                                 <View style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: isRTL ? 'right' : 'left' }}>
                                       {language === 'ar' ? 'اليوم' : 'Today'}
                                    </Text>
                                    {todayNotifs.map(renderNotificationItem)}
                                 </View>
                              )}

                              {/* YESTERDAY SECTION */}
                              {yesterdayNotifs.length > 0 && (
                                 <View style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: isRTL ? 'right' : 'left' }}>
                                       {language === 'ar' ? 'أمس' : 'Yesterday'}
                                    </Text>
                                    {yesterdayNotifs.map(renderNotificationItem)}
                                 </View>
                              )}

                              {/* THIS WEEK SECTION */}
                              {thisWeekNotifs.length > 0 && (
                                 <View style={{ marginBottom: 16 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: isRTL ? 'right' : 'left' }}>
                                       {language === 'ar' ? 'هذا الأسبوع' : 'This Week'}
                                    </Text>
                                    {thisWeekNotifs.map(renderNotificationItem)}
                                 </View>
                              )}
                           </>
                        )}
                     </ScrollView>
                  );
               })()}
            </View>
         </View>
      </Modal>

      <View ref={moodCardRef} collapsable={false}>
        <Card style={styles.moodCard}>
        <Text style={[styles.moodTitle, isRTL && { textAlign: 'right' }]}>{t.home.howAreYou}</Text>
        <View style={styles.moodEmojis}>
          {MOOD_ICONS.map((item, index) => {
            const MoodIconComponent = item.component;
            const isSelected = moodLevel === index + 1;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleEmojiPress(index + 1)}
                disabled={cooldownRemaining > 0}
                style={{
                  padding: 6,
                  opacity: cooldownRemaining > 0 ? 0.2 : (isSelected ? 1 : 0.4),
                  transform: [{ scale: isSelected ? 1.15 : 1.0 }],
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#F1F5F9' : 'transparent',
                  borderRadius: 20,
                  width: 44,
                  height: 44,
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: item.color
                }}
                accessibilityLabel={`Mood ${index + 1} of 5`}
              >
                <MoodIconComponent size={28} color={item.color} strokeWidth={isSelected ? 2.5 : 1.8} />
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sliderWrap}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>{t.home.low}</Text>
            <Text style={styles.sliderLabelText}>{t.home.high}</Text>
          </View>
          <View style={[styles.sliderTrack, { width: TRACK_WIDTH }]}>
            <View style={[styles.sliderFill, { width: `${fillWidth}%`, backgroundColor: cooldownRemaining > 0 ? '#CBD5E1' : colors.primary }]} />
            <View style={[styles.sliderThumb, { left: Math.max(0, thumbLeft), backgroundColor: cooldownRemaining > 0 ? '#E2E8F0' : colors.textLight, borderColor: cooldownRemaining > 0 ? '#94A3B8' : colors.primary }]} />
          </View>
          <Text style={[styles.moodLevelText, isRTL && { textAlign: 'right' }]}>{t.home.moodLevel}: {moodLevel}/5</Text>
        </View>
        <TouchableOpacity
          style={styles.needToSayTouch}
          onPress={() => setSaySomethingVisible(true)}
          accessibilityLabel="Need to say something?"
          disabled={cooldownRemaining > 0}
        >
          <Text style={[
            styles.needToSayText,
            isRTL && { textAlign: 'right' },
            cooldownRemaining > 0 && { color: '#94A3B8', textDecorationLine: 'none' }
          ]}>
            {t.home.needToSay}
          </Text>
        </TouchableOpacity>

        {cooldownRemaining > 0 && (
          <View style={[StyleSheet.absoluteFill, {
            backgroundColor: 'rgba(241, 245, 249, 0.9)',
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            padding: 20,
          }]}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}>
              <Circle cx="12" cy="12" r="10" stroke="#64748B" strokeWidth={2.5} />
              <Path d="M12 6v6l4 2" stroke="#64748B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: '#475569',
              marginBottom: 4,
              textAlign: 'center',
            }}>
              {t.home.moodLoggedSuccessfully}
            </Text>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#64748B',
              textAlign: 'center',
            }}>
              {t.home.moodCooldown}{formatCountdown(cooldownRemaining)}
            </Text>
          </View>
        )}
      </Card>
      </View>

      <View ref={recCardRef} collapsable={false} style={styles.recCard}>
        <View style={[styles.recHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={styles.recStarWrap}>
            <StarIcon color={colors.white} size={18} />
          </View>
          <Text style={[styles.recTitle, isRTL && { marginLeft: 0, marginRight: 10 }]}>{t.home.recommendedForYou}</Text>
        </View>
        
        {pendingQueue.length > 0 ? (
          <>
             <Text style={[typography.h3, { color: colors.white, marginTop: 4, marginBottom: 8, fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }]}>
               {pendingQueue[0].name}
             </Text>
             {pendingQueue.length > 1 && (
               <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 16, textAlign: isRTL ? 'right' : 'left' }}>
                 +{pendingQueue.length - 1} {t.home.moreWaiting}
               </Text>
             )}
          </>
        ) : (
          <Text style={[styles.recDesc, isRTL && { textAlign: 'right' }]}>
            {t.home.exploreLibrary}
          </Text>
        )}

        <TouchableOpacity
          style={styles.startExerciseBtn}
          onPress={() => {
            if (pendingQueue.length > 0) {
               (navigation as any).navigate('Exercises', { openSuggested: true });
            } else {
               (navigation as any).navigate('Exercises', { openSuggested: false });
            }
          }}
          activeOpacity={0.9}
          accessibilityLabel="Start exercise"
        >
          <Text style={styles.startExerciseText}>
            {pendingQueue.length > 0 ? `${t.home.startExercise} ${pendingQueue[0].name.slice(0, 15)}...` : t.home.seeCompleted}
          </Text>
          <ArrowRightIcon color={colors.white} size={16} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t.home.recentInsights}</Text>
      <View style={{ marginBottom: 20 }}>
          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Insights', { initialTab: 'Overview' })}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#E0E7FF' }]}>
                <InsightsIcon color="#4F46E5" size={20} />
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{t.home.moodAnalysis}</Text>
                <Text style={styles.activityMeta}>{t.home.moodAvgScore}: {stats.avgMood} • {t.home.trendingUp}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Insights', { initialTab: 'Trends' })}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <TrophyIcon color="#EF4444" size={20} />
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{t.home.exerciseActivity}</Text>
                <Text style={styles.activityMeta}>{stats.exercisesDone} {t.home.totalCompleted}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Main', { screen: 'Journal' })}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <JournalIcon color="#D97706" size={20} focused={true} />
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{language === 'ar' ? 'مذكراتي' : 'My Journal'}</Text>
                <Text style={styles.activityMeta}>{stats.journalCount} {language === 'ar' ? 'تدوينة' : 'entries'} • {language === 'ar' ? 'اكتب أفكارك' : 'Write your thoughts'}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Main', { screen: 'Chat' })}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <BrainIcon color="#0EA5E9" size={20} />
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{language === 'ar' ? 'محادثات الذكاء الاصطناعي' : 'AI Chat Sessions'}</Text>
                <Text style={styles.activityMeta}>{stats.chatCount} {language === 'ar' ? 'رسالة' : 'messages'} • {language === 'ar' ? 'تحدث مع منتورا' : 'Talk to Mentora'}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>
      </View>

      <Modal visible={saySomethingVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={closeSaySomething}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <View style={styles.modalCardHeader}>
                  <Text style={[styles.modalCardTitle, isRTL && { textAlign: 'right' }]}>{t.home.whatMadeYouFeel}</Text>
                  <TouchableOpacity onPress={closeSaySomething} style={styles.modalCloseBtn}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.modalInput, isRTL && { textAlign: 'right' }]}
                  placeholder={t.home.message}
                  placeholderTextColor={colors.textMuted}
                  value={moodMessage}
                  onChangeText={setMoodMessage}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity 
                  style={[styles.trackMoodBtn, isSubmittingMood && { opacity: 0.7 }]} 
                  onPress={trackMood} 
                  activeOpacity={0.9}
                  disabled={isSubmittingMood}
                >
                  {isSubmittingMood ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.trackMoodBtnText}>{t.home.trackMyMood}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Interactive In-App Tutorial Overlay */}
      {showTutorial && (
        <Modal transparent visible={showTutorial} animationType="fade">
          <View style={tStyles.tutorialOverlay}>
            {/* Highlight Indicator Ring */}
            {(() => {
              let targetStyle: any = {};
              if (tutorialStep === 0) {
                // Home Dashboard card
                if (moodCardLayout) {
                  targetStyle = { 
                    top: moodCardLayout.y - 6, 
                    left: moodCardLayout.x - 6, 
                    width: moodCardLayout.width + 12, 
                    height: moodCardLayout.height + 12 
                  };
                } else {
                  targetStyle = { top: insets.top + 70, left: 16, width: SCREEN_WIDTH - 32, height: 260 };
                }
              } else if (tutorialStep === 1) {
                // AI Chat Tab
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 11 : 11;
                targetStyle = { bottom: bottomVal, left: (SCREEN_WIDTH / 5) * 1 + (SCREEN_WIDTH / 5 - 50) / 2, width: 50, height: 50, borderRadius: 25 };
              } else if (tutorialStep === 2) {
                // Recommended Exercises Card
                if (recCardLayout) {
                  targetStyle = { 
                    top: recCardLayout.y - 6, 
                    left: recCardLayout.x - 6, 
                    width: recCardLayout.width + 12, 
                    height: recCardLayout.height + 12 
                  };
                } else {
                  targetStyle = { top: insets.top + 350, left: 16, width: SCREEN_WIDTH - 32, height: 165 };
                }
              } else if (tutorialStep === 3) {
                // Journal Tab
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 11 : 11;
                targetStyle = { bottom: bottomVal, left: (SCREEN_WIDTH / 5) * 2 + (SCREEN_WIDTH / 5 - 50) / 2, width: 50, height: 50, borderRadius: 25 };
              } else if (tutorialStep === 4) {
                // Insights Tab
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 11 : 11;
                targetStyle = { bottom: bottomVal, left: (SCREEN_WIDTH / 5) * 3 + (SCREEN_WIDTH / 5 - 50) / 2, width: 50, height: 50, borderRadius: 25 };
              } else if (tutorialStep === 5) {
                // Profile Tab
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 11 : 11;
                targetStyle = { bottom: bottomVal, left: (SCREEN_WIDTH / 5) * 4 + (SCREEN_WIDTH / 5 - 50) / 2, width: 50, height: 50, borderRadius: 25 };
              }
              return <View style={[tStyles.highlightRing, targetStyle]} />;
            })()}

            {/* Tooltip Card */}
            {(() => {
              let targetStyle: any = {};
              if (tutorialStep === 0) {
                const topVal = moodCardLayout ? (moodCardLayout.y + moodCardLayout.height + 16) : (insets.top + 340);
                targetStyle = { top: topVal, left: 24, right: 24 };
              } else if (tutorialStep === 1) {
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 70 : 70;
                targetStyle = { bottom: bottomVal, left: 24, right: 24 };
              } else if (tutorialStep === 2) {
                const topVal = recCardLayout ? (recCardLayout.y + recCardLayout.height + 16) : (insets.top + 530);
                targetStyle = { top: topVal, left: 24, right: 24 };
              } else if (tutorialStep === 3) {
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 70 : 70;
                targetStyle = { bottom: bottomVal, left: 24, right: 24 };
              } else if (tutorialStep === 4) {
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 70 : 70;
                targetStyle = { bottom: bottomVal, left: 24, right: 24 };
              } else if (tutorialStep === 5) {
                const bottomVal = Platform.OS === 'ios' ? insets.bottom + 70 : 70;
                targetStyle = { bottom: bottomVal, left: 24, right: 24 };
              }

              const steps = [
                {
                  title: language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Home Dashboard',
                  text: language === 'ar' 
                    ? 'هذه هي لوحة التحكم الرئيسية الخاصة بك. تتبع مزاجك اليومي وشاهد اتجاهاتك العاطفية في لمحة.'
                    : 'This is your main dashboard. Track your daily mood and see your emotional trends at a glance.',
                },
                {
                  title: language === 'ar' ? 'الدردشة مع المساعد الذكي' : 'Chat with AI Companion',
                  text: language === 'ar'
                    ? 'الدردشة الذكية. ابدأ محادثة في أي وقت للحصول على الدعم، التنفيس، وتلقي تمارين مخصصة.'
                    : 'Meet your AI Companion. Start a chat anytime to get support, vent, and receive personalized exercise recommendations.',
                },
                {
                  title: language === 'ar' ? 'التمارين الموصى بها' : 'Recommended Exercises',
                  text: language === 'ar'
                    ? 'التمارين المخصصة. أكمل التمارين المصممة خصيصاً لاحتياجاتك وتقدم في خارطة الطريق.'
                    : 'Personalized Exercises. Complete exercises tailored to your needs and advance through your roadmap.',
                },
                {
                  title: language === 'ar' ? 'دفتر يومياتك الخاص' : 'Private Journal',
                  text: language === 'ar'
                    ? 'دفتر يومياتك الخاص. سجل أفكارك، وعبر عن مشاعرك، ودع الذكاء الاصطناعي يحلل أنماطك العاطفية.'
                    : 'Private Journal. Record your thoughts, express your feelings, and let AI analyze your emotional patterns.',
                },
                {
                  title: language === 'ar' ? 'تحليلات الصحة النفسية' : 'Your Mental Wellness Insights',
                  text: language === 'ar'
                    ? 'تتبع أنماط مزاجك، تقدم التمارين، والاتجاهات العاطفية بمرور الوقت.'
                    : 'Track mood patterns, exercise progress, and emotional trends over time.',
                },
                {
                  title: language === 'ar' ? 'مساحتك الشخصية' : 'Your Personal Space',
                  text: language === 'ar'
                    ? 'إدارة معلوماتك، تفضيلاتك، وتتبع رحلة صحتك النفسية.'
                    : 'Manage your information, preferences, and track your wellness journey.',
                }
              ];

              const currentStepData = steps[tutorialStep];

              return (
                <View style={[tStyles.tooltipCard, targetStyle]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={tStyles.tooltipTitle}>{currentStepData.title}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 'bold' }}>{tutorialStep + 1} / 6</Text>
                  </View>
                  <Text style={tStyles.tooltipText}>{currentStepData.text}</Text>
                  <View style={tStyles.tooltipFooter}>
                    <TouchableOpacity style={tStyles.tooltipSkipBtn} onPress={handleSkipTutorial}>
                      <Text style={tStyles.tooltipSkipText}>{language === 'ar' ? 'تخطي الجولة' : 'Skip Tour'}</Text>
                    </TouchableOpacity>
                    <View style={tStyles.tooltipBtnRow}>
                      {tutorialStep > 0 && (
                        <TouchableOpacity style={tStyles.tooltipBackBtn} onPress={handlePrevStep}>
                          <Text style={tStyles.tooltipBackText}>{language === 'ar' ? 'السابق' : 'Back'}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={tStyles.tooltipNextBtn} onPress={handleNextStep}>
                        <Text style={tStyles.tooltipNextText}>
                          {tutorialStep === 5 
                            ? (language === 'ar' ? 'إنهاء' : 'Finish') 
                            : (language === 'ar' ? 'التالي' : 'Next')
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })()}
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const tStyles = StyleSheet.create({
  tutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    zIndex: 9999,
  },
  tooltipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    position: 'absolute',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  tooltipText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tooltipNextBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tooltipNextText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tooltipBackBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tooltipBackText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  tooltipSkipBtn: {
    paddingVertical: 10,
  },
  tooltipSkipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  highlightRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 16,
    borderStyle: 'dashed',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  }
});

export default HomeScreen;
