import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components';
import { BellIcon, StarIcon, ArrowRightIcon } from '../components/Icons';
import { colors } from '../theme';
import { styles } from './HomeScreen.style';

// Sad -> Happy
const MOOD_EMOJIS = ['😔', '😐', '🙂', '😊', '🤩'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_PADDING = 24;
const TRACK_WIDTH = SCREEN_WIDTH - TRACK_PADDING * 2 - 32;

const RECENT_ACTIVITIES = [
  { id: '1', title: 'Work Stress', meta: '08:00 AM • Journal', icon: '📄', iconBg: 'orange' },
  { id: '2', title: 'Breathing Exercise', meta: 'Yesterday • Mindfulness', icon: '🧘', iconBg: 'orange' },
  { id: '3', title: 'Anxiety Inquiry', meta: '15 Jan 26 • Chat', icon: '💬', iconBg: 'blue' },
];

function getTimeBasedGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation();
  // const { userName } = useAuth();
  const [moodLevel, setMoodLevel] = useState(3);
  const [saySomethingVisible, setSaySomethingVisible] = useState(false);
  const [moodMessage, setMoodMessage] = useState('');

  const displayName = 'Manar';
  const greeting = getTimeBasedGreeting();

  const closeSaySomething = (): void => {
    setSaySomethingVisible(false);
    setMoodMessage('');
  };

  const trackMood = (): void => {
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
        <TouchableOpacity style={styles.bellBtn} accessibilityLabel="Notifications">
          <BellIcon color={colors.textPrimary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Daily Quote */}

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
        <Text style={styles.recDesc}>Try a 3-minute breathing exercise to calm your mind.</Text>
        <TouchableOpacity
          style={styles.startExerciseBtn}
          onPress={() => navigation.navigate('BreathingExercise' as never)}
          activeOpacity={0.9}
          accessibilityLabel="Start exercise"
        >
          <Text style={styles.startExerciseText}>Start exercise</Text>
          <ArrowRightIcon color={colors.white} size={16} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {RECENT_ACTIVITIES.map((item) => (
        <TouchableOpacity key={item.id} style={styles.activityCard} activeOpacity={0.8}>
          <View style={[styles.activityIconWrap, item.iconBg === 'blue' ? styles.activityIconWrapBlue : styles.activityIconWrapOrange]}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityMeta}>{item.meta}</Text>
          </View>
          <ArrowRightIcon color={colors.textMuted} size={18} />
        </TouchableOpacity>
      ))}

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
