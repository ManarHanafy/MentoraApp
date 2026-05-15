import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { colors, typography } from '../theme';
import { ChartTrendIcon, ClipboardIcon, LightningIcon, TargetIcon } from '../components/Icons';
import { CurrentExerciseCard } from '../components/CurrentExerciseCard';
import { Exercise, ExerciseService } from '../services/exerciseService';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config/env';
import { LineChart, BarChart } from 'react-native-chart-kit';

type TabType = 'Overview' | 'Trends' | 'Triggers' | 'Goals';

export function DashboardScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [suggestedExercise, setSuggestedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgMood: 0,
    checkIns: 0,
    streak: 0,
    totalExercises: 0
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<{labels: string[], data: number[]}>({ labels: [], data: [] });
  const [copingStats, setCopingStats] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [activeTab])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Suggested Exercise
      const suggested = await ExerciseService.getSuggestedExercises();
      if (suggested && suggested.length > 0) {
        setSuggestedExercise(suggested[0]);
      } else {
        const all = await ExerciseService.getAllExercises();
        if (all.length > 0) setSuggestedExercise(all[0]);
      }

      // 2. Load Mood Stats from API
      const token = await ExerciseService.getAuthToken();
      const trendRes = await fetch(`${API_BASE_URL}/Journals/trend?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (trendRes.ok) {
        const data = await trendRes.json();
        const stressTrend = data.find((t: any) => t.parameter === 'str');
        if (stressTrend && stressTrend.points.length > 0) {
           setTrendData(stressTrend.points);
           const avg = stressTrend.points.reduce((sum: number, p: any) => sum + p.value, 0) / stressTrend.points.length;
           const moodScore = ((20 - avg) / 4).toFixed(1);
           setStats(prev => ({
             ...prev,
             avgMood: parseFloat(moodScore),
             checkIns: stressTrend.points.length
           }));
        } else {
           setTrendData([]); // No data
        }
      }

      // 3. Load Real Activity from Completed Exercises
      const completed = await ExerciseService.getCompletedExercises();
      setStats(prev => ({
        ...prev,
        totalExercises: completed.length,
        streak: calculateStreak(completed)
      }));

      // Calculate Activity Bar Chart (last 5 days)
      const last5Days = Array.from({length: 5}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (4 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      const activityCounts = last5Days.map(day => {
        return completed.filter(ex => {
           const exDate = new Date(ex.completedAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short' });
           return exDate === day;
        }).length;
      });

      setActivityData({ labels: last5Days, data: activityCounts });

      // Calculate Top Coping Mechanisms
      const typeCounts: Record<string, number> = {};
      completed.forEach(ex => {
        const type = ex.exerciseType || 'General';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      const total = completed.length || 1;
      const coping = Object.entries(typeCounts)
        .map(([label, count]) => ({
           label,
           val: Math.round((count / total) * 100),
           color: label === 'Mindfulness' ? '#4F46E9' : label === 'CBT' ? '#10B981' : '#F59E0B'
        }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 3);
      
      setCopingStats(coping.length > 0 ? coping : [
        { label: 'Journaling', val: 0, color: colors.primary },
        { label: 'Exercises', val: 0, color: colors.success }
      ]);

    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completed: any[]) => {
    if (completed.length === 0) return 0;
    // Simple logic: count unique days in latest entries
    const days = new Set(completed.map(ex => new Date(ex.completedAt || Date.now()).toDateString()));
    return Math.min(days.size, 7); // For demo, cap at 7
  };

  const renderOverview = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.row}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Average Mood</Text>
          <Text style={s.cardValue}>{stats.avgMood || '0'}</Text>
          <Text style={s.cardSubValueGreen}>📈 Based on analysis</Text>
        </View>
        <View style={[s.card, { backgroundColor: '#EEF2FF' }]}>
          <Text style={s.cardTitle}>Exercises Done</Text>
          <Text style={s.cardValue}>{stats.totalExercises}</Text>
          <Text style={s.cardSubValue}>Total completed</Text>
        </View>
      </View>

      <View style={s.row}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Check-ins</Text>
          <Text style={s.cardValue}>{stats.checkIns}</Text>
          <Text style={s.cardSubValue}>Journals logged</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Current Streak</Text>
          <Text style={s.cardValue}>{stats.streak} Days</Text>
          <Text style={[s.cardSubValue, { color: colors.warning }]}>Keep it up! 🔥</Text>
        </View>
      </View>

      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>Mood Patterns (Stress Levels)</Text>
        {trendData.length > 0 ? (
          <LineChart
            data={{
              labels: trendData.slice(-5).map((_: any, i: number) => `E${i+1}`),
              datasets: [{ data: trendData.slice(-5).map((p: any) => p.value) }]
            }}
            width={Dimensions.get('window').width - 72}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -10 }}
          />
        ) : (
          <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ color: colors.textMuted }}>No mood data yet. Start journaling!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
       <View style={s.largeCard}>
         <Text style={s.largeCardTitle}>Activity Overview</Text>
         {activityData.data.some(v => v > 0) ? (
           <BarChart
              data={{
                labels: activityData.labels,
                datasets: [{ data: activityData.data }]
              }}
              width={Dimensions.get('window').width - 72}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              }}
              style={{ borderRadius: 16, marginVertical: 8 }}
            />
         ) : (
           <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted }}>No activity recorded this week.</Text>
           </View>
         )}
       </View>

       <View style={s.largeCard}>
          <Text style={s.largeCardTitle}>Top Coping Mechanisms</Text>
          {stats.totalExercises > 0 ? (
            copingStats.map((item, i) => (
              <View key={i} style={{ marginBottom: 16 }}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={s.timelineTitle}>{item.label}</Text>
                    <Text style={s.timelinePercent}>{item.val}% of activity</Text>
                 </View>
                 <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${item.val}%`, backgroundColor: item.color }]} />
                 </View>
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
               <Text style={{ color: colors.textMuted }}>Complete exercises to see your patterns.</Text>
            </View>
          )}
       </View>
    </ScrollView>
  );

  const renderTabs = () => {
    const tabs = [
      { id: 'Overview', icon: ChartTrendIcon },
      { id: 'Trends', icon: ClipboardIcon },
      { id: 'Triggers', icon: LightningIcon },
      { id: 'Goals', icon: TargetIcon },
    ] as const;

    return (
      <View style={s.tabContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tabButton, isActive && s.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={16} focused={isActive} color={isActive ? colors.white : colors.textPrimary} />
              <Text style={[s.tabText, isActive && s.tabTextActive]}>{tab.id}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        {renderTabs()}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Trends' && renderTrends()}
            {(activeTab === 'Triggers' || activeTab === 'Goals') && (
               <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                  <Text style={typography.h4}>Coming Soon</Text>
                  <Text style={[typography.body, { textAlign: 'center', color: colors.textMuted, marginTop: 10 }]}>
                    We're working on analyzing your {activeTab.toLowerCase()} based on your activity.
                  </Text>
               </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabButtonActive: { backgroundColor: colors.primary },
  tabText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: { color: colors.white },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: 8 },
  cardValue: { ...typography.h2, color: colors.textPrimary, marginBottom: 4 },
  cardSubValue: { ...typography.caption, color: colors.textMuted },
  cardSubValueGreen: { ...typography.caption, color: colors.success },
  largeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  largeCardTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 10 },
  timelineTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  timelinePercent: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
});

export default DashboardScreen;
