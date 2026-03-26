import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, StarIcon } from '../components/Icons';

// Subcomponents for icons in the list to avoid bloating
const HeartOutline = ({ color = '#A0AEC0' }) => (
  <Text style={{ color, fontSize: 18 }}>♡</Text>
);
const HeartSolid = ({ color = '#EF4444' }) => (
  <Text style={{ color, fontSize: 18 }}>♥</Text>
);
const DownloadIcon = ({ color = '#10B981' }) => (
  <Text style={{ color, fontSize: 18 }}>📥</Text>
);
const SearchIcon = ({ color = '#A0AEC0' }) => (
  <Text style={{ color, fontSize: 16 }}>🔍</Text>
);
const ClockIcon = ({ color = '#A0AEC0' }) => (
  <Text style={{ color, fontSize: 12 }}>⏱</Text>
);

const CATEGORIES = ['All', 'Meditation', 'Breathing', 'Sleep'];

const TIPS = {
  All: { title: '🌿 General Wellness', points: ['Stay hydrated', 'Take short breaks', 'Breathe deeply', 'Be kind to yourself'] },
  Meditation: { title: '🧘 Meditation Tips', points: ['Find a quiet, comfortable space', 'Start with just 5 minutes daily', 'Focus on your breath', 'Be patient with yourself'] },
  Breathing: { title: '💨 Breathing Benefits', points: ['Reduces stress and anxiety', 'Improves focus and clarity', 'Lowers blood pressure', 'Enhances sleep quality'] },
  Sleep: { title: '😴 Better Sleep Habits', points: ['Stick to a consistent schedule', 'Avoid screens 1 hour before bed', 'Keep your bedroom cool and dark', 'Practice relaxation techniques'] }
};

const EXERCISES = [
  { id: '1', category: 'Meditation', title: '5-Minute Morning Meditation', desc: 'Start your day with clarity and calm', duration: '5 min', rating: '4.8', icon: '🧘‍♀️', iconBg: '#FCA5A5', actionType: 'heart_outline' },
  { id: '2', category: 'Meditation', title: 'Body Scan Meditation', desc: 'Release tension from head to toe', duration: '10 min', rating: '4.9', icon: '🧘', iconBg: '#93C5FD', actionType: 'heart_outline' },
  { id: '3', category: 'Meditation', title: 'Mindfulness for Anxiety', desc: 'Ground yourself in the present moment', duration: '8 min', rating: '4.7', icon: '🌿', iconBg: '#86EFAC', actionType: 'heart_outline' },
  { id: '4', category: 'Breathing', title: '5-Minute Morning...', desc: 'Start your day with clarity and calm', duration: '5 min', rating: '4.8', icon: '🎧', iconBg: '#1E293B', actionType: 'heart_solid' },
  { id: '5', category: 'Breathing', title: 'Box Breathing', desc: 'A powerful technique used by Navy SEALs', duration: '4 min', rating: '4.9', icon: '📦', iconBg: '#FCD34D', actionType: 'download' },
  { id: '6', category: 'Breathing', title: '4-7-8 Breathing', desc: 'Fall asleep faster with this relaxation technique', duration: '4 min', rating: '4.9', icon: '💨', iconBg: '#E2E8F0', actionType: 'heart_outline' },
  { id: '7', category: 'Sleep', title: 'Deep Sleep Meditation', desc: 'Drift into peaceful sleep naturally', duration: '15 min', rating: '4.9', icon: '😴', iconBg: '#FDE047', actionType: 'heart_outline' },
  { id: '8', category: 'Sleep', title: 'Sleep Stories', desc: 'Calming bedtime stories for adults', duration: '20 min', rating: '4.7', icon: '📖', iconBg: '#FCA5A5', actionType: 'heart_outline' },
  { id: '9', category: 'Sleep', title: 'Progressive Muscle Relaxation', desc: 'Release physical tension before sleep', duration: '12 min', rating: '4.8', icon: '💤', iconBg: '#86EFAC', actionType: 'heart_outline' },
];

export function ExercisesListScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const tipData = TIPS[activeTab as keyof typeof TIPS];
  const filteredExercises = EXERCISES.filter(ex => 
    (activeTab === 'All' || ex.category === activeTab) &&
    (ex.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.searchContainer}>
          <SearchIcon />
          <TextInput 
            style={s.searchInput}
            placeholder="Search..."
            placeholderTextColor="#A0AEC0"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={s.tabsContainer}>
        {CATEGORIES.map(cat => {
          const isActive = activeTab === cat;
          return (
            <TouchableOpacity 
              key={cat} 
              style={[s.tabPill, isActive && s.tabPillActive]}
              onPress={() => setActiveTab(cat)}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.tipsCard}>
        <Text style={s.tipsTitle}>{tipData.title}</Text>
        {tipData.points.map((pt, idx) => (
          <Text key={idx} style={s.tipsPoint}>• {pt}</Text>
        ))}
      </View>

      <View style={s.separator} />

      <ScrollView style={s.listContainer} showsVerticalScrollIndicator={false}>
        {filteredExercises.map(ex => (
          <TouchableOpacity 
            key={ex.id} 
            style={s.exerciseCard}
            onPress={() => navigation.navigate('BreathingExercise')}
          >
            <View style={s.cardLeft}>
              <View style={[s.iconBox, { backgroundColor: ex.iconBg }]}>
                 <Text style={s.iconText}>{ex.icon}</Text>
              </View>
              <View style={s.cardBody}>
                 <Text style={s.cardTitle}>{ex.title}</Text>
                 <Text style={s.cardDesc} numberOfLines={2}>{ex.desc}</Text>
                 
                 <View style={s.cardMetaRow}>
                    <ClockIcon />
                    <Text style={s.metaText}>{ex.duration}</Text>
                    <StarIcon size={12} color="#F59E0B" />
                    <Text style={[s.metaText, { color: '#F59E0B' }]}>{ex.rating}</Text>
                    <View style={s.categoryTag}>
                       <Text style={s.categoryTagText}>{ex.category}</Text>
                    </View>
                 </View>
              </View>
            </View>
            <View style={s.actionWrap}>
               {ex.actionType === 'heart_outline' && <HeartOutline />}
               {ex.actionType === 'heart_solid' && <HeartSolid />}
               {ex.actionType === 'download' && <DownloadIcon />}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop:50,
  },
  backBtn: { marginRight: 12, padding: 4 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, ...typography.bodySmall, color: colors.textPrimary },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabPillActive: { backgroundColor: '#161B22' },
  tabText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  tipsCard: {
    backgroundColor: '#2D3748',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipsTitle: { ...typography.body, fontWeight: '700', color: '#FCD34D', marginBottom: 8 },
  tipsPoint: { ...typography.caption, color: '#E2E8F0', marginBottom: 4 },
  separator: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 20, marginBottom: 16 },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  cardLeft: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  iconText: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.bodySmall, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardDesc: { ...typography.caption, color: colors.textSecondary, marginBottom: 10 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { ...typography.caption, color: colors.textSecondary, marginLeft: 4, marginRight: 12 },
  categoryTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  categoryTagText: { ...typography.caption, fontSize: 10, color: colors.textSecondary },
  actionWrap: { marginLeft: 12, padding: 4 },
});

export default ExercisesListScreen;
