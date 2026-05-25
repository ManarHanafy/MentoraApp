import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, CheckCircleSolidIcon } from '../components/Icons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../context/LanguageContext';

const LANGUAGES: { code: SupportedLanguage; label: string; sublabel: string; flag: string }[] = [
  { code: 'en', label: 'English', sublabel: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', sublabel: 'Arabic', flag: '🇸🇦' },
];

export function LanguageScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const choose = async (code: SupportedLanguage) => {
    await setLanguage(code);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.darkHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.languageScreen.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[s.subtitle, isRTL && s.rtlText]}>{t.languageScreen.subtitle}</Text>

      <View style={s.list}>
        {LANGUAGES.map(lang => {
          const isActive = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[s.row, isActive && s.rowActive]}
              onPress={() => choose(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={s.flag}>{lang.flag}</Text>
              <View style={s.labelWrap}>
                <Text style={[s.label, isActive && s.labelActive]}>{lang.label}</Text>
                <Text style={s.sublabel}>{lang.sublabel}</Text>
              </View>
              {isActive
                ? <CheckCircleSolidIcon size={24} color="#161B22" />
                : <View style={s.circle} />
              }
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.note}>
        <Text style={[s.noteText, isRTL && s.rtlText]}>
          {t.languageScreen.restartNote}
        </Text>
      </View>
    </SafeAreaView>
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
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  list: {
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowActive: {
    borderColor: '#161B22',
    backgroundColor: '#F1F5F9',
  },
  flag: {
    fontSize: 30,
    marginRight: 16,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#161B22',
  },
  labelActive: {
    color: '#161B22',
  },
  sublabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  note: {
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 14,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
    fontWeight: '600',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default LanguageScreen;
