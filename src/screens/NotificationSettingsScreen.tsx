import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, BellIcon } from '../components/Icons';
import { colors, typography } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { NotificationService } from '../services/notificationService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NotificationSettingsScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [aiRecs, setAiRecs] = useState(true);
  const [appAnnounce, setAppAnnounce] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@mentora_daily_reminder').then(v => {
      if (v !== null) setDailyReminder(v === 'true');
    });
    AsyncStorage.getItem('@mentora_ai_recs').then(v => {
      if (v !== null) setAiRecs(v === 'true');
    });
    AsyncStorage.getItem('@mentora_app_announce').then(v => {
      if (v !== null) setAppAnnounce(v === 'true');
    });
  }, []);

  const saveToggle = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    await AsyncStorage.setItem(key, String(val));
    await AsyncStorage.setItem('@mentora_notifications', String(val || dailyReminder || aiRecs));
    
    // Reschedule dynamic notifications
    setTimeout(async () => {
      await NotificationService.scheduleDailyReminders(language);
    }, 100);
  };

  const textDir = isRTL ? 'right' as const : 'left' as const;

  return (
    <View style={s.safeArea}>
      <View style={[s.darkHeader, { paddingTop: insets.top + 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.notifications.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <View style={s.infoIconBox}>
            <BellIcon size={28} color={colors.primary} />
          </View>
          <Text style={s.infoTitle}>
            {language === 'ar' ? 'ابق على اتصال' : 'Stay Connected'}
          </Text>
          <Text style={s.infoDesc}>
            {language === 'ar' 
              ? 'قم بإدارة إشعاراتك اليومية، والتمارين المقترحة من الذكاء الاصطناعي، وتنبيهات تسجيل المزاج.' 
              : 'Manage your daily notifications, recommended AI exercises, and check-in reminders.'
            }
          </Text>
        </View>

        <View style={s.settingsCard}>
          <View style={[s.switchRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[s.rowTextWrap, isRTL ? { marginLeft: 16 } : { marginRight: 16 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[s.rowLabel, { textAlign: textDir }]}>
                {language === 'ar' ? 'التذكيرات اليومية' : 'Daily Reminders'}
              </Text>
              <Text style={[s.rowSub, { textAlign: textDir }]}>
                {language === 'ar' ? 'تذكيري بتسجيل مزاجي وكتابة مذكراتي اليومية' : 'Remind me to log my mood and write journal entries'}
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={(v) => saveToggle('@mentora_daily_reminder', v, setDailyReminder)}
              trackColor={{ false: '#E2E8F0', true: '#161B22' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[s.switchRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[s.rowTextWrap, isRTL ? { marginLeft: 16 } : { marginRight: 16 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[s.rowLabel, { textAlign: textDir }]}>
                {language === 'ar' ? 'تنبيهات تمارين الذكاء الاصطناعي' : 'AI Exercise Alerts'}
              </Text>
              <Text style={[s.rowSub, { textAlign: textDir }]}>
                {language === 'ar' ? 'إعلامي عندما يقترح ذكاء منتورا تمارين جديدة لي' : 'Notify me when Mentora AI has new suggested exercises'}
              </Text>
            </View>
            <Switch
              value={aiRecs}
              onValueChange={(v) => saveToggle('@mentora_ai_recs', v, setAiRecs)}
              trackColor={{ false: '#E2E8F0', true: '#161B22' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[s.switchRow, { borderBottomWidth: 0 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[s.rowTextWrap, isRTL ? { marginLeft: 16 } : { marginRight: 16 }, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[s.rowLabel, { textAlign: textDir }]}>
                {language === 'ar' ? 'تحديثات التطبيق' : 'Product Updates'}
              </Text>
              <Text style={[s.rowSub, { textAlign: textDir }]}>
                {language === 'ar' ? 'إشعارات حول الميزات والتمارين العلاجية الجديدة' : 'Announcements about new therapeutic content and features'}
              </Text>
            </View>
            <Switch
              value={appAnnounce}
              onValueChange={(v) => saveToggle('@mentora_app_announce', v, setAppAnnounce)}
              trackColor={{ false: '#E2E8F0', true: '#161B22' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkHeader: {
    backgroundColor: '#161B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },
  infoIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161B22',
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 30,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161B22',
    marginBottom: 4,
  },
  rowSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});

export default NotificationSettingsScreen;
