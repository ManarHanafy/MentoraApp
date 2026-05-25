import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, AppState, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeartIcon, SendIcon, MicrophoneIcon } from '../components/Icons';
import { colors } from '../theme';
import s from './ChatScreen.style';
import { ChatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

// How long (ms) the user must be away from the chat before the session is auto-ended
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user' | 'system_warning' | 'system_crisis';
}

export function ChatScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { userName } = useAuth();
  const firstName = userName ? userName.split(' ')[0] : 'there';
  const navigation = useNavigation<any>();

  // ── state ──────────────────────────────────────────────────────────────────
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hi ${firstName}. I'm Mentora AI. I'm here to listen and help you through whatever is on your mind. How are you feeling today?`,
      sender: 'ai',
    }
  ]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);

  // ── refs for background / timeout ─────────────────────────────────────────
  const chatIdRef = useRef<string | null>(null);
  const isEndedRef = useRef(false);
  const isCrisisRef = useRef(false);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const blurTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Keep refs in sync with state
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);
  useEffect(() => { isEndedRef.current = isEnded; }, [isEnded]);
  useEffect(() => { isCrisisRef.current = isCrisis; }, [isCrisis]);

  // Keep active chatId in storage in sync
  useEffect(() => {
    const updateActiveChatId = async () => {
      try {
        const key = await ChatService.getUserKey('@mentora_active_chat_id');
        if (chatId && !isEnded) {
          await AsyncStorage.setItem(key, chatId);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (e) {
        console.error(e);
      }
    };
    updateActiveChatId();
  }, [chatId, isEnded]);

  // ── Load existing open chat on mount ──────────────────────────────────────
  useEffect(() => {
    const initChat = async () => {
      setIsThinking(true);
      try {
        // Fetch up to 3 recent chat sessions to build a continuous thread of conversation history
        const recentChats = await ChatService.getRecentChats(3);
        
        let allMappedMessages: Message[] = [];
        let activeChatId: string | null = null;
        let lastChatEnded = false;
        let lastChatCrisis = false;

        if (recentChats && recentChats.length > 0) {
          const latestChat = recentChats[0];
          activeChatId = latestChat.id.toString();
          lastChatEnded = latestChat.isEnded;
          lastChatCrisis = latestChat.riskLevel === 'crisis';

          // Only load history if the current session is NOT ended!
          if (!lastChatEnded) {
            const detailsPromises = recentChats.map((c: any) => ChatService.getChatDetails(c.id));
            const detailsList = await Promise.all(detailsPromises);
            
            const oldestToNewestDetails = detailsList.filter(d => d !== null).reverse();
            
            oldestToNewestDetails.forEach((details: any) => {
              if (details.messages && details.messages.length > 0) {
                const mapped: Message[] = details.messages.map((m: any) => ({
                  id: (m.id || Math.random()).toString(),
                  text: m.content || m.text || m.Message || '',
                  sender: m.role === 'assistant' ? 'ai' : 'user',
                }));
                allMappedMessages = [...allMappedMessages, ...mapped];
              }
            });
          }
        }

        if (allMappedMessages.length > 0 && !lastChatEnded) {
          setMessages(allMappedMessages);
        } else {
          // Ended session or new user -> start with empty/fresh welcome
          setMessages([
            {
              id: 'welcome_' + Date.now(),
              text: `Hi ${firstName}. I'm Mentora AI. I'm here to listen and help you through whatever is on your mind. How are you feeling today?`,
              sender: 'ai',
            }
          ]);
        }

        if (activeChatId && !lastChatEnded) {
          setChatId(activeChatId);
          setIsEnded(false);
          setIsCrisis(lastChatCrisis);
        } else {
          // Start a new chat session on the server
          const newId = await ChatService.startChat();
          if (newId) setChatId(newId);
          setIsEnded(false);
          setIsCrisis(false);
        }
      } catch (e) {
        console.error('Init chat history error', e);
      } finally {
        setIsThinking(false);
      }
    };
    initChat();
  }, [firstName]);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ── Background / foreground detection (5-min timeout) ────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextState.match(/background|inactive/)
      ) {
        // App went to background — save current time
        if (!isEndedRef.current && chatIdRef.current) {
          backgroundTimeRef.current = Date.now();
          const exitTimeKey = await ChatService.getUserKey('@chat_exit_time');
          await AsyncStorage.setItem(exitTimeKey, Date.now().toString());
        }
      } else if (nextState === 'active') {
        // App came back to foreground — calculate elapsed time
        if (backgroundTimeRef.current && !isEndedRef.current && chatIdRef.current) {
          const elapsed = Date.now() - backgroundTimeRef.current;
          if (elapsed >= SESSION_TIMEOUT_MS) {
            finalizeChat(chatIdRef.current!);
          } else {
            // Clear exit time only if ChatScreen is currently focused
            if (blurTimeRef.current === null) {
              const exitTimeKey = await ChatService.getUserKey('@chat_exit_time');
              await AsyncStorage.removeItem(exitTimeKey);
            }
          }
        }
        backgroundTimeRef.current = null;
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ── Tab blur → start 5-min timer (user navigated away inside app) ─────────
  useFocusEffect(
    useCallback(() => {
      // Screen gained focus — clear exit time from storage
      ChatService.getUserKey('@chat_exit_time').then(key => {
        AsyncStorage.removeItem(key).catch(console.error);
      });
      blurTimeRef.current = null;

      // Cancel any active background timer
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }

      return () => {
        // Screen lost focus (user switched tab)
        if (!isEndedRef.current && chatIdRef.current) {
          const now = Date.now();
          blurTimeRef.current = now;
          ChatService.getUserKey('@chat_exit_time').then(key => {
            AsyncStorage.setItem(key, now.toString()).catch(console.error);
          });
          
          // Also set a backup setTimeout in case they stay in foreground
          if (backgroundTimerRef.current) clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = setTimeout(() => {
            if (blurTimeRef.current) { // still blurred
              finalizeChat(chatIdRef.current!);
            }
          }, SESSION_TIMEOUT_MS);
        }
      };
    }, [chatId, isEnded])
  );

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || isThinking || isCrisis) return;

    const userMessageText = inputText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      let currentChatId = chatId;
      
      // If the session was previously ended normally (e.g. timeout), start a brand NEW chat session on send!
      if (isEnded || !currentChatId) {
        currentChatId = await ChatService.startChat();
        if (currentChatId) {
          setChatId(currentChatId);
          setIsEnded(false);
          isEndedRef.current = false;
        } else {
          addMessage('ai', 'Could not start a new session. Please check your connection and try again.');
          setIsThinking(false);
          return;
        }
      }

      const response = await ChatService.sendMessage(currentChatId, userMessageText);

      if (response) {
        // The AI reply comes in the "message" field
        addMessage('ai', response.message || response.reply || response.content || 'I understand. Tell me more.');

        // React based on riskLevel returned by the API
        // API returns: 'normal' | 'elevated' | 'crisis' — no suggestedAction field
        const riskLevel: string = (response.riskLevel || response.risk_level || 'normal').toLowerCase().trim();

        if (riskLevel === 'crisis' || riskLevel === 'danger') {
          handleCrisis(currentChatId);
        } else if (riskLevel === 'elevated' || riskLevel === 'high' || riskLevel === 'warning') {
          // Elevated/high/warning: fetch exercises in background, then show yellow bubble
          ChatService.summarizeChat(currentChatId)
            .then((summaryData) => {
              const exercises = summaryData?._exercises || [];
              showWarningBubble(exercises.length > 0 ? 'exercise' : 'journal');
            })
            .catch(() => showWarningBubble('exercise'));
        }
        // 'normal' → just continue the conversation, no bubbles
      } else {
        addMessage('ai', 'I\'m having a little trouble connecting right now, but I\'m still here for you. Please try again.');
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  // ── End the session (called automatically) ────────────────────────────────
  const finalizeChat = async (id: string) => {
    if (isEndedRef.current) return; // Guard against double calls
    isEndedRef.current = true;
    setIsEnded(true);

    try {
      const result = await ChatService.endChat(id);
      const exercises = result?._exercises || [];

      // Clear the previous messages immediately so they are no longer visible!
      setMessages([
        {
          id: 'welcome_' + Date.now(),
          text: `Hi ${firstName}. I'm Mentora AI. I'm here to listen and help you through whatever is on your mind. How are you feeling today?`,
          sender: 'ai',
        }
      ]);

      // Always save the flag and specify if we got exercises or not
      const flagValue = exercises.length > 0 ? 'exercises' : 'none';
      const alertKey = await ChatService.getUserKey('@session_complete_alert');
      await AsyncStorage.setItem(alertKey, flagValue);

      // Helper to start a fresh new session
      const startFreshSession = async () => {
        setIsThinking(true);
        try {
          const newId = await ChatService.startChat();
          if (newId) {
            setChatId(newId);
            setIsEnded(false);
            isEndedRef.current = false;
            setIsCrisis(false);
            isCrisisRef.current = false;
          }
        } catch (err) {
          console.error('Failed to auto-start fresh session after end:', err);
        } finally {
          setIsThinking(false);
        }
      };

      // Start the fresh session in the background
      await startFreshSession();

      // Show the complete alert
      if (exercises.length > 0) {
        Alert.alert(
          'Session Complete 🌿',
          'Mentora has suggested some exercises based on our conversation.',
          [
            { 
              text: 'View Exercises', 
              onPress: () => {
                navigation.navigate('Exercises', { openSuggested: true });
              } 
            },
            { 
              text: 'Later', 
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(
          'Session Ended 🌿',
          'Your conversation session has been completed and summarized.',
          [{ text: 'OK' }]
        );
      }
    } catch (e: any) {
      console.error('End chat error', e);
      Alert.alert(
        'Debug Error ⚠️',
        `Failed to finalize session: ${e.message || JSON.stringify(e)}`
      );
    }
  };

  // ── Crisis handling ───────────────────────────────────────────────────────
  const handleCrisis = async (id: string) => {
    setIsCrisis(true);
    isCrisisRef.current = true;
    setIsEnded(true);
    isEndedRef.current = true;
    addMessage('system_crisis',
      "I'm concerned about your safety. It's important that you speak with someone who can provide immediate support. Please reach out to a mental health professional or emergency services."
    );
    Alert.alert(
      'Your Safety Matters',
      'The chat has been stopped for your safety. Please reach out for professional help immediately.',
    );
    // Still call endChat so the backend records the session as ended
    try { await ChatService.endChat(id); } catch (_) {}
  };

  // ── Yellow warning bubble ─────────────────────────────────────────────────
  const showWarningBubble = (action: 'exercise' | 'journal') => {
    const text = action === 'exercise'
      ? "Based on our conversation, I think a short exercise might help you feel more grounded right now."
      : "Writing about your feelings in a journal can be a powerful way to process them.";

    const msg: Message = {
      id: 'warning_' + Date.now(),
      text,
      sender: 'system_warning',
    };
    setMessages(prev => [...prev, msg]);
  };

  // ── Helper to add a message ───────────────────────────────────────────────
  const addMessage = (sender: Message['sender'], text: string) => {
    setMessages(prev => [...prev, { id: sender + '_' + Date.now(), text, sender }]);
  };

  // ── Render a single message bubble ────────────────────────────────────────
  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'system_warning') {
      return (
        <View style={[s.warningBubble, { padding: 18, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }]}>
          <Text style={[s.warningText, { textAlign: 'left', fontSize: 14, marginBottom: 12, lineHeight: 20 }]}>
            ⚠️ {item.text}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: '#F59E0B', paddingVertical: 10,
                borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 4,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2,
              }}
              onPress={() => navigation.navigate('Exercises', { openSuggested: true })}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>🧘‍♂️ Start Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: '#FFF', borderWidth: 1,
                borderColor: '#F59E0B', paddingVertical: 10, borderRadius: 12,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 4,
              }}
              onPress={() => navigation.navigate('Journal')}
            >
              <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 13 }}>📝 Write Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.sender === 'system_crisis') {
      return (
        <View style={s.crisisBubble}>
          <Text style={s.crisisText}>🚨 {item.text}</Text>
        </View>
      );
    }

    const isAi = item.sender === 'ai';
    return (
      <View style={[s.messageRow, isAi ? s.messageRowLeft : s.messageRowRight]}>
        <View style={[s.messageBubble, isAi ? s.aiBubble : s.userBubble]}>
          <Text style={isAi ? s.aiText : s.userText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top || 44 }]}>
        <View style={s.headerContent}>
          <View style={s.profileIconContainer}>
            <HeartIcon color="#171B2B" size={20} />
          </View>
          <View style={s.headerTextContainer}>
            <Text style={s.headerTitle}>Mentora AI</Text>
            <Text style={s.headerSubtitle}>
              {isCrisis ? 'Safety Concern' : isEnded ? 'Session Completed' : 'Always here to listen'}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={s.keyboardAv}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[s.messageList, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListFooterComponent={
            isThinking ? (
              <View style={[s.messageRow, s.messageRowLeft]}>
                <View style={[s.messageBubble, s.aiBubble, { paddingVertical: 10 }]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              </View>
            ) : null
          }
        />

        {!isCrisis && (
          <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={s.inputContainer}>
              <TextInput
                style={s.textInput}
                placeholder="Share what's on your mind..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                editable={!isThinking}
                multiline
              />
              <TouchableOpacity style={s.micButton}>
                <MicrophoneIcon color="#9CA3AF" size={24} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[s.sendButton, (!inputText.trim() || isThinking) && { opacity: 0.6 }]}
              onPress={handleSend}
              disabled={!inputText.trim() || isThinking}
            >
              <SendIcon color={colors.white} size={20} />
            </TouchableOpacity>
          </View>
        )}

        {isCrisis && (
          <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 16), justifyContent: 'center' }]}>
            <Text style={{ color: 'red', fontStyle: 'italic', textAlign: 'center', fontWeight: 'bold' }}>
              This session has ended due to safety concerns. Please seek professional help.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatScreen;
