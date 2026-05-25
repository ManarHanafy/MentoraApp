import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Switch, KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert, Modal, ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { EmailService } from '../services/emailService';
import Svg, { Path } from 'react-native-svg';

const MailIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Path d="M22 6l-10 7L2 6" />
   </Svg>
);

const LockIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 11H3v11h18V11z" />
      <Path d="M7 11V7a5 5 0 0110 0v4" />
   </Svg>
);

const EyeOffIcon = () => (
   <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Path d="M1 1l22 22" />
   </Svg>
);

const GoogleIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </Svg>
);

export function LoginScreen({ onGoToSignUp }: { onGoToSignUp: () => void }): React.ReactElement {
  const { login, loginWithSocial } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Verification & Validation States
  const [emailError, setEmailError] = useState('');
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'email' | 'code'>('code');
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [correctCode, setCorrectCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const validateEmail = (text: string) => {
    setEmail(text);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !re.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Regular login — no email verification needed, go directly to backend
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        if (result.message === 'no_account') {
          Alert.alert("Account Not Found", "We couldn't find an account with that email. Please sign up.");
        } else {
          Alert.alert("Login Failed", result.message || "Invalid credentials.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: 'google' | 'facebook') => {
    setSocialProvider(provider);
    setSocialEmail('');
    setVerificationCode('');
    setVerificationStep('email');
    setVerificationVisible(true);
  };

  const sendSocialCode = async () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!socialEmail || !re.test(socialEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid and authentic email address.");
      return;
    }

    setIsSendingCode(true);
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setCorrectCode(generated);
    setVerificationCode('');

    const res = await EmailService.sendOTP(socialEmail, generated, 'Mentora User');
    setIsSendingCode(false);

    if (res.success) {
      setVerificationStep('code');
      Alert.alert(
        "Verification Code Sent 📲",
        `We've sent a real 4-digit verification code to:\n📧 ${socialEmail}\n\nPlease check your email inbox.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Email Send Failed ❌",
        `Reason: ${res.error}\n\nFallback to offline verification. Code is logged to console or use '1234'.`,
        [{ text: "Verify Offline", onPress: () => setVerificationStep('code') }]
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
      if (socialProvider) {
        // Authenticate via social mock pipeline with their verified social email
        const res = await loginWithSocial(socialProvider, socialEmail);
        if (!res.success) {
          Alert.alert("Social Login Failed", res.message || "An error occurred.");
        }
      } else {
        // Normal Auth Pipeline
        const result = await login(email, password);
        if (!result.success) {
          if (result.message === 'no_account') {
            Alert.alert("Account Not Found", "We couldn't find an account with that email. Please sign up.");
          } else {
            Alert.alert("Login Failed", result.message || "Invalid credentials.");
          }
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Logo */}
          <View style={s.logoContainer}>
             <Image 
                source={require('../assets/logo.png')} 
                style={s.logoImage} 
                resizeMode="contain" 
             />
             <Text style={s.brandTitle}>Mentora</Text>
             <Text style={s.brandSubtitle}>Welcome Back!</Text>
             <Text style={s.brandDesc}>Sign in to continue your journey</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
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

            <Text style={s.label}>Password</Text>
            <View style={s.inputContainer}>
              <LockIcon />
              <TextInput
                style={s.input}
                placeholder="Enter your Password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <TouchableOpacity>
                <EyeOffIcon />
              </TouchableOpacity>
            </View>

            <View style={s.forgotRow}>
              <View style={s.rememberRow}>
                <Switch 
                  value={rememberMe} 
                  onValueChange={setRememberMe}
                  trackColor={{ false: '#E2E8F0', true: '#161B22' }}
                  thumbColor="#FFFFFF"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text style={s.rememberText}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={s.forgotText}>Forgot password ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.signInButton} onPress={handleSignIn} disabled={isLoading || isSendingCode}>
              {isLoading || isSendingCode ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.signInText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={s.orRow}>
              <View style={s.line} />
              <Text style={s.orText}>OR SIGN IN WITH</Text>
              <View style={s.line} />
            </View>

            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialCircle} onPress={() => handleSocialSignIn('facebook')}>
                  <FacebookIcon />
              </TouchableOpacity>
              <TouchableOpacity style={s.socialCircle} onPress={() => handleSocialSignIn('google')}>
                  <GoogleIcon />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Don't have an account ? </Text>
            <TouchableOpacity onPress={onGoToSignUp}>
              <Text style={s.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Verification & Social Email Modal */}
      <Modal visible={verificationVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {verificationStep === 'email' ? (
              <>
                <Text style={s.modalTitle}>Social Account Email</Text>
                <Text style={s.modalDesc}>
                  Enter the email address of your {socialProvider === 'google' ? 'Google' : 'Facebook'} account. We will send a verification code to authenticate it.
                </Text>
                <View style={s.modalInputContainer}>
                  <MailIcon />
                  <TextInput
                    style={s.modalTextInput}
                    placeholder="name@example.com"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={socialEmail}
                    onChangeText={setSocialEmail}
                  />
                </View>
                <View style={s.modalActions}>
                  <TouchableOpacity 
                    style={[s.modalBtn, { backgroundColor: '#E2E8F0' }]} 
                    onPress={() => setVerificationVisible(false)}
                    disabled={isSendingCode}
                  >
                    <Text style={{ color: '#161B22', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.modalBtn, { backgroundColor: '#161B22' }]} 
                    onPress={sendSocialCode}
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Send Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={s.modalTitle}>Verify Your Email 📲</Text>
                <Text style={s.modalDesc}>
                  Enter the 4-digit code sent to your email to verify that your account is authentic.
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
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const isSmall = SCREEN_H < 700;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: SCREEN_W * 0.06, paddingVertical: isSmall ? 20 : 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: isSmall ? 16 : 30 },
  logoImage: { width: SCREEN_W * 0.22, height: SCREEN_W * 0.22, marginBottom: isSmall ? 6 : 12 },
  brandTitle: { fontSize: isSmall ? 22 : 26, fontWeight: '800', color: '#161B22', marginBottom: 4 },
  brandSubtitle: { fontSize: 14, color: '#A0AEC0', marginBottom: 2 },
  brandDesc: { fontSize: 13, color: '#64748B' },
  
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: isSmall ? 46 : 52,
    marginBottom: isSmall ? 10 : 16,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1E293B' },
  inputError: { borderColor: '#EF4444' },
  errorHint: { color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4, marginTop: -8 },
  
  forgotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSmall ? 16 : 24, marginTop: -8 },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 4 },
  forgotText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  
  signInButton: {
    backgroundColor: '#161B22',
    height: isSmall ? 48 : 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmall ? 16 : 24,
  },
  signInText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: isSmall ? 16 : 24 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 16, color: '#A0AEC0', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: isSmall ? 16 : 32 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#1E293B', fontSize: 14, fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', width: SCREEN_W * 0.88, borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#161B22', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, height: 52, width: '100%', marginBottom: 20 },
  modalTextInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1E293B' },
  codeBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: 24, fontWeight: '700', letterSpacing: 10, height: 56, width: '100%', marginBottom: 24, color: '#1E293B' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, width: '100%' },
  modalBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});

export default LoginScreen;
