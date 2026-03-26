import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { 
  ArrowLeftIcon, GlobeIcon, BellIcon, LockIcon, TrashIcon, ChevronRightIcon, CheckCircleSolidIcon 
} from '../components/Icons';

export function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [isLocked, setIsLocked] = useState(true);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={s.rightPlaceholder} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.listItem}>
          <View style={s.itemLeft}>
            <GlobeIcon size={24} color={colors.textPrimary} />
            <Text style={s.itemText}>Language</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem}>
          <View style={s.itemLeft}>
             <BellIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Notification Settings</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem}>
          <View style={s.itemLeft}>
            <LockIcon size={24} color={colors.textPrimary} />
            <Text style={s.itemText}>Change Password</Text>
          </View>
          <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem}>
           <View style={s.itemLeft}>
             <TrashIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Delete Account</Text>
           </View>
           <ChevronRightIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={s.listItem} onPress={() => setIsLocked(!isLocked)}>
           <View style={s.itemLeft}>
             <LockIcon size={24} color={colors.textPrimary} />
             <Text style={s.itemText}>Locked in Mentora Ai</Text>
           </View>
           {isLocked ? (
             <CheckCircleSolidIcon size={24} color={colors.textPrimary} />
           ) : (
             <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1', backgroundColor: '#ffffff' }} />
           )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
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
});

export default SettingsScreen;
