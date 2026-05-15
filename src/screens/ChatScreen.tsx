import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartIcon, SendIcon, MicrophoneIcon } from '../components/Icons';
import { colors } from '../theme';
import s from './ChatScreen.style';
import { ChatService } from '../services/chatService';
import { ExerciseService } from '../services/exerciseService';
import { useAuth } from '../context/AuthContext';

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
  // Removed message limits to allow continuous conversation

  useEffect(() => {
    const initChat = async () => {
      setIsThinking(true);
      try {
        const latest = await ChatService.getLatestChat();
        if (latest && !latest.isEnded) {
          const resolvedId = latest.id || latest.Id || latest.chatId;
          setChatId(resolvedId);
          const details = await ChatService.getChatDetails(resolvedId);
          if (details && details.messages) {
            const mappedMessages: Message[] = details.messages.map((m: any) => ({
              id: m.id || Math.random().toString(),
              text: m.content || m.text || m.Message || '',
              sender: m.role === 'assistant' ? 'ai' : (m.role === 'user' ? 'user' : 'ai')
            }));
            if (mappedMessages.length > 0) {
              setMessages(mappedMessages);
            }
          }
        } else {
          const id = await ChatService.startChat();
          if (id) setChatId(id);
        }
      } catch (e) {
        console.error('Init chat error', e);
      } finally {
        setIsThinking(false);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking || isEnded) return;

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
      // If we don't have a chatId yet, try to get one
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await ChatService.startChat();
        if (currentChatId) {
          setChatId(currentChatId);
        } else {
          // Instead of throwing, show a user-friendly error in the chat
          const errorMsg: Message = {
            id: 'init_error_' + Date.now(),
            text: "عذراً، لم نتمكن من بدء جلسة محادثة جديدة. يرجى التأكد من اتصالك بالإنترنت أو محاولة تسجيل الدخول مرة أخرى.\n\n(Could not initialize chat session. Please check your connection or try logging in again.)",
            sender: 'ai',
          };
          setMessages(prev => [...prev, errorMsg]);
          return;
        }
      }
      
      const response = await ChatService.sendMessage(currentChatId, userMessageText);
      
      if (response) {
        const aiMsg: Message = {
          id: 'ai_' + Date.now(),
          text: response.reply || response.content || response.message || "I understand. Tell me more.",
          sender: 'ai',
        };

        setMessages(prev => [...prev, aiMsg]);

        // Check for exercises
        const aiSuggested = response.suggestedExercises || response.suggested_exercises || response.SuggestedExercises || [];
        if (aiSuggested.length > 0) {
          await ExerciseService.saveSuggestedExercises(aiSuggested);
          const notifyMsg: Message = {
            id: 'exercises_notify_' + Date.now(),
            text: "لقد أضفت لك بعض التمارين الجديدة بناءً على حديثنا! يمكنك العثور عليها في قائمة التمارين.\n\n(I've added some new exercises for you based on our chat! You can find them in the Exercises tab.)",
            sender: 'ai',
          };
          setTimeout(() => {
            setMessages(prev => [...prev, notifyMsg]);
          }, 1000);
        }

        // Check for Crisis or Warning
        const riskLevel = response.riskLevel || response.risk_level;
        const suggestedAction = response.suggestedAction || response.suggested_action;

        if (riskLevel === 'crisis') {
          handleCrisis();
        } else if (riskLevel === 'elevated' || suggestedAction === 'journal' || suggestedAction === 'exercise') {
          showWarningMessage(suggestedAction);
        }
      } else {
        // Fallback if API fails
        const fallbackMsg: Message = {
          id: 'error_' + Date.now(),
          text: "عذراً، أواجه مشكلة في الاتصال حالياً، لكني ما زلت هنا معك. يمكنك الاستمرار.\n\n(I'm having a little trouble connecting right now, but I'm still here for you. Please continue.)",
          sender: 'ai',
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSummarize = async () => {
    if (!chatId || isThinking || isEnded) return;
    setIsThinking(true);
    try {
      const summaryData = await ChatService.summarizeChat(chatId);
      if (summaryData) {
        const summaryMsg: Message = {
          id: 'summary_' + Date.now(),
          text: "إليك ملخص لما تحدثنا عنه حتى الآن:\n\n" + (summaryData.summary || summaryData.content || summaryData.message || "لقد كنا نتحدث عن مشاعرك وكيفية التعامل مع الضغوط."),
          sender: 'ai',
        };
        setMessages(prev => [...prev, summaryMsg]);
      } else {
         Alert.alert("Note", "Summary is not available yet. Let's talk a bit more first.");
      }
    } catch (e) {
      console.error('Summarize error', e);
    } finally {
      setIsThinking(false);
    }
  };

  const showWarningMessage = (action?: string) => {
    let text = "It sounds like you might benefit from processing this further in your journal.";
    if (action === 'exercise') {
      text = "I feel like a quick breathing exercise might help you feel more grounded right now.";
    }
    
    const warningMsg: Message = {
      id: 'warning_' + Date.now(),
      text: text,
      sender: 'system_warning',
    };
    setMessages(prev => [...prev, warningMsg]);
  };

  const handleCrisis = () => {
    setIsEnded(true);
    const crisisMsg: Message = {
      id: 'crisis_' + Date.now(),
      text: "I'm concerned about your safety. It's important that you speak with someone who can provide immediate support. Please use the crisis resources in your profile or call emergency services.",
      sender: 'system_crisis',
    };
    setMessages(prev => [...prev, crisisMsg]);
    Alert.alert("Crisis Detected", "We've detected that you may be in a dangerous situation. The chat has been stopped for your safety. Please reach out for professional help.");
  };

  const finalizeChat = async (id: string) => {
    setIsThinking(true);
    try {
      const summaryData = await ChatService.endChat(id);
      setIsEnded(true);
      
      const systemMsg: Message = {
        id: 'end_' + Date.now(),
        text: "We've reached the end of our session. I've prepared some exercises for you based on our conversation. You can find them in the Exercises tab.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, systemMsg]);
      
      Alert.alert(
        "Session Complete",
        "This chat session has ended. Mentora has suggested some new exercises for you to help manage your current feelings.",
        [{ text: "View Exercises", onPress: () => {} }] // Navigation to exercises would go here
      );
    } catch (e) {
      console.error('End chat error', e);
    } finally {
      setIsThinking(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'system_warning') {
      return (
        <View style={s.warningBubble}>
          <Text style={s.warningText}>⚠️ {item.text}</Text>
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
              {isEnded ? 'Session Completed' : 'Always here to listen'}
            </Text>
          </View>
          
          {!isEnded && (
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: colors.primary + '20', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 20,
                }} 
                onPress={handleSummarize}
                disabled={isThinking}
              >
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Summarize</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={s.keyboardAv} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[s.messageList, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
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

        {!isEnded && (
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
        
        {isEnded && (
           <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 16), justifyContent: 'center' }]}>
             <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>
               This session has ended. Come back later if you need to talk.
             </Text>
           </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatScreen;
