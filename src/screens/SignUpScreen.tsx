import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import Svg, { Path, Circle } from 'react-native-svg';

const MailIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Path d="M22 6l-10 7L2 6" />
   </Svg>
);

const UserIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

const LockIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 11H3v11h18V11z" />
      <Path d="M7 11V7a5 5 0 0110 0v4" />
   </Svg>
);

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


export function SignUpScreen({ onGoToLogin }: { onGoToLogin: () => void }): React.ReactElement {
  const { signUp } = useAuth();
  const { language } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Date Picker States
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(2000);

  // Month lists
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const englishMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleOpenDatePicker = () => {
    if (dob) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          setTempDay(d);
          setTempMonth(m);
          setTempYear(y);
        }
      }
    } else {
      setTempDay(1);
      setTempMonth(1);
      setTempYear(2000);
    }
    setDatePickerVisible(true);
  };

  const handleConfirmDate = () => {
    const formattedDay = tempDay.toString().padStart(2, '0');
    const formattedMonth = tempMonth.toString().padStart(2, '0');
    setDob(`${formattedDay}/${formattedMonth}/${tempYear}`);
    setDatePickerVisible(false);
  };

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !re.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    if (text.length === 0) {
      setPasswordError('');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    } else if (!/[a-zA-Z]/.test(text)) {
      setPasswordError('Password must contain at least one letter (not just numbers)');
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    if (text.length > 0 && text !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };



  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert(
        language === 'ar' ? 'حقول مطلوبة' : 'Missing Fields',
        language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.'
      );
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      Alert.alert(
        language === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid Email',
        language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.'
      );
      return;
    }
    if (emailError || passwordError || confirmPasswordError) {
      Alert.alert(
        language === 'ar' ? 'خطأ في النموذج' : 'Form Error',
        language === 'ar' ? 'يرجى تصحيح الأخطاء في النموذج أولاً.' : 'Please correct the errors in the form.'
      );
      return;
    }

    // Register directly — no email verification step
    setIsLoading(true);
    try {
      await signUp({ email, password, name, phone: '', dob, gender });
    } catch (e: any) {
      Alert.alert(
        language === 'ar' ? 'فشل التسجيل' : 'Registration Failed',
        e.message || (language === 'ar' ? 'حدث خطأ أثناء التسجيل.' : 'An error occurred during registration.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const genders = ['Male', 'Female'];

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={s.logoContainer}>
             <Image 
                source={require('../assets/logo.png')} 
                style={s.logoImage} 
                resizeMode="contain" 
             />
             <Text style={s.brandTitle}>Mentora</Text>
             <Text style={s.brandSubtitle}>Create your account</Text>
          </View>

          <View style={s.form}>
            <Text style={s.label}>Full Name</Text>
            <View style={s.inputContainer}>
              <UserIcon />
              <TextInput
                style={s.input}
                placeholder="Enter your name"
                placeholderTextColor="#A0AEC0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={s.label}>Email</Text>
            <View style={[s.inputContainer, emailError ? s.inputError : null]}>
              <MailIcon />
              <TextInput
                style={s.input}
                placeholder="Enter your email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? <Text style={s.errorHint}>{emailError}</Text> : null}



            <Text style={s.label}>Date of Birth</Text>
            <TouchableOpacity style={s.inputContainer} onPress={handleOpenDatePicker}>
              <CalendarIcon />
              <Text style={[s.input, { textAlignVertical: 'center', paddingTop: 14, color: dob ? '#1E293B' : '#A0AEC0' }]}>
                {dob || "DD/MM/YYYY"}
              </Text>
            </TouchableOpacity>

            <Text style={s.label}>Gender</Text>
            <TouchableOpacity style={s.inputContainer} onPress={() => setGenderModalVisible(true)}>
              <UserIcon />
              <Text style={[s.input, { textAlignVertical: 'center', paddingTop: 14 }]}>{gender}</Text>
              <Text style={{ color: '#A0AEC0', fontSize: 12 }}>▼</Text>
            </TouchableOpacity>

            <Text style={s.label}>Password</Text>
            <View style={[s.inputContainer, passwordError ? s.inputError : null]}>
              <LockIcon />
              <TextInput
                style={s.input}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={s.errorHint}>{passwordError}</Text> : null}

            <Text style={s.label}>Confirm Password</Text>
            <View style={[s.inputContainer, confirmPasswordError ? s.inputError : null]}>
              <LockIcon />
              <TextInput
                style={s.input}
                placeholder="Re-enter your Password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={validateConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={s.errorHint}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity style={s.signUpButton} onPress={handleSignUp} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.signUpText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account ? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={s.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <Modal visible={genderModalVisible} transparent animationType="fade">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setGenderModalVisible(false)}>
          <View style={s.modalContent}>
            <FlatList
              data={genders}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={s.modalItem} 
                  onPress={() => {
                    setGender(item);
                    setGenderModalVisible(false);
                  }}
                >
                  <Text style={s.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date of Birth Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="slide">
        <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)}>
          <TouchableOpacity style={s.pickerContent} activeOpacity={1}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>{language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={s.pickerCloseButton}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.pickerRow}>
              {/* Day Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{language === 'ar' ? 'اليوم' : 'Day'}</Text>
                <FlatList
                  data={Array.from({ length: getDaysInMonth(tempMonth, tempYear) }, (_, i) => i + 1)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[s.pickerItem, tempDay === item && s.pickerItemActive]}
                      onPress={() => setTempDay(item)}
                    >
                      <Text style={[s.pickerItemText, tempDay === item && s.pickerItemTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              {/* Month Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{language === 'ar' ? 'الشهر' : 'Month'}</Text>
                <FlatList
                  data={Array.from({ length: 12 }, (_, i) => i + 1)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[s.pickerItem, tempMonth === item && s.pickerItemActive]}
                      onPress={() => {
                        setTempMonth(item);
                        const maxDays = getDaysInMonth(item, tempYear);
                        if (tempDay > maxDays) {
                          setTempDay(maxDays);
                        }
                      }}
                    >
                      <Text style={[s.pickerItemText, tempMonth === item && s.pickerItemTextActive]}>
                        {language === 'ar' ? arabicMonths[item - 1] : englishMonths[item - 1]}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              {/* Year Column */}
              <View style={s.pickerColumn}>
                <Text style={s.columnHeader}>{language === 'ar' ? 'السنة' : 'Year'}</Text>
                <FlatList
                  data={Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[s.pickerItem, tempYear === item && s.pickerItemActive]}
                      onPress={() => {
                        setTempYear(item);
                        const maxDays = getDaysInMonth(tempMonth, item);
                        if (tempDay > maxDays) {
                          setTempDay(maxDays);
                        }
                      }}
                    >
                      <Text style={[s.pickerItemText, tempYear === item && s.pickerItemTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>

            <TouchableOpacity style={s.pickerConfirmButton} onPress={handleConfirmDate}>
              <Text style={s.pickerConfirmText}>{language === 'ar' ? 'تأكيد' : 'Confirm'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoImage: { width: 100, height: 100, marginBottom: 12 },
  brandTitle: { fontSize: 26, fontWeight: '800', color: '#161B22', marginBottom: 4 },
  brandSubtitle: { fontSize: 14, color: '#A0AEC0', marginBottom: 10 },
  
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1E293B' },
  inputError: { borderColor: '#EF4444' },
  errorHint: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: -8 },
  
  signUpButton: {
    backgroundColor: '#161B22',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  signUpText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 20 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#1E293B', fontSize: 14, fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', width: '85%', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#161B22', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalItem: { paddingVertical: 16, width: '100%', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { fontSize: 16, textAlign: 'center', color: '#1E293B' },
  codeBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: 24, fontWeight: '700', letterSpacing: 10, height: 56, width: '100%', marginBottom: 24, color: '#1E293B' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Date Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161B22',
  },
  pickerCloseButton: {
    fontSize: 16,
    color: '#161B22',
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 220,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    width: '100%',
    textAlign: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#161B22',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerConfirmButton: {
    backgroundColor: '#161B22',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignUpScreen;
