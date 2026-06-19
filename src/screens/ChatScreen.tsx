import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Platform, ActivityIndicator, Alert, AppState, Linking, Keyboard, KeyboardEvent, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeartIcon, SendIcon, MicrophoneIcon } from '../components/Icons';
import { colors } from '../theme';
import s from './ChatScreen.style';
import { ChatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  BookOpen, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Wind, 
  Globe, 
  ShieldAlert 
} from 'lucide-react-native';

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user' | 'system_warning' | 'system_crisis' | 'system_session_end';
}

export function ChatScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { userName } = useAuth();
  const firstName = userName ? userName.split(' ')[0] : 'there';
  const navigation = useNavigation<any>();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);

  const chatIdRef = useRef<string | null>(null);
  const isEndedRef = useRef(false);
  const isCrisisRef = useRef(false);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const blurTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);
  useEffect(() => { isEndedRef.current = isEnded; }, [isEnded]);
  useEffect(() => { isCrisisRef.current = isCrisis; }, [isCrisis]);

  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Keyboard animation hook – moves input exactly above the keyboard
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const duration = Platform.OS === 'ios' ? 250 : 150;

    const onShow = (e: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration,
        useNativeDriver: false,
      }).start();
      // Scroll to bottom when keyboard opens
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), duration + 50);
    };
    const onHide = () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  useEffect(() => {
    const initChat = async () => {
      setIsThinking(true);
      try {
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
          // Only set welcome message here; do not duplicate the initial state
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
          // If the last chat ended, start a new one automatically
          const newId = await ChatService.startChat();
          if (newId) setChatId(newId);
          setIsEnded(false);
          setIsCrisis(false);

          // Check if we need to show the session-complete alert sequence
          const alertKey = await ChatService.getUserKey('@session_complete_alert');
          const flag = await AsyncStorage.getItem(alertKey);
          if (flag === 'exercises' || flag === 'none') {
            await AsyncStorage.removeItem(alertKey);
            // Alert 1: Session completed
            Alert.alert(
              'Session Completed',
              'Session completed successfully.',
              [{
                text: 'OK',
                onPress: () => {
                  if (flag === 'exercises') {
                    // Alert 2: Personalized exercises
                    Alert.alert(
                      'Exercises Available',
                      'Personalized exercises are available based on your session.',
                      [
                        {
                          text: 'Start Exercises',
                          onPress: () => navigation.navigate('Exercises', { openSuggested: true }),
                        },
                        { text: 'Later', style: 'cancel' },
                      ]
                    );
                  }
                },
              }]
            );
          }
        }
      } catch (e) {
        console.error('Init chat history error', e);
      } finally {
        setIsThinking(false);
      }
    };
    initChat();
  }, [firstName]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextState.match(/background|inactive/)
      ) {
        if (!isEndedRef.current && chatIdRef.current) {
          backgroundTimeRef.current = Date.now();
          const exitTimeKey = await ChatService.getUserKey('@chat_exit_time');
          await AsyncStorage.setItem(exitTimeKey, Date.now().toString());
        }
      } else if (nextState === 'active') {
        if (backgroundTimeRef.current && !isEndedRef.current && chatIdRef.current) {
          const elapsed = Date.now() - backgroundTimeRef.current;
          if (elapsed >= SESSION_TIMEOUT_MS) {
            finalizeChat(chatIdRef.current!);
          } else {
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

  useFocusEffect(
    useCallback(() => {
      ChatService.getUserKey('@chat_exit_time').then(key => {
        AsyncStorage.removeItem(key).catch(console.error);
      });
      blurTimeRef.current = null;

      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }

      return () => {
        if (!isEndedRef.current && chatIdRef.current) {
          const now = Date.now();
          blurTimeRef.current = now;
          ChatService.getUserKey('@chat_exit_time').then(key => {
            AsyncStorage.setItem(key, now.toString()).catch(console.error);
          });
          
          if (backgroundTimerRef.current) clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = setTimeout(() => {
            if (blurTimeRef.current) {
              finalizeChat(chatIdRef.current!);
            }
          }, SESSION_TIMEOUT_MS);
        }
      };
    }, [chatId, isEnded])
  );

  const handleSend = async () => {
    if (!inputText.trim() || isThinking || isCrisis) return;

    const userMessageText = inputText.trim();
    
    const lowerText = userMessageText.toLowerCase();
    const riskPhrases = [
      'suicide', 'kill myself', 'want to die', 'end my life', 'harm myself', 
      'killmy self', 'end mylife', 'suicidal', 'better off dead',
      'انتحر', 'أنتحر', 'هموت نفسي', 'اموت نفسي', 'اقتل نفسي', 'أقتل نفسي',
      'انهي حياتي', 'أنهي حياتي', 'ايذاء نفسي', 'إيذاء نفسي'
    ];
    const containsRisk = riskPhrases.some(phrase => lowerText.includes(phrase));

    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (containsRisk) {
      setIsThinking(true);
      setTimeout(() => {
        setIsThinking(false);
        handleCrisis(chatId || 'client_detected');
      }, 800);
      return;
    }

    setIsThinking(true);

    try {
      let currentChatId = chatId;
      
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
        addMessage('ai', response.message || response.reply || response.content || 'I understand. Tell me more.');

        const riskLevel: string = (response.riskLevel || response.risk_level || 'normal').toLowerCase().trim();

        if (riskLevel === 'crisis' || riskLevel === 'danger') {
          handleCrisis(currentChatId);
        } else if (riskLevel === 'elevated' || riskLevel === 'high' || riskLevel === 'warning') {
          ChatService.summarizeChat(currentChatId)
            .then((summaryData) => {
              const exercises = summaryData?._exercises || [];
              showWarningBubble(exercises.length > 0 ? 'exercise' : 'journal');
            })
            .catch(() => showWarningBubble('exercise'));
        }
      } else {
        addMessage('ai', 'I\'m having a little trouble connecting right now, but I\'m still here for you. Please try again.');
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleStartNewSession = async () => {
    setIsThinking(true);
    try {
      const newId = await ChatService.startChat();
      if (newId) {
        setChatId(newId);
        setIsEnded(false);
        isEndedRef.current = false;
        setIsCrisis(false);
        isCrisisRef.current = false;
        
        setMessages([
          {
            id: 'welcome_' + Date.now(),
            text: `Hi ${firstName}. I'm Mentora AI. I'm here to listen and help you through whatever is on your mind. How are you feeling today?`,
            sender: 'ai',
          }
        ]);
      } else {
        Alert.alert('Error', 'Could not start a new session. Please check your connection.');
      }
    } catch (err) {
      console.error('Failed to start new session:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const finalizeChat = async (id: string) => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;

    let validExercises: any[] = [];
    try {
      // endChat calls /summarize then /end — exactly once, no duplicates
      const result = await ChatService.endChat(id);
      validExercises = result?._exercises || [];

      // Clear the HomeScreen polling flag so it cannot fire a duplicate alert
      const alertKey = await ChatService.getUserKey('@session_complete_alert');
      await AsyncStorage.removeItem(alertKey);
    } catch (e: any) {
      console.error('End chat error', e);
    }

    // Starts a fresh session after alerts are dismissed
    const startFreshSession = () => {
      setTimeout(async () => {
        try {
          const newId = await ChatService.startChat();
          if (newId) {
            setChatId(newId);
            isEndedRef.current = false;
            setIsEnded(false);
            setIsCrisis(false);
            isCrisisRef.current = false;
            setMessages([
              {
                id: 'welcome_' + Date.now(),
                text: `Hi ${firstName}. I'm Mentora AI. I'm here to listen and help you through whatever is on your mind. How are you feeling today?`,
                sender: 'ai',
              }
            ]);
          }
        } catch (err) {
          console.error('Failed to auto-start fresh session after end:', err);
        }
      }, 500);
    };

    // Alert 1 — always shown after session ends
    Alert.alert(
      'Session Completed',
      'Session completed successfully.',
      [{
        text: 'OK',
        onPress: () => {
          if (validExercises.length > 0) {
            // Alert 2 — only when exercises were returned
            Alert.alert(
              'Exercises Available',
              'Personalized exercises are available based on your session.',
              [
                {
                  text: 'Start Exercises',
                  onPress: () => {
                    navigation.navigate('Exercises', { openSuggested: true });
                    startFreshSession();
                  },
                },
                {
                  text: 'Later',
                  style: 'cancel',
                  onPress: startFreshSession,
                },
              ]
            );
          } else {
            startFreshSession();
          }
        },
      }]
    );
  };

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
    try { await ChatService.endChat(id); } catch (_) {}
  };

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

  const addMessage = (sender: Message['sender'], text: string) => {
    setMessages(prev => [...prev, { id: sender + '_' + Date.now(), text, sender }]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'system_warning') {
      return (
        <View style={[s.warningBubble, { padding: 18, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <AlertTriangle size={16} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={[s.warningText, { textAlign: 'left', fontSize: 14, lineHeight: 20, flex: 1 }]}>
              {item.text}
            </Text>
          </View>
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
              <Activity size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Start Exercise</Text>
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
              <BookOpen size={14} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 13 }}>Write Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.sender === 'system_session_end') {
      return (
        <View style={[
          s.warningBubble,
          { padding: 18, borderLeftWidth: 4, borderLeftColor: '#10B981', backgroundColor: '#F0FDF4' }
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MessageSquare size={16} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={{ color: '#065F46', fontWeight: 'bold', fontSize: 14 }}>Session Complete 🎉</Text>
          </View>
          <Text style={{ color: '#065F46', fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
            {item.text}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#10B981', paddingVertical: 11,
              borderRadius: 12, alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 6,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15, shadowRadius: 2, elevation: 3,
            }}
            onPress={() => navigation.navigate('Exercises', { openSuggested: true })}
          >
            <Activity size={15} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Start Exercises</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.sender === 'system_crisis') {
      return (
        <View style={s.crisisBubble}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShieldAlert size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={[s.crisisText, { flex: 1 }]}>{item.text}</Text>
          </View>
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

      {/* The Animated.View wraps the messages + input so the whole area lifts by exactly
          the keyboard height, giving pixel-perfect placement above the keyboard */}
      <Animated.View style={[s.keyboardAv, { marginBottom: keyboardHeight }]}>
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
          <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
          <View style={{
            backgroundColor: '#FFF5F5',
            borderTopWidth: 2,
            borderTopColor: '#FEE2E2',
            paddingTop: 20,
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 20),
            alignItems: 'center',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 10,
          }}>
            <Text style={{
              fontSize: 18,
              color: '#DC2626',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 6
            }}>
              You're Not Alone
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#7F1D1D',
              textAlign: 'center',
              marginBottom: 18,
              lineHeight: 18
            }}>
              Your safety is our top priority. If you or someone you know is struggling or in crisis, help is available. Please reach out to these free, confidential resources:
            </Text>

            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#DC2626',
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#DC2626',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={() => Linking.openURL('tel:988').catch(() => Alert.alert('Error', 'Could not dial 988. Please call directly.'))}
              >
                <Phone size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                  Call Suicide & Crisis Lifeline (988)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#1E293B',
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={() => Linking.openURL('sms:741741?body=HOME').catch(() => Alert.alert('Error', 'Could not open messages. Please text HOME to 741741.'))}
              >
                <MessageSquare size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                  Text Crisis Support (HOME to 741741)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: '#059669',
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8
                }}
                onPress={() => navigation.navigate('BreathingExercise')}
              >
                <Wind size={14} color="#059669" style={{ marginRight: 6 }} />
                <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 14 }}>
                  Take a Guided Calming Breath
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8
                }}
                onPress={() => Linking.openURL('https://findahelpline.com/').catch(() => Alert.alert('Error', 'Could not open help portal.'))}
              >
                <Globe size={14} color="#4B5563" style={{ marginRight: 6 }} />
                <Text style={{ color: '#4B5563', fontWeight: '500', fontSize: 13 }}>
                  International Helplines & Resources
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

export default ChatScreen;
