import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, LockIcon } from '../components/Icons';
import { colors, typography } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import Svg, { Path, Circle } from 'react-native-svg';

const EyeIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" stroke="#A0AEC0" strokeWidth="2" />
   </Svg>
);

const EyeOffIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Path d="M1 1l22 22" />
   </Svg>
);

export function ChangePasswordScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { t, isRTL, language } = useLanguage();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error', 
        language === 'ar' ? 'يرجى ملء جميع الحقول.' : 'Please fill in all fields.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error', 
        language === 'ar' ? 'كلمات المرور الجديدة غير متطابقة.' : 'New passwords do not match.'
      );
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error', 
        language === 'ar' ? 'يجب أن تتكون كلمة المرور الجديدة من ٦ أحرف على الأقل.' : 'New password must be at least 6 characters.'
      );
      return;
    }
    Alert.alert(
      language === 'ar' ? 'نجح' : 'Success', 
      language === 'ar' ? 'تم تغيير كلمة المرور بنجاح.' : 'Your password has been changed successfully.', 
      [{ text: t.common.ok, onPress: () => navigation.goBack() }]
    );
  };

  const textDir = isRTL ? 'right' as const : 'left' as const;

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[s.darkHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
            <ArrowLeftIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t.changePassword.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={s.content} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={s.iconWrapper}>
            <View style={s.iconBg}>
              <LockIcon size={32} color={colors.primary} />
            </View>
            <Text style={s.mainLabel}>
              {language === 'ar' ? 'حماية حسابك' : 'Secure Your Account'}
            </Text>
            <Text style={s.subLabel}>
              {language === 'ar' 
                ? 'يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل وأن تحتوي على أرقام أو رموز.' 
                : 'Your password should be at least 6 characters long and include numbers or symbols.'
              }
            </Text>
          </View>

          <View style={s.form}>
            <Text style={[s.fieldLabel, { textAlign: textDir }]}>{t.changePassword.current}</Text>
            <View style={[s.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <TextInput
                style={[s.input, { textAlign: textDir }]}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>

            <Text style={[s.fieldLabel, { textAlign: textDir }]}>{t.changePassword.newPass}</Text>
            <View style={[s.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <TextInput
                style={[s.input, { textAlign: textDir }]}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>

            <Text style={[s.fieldLabel, { textAlign: textDir }]}>{t.changePassword.confirm}</Text>
            <View style={[s.inputContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <TextInput
                style={[s.input, { textAlign: textDir }]}
                placeholder={language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.btnSave} onPress={handleUpdate}>
              <Text style={s.btnSaveText}>{t.changePassword.update}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161B22',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  form: {
    marginTop: 16,
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  btnSave: {
    backgroundColor: '#161B22',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ChangePasswordScreen;
