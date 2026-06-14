import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import {
  ArrowLeftIcon, GlobeIcon, BellIcon, LockIcon, TrashIcon,
  ChevronRightIcon, CheckCircleSolidIcon, ClipboardIcon, HelpCircleIcon
} from '../components/Icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const { t, language, isRTL } = useLanguage();
  const { resetOnboarding, email, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLocked, setIsLocked] = useState(true);
  const [resetting, setResetting] = useState(false);

  // PIN change state
  const [pinChangeVisible, setPinChangeVisible] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // New PIN input state
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinChangeStep, setPinChangeStep] = useState(1);
  
  const pinInputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (!verifyEmail.trim() || !verifyPassword.trim()) {
      Alert.alert(t.common.error, isRTL ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter email and password.');
      return;
    }
    
    if (verifyEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      Alert.alert(t.common.error, isRTL ? 'البريد الإلكتروني المدخل لا يطابق البريد الإلكتروني للحساب الحالي.' : 'The entered email does not match the logged-in user.');
      return;
    }
    
    setIsVerifying(true);
    try {
      const res = await login(verifyEmail.trim(), verifyPassword);
      if (res.success) {
        setIsVerified(true);
        setPinChangeStep(2);
      } else {
        Alert.alert(t.common.error, t.settings.invalidCredentials);
      }
    } catch (e: any) {
      Alert.alert(t.common.error, e.message || t.settings.invalidCredentials);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (pinChangeVisible && (pinChangeStep === 2 || pinChangeStep === 3)) {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pinChangeVisible, pinChangeStep]);

  const renderPinDigits = (pin: string) => {
    const digits = [0, 1, 2, 3];
    return (
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => pinInputRef.current?.focus()}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 16, marginVertical: 20, justifyContent: 'center' }}
      >
        {digits.map((index) => {
          const char = pin[index];
          const hasValue = char !== undefined;
          return (
            <View
              key={index}
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: hasValue ? colors.primary : '#E2E8F0',
                backgroundColor: hasValue ? '#EFF6FF' : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {hasValue ? (
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary }} />
              ) : null}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

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

  const handleRetakeTour = () => {
    Alert.alert(
      isRTL ? 'إعادة تشغيل الجولات الإرشادية' : 'Retake Guided Tours',
      isRTL 
        ? 'هل تريد إعادة تفعيل الجولات الإرشادية لصفحات الإحصاءات والملف الشخصي؟'
        : 'Do you want to enable the guided walkthrough tours for both Insights and Profile screens again?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: isRTL ? 'نعم، تفعيل' : 'Yes, Enable', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@mentora_tour_insights_done');
              await AsyncStorage.removeItem('@mentora_tour_profile_done');
              Alert.alert(
                isRTL ? 'نجاح' : 'Success',
                isRTL 
                  ? 'تمت إعادة تعيين الجولات الإرشادية بنجاح. ستظهر لك عند زيارتك القادمة لصفحتي الإحصاءات والملف الشخصي.'
                  : 'Guided tours reset successfully. They will appear on your next visit to Insights and Profile screens.'
              );
            } catch (err: any) {
              Alert.alert(
                isRTL ? 'خطأ' : 'Error',
                isRTL ? 'حدث خطأ غير متوقع.' : 'An error occurred. Please try again.'
              );
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

        <TouchableOpacity style={[s.listItem, { flexDirection: rowDir }]} onPress={handleRetakeTour}>
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <HelpCircleIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>
              {isRTL ? 'إعادة تشغيل الجولة الإرشادية' : 'Retake Guided Tour'}
            </Text>
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

        <TouchableOpacity 
          style={[s.listItem, { flexDirection: rowDir }]} 
          onPress={() => {
            setVerifyEmail('');
            setVerifyPassword('');
            setIsVerified(false);
            setNewPin('');
            setNewPinConfirm('');
            setPinChangeStep(1);
            setPinChangeVisible(true);
          }}
        >
          <View style={[s.itemLeft, { flexDirection: rowDir }]}>
            <LockIcon size={24} color={colors.textPrimary} />
            <Text style={[s.itemText, isRTL && s.rtlItemText]}>{t.settings.changeJournalPin}</Text>
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

      {/* Change Journal PIN Modal */}
      <Modal
        visible={pinChangeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPinChangeVisible(false);
          setVerifyEmail('');
          setVerifyPassword('');
          setIsVerified(false);
          setNewPin('');
          setNewPinConfirm('');
          setPinChangeStep(1);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setPinChangeVisible(false);
          setVerifyEmail('');
          setVerifyPassword('');
          setIsVerified(false);
          setNewPin('');
          setNewPinConfirm('');
          setPinChangeStep(1);
        }}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[s.modalCard, { padding: 24, maxWidth: 380, width: '90%', borderRadius: 24 }]}>
                
                {pinChangeStep === 1 && (
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                      {t.settings.verifyTitle}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 10, marginBottom: 16, lineHeight: 18 }}>
                      {t.settings.verifyDesc}
                    </Text>
                    
                    <TextInput
                      style={s.textInput}
                      placeholder={t.auth.email}
                      placeholderTextColor={colors.textMuted}
                      value={verifyEmail}
                      onChangeText={setVerifyEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    
                    <TextInput
                      style={s.textInput}
                      placeholder={t.auth.password}
                      placeholderTextColor={colors.textMuted}
                      value={verifyPassword}
                      onChangeText={setVerifyPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    
                    <TouchableOpacity
                      style={[s.primaryBtn, { marginTop: 12 }]}
                      onPress={handleVerify}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={s.btnText}>{isRTL ? 'تحقق' : 'Verify'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {pinChangeStep === 2 && (
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                      {t.journal.setPinTitle}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 }}>
                      {t.journal.setPinDesc}
                    </Text>
                    
                    {renderPinDigits(newPin)}
                    
                    <TextInput
                      ref={pinInputRef}
                      style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}
                      keyboardType="numeric"
                      maxLength={4}
                      value={newPin}
                      onChangeText={(val) => {
                        const cleanVal = val.replace(/[^0-9]/g, '');
                        setNewPin(cleanVal);
                        if (cleanVal.length === 4) {
                          setPinChangeStep(3);
                        }
                      }}
                    />
                  </View>
                )}

                {pinChangeStep === 3 && (
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                      {t.journal.setPinTitle}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 }}>
                      {t.journal.enterPinDesc}
                    </Text>
                    
                    {renderPinDigits(newPinConfirm)}
                    
                    <TextInput
                      ref={pinInputRef}
                      style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}
                      keyboardType="numeric"
                      maxLength={4}
                      value={newPinConfirm}
                      onChangeText={(val) => {
                        const cleanVal = val.replace(/[^0-9]/g, '');
                        setNewPinConfirm(cleanVal);
                        if (cleanVal.length === 4) {
                          if (cleanVal === newPin) {
                            (async () => {
                              const userEmail = email ? email.trim().toLowerCase() : '';
                              const key = `@mentora_journal_pin_${userEmail}`;
                              await AsyncStorage.setItem(key, newPin);
                              setPinChangeVisible(false);
                              setVerifyEmail('');
                              setVerifyPassword('');
                              setIsVerified(false);
                              setNewPin('');
                              setNewPinConfirm('');
                              setPinChangeStep(1);
                              Alert.alert(t.common.success, t.settings.pinChangedSuccess);
                            })();
                          } else {
                            Alert.alert(t.common.error, t.journal.pinMismatch);
                            setNewPinConfirm('');
                          }
                        }
                      }}
                    />
                  </View>
                )}
                
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity
                    style={[s.cancelBtn, { flex: 1 }]}
                    onPress={() => {
                      setPinChangeVisible(false);
                      setVerifyEmail('');
                      setVerifyPassword('');
                      setIsVerified(false);
                      setNewPin('');
                      setNewPinConfirm('');
                      setPinChangeStep(1);
                    }}
                  >
                    <Text style={s.cancelBtnText}>{t.common.cancel}</Text>
                  </TouchableOpacity>
                  
                  {pinChangeStep === 3 && (
                    <TouchableOpacity
                      style={[s.cancelBtn, { flex: 1, backgroundColor: '#F1F5F9' }]}
                      onPress={() => {
                        setNewPinConfirm('');
                        setPinChangeStep(2);
                      }}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{t.common.back}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    textAlign: 'left',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SettingsScreen;
