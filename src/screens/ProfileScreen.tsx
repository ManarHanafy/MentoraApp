import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import {
  UserCircleIcon, HelpCircleIcon, ShieldCheckIcon, CogIcon, LogoutIcon, ChevronRightIcon
} from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle } from 'lucide-react-native';

export function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { userName, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('@mentora_tour_profile_done').then(val => {
      if (val !== 'true') {
        setShowTour(true);
        setTourStep(0);
      }
    });
  }, []);

  const handleTourNext = async () => {
    if (tourStep < 2) {
      setTourStep(prev => prev + 1);
    } else {
      setShowTour(false);
      await AsyncStorage.setItem('@mentora_tour_profile_done', 'true');
    }
  };

  const handleTourBack = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  const handleTourSkip = async () => {
    setShowTour(false);
    await AsyncStorage.setItem('@mentora_tour_profile_done', 'true');
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const rowDir = isRTL ? 'row-reverse' as const : 'row' as const;
  const defaultName = language === 'ar' ? 'منار محمد حنفي' : 'Manar Mohamed Hanafy';

  return (
    <View style={s.safeArea}>
      <View style={[s.darkHeader, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerContent}>
          <View style={[
            s.avatarContainer,
            showTour && tourStep === 0 && { borderColor: '#38BDF8', borderWidth: 3 }
          ]}>
            <UserCircleIcon size={48} color={colors.primary} />
          </View>
          <Text style={s.headerName}>{userName || defaultName}</Text>
          <Text style={s.headerSub}>{t.profile.mentoraWelcomes}</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[
            s.listItem, 
            { flexDirection: rowDir }
          ]} 
          onPress={() => !showTour && navigation.navigate('EditProfile')}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <UserCircleIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.yourProfile}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            s.listItem, 
            { flexDirection: rowDir },
            showTour && tourStep === 2 && { backgroundColor: '#F8FAFC', borderColor: colors.primary, borderWidth: 2, borderRadius: 12, paddingHorizontal: 12 }
          ]} 
          onPress={() => !showTour && navigation.navigate('HelpCenter')}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <HelpCircleIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.helpCenter}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            s.listItem, 
            { flexDirection: rowDir },
            showTour && tourStep === 2 && { backgroundColor: '#F8FAFC', borderColor: colors.primary, borderWidth: 2, borderRadius: 12, paddingHorizontal: 12 }
          ]} 
          onPress={() => !showTour && navigation.navigate('PrivacyPolicy')}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <ShieldCheckIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.privacyPolicy}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            s.listItem, 
            { flexDirection: rowDir },
            showTour && tourStep === 1 && { backgroundColor: '#F8FAFC', borderColor: colors.primary, borderWidth: 2, borderRadius: 12, paddingHorizontal: 12 }
          ]} 
          onPress={() => !showTour && navigation.navigate('Settings')}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <CogIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.settings}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => !showTour && setLogoutModalVisible(true)}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <LogoutIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.logOut}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent={true} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{t.profile.logOutConfirmTitle}</Text>
            <Text style={[s.modalMessage, isRTL && { textAlign: 'right' }]}>{t.profile.logOutConfirmMsg}</Text>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={s.cancelButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
                <Text style={s.logoutButtonText}>{t.profile.yesLogOut}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Guided Tour Modal */}
      {showTour && (
        <Modal transparent visible={showTour} animationType="fade">
          <View style={s.tourOverlay}>
            <View style={s.tourCard}>
              <View style={s.tourHeader}>
                <Text style={s.tourStepText}>
                  {language === 'ar' ? `خطوة ${tourStep + 1} من 3` : `Step ${tourStep + 1} of 3`}
                </Text>
                <TouchableOpacity onPress={handleTourSkip}>
                  <Text style={s.tourSkipText}>
                    {language === 'ar' ? 'تخطي' : 'Skip'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={s.tourIconContainer}>
                {tourStep === 0 && <User size={36} color={colors.primary} />}
                {tourStep === 1 && <Settings size={36} color={colors.primary} />}
                {tourStep === 2 && <HelpCircle size={36} color={colors.primary} />}
              </View>

              <Text style={s.tourTitle}>
                {tourStep === 0 && (language === 'ar' ? 'ملفك الشخصي' : 'Your Account Profile')}
                {tourStep === 1 && (language === 'ar' ? 'الإعدادات والتفضيلات' : 'Settings & Preferences')}
                {tourStep === 2 && (language === 'ar' ? 'مركز المساعدة والخصوصية' : 'Help Center & Privacy')}
              </Text>

              <Text style={s.tourDesc}>
                {tourStep === 0 && (language === 'ar' 
                  ? 'اعرض وعدل بياناتك الشخصية واسمك أو ارفع صورة ملفك الشخصي.'
                  : 'View and edit your personal details, name, or upload your profile picture.'
                )}
                {tourStep === 1 && (language === 'ar'
                  ? 'تحكم بالإشعارات، وقم بضبط اللغة المفضلة، أو غير كلمة المرور، أو أعد تعيين أسئلة البداية.'
                  : 'Toggle notifications, configure your language, change password, or reset onboarding.'
                )}
                {tourStep === 2 && (language === 'ar'
                  ? 'ابحث عن إجابات للأسئلة الشائعة، واطلع على سياسة الخصوصية، أو راسل الدعم الفني مباشرة.'
                  : 'Find answers to FAQs, view privacy terms, or contact support directly.'
                )}
              </Text>

              <View style={s.tourDots}>
                {[0, 1, 2].map((idx) => (
                  <View 
                    key={idx} 
                    style={[s.tourDot, tourStep === idx && s.tourDotActive]} 
                  />
                ))}
              </View>

              <View style={s.tourActions}>
                {tourStep > 0 ? (
                  <TouchableOpacity style={s.tourBackBtn} onPress={handleTourBack}>
                    <Text style={s.tourBackBtnText}>
                      {language === 'ar' ? 'السابق' : 'Back'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flex: 1 }} />
                )}

                <TouchableOpacity style={s.tourNextBtn} onPress={handleTourNext}>
                  <Text style={s.tourNextBtnText}>
                    {tourStep === 2 
                      ? (language === 'ar' ? 'إنهاء الجولة' : 'Finish')
                      : (language === 'ar' ? 'التالي' : 'Next')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  darkHeader: {
    backgroundColor: '#161B22',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContent: { alignItems: 'center' },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  headerName: { ...typography.h3, color: '#FFFFFF', fontWeight: '600', marginBottom: 4 },
  headerSub: { ...typography.caption, color: '#A0AEC0' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  listItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 0,
  },
  itemLeft: { alignItems: 'center' },
  itemText: { ...typography.body, fontWeight: '600', color: colors.textPrimary, marginLeft: 16 },
  rtlItemText: { marginLeft: 0, marginRight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, alignItems: 'center',
  },
  modalTitle: { ...typography.h4, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  modalMessage: { ...typography.body, color: colors.textSecondary, marginBottom: 32 },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelButton: {
    flex: 1, backgroundColor: '#E2E8F0', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', marginRight: 8,
  },
  cancelButtonText: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  logoutButton: {
    flex: 1, backgroundColor: '#161B22', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', marginLeft: 8,
  },
  logoutButtonText: { ...typography.bodySmall, fontWeight: '600', color: colors.white },
  tourOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 40,
    alignItems: 'stretch',
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tourStepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  tourSkipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  tourIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'left',
  },
  tourDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'left',
  },
  tourDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  tourDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  tourDotActive: {
    width: 18,
    backgroundColor: '#0F172A',
  },
  tourActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  tourBackBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tourBackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  tourNextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  tourNextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
