import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure foreground notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export const NotificationService = {
  /**
   * Request push/local notification permissions and set up Android channels
   */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Notification permissions not granted');
        return false;
      }

      // Configure Android channel for popup notifications (Banners at top)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('mentora-reminders', {
          name: 'Mentora Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#161B22',
        });
      }

      return true;
    } catch (error) {
      console.warn('[NotificationService] Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Schedules or updates daily reminders based on selected language
   */
  scheduleDailyReminders: async (locale: 'en' | 'ar'): Promise<void> => {
    try {
      // 1. Cancel all previously scheduled notifications to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Check if notifications are globally enabled by the user in settings
      const dailyReminderEnabled = await AsyncStorage.getItem('@mentora_daily_reminder');
      const aiRecsEnabled = await AsyncStorage.getItem('@mentora_ai_recs');
      
      const shouldScheduleReminders = dailyReminderEnabled !== 'false';
      const shouldScheduleExercises = aiRecsEnabled !== 'false';

      if (!shouldScheduleReminders && !shouldScheduleExercises) {
        console.log('[NotificationService] Notifications are disabled in settings');
        return;
      }

      const isAr = locale === 'ar';

      // 2. Chat Reminder (Scheduled daily at 4:30 PM / 16:30)
      if (shouldScheduleReminders) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: isAr ? 'فضفض مع منتورا 💬' : 'Talk with Mentora 💬',
            body: isAr 
              ? 'لم تتحدث مع شريكك الذكاء الاصطناعي اليوم؟ شاركنا كيف تسير أمورك وتحدث معنا!'
              : "Haven't talked to your AI companion today? Let's check in and chat!",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            android: {
              channelId: 'mentora-reminders',
            }
          } as any,
          trigger: {
            hour: 16,
            minute: 30,
            repeats: true,
          } as any,
        });
        console.log('[NotificationService] Scheduled Daily Chat Reminder');
      }

      // 3. Exercise Reminder (Scheduled daily at 6:30 PM / 18:30)
      if (shouldScheduleExercises) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: isAr ? 'تمارينك العلاجية اليومية 🧘' : 'Daily Therapeutic Exercises 🧘',
            body: isAr
              ? 'أنت ماكملتش تمارينك النهارده! استمر للحفاظ على صحتك النفسية وتقدمك.'
              : "You haven't completed your daily exercises yet! Keep going to maintain your progress.",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            android: {
              channelId: 'mentora-reminders',
            }
          } as any,
          trigger: {
            hour: 18,
            minute: 30,
            repeats: true,
          } as any,
        });
        console.log('[NotificationService] Scheduled Daily Exercise Reminder');
      }

      // 4. Journal Reminder (Scheduled daily at 8:30 PM / 20:30)
      if (shouldScheduleReminders) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: isAr ? 'يومياتك اليومية ✍️' : 'Your Daily Journal ✍️',
            body: isAr
              ? 'مش عايز تحكي يومك النهارده للجورنال؟ فضفض وسجّل مشاعرك وأفكارك.'
              : "Don't want to tell your day to the journal today? Share your thoughts and log your feelings.",
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            android: {
              channelId: 'mentora-reminders',
            }
          } as any,
          trigger: {
            hour: 20,
            minute: 30,
            repeats: true,
          } as any,
        });
        console.log('[NotificationService] Scheduled Daily Journal Reminder');
      }

    } catch (error) {
      console.warn('[NotificationService] Error scheduling notifications:', error);
    }
  },
};
