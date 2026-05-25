import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import {
  ArrowLeftIcon, GlobeIcon, BellIcon, LockIcon, TrashIcon,
  ChevronRightIcon, CheckCircleSolidIcon
} from '../components/Icons';
import { useLanguage } from '../context/LanguageContext';

export function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { t, language, isRTL } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);

  const langLabel = language === 'ar' ? 'العربية' : 'English';
  const rowDir = isRTL ? 'row-reverse' as const : 'row' as const;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.darkHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('Language')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <GlobeIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.language}</Text>
          </View>
          <View style={[s.itemRight, { flexDirection: rowDir }]}>
            <Text style={[s.itemValue, isRTL && { marginRight: 0, marginLeft: 8 }]}>{langLabel}</Text>
            <ChevronRightIcon size={20} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('NotificationSettings')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <BellIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.notifications}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('ChangePassword')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <LockIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.changePassword}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('DeleteAccount')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <TrashIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.deleteAccount}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={[s.listItem, { flexDirection: rowDir }]}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <CheckCircleSolidIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.lockedInMentora}</Text>
          </View>
          <Switch
            value={isLocked}
            onValueChange={setIsLocked}
            trackColor={{ false: '#E2E8F0', true: '#161B22' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  listItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeft: { alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginLeft: 16 },
  rtlItemText: { marginLeft: 0, marginRight: 16 },
  itemRight: { alignItems: 'center' },
  itemValue: { fontSize: 14, color: '#94A3B8', marginRight: 8 },
});

export default SettingsScreen;
