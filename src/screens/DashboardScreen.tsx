import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography } from '../theme';
import { Exercise, ExerciseService } from '../services/exerciseService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/env';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'Overview' | 'Trends' | 'Triggers' | 'Goals';

const CustomBarChart = ({ labels, data, maxVal = 5 }: { labels: string[], data: number[], maxVal?: number }) => {
  return (
    <View style={{ flexDirection: 'row', height: 160, paddingHorizontal: 10, alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 }}>
      {/* Y-axis labels and lines */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 20, justifyContent: 'space-between', zIndex: 0 }}>
        {[maxVal, Math.round(maxVal / 2), 0].map((val, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, maxHeight: 1 }}>
            <Text style={{ width: 14, fontSize: 10, color: '#94A3B8', textAlign: 'right', marginRight: 8 }}>{val}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
          </View>
        ))}
      </View>

      {/* Bars */}
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', paddingLeft: 22, zIndex: 1, paddingBottom: 20 }}>
        {data.map((val, idx) => {
          const heightPercent = Math.min((val / maxVal) * 100, 100);
          const isDark = idx % 2 === 0 || val > 3.8;
          return (
            <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                height: `${heightPercent}%`,
                width: 14,
                backgroundColor: isDark ? '#1E293B' : '#CBD5E1',
                borderRadius: 7,
                marginBottom: 6
              }} />
              <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', position: 'absolute', bottom: -20 }}>{labels[idx]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export function DashboardScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
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
  
  // New dashboard feature states
  const [journalTags, setJournalTags] = useState<any[]>([]);
  const [hasJournals, setHasJournals] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  const [goalsList, setGoalsList] = useState<any[]>([]);
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

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
      setCompletedExercises(completed);
      
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

      // 4. Load Journal Tags for Triggers tab
      const email = await AsyncStorage.getItem('@mentora_user_email');
      const journalKey = email ? `@mentora_journal_entries_${email.trim().toLowerCase()}` : '@mentora_journal_entries';
      const journalStored = await AsyncStorage.getItem(journalKey);
      let journalEntries = journalStored ? JSON.parse(journalStored) : [];
      
      const tagCounts: Record<string, number> = {};
      let totalTagCount = 0;
      
      journalEntries.forEach((entry: any) => {
        if (entry.tags && Array.isArray(entry.tags)) {
          entry.tags.forEach((tag: string) => {
            const cleanTag = tag.trim();
            if (cleanTag) {
              tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
              totalTagCount += 1;
            }
          });
        }
      });

      const colorsList = ['#6366F1', '#38BDF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];
      const parsedTags = Object.entries(tagCounts).map(([tag, count], index) => {
        return {
          tag,
          percentage: Math.round((count / (totalTagCount || 1)) * 100),
          count,
          color: colorsList[index % colorsList.length]
        };
      }).sort((a, b) => b.count - a.count);

      setJournalTags(parsedTags);
      setHasJournals(journalEntries.length > 0);

      // 5. Calculate Goals
      const goalMap: Record<string, { completed: number; target: number; name: string }> = {
        'Breathing': { completed: 0, target: 5, name: 'Deep Breathing Practice' },
        'CBT': { completed: 0, target: 3, name: 'CBT Daily Exercises' },
        'Mindfulness': { completed: 0, target: 3, name: 'Mindfulness Sessions' },
        'Relaxation': { completed: 0, target: 4, name: 'Relaxation Practices' }
      };

      completed.forEach(ex => {
        const type = ex.exerciseType || 'General';
        if (goalMap[type]) {
          goalMap[type].completed += 1;
        }
      });

      const goals = Object.entries(goalMap).map(([type, value]) => ({
        type,
        name: value.name,
        completed: value.completed,
        target: value.target,
        percentage: Math.min(Math.round((value.completed / value.target) * 100), 100)
      }));

      setGoalsList(goals);

    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completed: any[]) => {
    if (completed.length === 0) return 0;
    const days = new Set(completed.map(ex => new Date(ex.completedAt || Date.now()).toDateString()));
    return Math.min(days.size, 7);
  };

  const translateType = (type: string) => {
    if (language !== 'ar') return type;
    const m: Record<string, string> = {
      'Breathing': 'تنفس عميق',
      'CBT': 'علاج سلوكي معرفي',
      'Mindfulness': 'يقظة ذهنية',
      'Relaxation': 'استرخاء',
      'Sleep': 'نوم',
      'Exercise': 'تمارين جسدية',
      'General': 'عام'
    };
    return m[type] || type;
  };

  const renderOverview = () => {
    const chartLabels = activityData.labels.length > 0 ? activityData.labels : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const translatedChartLabels = chartLabels.map(l => {
      if (language !== 'ar') return l;
      const m: Record<string, string> = {
        Mon: 'إثن', Tue: 'ثلا', Wed: 'أرب', Thu: 'خمي', Fri: 'جمع', Sat: 'سبت', Sun: 'أحد',
        M: 'إثن', T: 'ثلا', W: 'أرب', Th: 'خمي', F: 'جمع', S: 'سبت', Su: 'أحد'
      };
      return m[l] || l;
    });

    const chartData  = activityData.data.length  > 0 ? activityData.data  : [0,0,0,0,0,0,0];
    const maxVal     = Math.max(...chartData, 1);
    const bestDayIdx = chartData.indexOf(Math.max(...chartData));
    const bestDay    = chartData[bestDayIdx] > 0 ? translatedChartLabels[bestDayIdx] : '—';
    const hasActivity = completedExercises.length > 0 || stats.checkIns > 0;

    return (
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={[s.row, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={s.card}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{t.insights.avgMood}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{stats.avgMood > 0 ? stats.avgMood : hasActivity ? '—' : '—'}</Text>
            <Text style={[s.cardSubValueGreen, isRTL && { textAlign: 'right' }]}>
              {stats.avgMood > 0 ? (language === 'ar' ? '📈 بناءً على اليوميات' : '📈 Based on journals') : (language === 'ar' ? 'ابدأ كتابة اليوميات!' : 'Start journaling!')}
            </Text>
          </View>
          <View style={s.card}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{t.insights.checkIns}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{stats.checkIns}</Text>
            <Text style={[s.cardSubValue, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'يوميات مكتوبة' : 'Journal entries'}</Text>
          </View>
        </View>

        <View style={[s.row, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={s.card}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'أفضل يوم' : 'Best Day'}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{bestDay}</Text>
            <Text style={[s.cardSubValue, isRTL && { textAlign: 'right' }]}>
              {chartData[bestDayIdx] > 0 ? (language === 'ar' ? `${chartData[bestDayIdx]} تمارين` : `${chartData[bestDayIdx]} exercises`) : (language === 'ar' ? 'لا توجد بيانات' : 'No data yet')}
            </Text>
          </View>
          <View style={s.card}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{t.insights.streak}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{stats.streak > 0 ? `${stats.streak} ${language === 'ar' ? 'أيام' : 'days'}` : `0 ${language === 'ar' ? 'أيام' : 'days'}`}</Text>
            <Text style={[s.cardSubValue, isRTL && { textAlign: 'right' }, { color: stats.streak > 0 ? '#D97706' : '#94A3B8' }]}>
              {stats.streak > 0 ? (language === 'ar' ? 'استمر! 🔥' : 'Keep it up! 🔥') : (language === 'ar' ? 'ابدأ اليوم!' : 'Start today!')}
            </Text>
          </View>
        </View>

        <View style={s.largeCard}>
          <Text style={[s.largeCardTitle, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</Text>
          {chartData.some(v => v > 0)
            ? <CustomBarChart labels={translatedChartLabels} data={chartData} maxVal={maxVal} />
            : <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
                <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>{language === 'ar' ? 'أكمل التمارين لرؤية مخططك الأسبوعي' : 'Complete exercises to see your weekly chart'}</Text>
              </View>
          }
        </View>
      </ScrollView>
    );
  };

  const typeEmoji = (type: string) => {
    const m: Record<string,string> = { Breathing:'🌬️', CBT:'🧠', Mindfulness:'🧘', Relaxation:'🛁', Sleep:'😴', Exercise:'💪', General:'⚡' };
    return m[type] || '⚡';
  };

  const renderTrends = () => {
    const trendLabels = activityData.labels.length > 0 ? activityData.labels : ['w1','w2','w3','w4'];
    const translatedTrendLabels = trendLabels.map(l => {
      if (language !== 'ar') return l;
      const m: Record<string, string> = {
        Mon: 'إثن', Tue: 'ثلا', Wed: 'أرب', Thu: 'خمي', Fri: 'جمع', Sat: 'سبت', Sun: 'أحد',
        M: 'إثن', T: 'ثلا', W: 'أرب', Th: 'خمي', F: 'جمع', S: 'سبت', Su: 'أحد'
      };
      return m[l] || l;
    });

    const trendVals   = activityData.data.length   > 0 ? activityData.data   : [0,0,0,0];
    const trendMax    = Math.max(...trendVals, 1);

    const typeCounts: Record<string, number> = {};
    completedExercises.forEach((ex: any) => {
      const t = ex.exerciseType || 'General';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const total = completedExercises.length || 1;
    const helps = Object.entries(typeCounts)
      .map(([type, count]) => ({
        emoji: typeEmoji(type),
        name: translateType(type),
        feedback: language === 'ar' ? `تم إكمال ${count} جلسات` : `${count} session${count > 1 ? 's' : ''} completed`,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);

    const hasHelps = helps.length > 0;

    return (
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.largeCard}>
          <Text style={[s.largeCardTitle, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'نشاط التمارين' : 'Exercise Activity'}</Text>
          {trendVals.some(v => v > 0)
            ? <CustomBarChart labels={translatedTrendLabels} data={trendVals} maxVal={trendMax} />
            : <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 13 }}>{language === 'ar' ? 'لم يتم تسجيل أي نشاط بعد' : 'No activity recorded yet'}</Text>
              </View>
          }
        </View>

        <Text style={[s.largeCardTitle, { marginTop: 10, marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>
          {language === 'ar' ? 'ما يساعدك أكثر' : 'What Helps You Most'}
        </Text>

        {hasHelps ? (
          <View style={{ paddingLeft: isRTL ? 0 : 10, paddingRight: isRTL ? 10 : 0, position: 'relative' }}>
            <View style={{ position: 'absolute', left: isRTL ? undefined : 24, right: isRTL ? 24 : undefined, top: 20, bottom: 40, width: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', zIndex: 0 }} />
            {helps.map((item, idx) => (
              <View key={idx} style={[{ flexDirection: 'row', marginBottom: 20, alignItems: 'center', zIndex: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' }, isRTL ? { marginLeft: 16 } : { marginRight: 16 }]}>
                  <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 }}>
                  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{item.name}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{item.feedback}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>{item.percentage}%</Text>
                  </View>
                  <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${item.percentage}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🌿</Text>
            <Text style={{ fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>{language === 'ar' ? 'لا توجد بيانات بعد' : 'No data yet'}</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13, paddingHorizontal: 12 }}>
              {language === 'ar' ? 'أكمل التمارين لترى أيها يساعدك أكثر.' : 'Complete exercises to see which ones help you the most.'}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const copingTip = (tag: string): { emoji: string; desc: string } => {
    const lower = tag.toLowerCase();
    if (lower.includes('stress') || lower.includes('work')) return { emoji: '🌬️', desc: language === 'ar' ? 'خذ فترات راحة للتنفس لمدة 5 دقائق كل ساعتين' : 'Try 5-minute breathing breaks every 2 hours' };
    if (lower.includes('sleep'))                            return { emoji: '🌙', desc: language === 'ar' ? 'روتين الاسترخاء قبل النوم بساعة' : 'Wind down routine 1 hour before bed' };
    if (lower.includes('anxi') || lower.includes('worry')) return { emoji: '🪴', desc: language === 'ar' ? 'تقنيات التثبيت وكتابة اليوميات' : 'Grounding techniques and journaling' };
    if (lower.includes('sad') || lower.includes('depress'))return { emoji: '👥', desc: language === 'ar' ? 'تواصل مع صديق مقرب أو فرد من العائلة' : 'Reach out to a trusted friend or family member' };
    return { emoji: '🧘', desc: language === 'ar' ? 'تمارين اليقظة والتنفس العميق' : 'Mindfulness and deep breathing exercises' };
  };

  const renderTriggers = () => {
    const hasTags = journalTags.length > 0;
    const topTags = journalTags.slice(0, 3);
    
    const translateTag = (tag: string) => {
      if (language !== 'ar') return tag;
      const m: Record<string, string> = {
        'stress': 'الضغط العصبي',
        'work': 'العمل',
        'sleep': 'النوم',
        'anxiety': 'القلق',
        'worry': 'الهموم',
        'sad': 'الحزن',
        'depress': 'الاكتئاب'
      };
      const found = Object.entries(m).find(([k, v]) => tag.toLowerCase().includes(k));
      return found ? found[1] : tag;
    };

    const getExerciseCode = (tag: string): string => {
      const lower = tag.toLowerCase();
      if (lower.includes('stress') || lower.includes('work')) return 'Routine_Breaks';
      if (lower.includes('sleep'))                            return 'Daily_Wind_Down_Routine';
      if (lower.includes('anxi') || lower.includes('worry')) return '5_Senses_Grounding';
      if (lower.includes('sad') || lower.includes('depress'))return 'Behavioral_Activation_Plan';
      return 'Simple_Breathing_1xDay';
    };

    const strategies = topTags.map(t => ({
      emoji: copingTip(t.tag).emoji,
      title: language === 'ar' ? `لـ ${translateTag(t.tag)}` : `For ${t.tag}`,
      desc: copingTip(t.tag).desc,
      exerciseCode: getExerciseCode(t.tag)
    }));

    return (
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.largeCardTitle, { marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>
          {language === 'ar' ? 'المحفزات الشائعة' : 'Common Triggers'}
        </Text>

        {hasTags ? journalTags.slice(0, 5).map((item: any, idx: number) => (
          <View key={idx} style={[s.card, { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 16, borderRadius: 18, marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }, isRTL ? { marginLeft: 14 } : { marginRight: 14 }]}>
              <Text style={{ fontSize: 22 }}>{copingTip(item.tag).emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{translateTag(item.tag)}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B' }}>{item.percentage}%</Text>
              </View>
              <Text style={[{ fontSize: 12, color: '#64748B', marginBottom: 8 }, isRTL && { textAlign: 'right' }]}>
                {language === 'ar' ? `تكرر ${item.count} مرات هذا الشهر` : `${item.count} time${item.count !== 1 ? 's' : ''} this month`}
              </Text>
              <View style={[s.progressBarBg, { height: 6, backgroundColor: '#E2E8F0' }]}>
                <View style={[s.progressBarFill, { width: `${item.percentage}%`, backgroundColor: '#1E293B' }]} />
              </View>
            </View>
          </View>
        )) : (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>⚡</Text>
            <Text style={{ fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>{language === 'ar' ? 'لم يتم رصد أي محفزات بعد' : 'No triggers detected yet'}</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13 }}>
              {language === 'ar' ? 'اكتب يومياتك وسيقوم الذكاء الاصطناعي برصد محفزاتك العاطفية هنا تلقائياً.' : 'Write journal entries and the AI will automatically detect your emotional triggers here.'}
            </Text>
          </View>
        )}

        {strategies.length > 0 && (
          <View style={{ backgroundColor: '#1E293B', borderRadius: 24, padding: 20, marginTop: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
            <Text style={[{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>
              {language === 'ar' ? 'آليات التعامل الموصى بها (اضغط لبدء التمرين)' : 'Recommended Coping Strategies (Tap to Start)'}
            </Text>
            {strategies.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'center' }, isRTL && { flexDirection: 'row-reverse' }]}
                activeOpacity={0.8}
                onPress={() => {
                  const details = ExerciseService.getExerciseDetailsByCode(item.exerciseCode);
                  navigation.navigate('Exercises', {
                    openSuggested: true,
                    exerciseToStart: {
                      id: item.exerciseCode,
                      exerciseCode: item.exerciseCode,
                      name: details.name || item.title,
                      description: details.description || item.desc,
                      ...details
                    }
                  });
                }}
              >
                <View style={[{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }, isRTL ? { marginLeft: 12 } : { marginRight: 12 }]}>
                  <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                </View>
                <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{item.title}</Text>
                  <Text style={[{ fontSize: 11, color: '#64748B', marginTop: 2 }, isRTL && { textAlign: 'right' }]} numberOfLines={2}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderGoals = () => {
    const goalsCompleted = goalsList.filter((g: any) => g.percentage >= 100).length;
    const hasGoals = goalsList.length > 0;

    return (
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.largeCardTitle, { marginBottom: 16 }, isRTL && { textAlign: 'right' }]}>
          {language === 'ar' ? 'الأهداف النشطة' : 'Active Goals'}
        </Text>

        {hasGoals ? goalsList.map((item: any, idx: number) => {
          const transGoalName = (name: string) => {
            if (language !== 'ar') return name;
            const m: Record<string, string> = {
              'Deep Breathing Practice': 'جلسات تنفس عميق',
              'CBT Daily Exercises': 'تمارين العلاج السلوكي المعرفي اليومية',
              'Mindfulness Sessions': 'جلسات اليقظة الذهنية',
              'Relaxation Practices': 'تمارين الاسترخاء'
            };
            return m[name] || name;
          };

          return (
            <View key={idx} style={[s.card, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', padding: 16, borderRadius: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }]}>
              <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }, isRTL ? { marginLeft: 12 } : { marginRight: 12 }]}>
                  <Text style={{ fontSize: 18 }}>{typeEmoji(item.type)}</Text>
                </View>
                <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{transGoalName(item.name)}</Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    {language === 'ar' ? `المستهدف: ${item.target} جلسات` : `Target: ${item.target} sessions`}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: item.percentage >= 100 ? '#10B981' : '#0F172A' }}>{item.percentage}%</Text>
              </View>
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${item.percentage}%`, backgroundColor: item.percentage >= 100 ? '#10B981' : '#1E293B' }]} />
              </View>
              <Text style={[{ fontSize: 11, color: '#94A3B8', marginTop: 8 }, isRTL && { textAlign: 'right' }]}>
                {language === 'ar' ? `أكملت ${item.completed} من أصل ${item.target} جلسات` : `${item.completed} of ${item.target} sessions done`}
              </Text>
            </View>
          );
        }) : (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🎯</Text>
            <Text style={{ fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>{language === 'ar' ? 'لا توجد أهداف مضافة بعد' : 'No goals tracked yet'}</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13 }}>
              {language === 'ar' ? 'أكمل التمارين المقترحة من الذكاء الاصطناعي للبدء في تتبع أهدافك النفسية.' : 'Complete AI-suggested exercises to start tracking your wellness goals.'}
            </Text>
          </View>
        )}

        <View style={[s.row, { marginTop: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[s.card, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'الأهداف المكتملة' : 'Goals Completed'}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{goalsCompleted}</Text>
            <Text style={[s.cardSubValue, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'هذه الدورة' : 'This cycle'}</Text>
          </View>
          <View style={[s.card, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[s.cardTitle, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'السلسلة الحالية' : 'Current Streak'}</Text>
            <Text style={[s.cardValue, isRTL && { textAlign: 'right' }]}>{stats.streak > 0 ? `${stats.streak} 🔥` : '0'}</Text>
            <Text style={[s.cardSubValue, isRTL && { textAlign: 'right' }]}>{language === 'ar' ? 'أيام متتالية' : 'Days in a row'}</Text>
          </View>
        </View>

        {stats.streak >= 7 && (
          <>
            <Text style={[s.largeCardTitle, { marginTop: 16, marginBottom: 12 }, isRTL && { textAlign: 'right' }]}>
              {language === 'ar' ? 'الإنجازات الأخيرة' : 'Recent Achievements'}
            </Text>
            <View style={[{ backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }, isRTL ? { marginLeft: 16 } : { marginRight: 16 }]}>
                <Text style={{ fontSize: 22 }}>🏆</Text>
              </View>
              <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                  {language === 'ar' ? `سلسلة لـ ${stats.streak} أيام!` : `${stats.streak}-Day Streak!`}
                </Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  {language === 'ar' ? `أكملت أهدافك لـ ${stats.streak} أيام متواصلة` : `Completed all goals for ${stats.streak} days`}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  const renderTabs = () => {
    const tabs = ['Overview', 'Trends', 'Triggers', 'Goals'] as const;
    const tabLabels: Record<TabType, string> = {
      Overview: t.insights.overview,
      Trends: t.insights.activity,
      Triggers: t.insights.triggers,
      Goals: language === 'ar' ? 'الأهداف' : 'Goals'
    };

    return (
      <View style={[s.tabContainer, isRTL && { flexDirection: 'row-reverse' }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabButton, isActive && s.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>{tabLabels[tab]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {renderTabs()}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Trends' && renderTrends()}
          {activeTab === 'Triggers' && renderTriggers()}
          {activeTab === 'Goals' && renderGoals()}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: { fontSize: 12, fontWeight: '500', color: '#64748B', marginBottom: 8 },
  cardValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  cardSubValue: { fontSize: 11, color: '#94A3B8' },
  cardSubValueGreen: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  largeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  largeCardTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#1E293B', borderRadius: 4 },
});

export default DashboardScreen;
