import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartIcon, SendIcon, MicrophoneIcon } from '../components/Icons';
import { colors } from '../theme';
import s from './ChatScreen.style';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: "Hi Alex. I noticed you logged a 'Rough' mood earlier. Would you like to talk about what's on your mind?",
    sender: 'ai',
  },
  {
    id: '2',
    text: 'Need coping strategies',
    sender: 'user',
  },
];

export function ChatScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const renderMessage = ({ item }: { item: Message }) => {
    const isAi = item.sender === 'ai';
    return (
      <View style={[s.messageRow, isAi ? s.messageRowLeft : s.messageRowRight]}>
        <View style={[s.messageBubble, isAi ? s.aiBubble : s.userBubble]}>
          <Text style={isAi ? s.aiText : s.userText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user'
      }
    ]);
    setInputText('');
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
            <Text style={s.headerSubtitle}>Always here to listen</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={s.keyboardAv} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
        />

        <View style={[s.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={s.inputContainer}>
            <TextInput
              style={s.textInput}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={s.micButton}>
              <MicrophoneIcon color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.sendButton} onPress={handleSend}>
            <SendIcon color={colors.white} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatScreen;
