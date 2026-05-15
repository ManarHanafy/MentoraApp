import { API_BASE_URL } from '../config/env';
import { ExerciseService } from './exerciseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user' | 'system_warning' | 'system_crisis';
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  isEnded: boolean;
  riskLevel: 'normal' | 'elevated' | 'crisis';
}

const getAuthToken = async (): Promise<string> => {
  return await AsyncStorage.getItem('@mentora_auth_token') || '';
};

export const ChatService = {
  getLatestChat: async (): Promise<any | null> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats?pageSize=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const chats = data.items || data;
        return chats.length > 0 ? chats[0] : null;
      }
    } catch (e) {
      console.error('Failed to get latest chat', e);
    }
    return null;
  },

  getChatDetails: async (chatId: string): Promise<any | null> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to get chat details', e);
    }
    return null;
  },

  startChat: async (): Promise<string | null> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (res.ok) {
        const data = await res.json();
        if (typeof data === 'number' || typeof data === 'string') return data.toString();
        const id = data.id || data.Id || data.chatId || data.ChatId || '';
        return id ? id.toString() : null;
      }
    } catch (e) {
      console.error('Failed to start chat', e);
    }
    return null;
  },

  sendMessage: async (chatId: string, text: string): Promise<any> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
    return null;
  },

  endChat: async (chatId: string): Promise<any> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats/${chatId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const aiSuggested = data.suggestedExercises || data.suggested_exercises || data.SuggestedExercises || [];
        if (aiSuggested.length > 0) {
           await ExerciseService.saveSuggestedExercises(aiSuggested);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to end chat', e);
    }
    return null;
  },

  summarizeChat: async (chatId: string): Promise<any> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats/${chatId}/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to summarize chat', e);
    }
    return null;
  }
};
