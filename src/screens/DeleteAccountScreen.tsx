import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, TrashIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseService } from '../services/exerciseService';
import { API_BASE_URL } from '../config/env';

export function DeleteAccountScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { logout, email } = useAuth();
  const { t, isRTL, language } = useLanguage();

  const handleDelete = () => {
    Alert.alert(
      language === 'ar' ? '⚠️ إجراء نهائي ودائم' : '⚠️ Permanent Action',
      language === 'ar' 
        ? `هل أنت متأكد تماماً من رغبتك في حذف حسابك (${email}) نهائياً؟ سيتم مسح جميع مذكراتك ورسائلك وسجلات تقدمك تماماً من خوادمنا ولن تتمكن من تسجيل الدخول به مجدداً.`
        : `Are you absolutely sure you want to permanently delete your account (${email})? All your journal entries, messages, and custom AI exercise history will be deleted from our servers forever, and you will not be able to log in with this account again.`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف نهائي' : 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await ExerciseService.getAuthToken();
              const response = await fetch(`${API_BASE_URL}/Account`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok || response.status === 200 || response.status === 204) {
                const cleanEmail = email ? email.trim().toLowerCase() : '';
                const keysToRemove = [
                  '@mentora_logged_in',
                  '@mentora_user_email',
                  '@mentora_user_name',
                  '@mentora_auth_token',
                  '@mentora_has_account',
                ];
                if (cleanEmail) {
                  keysToRemove.push(`@mentora_onboarding_done_${cleanEmail}`);
                  keysToRemove.push(`@mentora_journal_entries_${cleanEmail}`);
                }
                await AsyncStorage.multiRemove(keysToRemove);
                
                Alert.alert(
                  language === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account Deleted Successfully',
                  language === 'ar'
                    ? 'تم مسح حسابك وكل بياناتك نهائياً. يمكنك إنشاء حساب جديد في أي وقت.'
                    : 'Your account and all associated data have been permanently erased. You may sign up with a new account anytime.',
                  [{ text: t.common.ok, onPress: async () => {
                    await logout();
                  }}]
                );
              } else {
                throw new Error(`Server returned ${response.status}`);
              }
            } catch (error: any) {
              Alert.alert(
                language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error',
                language === 'ar' 
                  ? 'تعذر الاتصال بالخادم لحذف الحساب. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'
                  : 'Could not connect to the server to delete your account. Please check your internet connection and try again.'
              );
            }
          }
        }
      ]
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
          <Text style={s.headerTitle}>{t.deleteAccount.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={s.content} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={s.iconWrapper}>
            <View style={s.iconBg}>
              <TrashIcon size={32} color="#EF4444" />
            </View>
            <Text style={s.mainLabel}>
              {language === 'ar' ? 'يؤسفنا رحيلك' : "We're sorry to see you go"}
            </Text>
            <Text style={s.subLabel}>
              {language === 'ar' 
                ? 'حذف حسابك نهائي ولا يمكن التراجع عنه. سيتم محو جميع بياناتك العلاجية تماماً.'
                : 'Deleteting your account is permanent. All your therapeutic history will be permanently erased.'
              }
            </Text>
          </View>

          <View style={[s.warningCard, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={s.warningTitle}>
              {language === 'ar' ? '⚠️ تحذير سلامة هام' : '⚠️ Important Safety Warning'}
            </Text>
            <Text style={[s.warningText, { textAlign: textDir }]}>
              {language === 'ar' ? '• هذا الإجراء نهائي ولا يمكن الرجوع عنه.' : '• This action is permanent and cannot be reversed.'}
            </Text>
            <Text style={[s.warningText, { textAlign: textDir }]}>
              {language === 'ar' 
                ? '• ستفقد جميع أهدافك النشطة، وسلاسل التمارين، وسجلات تقدمك فوراً.'
                : '• All your active goals, exercise streaks, and progress records will be lost immediately.'
              }
            </Text>
            <Text style={[s.warningText, { textAlign: textDir }]}>
              {language === 'ar' 
                ? '• سيتم مسح يومياتك الخاصة ومحادثاتك مع ذكاء منتورا بشكل دائم.'
                : '• Your private journal logs and chats with Mentora AI will be permanently removed.'
              }
            </Text>
          </View>

          <View style={s.form}>
            <Text style={[s.fieldLabel, { textAlign: textDir, color: '#E11D48', marginBottom: 12 }]}>
              {language === 'ar' ? 'تأكيد الحساب النشط' : 'Confirm Active Account'}
            </Text>
            
            <View style={[s.emailDisplayContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{email}</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                {language === 'ar' ? 'سيتم مسح هذا الحساب نهائياً' : 'This account will be permanently deleted'}
              </Text>
            </View>

            <TouchableOpacity style={s.btnDelete} onPress={handleDelete}>
              <Text style={s.btnDeleteText}>
                {language === 'ar' ? 'حذف حسابي نهائياً' : 'Delete My Account Forever'}
              </Text>
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
    backgroundColor: '#FEF2F2',
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
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginVertical: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    marginBottom: 4,
  },
  form: {
    marginTop: 12,
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emailDisplayContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  btnDelete: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeleteAccountScreen;
