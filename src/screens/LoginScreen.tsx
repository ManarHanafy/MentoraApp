import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme';
import { styles } from './LoginScreen.style';
import { useAuth } from '../context/AuthContext';

export interface LoginScreenProps {
  onGoToSignUp: () => void;
}

export function LoginScreen({ onGoToSignUp }: LoginScreenProps): React.ReactElement {
  const { login, noAccountMessageVisible, setNoAccountMessageVisible } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignIn = async (): Promise<void> => {
    const result = await login(email, password);
    if (result.success === false && result.message === 'no_account') {
      setNoAccountMessageVisible(true);
    }
  };

  const closeNoAccountMessage = (): void => {
    setNoAccountMessageVisible(false);
    onGoToSignUp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIconWrap}>
            <Text style={styles.logoBrain}>🧠</Text>
            <Text style={styles.logoSparkle1}>✦</Text>
            <Text style={styles.logoSparkle2}>✦</Text>
            <Text style={styles.logoSparkle3}>✧</Text>
          </View>
          <Text style={styles.logoTitle}>Mentora</Text>
          <Text style={styles.logoSubtitle}>Welcome Back! Sign in to continue your journey</Text>
        </View>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>{passwordVisible ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => {}} style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={styles.rememberWrap}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: colors.borderLight, true: colors.info }}
            thumbColor={colors.white}
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </View>

        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} activeOpacity={0.9}>
          <Text style={styles.signInBtnText}>Sign in</Text>
        </TouchableOpacity>

        <View style={styles.orWrap}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.socialWrap}>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Text style={styles.socialIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Text style={styles.socialIconG}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
            <Text style={styles.socialIcon}>in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onGoToSignUp} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* No account message modal */}
      <Modal visible={noAccountMessageVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>No account registered</Text>
            <Text style={styles.modalBody}>
              There is no account registered with this app. Please sign up to create an account.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={closeNoAccountMessage} activeOpacity={0.9}>
              <Text style={styles.modalBtnText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
