import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { translations, TranslationKeys } from '../localization/translations';
import { NotificationService } from '../services/notificationService';

const LANG_KEY = '@mentora_app_language';

export type SupportedLanguage = 'en' | 'ar';

interface LanguageContextValue {
  language: SupportedLanguage;
  t: TranslationKeys;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [language, setLang] = useState<SupportedLanguage>('en');

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      const activeLang: SupportedLanguage = (stored === 'ar' || stored === 'en') ? stored : 'en';
      if (stored === 'ar' || stored === 'en') {
        setLang(stored);
        const shouldBeRTL = stored === 'ar';
        try {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        } catch (e) {
          console.warn('I18nManager error during load:', e);
        }
      }
      
      // Initialize notification system
      NotificationService.requestPermissions().then((granted) => {
        if (granted) {
          NotificationService.scheduleDailyReminders(activeLang);
        }
      });
    });
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      await AsyncStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      console.warn('AsyncStorage error setting language:', e);
    }
    
    const shouldBeRTL = lang === 'ar';
    try {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    } catch (e) {
      console.warn('I18nManager error during setLanguage:', e);
    }
    
    setLang(lang);

    // Reschedule in the new language
    NotificationService.requestPermissions().then((granted) => {
      if (granted) {
        NotificationService.scheduleDailyReminders(lang);
      }
    });
  }, []);

  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, t, isRTL, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
