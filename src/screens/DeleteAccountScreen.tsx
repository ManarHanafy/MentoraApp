import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon, TrashIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function DeleteAccountScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [emailConfirm, setEmailConfirm] = useState('');

  const handleDelete = () => {
    if (!emailConfirm) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error', 
        language === 'ar' ? 'يرجى إدخال بريدك الإلكتروني للتأكيد.' : 'Please enter your email to confirm.'
      );
      return;
    }
    Alert.alert(
      language === 'ar' ? 'إجراء نهائي ودائم' : 'Permanent Action',
      language === 'ar' 
        ? 'هل أنت متأكد تماماً من رغبتك في حذف حسابك نهائياً؟ سيتم حذف جميع مذكراتك ورسائلك وسجلات تقدمك إلى الأبد.'
        : 'Are you absolutely sure you want to permanently delete your account? All your journal entries, messages, and custom AI exercise history will be deleted forever.',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف نهائي' : 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            await logout();
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
            <Text style={[s.fieldLabel, { textAlign: textDir }]}>
              {language === 'ar' ? 'اكتب بريدك الإلكتروني للتأكيد' : 'Type your email to confirm'}
            </Text>
            <TextInput
              style={[s.input, { textAlign: textDir }]}
              placeholder="your.email@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailConfirm}
              onChangeText={setEmailConfirm}
            />

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
