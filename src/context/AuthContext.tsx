import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_ACCOUNT_KEY = '@mentora_has_account';
const LOGGED_IN_KEY = '@mentora_logged_in';
const ONBOARDING_DONE_KEY = '@mentora_onboarding_done';
const USER_NAME_KEY = '@mentora_user_name';

export interface AuthState {
  hasAccount: boolean;
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  userName: string;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  setNoAccountMessageVisible: (v: boolean) => void;
  noAccountMessageVisible: boolean;
}

const defaultState: AuthState = {
  hasAccount: false,
  isLoggedIn: false,
  hasCompletedOnboarding: false,
  userName: 'Manar',
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, setState] = useState<AuthState>(defaultState);
  const [noAccountMessageVisible, setNoAccountMessageVisible] = useState(false);

  const loadStored = useCallback(async (): Promise<void> => {
    try {
      const [hasAccount, loggedIn, onboardingDone, userName] = await Promise.all([
        AsyncStorage.getItem(HAS_ACCOUNT_KEY),
        AsyncStorage.getItem(LOGGED_IN_KEY),
        AsyncStorage.getItem(ONBOARDING_DONE_KEY),
        AsyncStorage.getItem(USER_NAME_KEY),
      ]);
      setState({
        hasAccount: hasAccount === 'true',
        isLoggedIn: loggedIn === 'true',
        hasCompletedOnboarding: onboardingDone === 'true',
        userName: userName || 'Manar',
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
    async (email: string, _password: string): Promise<{ success: boolean; message?: string }> => {
      const hasAccount = await AsyncStorage.getItem(HAS_ACCOUNT_KEY);
      if (hasAccount !== 'true') {
        return { success: false, message: 'no_account' };
      }
      await AsyncStorage.setItem(LOGGED_IN_KEY, 'true');
      setState((s) => ({ ...s, isLoggedIn: true }));
      return { success: true };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, _password: string, name?: string): Promise<void> => {
      await AsyncStorage.multiSet([
        [HAS_ACCOUNT_KEY, 'true'],
        [LOGGED_IN_KEY, 'true'],
        [USER_NAME_KEY, name && name.trim() ? name.trim() : 'Manar'],
      ]);
      setState((s) => ({
        ...s,
        hasAccount: true,
        isLoggedIn: true,
        userName: name && name.trim() ? name.trim() : 'Manar',
      }));
    },
    []
  );

  const completeOnboarding = useCallback(async (): Promise<void> => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    setState((s) => ({ ...s, hasCompletedOnboarding: true }));
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await AsyncStorage.setItem(LOGGED_IN_KEY, 'false');
    setState((s) => ({ ...s, isLoggedIn: false }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    signUp,
    completeOnboarding,
    logout,
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
