import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

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

export function SignUpScreen({ onGoToLogin }: { onGoToLogin: () => void }): React.ReactElement {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    // Setting name empty or prompt later, the context takes a generic name 'Manar'
    await signUp(email, password, 'Manar'); 
  };

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
             <Text style={s.brandSubtitle}>Your daily mental wellness companion</Text>
          </View>

          <View style={s.form}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputContainer}>
              <MailIcon />
              <TextInput
                style={s.input}
                placeholder="Enter your email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

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

            <Text style={s.label}>Confirm Password</Text>
            <View style={s.inputContainer}>
              <LockIcon />
              <TextInput
                style={s.input}
                placeholder="Re-enter your Password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <TouchableOpacity>
                <EyeOffIcon />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.signUpButton} onPress={handleSignUp}>
              <Text style={s.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={s.orRow}>
              <View style={s.line} />
              <Text style={s.orText}>OR</Text>
              <View style={s.line} />
            </View>

            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialCircle}>
                 <Text style={[s.socialText, { color: '#1877F2' }]}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialCircle}>
                 <Text style={[s.socialText, { color: '#DB4437' }]}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialCircle}>
                 <Text style={[s.socialText, { color: '#0A66C2' }]}>in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account ? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={s.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120, marginBottom: 16 },
  brandTitle: { fontSize: 28, fontWeight: '800', color: '#161B22', marginBottom: 8 },
  brandSubtitle: { fontSize: 16, color: '#A0AEC0', marginBottom: 2 },
  
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1E293B' },
  
  signUpButton: {
    backgroundColor: '#161B22',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  signUpText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 16, color: '#A0AEC0', fontSize: 12, fontWeight: '600' },
  
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: { fontSize: 20, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#1E293B', fontSize: 14, fontWeight: '600' },
});

export default SignUpScreen;
