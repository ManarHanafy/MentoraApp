import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { colors, typography } from '../theme';
import { ChartTrendIcon, ClipboardIcon, LightningIcon, TargetIcon } from '../components/Icons';

type TabType = 'Overview' | 'Trends' | 'Triggers' | 'Goals';

export function DashboardScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

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

  const renderOverview = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.row}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Average Mood</Text>
          <Text style={s.cardValue}>3.8</Text>
          <Text style={s.cardSubValueGreen}>📈 +0.5 this week</Text>
        </View>
        <View style={[s.card, { backgroundColor: '#E2E8F0' }]}>
          <Text style={s.cardTitle}>Check-ins</Text>
          <Text style={s.cardValue}>24</Text>
          <Text style={s.cardSubValue}>This week</Text>
        </View>
      </View>
      <View style={s.row}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Best Day</Text>
          <Text style={s.cardValue}>Friday</Text>
          <Text style={s.cardSubValue}>Mood score: 4.5</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Streak</Text>
          <Text style={s.cardValue}>7 days</Text>
          <Text style={[s.cardSubValue, { color: colors.warning }]}>Keep it up! ⚡</Text>
        </View>
      </View>

      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>This Week</Text>
        <View style={s.chartContainer}>
          <View style={s.yAxis}>
            <Text style={s.axisLabel}>5-</Text>
            <Text style={s.axisLabel}>2-</Text>
            <Text style={s.axisLabel}>0-</Text>
          </View>
          <View style={s.barsContainer}>
            {[4, 2, 3, 5, 4, 4, 4.5].map((val, idx) => (
              <View key={idx} style={s.barColumn}>
                <View style={[s.bar, { height: `${(val / 5) * 100}%` }]} />
                <Text style={s.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>Monthly Trend</Text>
        <View style={s.chartContainer}>
          <View style={s.yAxis}>
             <Text style={s.axisLabel}>5-</Text>
             <Text style={s.axisLabel}>2-</Text>
             <Text style={s.axisLabel}>0-</Text>
          </View>
          <View style={s.barsContainer}>
            {[3, 5, 2, 3].map((val, idx) => (
              <View key={idx} style={s.barColumn}>
                <View style={[s.bar, { height: `${(val / 5) * 100}%`, backgroundColor: idx % 2 === 0 ? colors.primaryLight : '#CBD5E1' }]} />
                <Text style={s.barLabel}>{`w${idx + 1}`}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>What Helps You Most</Text>
        <View style={s.timelineItem}>
          <View style={s.timelineLine} />
          <View style={s.timelineDot} />
          <View style={s.timelineContent}>
             <View style={s.timelineHeader}>
               <Text style={s.timelineTitle}>🏃 Exercise</Text>
               <Text style={s.timelinePercent}>78%</Text>
             </View>
             <Text style={s.timelineSubtitle}>Great meeting with the team</Text>
             <View style={s.progressBarBg}>
               <View style={[s.progressBarFill, { width: '78%' }]} />
             </View>
          </View>
        </View>

        <View style={s.timelineItem}>
          <View style={s.timelineLine} />
          <View style={s.timelineDot} />
          <View style={s.timelineContent}>
             <View style={s.timelineHeader}>
               <Text style={s.timelineTitle}>🧘‍♀️ Meditation</Text>
               <Text style={s.timelinePercent}>65%</Text>
             </View>
             <Text style={s.timelineSubtitle}>Impact: High</Text>
             <View style={s.progressBarBg}>
               <View style={[s.progressBarFill, { width: '65%' }]} />
             </View>
          </View>
        </View>

        <View style={[s.timelineItem, { borderLeftColor: 'transparent' }]}>
          <View style={s.timelineDot} />
          <View style={s.timelineContent}>
             <View style={s.timelineHeader}>
               <Text style={s.timelineTitle}>👥 Social Time</Text>
               <Text style={s.timelinePercent}>54%</Text>
             </View>
             <Text style={s.timelineSubtitle}>Great meeting with the team</Text>
             <View style={s.progressBarBg}>
               <View style={[s.progressBarFill, { width: '54%' }]} />
             </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderTriggers = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>Common Triggers</Text>
        
        <View style={s.triggerItem}>
          <View style={s.triggerHeader}>
             <Text style={s.triggerTitle}>💼 Work Stress</Text>
             <Text style={s.triggerPercent}>45%</Text>
          </View>
          <Text style={s.triggerSubtitle}>12 times this month</Text>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: '45%' }]} />
          </View>
        </View>
        
        <View style={s.triggerItem}>
          <View style={s.triggerHeader}>
             <Text style={s.triggerTitle}>😴 Poor Sleep</Text>
             <Text style={s.triggerPercent}>74%</Text>
          </View>
          <Text style={s.triggerSubtitle}>8 times this month</Text>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: '74%' }]} />
          </View>
        </View>

        <View style={s.triggerItem}>
          <View style={s.triggerHeader}>
             <Text style={s.triggerTitle}>👬 Social Anxiety</Text>
             <Text style={s.triggerPercent}>86%</Text>
          </View>
          <Text style={s.triggerSubtitle}>5 times this month</Text>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: '86%' }]} />
          </View>
        </View>

      </View>

      <View style={s.darkCard}>
        <Text style={s.darkCardTitle}>Recommended Coping Strategies</Text>

        <View style={s.strategyCard}>
          <Text style={s.strategyTitle}>🚧 For Work Stress</Text>
          <Text style={s.strategyDesc}>Try 5-minute breathing breaks every 2 hours</Text>
        </View>

        <View style={s.strategyCard}>
          <Text style={s.strategyTitle}>😴 For Better Sleep</Text>
          <Text style={s.strategyDesc}>Wind down routine 1 hour before bed</Text>
        </View>

        <View style={s.strategyCard}>
          <Text style={s.strategyTitle}>🪴 For Anxiety</Text>
          <Text style={s.strategyDesc}>Grounding techniques and journaling</Text>
        </View>

      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>Active Goals</Text>

        <View style={s.goalItem}>
           <View style={s.goalHeader}>
             <Text style={s.goalTitle}>😴 Better Sleep Quality</Text>
             <Text style={s.goalPercent}>65%</Text>
           </View>
           <Text style={s.goalSubtitle}>12 times this month</Text>
           <View style={s.progressBarBg}>
             <View style={[s.progressBarFill, { width: '65%' }]} />
           </View>
           <Text style={s.goalFooter}>5 out of 7 nights this week</Text>
        </View>

        <View style={s.goalItem}>
           <View style={s.goalHeader}>
             <Text style={s.goalTitle}>🧘‍♂️ Daily Meditation</Text>
             <Text style={s.goalPercent}>85%</Text>
           </View>
           <Text style={s.goalSubtitle}>10 minutes minimum</Text>
           <View style={s.progressBarBg}>
             <View style={[s.progressBarFill, { width: '85%' }]} />
           </View>
           <Text style={s.goalFooter}>6 out of 7 days completed</Text>
        </View>

        <View style={s.goalItem}>
           <View style={s.goalHeader}>
             <Text style={s.goalTitle}>💪 Exercise 3x Weekly</Text>
             <Text style={s.goalPercent}>65%</Text>
           </View>
           <Text style={s.goalSubtitle}>30 minutes each session</Text>
           <View style={s.progressBarBg}>
             <View style={[s.progressBarFill, { width: '65%' }]} />
           </View>
           <Text style={s.goalFooter}>2 out of 3 sessions this week</Text>
        </View>
      </View>

      <View style={s.row}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Goals Completed</Text>
          <Text style={s.cardValue}>12</Text>
          <Text style={s.cardSubValue}>This month</Text>
        </View>
        <View style={[s.card, { backgroundColor: '#E2E8F0' }]}>
          <Text style={s.cardTitle}>Current Streak</Text>
          <Text style={s.cardValue}>7 🔥</Text>
          <Text style={s.cardSubValue}>Days in a row</Text>
        </View>
      </View>

      <View style={s.largeCard}>
        <Text style={s.largeCardTitle}>Recent Achievements</Text>
        <View style={s.achievementCard}>
           <View style={s.achievementIconBg}>
              <Text style={{fontSize: 20}}>🏆</Text>
           </View>
           <View style={s.achievementTextContent}>
              <Text style={s.achievementTitle}>7-Day Streak!</Text>
              <Text style={s.achievementDesc}>Completed all goals for a week</Text>
           </View>
        </View>
      </View>

    </ScrollView>
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        {renderTabs()}
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Trends' && renderTrends()}
        {activeTab === 'Triggers' && renderTriggers()}
        {activeTab === 'Goals' && renderGoals()}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 75,
    paddingBottom: 20,
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
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
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
  cardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubValue: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardSubValueGreen: {
    ...typography.caption,
    color: colors.success,
  },
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
  largeCardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
    marginTop: 10,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  axisLabel: {
    ...typography.caption,
    color: '#CBD5E1',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  barColumn: {
    alignItems: 'center',
    width: 30,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    ...typography.caption,
    color: '#CBD5E1',
    marginTop: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 24,
    paddingBottom: 24,
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: -1,
    top: 10,
    bottom: -10,
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  timelineDot: {
    position: 'absolute',
    left: -6.5,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  timelineContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelinePercent: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timelineSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
  },
  triggerItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  triggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  triggerTitle: {
     ...typography.bodySmall,
     fontWeight: '600',
     color: colors.textPrimary,
  },
  triggerPercent: {
     ...typography.bodySmall,
     fontWeight: '600',
     color: colors.textSecondary,
  },
  triggerSubtitle: {
     ...typography.caption,
     color: colors.textMuted,
     marginBottom: 10,
  },
  darkCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  darkCardTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  strategyTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  strategyDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  goalItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  goalPercent: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 10,
  },
  goalFooter: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
  },
  achievementCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementTextContent: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  achievementDesc: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default DashboardScreen;
