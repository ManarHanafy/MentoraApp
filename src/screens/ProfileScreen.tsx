import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { 
  UserCircleIcon, HelpCircleIcon, ShieldCheckIcon, CogIcon, LogoutIcon, ChevronRightIcon 
} from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { userName, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
     setLogoutModalVisible(false);
     await logout();
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.darkHeader}>
        <View style={s.headerContent}>
          <View style={s.avatarContainer}>
             <UserCircleIcon size={48} color={colors.primary} />
          </View>
          <Text style={s.headerName}>{userName || 'Manar Mohamed Hanafy'}</Text>
          <Text style={s.headerSub}>Mentora welcomes you</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.listItem} onPress={() => navigation.navigate('EditProfile')}>
          <View style={s.itemLeft}>
             <UserCircleIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Your Profile</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem}>
          <View style={s.itemLeft}>
             <HelpCircleIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Help Center</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem}>
          <View style={s.itemLeft}>
             <ShieldCheckIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Privacy Policy</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem} onPress={() => navigation.navigate('Settings')}>
          <View style={s.itemLeft}>
             <CogIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Settings</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem} onPress={() => setLogoutModalVisible(true)}>
          <View style={s.itemLeft}>
             <LogoutIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Log Out</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={logoutModalVisible} transparent={true} animationType="fade">
        <View style={s.modalOverlay}>
           <View style={s.modalContent}>
              <Text style={s.modalTitle}>Log Out</Text>
              <Text style={s.modalMessage}>Are you sure you want to log out ?</Text>
              
              <View style={s.modalActions}>
                 <TouchableOpacity style={s.cancelButton} onPress={() => setLogoutModalVisible(false)}>
                    <Text style={s.cancelButtonText}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
                    <Text style={s.logoutButtonText}>Yes, Log out</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>

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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerName: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSub: {
    ...typography.caption,
    color: '#A0AEC0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#161B22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  logoutButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ProfileScreen;
