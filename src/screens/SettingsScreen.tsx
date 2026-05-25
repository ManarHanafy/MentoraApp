import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import {
  ArrowLeftIcon, GlobeIcon, BellIcon, LockIcon, TrashIcon,
  ChevronRightIcon, CheckCircleSolidIcon, ClipboardIcon
} from '../components/Icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { t, language, isRTL } = useLanguage();
  const { resetOnboarding } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLocked, setIsLocked] = useState(true);
  const [resetting, setResetting] = useState(false);

  const langLabel = language === 'ar' ? 'العربية' : 'English';
  const rowDir = isRTL ? 'row-reverse' as const : 'row' as const;

  const handleResetOnboarding = () => {
    Alert.alert(
      isRTL ? 'إعادة تعيين الأسئلة' : 'Reset Onboarding',
      isRTL 
        ? 'هل أنت متأكد من رغبتك في إعادة تعيين إجاباتك وإعادة ملء الأسئلة؟'
        : 'Are you sure you want to reset your answers and retake the onboarding questions?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: isRTL ? 'نعم، إعادة تعيين' : 'Yes, Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              await resetOnboarding();
              Alert.alert(
                isRTL ? 'نجاح' : 'Success',
                isRTL 
                  ? 'تمت إعادة تعيين الأسئلة بنجاح. سيتم توجيهك الآن.'
                  : 'Onboarding answers have been reset successfully. Redirecting you...'
              );
            } catch (err: any) {
              Alert.alert(
                isRTL ? 'خطأ' : 'Error',
                isRTL ? 'فشل إعادة التعيين. يرجى المحاولة مرة أخرى.' : 'Failed to reset. Please try again.'
              );
            } finally {
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={s.safeArea}>
      <View style={[s.darkHeader, { paddingTop: insets.top + 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
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

        <TouchableOpacity 
          style={[s.listItem, { flexDirection: rowDir }]} 
          onPress={handleResetOnboarding}
          disabled={resetting}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <ClipboardIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>
              {isRTL ? 'إعادة تعيين الأسئلة' : 'Reset Onboarding'}
            </Text>
          </View>
          <View style={[s.itemRight, { flexDirection: rowDir }]}>
            {resetting ? (
              <ActivityIndicator size="small" color="#161B22" />
            ) : (
              <ChevronRightIcon size={20} color={colors.textPrimary} />
            )}
          </View>
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
    </View>
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
