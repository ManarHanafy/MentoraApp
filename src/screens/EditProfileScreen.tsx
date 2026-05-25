import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, UserCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function EditProfileScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { userName, email: contextEmail, phone: contextPhone, dob: contextDob, gender: contextGender, updateProfile } = useAuth();
  const { t, isRTL, language } = useLanguage();

  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(contextEmail || '');
  const [phone, setPhone] = useState(contextPhone || '');
  const [dob, setDob] = useState(contextDob || '');
  const [gender, setGender] = useState(contextGender || '');
  
  const handleSave = async () => {
     await updateProfile({ userName: name, email, phone, dob, gender });
     navigation.goBack();
  };

  const textDir = isRTL ? 'right' as const : 'left' as const;
  const defaultName = language === 'ar' ? 'منار محمد حنفي' : 'Manar Mohamed Hanafy';

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.darkHeader}>
        <View style={[s.headerTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
             <ArrowLeftIcon size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={s.headerContent}>
          <View style={s.avatarContainer}>
             <UserCircleIcon size={48} color={colors.primary} />
          </View>
          <Text style={s.headerName}>{name || defaultName}</Text>
          <Text style={s.headerSub}>{t.profile.mentoraWelcomes}</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.name}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.email}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.phone}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.dob}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={dob}
                  onChangeText={setDob}
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.gender}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={gender}
                  onChangeText={setGender}
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <TouchableOpacity style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>{t.editProfile.saveChanges}</Text>
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
  darkHeader: {
    backgroundColor: '#161B22', 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 35,
    paddingBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: -16, 
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
     ...typography.bodySmall,
     color: colors.textPrimary,
     fontWeight: '500',
     marginBottom: 8,
  },
  inputWrapper: {
     backgroundColor: '#F3F4F6',
     borderRadius: 12,
     paddingHorizontal: 16,
     height: 48,
     justifyContent: 'center',
  },
  input: {
     ...typography.bodySmall,
     color: colors.textPrimary,
     flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
