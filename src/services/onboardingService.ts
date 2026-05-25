import { API_BASE_URL } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async (): Promise<string> => {
  try {
    const { getOrRefreshToken } = require('./authHelper');
    return await getOrRefreshToken();
  } catch {
    return await AsyncStorage.getItem('@mentora_auth_token') || '';
  }
};

export interface OnboardingOption {
  optionId: number;
  optionText: string;
  scorePoints?: number;
}

export interface OnboardingQuestion {
  questionId: number;
  category?: string;
  parameter?: string;
  questionText: string;
  inputControlType?: string;
  responseOptions: OnboardingOption[];
  maxAllowedSelections?: number;
  isSensitiveQuestion?: boolean;
  preQuestionDisclaimer?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  completedAt?: string;
  shouldShow: boolean;
}

export const OnboardingService = {
  getQuestions: async (locale: string = 'en'): Promise<OnboardingQuestion[]> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Onboarding/questions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': locale
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data.questions || [];
      }
      throw new Error(`Failed to fetch onboarding questions: ${res.status}`);
    } catch (e) {
      console.warn('[OnboardingService] getQuestions error:', e);
      throw e;
    }
  },

  getStatus: async (): Promise<OnboardingStatus> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Onboarding/status`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Failed to fetch onboarding status: ${res.status}`);
    } catch (e) {
      console.warn('[OnboardingService] getStatus error:', e);
      throw e;
    }
  },

  submitOnboarding: async (answers: { questionId: number; selectedOptionIds: number[] }[], locale: string = 'en'): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Onboarding/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ answers, locale })
      });
      if (res.ok) {
        const data = await res.json();
        return data.success || data.completed || false;
      }
      throw new Error(`Failed to submit onboarding answers: ${res.status}`);
    } catch (e) {
      console.warn('[OnboardingService] submitOnboarding error:', e);
      throw e;
    }
  },

  resetOnboarding: async (): Promise<void> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Onboarding/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to reset onboarding: ${res.status}`);
      }
    } catch (e) {
      console.warn('[OnboardingService] resetOnboarding error:', e);
      throw e;
    }
  }
};
