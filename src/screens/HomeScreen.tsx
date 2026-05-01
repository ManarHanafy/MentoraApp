import React, { useState, useEffect } from 'react';
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components';
import { BellIcon, StarIcon, ArrowRightIcon } from '../components/Icons';
import { colors, typography } from '../theme';
import { styles } from './HomeScreen.style';
import { ExerciseService } from '../services/exerciseService';

// Sad -> Happy
const MOOD_EMOJIS = ['😔', '😐', '🙂', '😊', '🤩'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2 - 32;

function getTimeBasedGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { userName } = useAuth();
  const [moodLevel, setMoodLevel] = useState(3);
  const [saySomethingVisible, setSaySomethingVisible] = useState(false);
  const [moodMessage, setMoodMessage] = useState('');

  // Queue State
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = userName || 'Friend';
  const greeting = getTimeBasedGreeting();

  useEffect(() => {
    if (isFocused) {
       loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const completed = await ExerciseService.getCompletedExercises();
      setRecentHistory(completed.reverse());
      
      const suggestedRes = await ExerciseService.getSuggestedExercises();
      setPendingQueue(suggestedRes || []);
    } catch(e) {}
  };

  const closeSaySomething = (): void => {
    setSaySomethingVisible(false);
    setMoodMessage('');
  };

  const trackMood = (): void => {
    navigation.navigate('Journal' as never);
    closeSaySomething();
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
                  <Text style={styles.modalCardTitle}>Pending Exercises ({pendingQueue.length})</Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowNotifications(false)}>
                     <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
               </View>
               {pendingQueue.length === 0 ? (
                  <Text style={{color: colors.textMuted, textAlign: 'center', marginTop: 20}}>No pending exercises. You're all caught up!</Text>
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
        <Text style={styles.moodTitle}>How are you feeling?</Text>
        <View style={styles.moodEmojis}>
          {MOOD_EMOJIS.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setMoodLevel(index + 1)}
              style={{ padding: 4, opacity: moodLevel === index + 1 ? 1 : 0.4 }}
              accessibilityLabel={`Mood ${index + 1} of 5`}
            >
              <Text style={[styles.moodEmoji, { transform: [{ scale: moodLevel === index + 1 ? 1.2 : 1 }] }]}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sliderWrap}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Low</Text>
            <Text style={styles.sliderLabelText}>High</Text>
          </View>
          <View style={[styles.sliderTrack, { width: TRACK_WIDTH }]}>
            <View style={[styles.sliderFill, { width: `${fillWidth}%` }]} />
            <View style={[styles.sliderThumb, { left: Math.max(0, thumbLeft) }]} />
          </View>
          <Text style={styles.moodLevelText}>Mood Level: {moodLevel}/5</Text>
        </View>
        <TouchableOpacity
          style={styles.needToSayTouch}
          onPress={() => setSaySomethingVisible(true)}
          accessibilityLabel="Need to say something?"
        >
          <Text style={styles.needToSayText}>Need to say something?</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.recCard}>
        <View style={styles.recHeader}>
          <View style={styles.recStarWrap}>
            <StarIcon color={colors.white} size={18} />
          </View>
          <Text style={styles.recTitle}>Recommended for you</Text>
        </View>
        
        {pendingQueue.length > 0 ? (
          <>
             <Text style={[typography.h3, { color: colors.white, marginTop: 4, marginBottom: 8, fontWeight: 'bold' }]}>
               {pendingQueue[0].name}
             </Text>
             {pendingQueue.length > 1 && (
               <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 16 }}>
                 +{pendingQueue.length - 1} more waiting for you
               </Text>
             )}
          </>
        ) : (
          <Text style={styles.recDesc}>
            Explore our exercise library and track your daily progress.
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
            {pendingQueue.length > 0 ? `Start ${pendingQueue[0].name.slice(0, 15)}...` : 'See completed exercises'}
          </Text>
          <ArrowRightIcon color={colors.white} size={16} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentHistory.length > 0 ? (
          recentHistory.slice(0, 5).map((ex) => (
            <TouchableOpacity 
              key={ex.id + Math.random().toString()} 
              style={styles.activityCard} 
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate('Exercises', { openSuggested: false })}
            >
              <View style={[styles.activityIconWrap, {backgroundColor: '#FED7AA'}]}>
                <Text style={styles.activityIcon}>✅</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{ex.name}</Text>
                <Text style={styles.activityMeta}>{ex.durationMinutes || 5} min • {ex.exerciseType || 'Exercise'}</Text>
              </View>
              <ArrowRightIcon color={colors.textMuted} size={18} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.activityCard}>
            <Text style={{ color: colors.textMuted, padding: 10 }}>No recent activities yet.</Text>
          </View>
      )}

      <Modal visible={saySomethingVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={closeSaySomething}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalCard}>
                <View style={styles.modalCardHeader}>
                  <Text style={styles.modalCardTitle}>What made you feel this way?</Text>
                  <TouchableOpacity onPress={closeSaySomething} style={styles.modalCloseBtn}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Message"
                  placeholderTextColor={colors.textMuted}
                  value={moodMessage}
                  onChangeText={setMoodMessage}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.trackMoodBtn} onPress={trackMood} activeOpacity={0.9}>
                  <Text style={styles.trackMoodBtnText}>Track My Mood</Text>
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
