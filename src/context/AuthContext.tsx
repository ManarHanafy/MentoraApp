import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_ACCOUNT_KEY = '@mentora_has_account';
const LOGGED_IN_KEY = '@mentora_logged_in';
const ONBOARDING_DONE_KEY = '@mentora_onboarding_done';
const USER_NAME_KEY = '@mentora_user_name';
const USER_EMAIL_KEY = '@mentora_user_email';
const USER_PHONE_KEY = '@mentora_user_phone';
const USER_DOB_KEY = '@mentora_user_dob';
const USER_GENDER_KEY = '@mentora_user_gender';
const TOKEN_KEY = '@mentora_auth_token';

export interface AuthState {
  hasAccount: boolean;
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  userName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithSocial: (provider: 'google' | 'facebook', verifiedEmail: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (data: { email: string; password: string; name: string; phone: string; dob: string; gender: string }) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<AuthState, 'userName' | 'email' | 'phone' | 'dob' | 'gender'>>) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setNoAccountMessageVisible: (v: boolean) => void;
  noAccountMessageVisible: boolean;
}

const defaultState: AuthState = {
  hasAccount: false,
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  userName: 'Manar',
  email: 'Manar@gmail.com',
  phone: '+020129482145',
  dob: '3/2/2005',
  gender: 'Female',
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, setState] = useState<AuthState>(defaultState);
  const [noAccountMessageVisible, setNoAccountMessageVisible] = useState(false);

  const loadStored = useCallback(async (): Promise<void> => {
    try {
      const [hasAccount, loggedIn, userName, email, phone, dob, gender] = await Promise.all([
        AsyncStorage.getItem(HAS_ACCOUNT_KEY),
        AsyncStorage.getItem(LOGGED_IN_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
        AsyncStorage.getItem(USER_EMAIL_KEY),
        AsyncStorage.getItem(USER_PHONE_KEY),
        AsyncStorage.getItem(USER_DOB_KEY),
        AsyncStorage.getItem(USER_GENDER_KEY),
      ]);

      let onboardingDone = 'false';
      if (email) {
        const userOnboardingKey = `@mentora_onboarding_done_${email.trim().toLowerCase()}`;
        const userOnboarding = await AsyncStorage.getItem(userOnboardingKey);
        if (userOnboarding) {
          onboardingDone = userOnboarding;
        } else {
          onboardingDone = (await AsyncStorage.getItem(ONBOARDING_DONE_KEY)) || 'false';
        }
      } else {
        onboardingDone = (await AsyncStorage.getItem(ONBOARDING_DONE_KEY)) || 'false';
      }

      setState({
        hasAccount: hasAccount === 'true',
        isLoggedIn: loggedIn === 'true',
        hasCompletedOnboarding: onboardingDone === 'true',
        userName: userName || 'Manar',
        email: email || 'Manar@gmail.com',
        phone: phone || '+020129482145',
        dob: dob || '3/2/2005',
        gender: gender || 'Female',
        isLoading: false,
      });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadStored();
  }, [loadStored]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const { AuthService } = require('../services/authService');
        const data = await AuthService.login(email, password);
        if (data && data.token) {
          const usernamePart = email.split('@')[0];
          const name = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);

          await AsyncStorage.multiSet([
            [LOGGED_IN_KEY, 'true'],
            [HAS_ACCOUNT_KEY, 'true'],
            [TOKEN_KEY, data.token],
            [USER_EMAIL_KEY, email],
            [USER_NAME_KEY, name],
          ]);

          // Save password for silent re-login
          await AsyncStorage.setItem('@mentora_user_password', password);
          
          // Since it's a regular login, we assume onboarding is already completed
          const userOnboardingKey = `@mentora_onboarding_done_${email.trim().toLowerCase()}`;
          await AsyncStorage.setItem(userOnboardingKey, 'true');
          
          const { ExerciseService } = require('../services/exerciseService');
          ExerciseService.clearCache();
          
          setState((s) => ({ 
            ...s, 
            isLoggedIn: true, 
            email: email, 
            userName: name,
            hasAccount: true,
            hasCompletedOnboarding: true,
          }));
          return { success: true };
        }
        return { success: false, message: 'Invalid response from server' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Login failed' };
      }
    },
    []
  );

  const loginWithSocial = useCallback(
    async (provider: 'google' | 'facebook', verifiedEmail: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const usernamePart = verifiedEmail.split('@')[0];
        const name = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);
        const email = verifiedEmail;
        // Deterministic password for the auto-created social account
        const autoPassword = `Mentora_${usernamePart}_Social!1`;

        let token = '';
        try {
          const { API_BASE_URL } = require('../config/env');
          const { AuthService } = require('../services/authService');

          // Step 1: Try to login directly (account may already exist)
          try {
            const loginRes = await AuthService.login(email, autoPassword);
            if (loginRes?.token) {
              token = loginRes.token;
            }
          } catch {
            // Login failed — account doesn't exist yet, register first
          }

          // Step 2: If no token, register then login
          if (!token) {
            try {
              await AuthService.register({
                username: usernamePart,
                email,
                firstName: name,
                lastName: 'User',
                password: autoPassword,
                phoneNumber: '',
                dateOfBirth: '',
                gender: '',
              });
            } catch {
              // Registration may fail if account already exists — that's fine
            }
            // Try login after register
            try {
              const loginRes2 = await AuthService.login(email, autoPassword);
              if (loginRes2?.token) {
                token = loginRes2.token;
              }
            } catch (loginErr) {
              console.warn('Social login: auto-login after register failed:', loginErr);
            }
          }
        } catch (apiErr) {
          console.warn('Social login: backend unreachable, continuing without token:', apiErr);
        }

        // Check if this social user has completed onboarding before
        const userOnboardingKey = `@mentora_onboarding_done_${email.trim().toLowerCase()}`;
        const existingOnboarding = await AsyncStorage.getItem(userOnboardingKey);
        const hasOnboarded = existingOnboarding === 'true';
        
        await AsyncStorage.multiSet([
          [LOGGED_IN_KEY, 'true'],
          [HAS_ACCOUNT_KEY, 'true'],
          [TOKEN_KEY, token],
          [USER_EMAIL_KEY, email],
          [USER_NAME_KEY, name],
        ]);

        await AsyncStorage.setItem(userOnboardingKey, hasOnboarded ? 'true' : 'false');
        await AsyncStorage.setItem('@mentora_user_password', autoPassword);
        
        const { ExerciseService } = require('../services/exerciseService');
        ExerciseService.clearCache();
        
        setState((s) => ({ 
          ...s, 
          isLoggedIn: true, 
          email: email, 
          userName: name,
          hasAccount: true,
          hasCompletedOnboarding: hasOnboarded,
        }));
        return { success: true };
      } catch (e: any) {
        return { success: false, message: e.message || 'Social login failed' };
      }
    },
    []
  );

  const signUp = useCallback(
    async (formData: { email: string; password: string; name: string; phone: string; dob: string; gender: string }): Promise<void> => {
      try {
        const { AuthService } = require('../services/authService');
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || 'Mentora';

        const registerData = {
          username: formData.email.split('@')[0],
          email: formData.email,
          firstName,
          lastName,
          password: formData.password,
          phoneNumber: formData.phone,
          dateOfBirth: formData.dob,
          gender: formData.gender
        };

        const data = await AuthService.register(registerData);
        
        let token = data?.token;
        if (!token) {
          try {
            console.log('No token in signup response. Attempting auto-login for:', formData.email);
            const loginRes = await AuthService.login(formData.email, formData.password);
            token = loginRes?.token;
          } catch (loginErr) {
            console.error('Auto-login after signup failed:', loginErr);
          }
        }
        
        await AsyncStorage.multiSet([
          [HAS_ACCOUNT_KEY, 'true'],
          [LOGGED_IN_KEY, 'true'],
          [ONBOARDING_DONE_KEY, 'false'],
          [USER_NAME_KEY, formData.name],
          [USER_EMAIL_KEY, formData.email],
          [USER_PHONE_KEY, formData.phone],
          [USER_DOB_KEY, formData.dob],
          [USER_GENDER_KEY, formData.gender],
        ]);
        
        await AsyncStorage.setItem('@mentora_user_password', formData.password);
        const userOnboardingKey = `@mentora_onboarding_done_${formData.email.trim().toLowerCase()}`;
        await AsyncStorage.setItem(userOnboardingKey, 'false');
        
        if (token) {
          await AsyncStorage.setItem(TOKEN_KEY, token);
        }

        const { ExerciseService } = require('../services/exerciseService');
        ExerciseService.clearCache();

        setState((s) => ({
          ...s,
          hasAccount: true,
          isLoggedIn: true,
          hasCompletedOnboarding: false,
          userName: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender
        }));
      } catch (e: any) {
        console.error('Sign up error:', e);
        throw e;
      }
    },
    []
  );

  const setToken = useCallback(async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }, []);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    const userEmail = state.email || '';
    if (userEmail) {
      const userOnboardingKey = `@mentora_onboarding_done_${userEmail.trim().toLowerCase()}`;
      await AsyncStorage.setItem(userOnboardingKey, 'true');
    }
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    setState((s) => ({ ...s, hasCompletedOnboarding: true }));
  }, [state.email]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const keysToClear = [
        LOGGED_IN_KEY,
        TOKEN_KEY,
        USER_NAME_KEY,
        USER_EMAIL_KEY,
        USER_PHONE_KEY,
        USER_DOB_KEY,
        USER_GENDER_KEY,
        ONBOARDING_DONE_KEY,
        '@mentora_user_password',
      ];
      await AsyncStorage.multiRemove(keysToClear);
      
      const { ExerciseService } = require('../services/exerciseService');
      ExerciseService.clearCache();
      
      // Reset state to default (logged out)
      setState({
        ...defaultState,
        isLoading: false,
        isLoggedIn: false,
        hasCompletedOnboarding: false
      });
    } catch (e) {
      console.error('Logout error', e);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<AuthState, 'userName' | 'email' | 'phone' | 'dob' | 'gender'>>): Promise<void> => {
    const keys: [string, string][] = [];
    if (data.userName !== undefined) keys.push([USER_NAME_KEY, data.userName]);
    if (data.email !== undefined) keys.push([USER_EMAIL_KEY, data.email]);
    if (data.phone !== undefined) keys.push([USER_PHONE_KEY, data.phone]);
    if (data.dob !== undefined) keys.push([USER_DOB_KEY, data.dob]);
    if (data.gender !== undefined) keys.push([USER_GENDER_KEY, data.gender]);

    if (keys.length > 0) {
      await AsyncStorage.multiSet(keys);
      setState((s) => ({ ...s, ...data }));
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    loginWithSocial,
    signUp,
    completeOnboarding,
    logout,
    updateProfile,
    setToken,
    setNoAccountMessageVisible,
    noAccountMessageVisible,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
