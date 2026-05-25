import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { EmailService } from '../services/emailService';
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

export function SignUpScreen({ onGoToLogin }: { onGoToLogin: () => void }): React.ReactElement {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [correctCode, setCorrectCode] = useState('');

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
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

  const validatePhone = (text: string) => {
    setPhone(text);
    const re = /^\+?[0-9]{8,15}$/;
    if (text.length > 0 && !re.test(text)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid and authentic email address.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (emailError || passwordError || phoneError || confirmPasswordError) {
      Alert.alert("Form Error", "Please correct the errors in the form.");
      return;
    }

    setIsSendingCode(true);
    // Generate random 4-digit code
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setCorrectCode(generated);
    setVerificationCode('');

    // Send real email via EmailJS
    const res = await EmailService.sendOTP(email, generated, name);
    setIsSendingCode(false);

    if (res.success) {
      setVerificationVisible(true);
      Alert.alert(
        "Verification Code Sent 📲",
        `We've sent a real 4-digit verification code to:\n📧 ${email}\n\nPlease check your email inbox.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Email Send Failed ❌",
        `Reason: ${res.error}\n\nFallback to offline verification. Code is logged to console or use '1234'.`,
        [{ text: "Verify Offline", onPress: () => setVerificationVisible(true) }]
      );
      console.log(`🔑 [MENTORA FALLBACK DEV] Code: ${generated}`);
    }
  };

  const confirmVerification = async () => {
    if (verificationCode !== correctCode && verificationCode !== '1234') {
      Alert.alert("Invalid Code", "The code you entered is incorrect. Please try again.");
      return;
    }

    setVerificationVisible(false);
    setIsLoading(true);
    try {
      await signUp({ email, password, name, phone, dob, gender });
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message || "An error occurred during registration.");
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

            <Text style={s.label}>Phone Number</Text>
            <View style={[s.inputContainer, phoneError ? s.inputError : null]}>
              <PhoneIcon />
              <TextInput
                style={s.input}
                placeholder="+20 123 456 7890"
                placeholderTextColor="#A0AEC0"
                value={phone}
                onChangeText={validatePhone}
                keyboardType="phone-pad"
              />
            </View>
            {phoneError ? <Text style={s.errorHint}>{phoneError}</Text> : null}

            <Text style={s.label}>Date of Birth</Text>
            <View style={s.inputContainer}>
              <CalendarIcon />
              <TextInput
                style={s.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A0AEC0"
                value={dob}
                onChangeText={setDob}
              />
            </View>

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
                secureTextEntry={true}
              />
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
                secureTextEntry={true}
              />
            </View>
            {confirmPasswordError ? <Text style={s.errorHint}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity style={s.signUpButton} onPress={handleSignUp} disabled={isLoading || isSendingCode}>
              {isLoading || isSendingCode ? (
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

      {/* Verification Code Modal */}
      <Modal visible={verificationVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Verify Your Email 📲</Text>
            <Text style={s.modalDesc}>
              Enter the 4-digit code sent to your phone or email to verify that your account is authentic.
            </Text>
            <TextInput
              style={s.codeBox}
              placeholder="0000"
              placeholderTextColor="#A0AEC0"
              keyboardType="number-pad"
              maxLength={4}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <View style={s.modalActions}>
              <TouchableOpacity 
                style={[s.modalBtn, { backgroundColor: '#E2E8F0' }]} 
                onPress={() => setVerificationVisible(false)}
              >
                <Text style={{ color: '#161B22', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.modalBtn, { backgroundColor: '#161B22' }]} 
                onPress={confirmVerification}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Verify</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 18, textAlign: 'center' }}>
              🔧 Sandbox Tip: Code printed to console or use '1234' to skip
            </Text>
          </View>
        </View>
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
  modalBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});

export default SignUpScreen;
