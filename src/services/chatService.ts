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
  /** GET /Chats?pageSize=1 — returns the most recent chat or null */
  getLatestChat: async (): Promise<any | null> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats?pageSize=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // API returns { items: [...], totalCount, ... }
        const chats = data.items || data;
        return Array.isArray(chats) && chats.length > 0 ? chats[0] : null;
      }
    } catch (e) {
      console.error('Failed to get latest chat', e);
    }
    return null;
  },

  /** GET /Chats — returns recent chats list */
  getRecentChats: async (pageSize = 3): Promise<any[]> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats?pageSize=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (e) {
      console.error('Failed to get recent chats', e);
    }
    return [];
  },

  /** GET /Chats/:chatId — returns full chat with messages */
  getChatDetails: async (chatId: string | number): Promise<any | null> => {
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

  /** POST /Chats — starts a new chat session, returns chatId as number/string */
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
        // API returns { "chatId": 10 } — note: field is "chatId" not "id"
        if (typeof data === 'number' || typeof data === 'string') return data.toString();
        const id = data.chatId || data.ChatId || data.id || data.Id || '';
        return id ? id.toString() : null;
      }
    } catch (e) {
      console.error('Failed to start chat', e);
    }
    return null;
  },

  /** POST /Chats/:chatId/messages — sends a message, returns AI reply + riskLevel */
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
        // Response shape: { chatId, message, currentScores, deltas, riskLevel, tags, timestamp }
        // Note: there is NO suggestedAction field — only riskLevel: 'normal'|'elevated'|'crisis'
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
    return null;
  },

  /** POST /Chats/:chatId/end — ends the session and returns suggested exercises.
   *  NOTE: The backend /end returns only { message: "Chat ended." } with NO exercises.
   *  So we call /summarize FIRST to get exercises, then call /end to close the session. */
  endChat: async (chatId: string): Promise<any> => {
    let exercises: any[] = [];

    // Step 1: Get exercises from /summarize before ending
    try {
      const summaryResult = await ChatService.summarizeChat(chatId);
      exercises = summaryResult?._exercises || [];
    } catch (e) {
      console.warn('summarize before end failed, continuing to end anyway', e);
    }

    // Step 2: Call /end to close the session on the server
    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE_URL}/Chats/${chatId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.warn('Failed to call /end endpoint', e);
    }

    // NOTE: No fallback exercises — exercises only come from the AI
    // based on what the user actually said during the conversation.
    // If the session was too short or the AI returned nothing, we show nothing.

    return { message: 'Chat ended.', _exercises: exercises };
  },

  /** POST /Chats/:chatId/summarize — mid-session summary + exercises (for elevated risk) */
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
        const data = await res.json();
        const aiSuggested =
          data.suggestedExercises ||
          data.suggested_exercises ||
          data.SuggestedExercises || [];
        if (aiSuggested.length > 0) {
          await ExerciseService.saveSuggestedExercises(aiSuggested);
        }
        return { ...data, _exercises: aiSuggested };
      }
    } catch (e) {
      console.error('Failed to summarize chat', e);
    }
    return null;
  },

  /** GET /Chats/:chatId/summary — read-only summary (no side effects) */
  getChatSummary: async (chatId: string): Promise<any> => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/Chats/${chatId}/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to get chat summary', e);
    }
    return null;
  },

  /** Check active chat session exit time and finalize if timed out */
  checkAndFinalizeTimeout: async (timeoutMs: number = 5 * 60 * 1000): Promise<boolean> => {
    try {
      const activeChatId = await AsyncStorage.getItem('@mentora_active_chat_id');
      const exitTimeStr = await AsyncStorage.getItem('@chat_exit_time');
      
      if (activeChatId && exitTimeStr) {
        const exitTime = parseInt(exitTimeStr, 10);
        const elapsed = Date.now() - exitTime;
        if (elapsed >= timeoutMs) {
          console.log(`Chat session ${activeChatId} timed out. Finalizing...`);
          // Clear keys FIRST to prevent duplicate calls
          await AsyncStorage.removeItem('@mentora_active_chat_id');
          await AsyncStorage.removeItem('@chat_exit_time');
          
          const result = await ChatService.endChat(activeChatId);
          const exercises = result?._exercises || [];
          
          // Set flag to notify components
          const flagValue = exercises.length > 0 ? 'exercises' : 'none';
          await AsyncStorage.setItem('@session_complete_alert', flagValue);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to check/finalize chat timeout:', e);
    }
    return false;
  }
};
