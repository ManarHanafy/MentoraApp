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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components';
import { BellIcon, StarIcon, ArrowRightIcon } from '../components/Icons';
import { colors, typography } from '../theme';
import { styles } from './HomeScreen.style';
import { ExerciseService } from '../services/exerciseService';
import { MoodService } from '../services/moodService';
import { ChatService } from '../services/chatService';
import { ActivityIndicator, Alert } from 'react-native';
import { API_BASE_URL } from '../config/env';

// Sad -> Happy
const MOOD_EMOJIS = ['😔', '😐', '🙂', '😊', '🤩'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2 - 32;

// Greeting is now done inside the component using translation keys

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { userName } = useAuth();
  const { t, isRTL } = useLanguage();
  const [moodLevel, setMoodLevel] = useState(3);
  const [saySomethingVisible, setSaySomethingVisible] = useState(false);
  const [moodMessage, setMoodMessage] = useState('');

  // Queue State
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);
  const [stats, setStats] = useState({ avgMood: '3.8', exercisesDone: '0', streak: '0' });

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

      // Poll every 15s for the session-complete flag set by ChatScreen.finalizeChat
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
              'Session Complete 🌿',
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
              'Session Ended 🌿',
              'Your conversation session has been completed and summarized.',
              [{ text: 'OK' }]
            );
          }
        }
      }, 15000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }, [])
  );

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

      setStats({
        avgMood: moodScore,
        exercisesDone: completed.length.toString(),
        streak: completed.length > 0 ? Math.min(completed.length, 7).toString() : '0'
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
      style={styles.container}
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
            <View style={[styles.modalCard, { maxHeight: '80%', padding: 20 }]}>
               <View style={styles.modalCardHeader}>
                  <Text style={styles.modalCardTitle}>{t.home.pendingExercises} ({pendingQueue.length})</Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowNotifications(false)}>
                     <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
               </View>
               {pendingQueue.length === 0 ? (
                  <Text style={{color: colors.textMuted, textAlign: 'center', marginTop: 20}}>{t.home.noPending}</Text>
               ) : (
                  <FlatList 
                     data={pendingQueue}
                     keyExtractor={(item) => (item.queueId || item.id) + Math.random().toString()}
                     renderItem={({item}) => (
                        <TouchableOpacity 
                           style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', alignItems: 'center'}}
                           onPress={() => {
                              setShowNotifications(false);
                              (navigation as any).navigate('Exercises', { openSuggested: true, exerciseToStart: item });
                           }}
                        >
                           <Text style={{fontSize: 24, marginRight: 15}}>🧠</Text>
                           <View style={{flex: 1}}>
                              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#333'}}>{item.name}</Text>
                              <Text style={{color: '#666', fontSize: 12}} numberOfLines={1}>{item.description}</Text>
                           </View>
                           <ArrowRightIcon color="#999" size={16} />
                        </TouchableOpacity>
                     )}
                  />
               )}
            </View>
         </View>
      </Modal>

      <Card style={styles.moodCard}>
        <Text style={[styles.moodTitle, isRTL && { textAlign: 'right' }]}>{t.home.howAreYou}</Text>
        <View style={styles.moodEmojis}>
          {MOOD_EMOJIS.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleEmojiPress(index + 1)}
              style={{ padding: 4, opacity: moodLevel === index + 1 ? 1 : 0.4 }}
              accessibilityLabel={`Mood ${index + 1} of 5`}
            >
              <Text style={[styles.moodEmoji, { transform: [{ scale: moodLevel === index + 1 ? 1.2 : 1 }] }]}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sliderWrap}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>{t.home.low}</Text>
            <Text style={styles.sliderLabelText}>{t.home.high}</Text>
          </View>
          <View style={[styles.sliderTrack, { width: TRACK_WIDTH }]}>
            <View style={[styles.sliderFill, { width: `${fillWidth}%` }]} />
            <View style={[styles.sliderThumb, { left: Math.max(0, thumbLeft) }]} />
          </View>
          <Text style={[styles.moodLevelText, isRTL && { textAlign: 'right' }]}>{t.home.moodLevel}: {moodLevel}/5</Text>
        </View>
        <TouchableOpacity
          style={styles.needToSayTouch}
          onPress={() => setSaySomethingVisible(true)}
          accessibilityLabel="Need to say something?"
        >
          <Text style={[styles.needToSayText, isRTL && { textAlign: 'right' }]}>{t.home.needToSay}</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.recCard}>
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
            onPress={() => (navigation as any).navigate('Insights')}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#E0E7FF' }]}>
                <Text style={styles.activityIcon}>📈</Text>
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{t.home.moodAnalysis}</Text>
                <Text style={styles.activityMeta}>{t.home.moodAvgScore}: {stats.avgMood} • {t.home.trendingUp}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Insights')}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.activityIcon}>🏆</Text>
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{t.home.exerciseActivity}</Text>
                <Text style={styles.activityMeta}>{stats.exercisesDone} {t.home.totalCompleted}</Text>
             </View>
             <ArrowRightIcon color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.activityCard, isRTL && { flexDirection: 'row-reverse' }]}
            onPress={() => (navigation as any).navigate('Insights')}
          >
             <View style={[styles.activityIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.activityIcon}>🔥</Text>
             </View>
             <View style={[styles.activityContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.activityTitle}>{t.home.personalStreak}</Text>
                <Text style={styles.activityMeta}>{stats.streak} {t.home.dayRecord} • {t.home.keepGoing}</Text>
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
    </ScrollView>
  );
}

export default HomeScreen;
