import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import {
  UserCircleIcon, HelpCircleIcon, ShieldCheckIcon, CogIcon, LogoutIcon, ChevronRightIcon
} from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { userName, logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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
          <View style={s.avatarContainer}>
            <UserCircleIcon size={48} color={colors.primary} />
          </View>
          <Text style={s.headerName}>{userName || defaultName}</Text>
          <Text style={s.headerSub}>{t.profile.mentoraWelcomes}</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('EditProfile')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <UserCircleIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.yourProfile}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('HelpCenter')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <HelpCircleIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.helpCenter}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <ShieldCheckIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.privacyPolicy}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => navigation.navigate('Settings')}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <CogIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.profile.settings}</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={() => setLogoutModalVisible(true)}>
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
});

export default ProfileScreen;
