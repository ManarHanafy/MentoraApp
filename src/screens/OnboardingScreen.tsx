import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const QUESTIONS = [
  {
    step: 1,
    title: "What brings you here today?",
    options: [
      { id: '1', icon: '😔', text: 'Feeling down or depressed' },
      { id: '2', icon: '😰', text: 'Feeling anxious or worried' },
      { id: '3', icon: '😴', text: 'Having trouble sleeping' },
      { id: '4', icon: '⭐', text: 'Just checking my wellbeing' },
    ]
  },
  {
    step: 2,
    title: "How often do you feel stressed?",
    options: [
      { id: '1', icon: '🕰️', text: 'Rarely' },
      { id: '2', icon: '⏳', text: 'Sometimes' },
      { id: '3', icon: '⏰', text: 'Often' },
      { id: '4', icon: '🚨', text: 'Always' },
    ]
  },
  {
    step: 3,
    title: "How do you usually cope with stress?",
    options: [
      { id: '1', icon: '🗣️', text: 'Talking to someone' },
      { id: '2', icon: '🏃‍♂️', text: 'Exercising' },
      { id: '3', icon: '🧘‍♀️', text: 'Meditating' },
      { id: '4', icon: '📺', text: 'Watching TV / Distractions' },
    ]
  },
  {
    step: 4,
    title: "What's your main goal with Mentora?",
    options: [
      { id: '1', icon: '📊', text: 'Track my mental health' },
      { id: '2', icon: '🎯', text: 'Understand my symptoms' },
      { id: '3', icon: '💪', text: 'Improve my wellbeing' },
      { id: '4', icon: '🆘', text: 'Get help and support' },
    ]
  }
];

export function OnboardingScreen({ onComplete }: { onComplete?: () => void }): React.ReactElement {
  const { userName, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, string[]>>({});

  const question = QUESTIONS[currentStep - 1];

  const handleToggle = (optId: string) => {
    setSelections(prev => {
      const current = prev[currentStep] || [];
      if (current.includes(optId)) {
        return { ...prev, [currentStep]: current.filter(id => id !== optId) };
      }
      return { ...prev, [currentStep]: [...current, optId] };
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressWidth = `${(currentStep / 4) * 100}%`;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        
        {/* Header */}
        <View style={s.header}>
           <Text style={s.welcomeText}>Welcome, {userName || 'Friend'}! 👋</Text>
           <Text style={s.headerTitle}>Let's get to know you</Text>
           
           <View style={s.progressRow}>
              <View style={s.progressTrack}>
                 <View style={[s.progressFill, { width: progressWidth as any }]} />
              </View>
           </View>
           <Text style={s.stepText}>{currentStep} out of 4</Text>
        </View>

        {/* Content */}
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
           <Text style={s.questionTitle}>{question.title}</Text>
           <Text style={s.questionSubtitle}>Select the option that best describes you</Text>

           <View style={s.optionsContainer}>
             {question.options.map(opt => {
               const isSelected = (selections[currentStep] || []).includes(opt.id);
               return (
                 <TouchableOpacity 
                   key={opt.id} 
                   style={s.optionRow} 
                   activeOpacity={0.7}
                   onPress={() => handleToggle(opt.id)}
                 >
                   <View style={s.optionLeft}>
                      <Text style={s.optionIcon}>{opt.icon}</Text>
                      <Text style={s.optionText}>{opt.text}</Text>
                   </View>
                   <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                      {isSelected && <Text style={s.checkmark}>✓</Text>}
                   </View>
                 </TouchableOpacity>
               );
             })}
           </View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={s.footer}>
           {currentStep > 1 ? (
             <TouchableOpacity onPress={handlePrev}>
               <Text style={s.navText}>« Previous</Text>
             </TouchableOpacity>
           ) : <View />}

           <TouchableOpacity onPress={handleNext}>
             <Text style={s.navText}>Next »</Text>
           </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  
  header: { marginBottom: 40 },
  welcomeText: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  progressRow: { height: 8, marginBottom: 8 },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#161B22', borderRadius: 4 },
  stepText: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },

  content: { flex: 1 },
  questionTitle: { fontSize: 20, fontWeight: '700', color: '#161B22', textAlign: 'center', marginBottom: 8 },
  questionSubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', marginBottom: 40 },

  optionsContainer: { paddingHorizontal: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { fontSize: 24, marginRight: 12 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: '#161B22', borderColor: '#161B22' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  navText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
});

export default OnboardingScreen;
