import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon } from '../components/Icons';

const HeartOutline = ({ color = '#FFFFFF' }) => (
  <Text style={{ color, fontSize: 24 }}>♡</Text>
);

const PlayIcon = () => (
  <Text style={{ fontSize: 16 }}>▶</Text>
);

export function BreathingExerciseScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      navigation.navigate('ExercisesList');
    }
    return () => clearTimeout(timer);
  }, [countdown, navigation]);

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
           
           <TouchableOpacity style={s.startNowBtn} onPress={() => setCountdown(10)}>
              <PlayIcon />
              <Text style={s.startNowText}>Start Now</Text>
           </TouchableOpacity>
        </View>

        {/* Overview section */}
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.overviewBox}>
           <Text style={s.overviewText}>
             A scientifically-proven breathing technique designed to calm your nervous system and reduce stress instantly. Used by athletes, military personnel, and wellness practitioners worldwide.
           </Text>
        </View>

        {/* How to Do It section */}
        <Text style={s.sectionTitle}>How to Do It</Text>

        <View style={s.stepBox}>
           <View style={s.stepNumberCircle}>
              <Text style={s.stepNumberText}>1</Text>
           </View>
           <View style={s.stepContent}>
              <View style={s.stepTitleRow}>
                 <Text style={s.stepTitle}>Get Comfortable</Text>
                 <Text style={s.stepDuration}>⏱ 30 sec</Text>
              </View>
              <Text style={s.stepDesc}>
                Sit or lie down in a comfortable position. Place one hand on your chest and the other on your belly.
              </Text>
           </View>
        </View>

        <View style={s.stepBox}>
           <View style={s.stepNumberCircle}>
              <Text style={s.stepNumberText}>2</Text>
           </View>
           <View style={s.stepContent}>
              <View style={s.stepTitleRow}>
                 <Text style={s.stepTitle}>Breathe In (4 counts)</Text>
                 <Text style={s.stepDuration}>⏱ 4 sec</Text>
              </View>
              <Text style={s.stepDesc}>
                Slowly inhale through your nose for 4 seconds. Feel your belly rise as you fill your lungs with air.
              </Text>
           </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Countdown Timer Overlay */}
      <Modal visible={countdown !== null} transparent animationType="fade">
         <View style={s.countdownOverlay}>
            <Text style={s.countdownText}>{countdown}</Text>
            <Text style={s.countdownSubText}>Prepare to breathe...</Text>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setCountdown(null)}>
               <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
         </View>
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
    paddingTop: 20,
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

  countdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 27, 34, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: { fontSize: 120, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  countdownSubText: { ...typography.h4, color: '#94A3B8', marginBottom: 60 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, backgroundColor: '#334155' },
  cancelText: { ...typography.body, color: '#FFFFFF', fontWeight: '600' },
});

export default BreathingExerciseScreen;
