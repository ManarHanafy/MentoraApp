import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

export interface Exercise {
  id: string | number;
  name: string;
  description: string;
  exerciseType: string;
  durationMinutes: number;
  difficulty: string;
  instructions: string;
  isActive: boolean;
  exerciseCode?: string;
  queueId?: string;
}

export const EXERCISE_LIBRARY_MAP: Record<string, Partial<Exercise>> = {
  'CBT_THOUGHT_RECORD_DAILY': { 
    name: 'CBT Thought Record', 
    description: 'A daily journal to identify and challenge negative thought patterns.', 
    exerciseType: 'CBT', 
    durationMinutes: 10,
    instructions: '1. Identify the upsetting situation.\n2. Write down the automatic thoughts that came to mind.\n3. Look for evidence supporting and contradicting these thoughts.\n4. Formulate a more balanced perspective.'
  },
  'WORRY_SCHEDULING_15MIN': { 
    name: 'Worry Scheduling', 
    description: 'Allocate a specific time in your day to process worries instead of worrying all day.', 
    exerciseType: 'CBT', 
    durationMinutes: 15,
    instructions: '1. Choose a "Worry Time" (e.g., 5 PM).\n2. If you worry during the day, write it down and wait for your scheduled time.\n3. During the 15 minutes, focus only on your worries and look for solutions.'
  },
  'SLEEP_HYGIENE_CHECKLIST': { 
    name: 'Sleep Hygiene Checklist', 
    description: 'Review your pre-sleep habits to improve your quality of rest.', 
    exerciseType: 'Sleep', 
    durationMinutes: 0,
    instructions: '1. Avoid caffeine 6 hours before bed.\n2. Stay away from screens for 1 hour before sleep.\n3. Ensure your room is dark and cool.'
  },
  'GRATITUDE_JOURNAL_3XWEEK': { 
    name: 'Gratitude Journal', 
    description: 'Write down things you are grateful for to boost your positivity.', 
    exerciseType: 'Mindfulness', 
    durationMinutes: 5,
    instructions: '1. Think of 3 positive things that happened today.\n2. Write down exactly why you are grateful for these things.\n3. Savor the positive feelings while writing.'
  },
  'SIMPLE_BREATHING_1XDAY': { 
    name: 'Simple Deep Breathing', 
    description: 'A basic breathing exercise to calm your nervous system.', 
    exerciseType: 'Breathing', 
    durationMinutes: 4,
    instructions: '1. Sit comfortably.\n2. Inhale deeply through your nose for 4 seconds.\n3. Hold for 2 seconds.\n4. Exhale slowly through your mouth for 6 seconds.'
  },
  'MAINTAIN_SLEEP_SCHEDULE': { 
    name: 'Maintain Sleep Schedule', 
    description: 'Set a consistent sleep and wake time for every day.', 
    exerciseType: 'Sleep', 
    durationMinutes: 0,
    instructions: '1. Choose a fixed bedtime.\n2. Commit to waking up at the same time even on weekends.'
  },
  'CONTACT_ONE_TRUSTED_PERSON': { 
    name: 'Reach Out', 
    description: 'Social connection to reduce feelings of isolation.', 
    exerciseType: 'Social', 
    durationMinutes: 0,
    instructions: '1. Choose a friend or relative you feel comfortable with.\n2. Send a message or call to check in.\n3. Share something simple about your day.'
  },
  'REALITY_CHECK_JOURNAL_WEEKLY': { 
    name: 'Reality Check Journal', 
    description: 'A weekly exercise to evaluate how realistic your worrying thoughts are.', 
    exerciseType: 'CBT', 
    durationMinutes: 10,
    instructions: '1. Write down a thought that worries you a lot.\n2. Ask yourself: what is the actual likelihood of this happening?\n3. What is the worst that could happen, and can you handle it?'
  },
  '5_SENSES_GROUNDING': { 
    name: '5 Senses Grounding', 
    description: 'A technique to calm anxiety by focusing on your senses.', 
    exerciseType: 'Relaxation', 
    durationMinutes: 5,
    instructions: '1. Notice 5 things you can see.\n2. Notice 4 things you can touch.\n3. Notice 3 things you can hear.\n4. Notice 2 things you can smell.\n5. Notice 1 thing you can taste.'
  },
  'BOX_BREATHING_3MIN': { 
    name: 'Box Breathing', 
    description: 'A powerful breathing technique for focus and calm.', 
    exerciseType: 'Breathing', 
    durationMinutes: 3,
    instructions: '1. Inhale for 4 seconds.\n2. Hold for 4 seconds.\n3. Exhale for 4 seconds.\n4. Wait for 4 seconds before inhaling again.'
  },
  'BASIC_BREATHING_1XDAY': { 
    name: 'Daily Breathing Exercise', 
    description: 'Practice mindful breathing once a day to maintain emotional balance.', 
    exerciseType: 'Breathing', 
    durationMinutes: 3,
    instructions: '1. Focus only on the air entering and leaving your lungs.\n2. If your mind wanders, gently bring it back to your breath.'
  },
  'PROFESSIONAL_HELP_INFO': {
    name: 'Professional Help Guide',
    description: 'Information on how to reach out to mental health professionals for support.',
    exerciseType: 'Support',
    durationMinutes: 0,
    instructions: '1. Research local therapists or counselors.\n2. Check your insurance for mental health coverage.\n3. Prepare a list of questions for your first session.'
  },
  'PROBLEM_SOLVING_WORKSHEET': {
    name: 'Problem Solving Worksheet',
    description: 'A structured approach to tackling difficult life challenges.',
    exerciseType: 'CBT',
    durationMinutes: 15,
    instructions: '1. Clearly define the problem you are facing.\n2. Brainstorm at least 5 possible solutions.\n3. Evaluate the pros and cons of each solution.\n4. Pick one and create an action plan.'
  },
  'PANIC_RESPONSE_STEPS': {
    name: 'Panic Response Steps',
    description: 'Immediate actions to take when you feel a panic attack coming on.',
    exerciseType: 'Safety',
    durationMinutes: 10,
    instructions: '1. Remind yourself that the feeling is temporary and safe.\n2. Focus on grounding yourself (5-4-3-2-1 technique).\n3. Breathe slowly and deeply into your belly.'
  },
  'NO_CRISIS_ACTION': {
    name: 'Safety Maintenance',
    description: 'Daily habits to keep yourself safe and emotionally stable.',
    exerciseType: 'Safety',
    durationMinutes: 0,
    instructions: '1. Review your safety triggers.\n2. Connect with your support system early.\n3. Stay in a safe environment and avoid isolation.'
  },
  'ENCOURAGE_FIRST_CHECKIN': {
    name: 'First Check-in',
    description: 'Getting started with your journaling habit for mental wellness.',
    exerciseType: 'Behavioral',
    durationMinutes: 0,
    instructions: '1. Write just one sentence about how you feel right now.\n2. Don\'t worry about grammar or length.\n3. Acknowledge your effort in taking this first step.'
  }
};




let exerciseTokenCache = '';

export const ExerciseService = {
  getExerciseDetailsByCode: (code: string): Partial<Exercise> => {
    if (!code) return {};
    const upperCode = code.toUpperCase();
    if (EXERCISE_LIBRARY_MAP[upperCode]) return EXERCISE_LIBRARY_MAP[upperCode];
    
    // Check for mixed casing match just in case
    const match = Object.keys(EXERCISE_LIBRARY_MAP).find(k => k.toUpperCase() === upperCode);
    if (match) return EXERCISE_LIBRARY_MAP[match];
    
    // Fallback formatter if it's a new code not in the map
    const formattedName = code.split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
        
    return {
        name: formattedName,
        description: 'A recommended wellness exercise.',
        exerciseType: 'General',
        durationMinutes: 5
    };
  },

  // جلب التوكن
  getAuthToken: async (): Promise<string> => {
    if (exerciseTokenCache) return exerciseTokenCache;
    try {
      let res = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           'Cache-Control': 'no-cache',
           'Pragma': 'no-cache'
        },
        body: JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' })
      });
      
      // Auto-register if login fails
      if (!res.ok) {
         console.log('Login failed for ExerciseService, attempting auto-registration...');
         await fetch(`${API_BASE_URL}/Users`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             username: 'ManarH',
             firstName: 'Manar', 
             lastName: 'Hanafy', 
             email: 'newmanar@gmail.com', 
             password: 'Password123!' 
           })
         });
         
         // Retry login
         res = await fetch(`${API_BASE_URL}/Auth/login`, {
           method: 'POST',
           headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
           },
           body: JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' })
         });
      }

      if (res.ok) {
        const data = await res.json();
        exerciseTokenCache = data.token;
        return exerciseTokenCache;
      }
    } catch (e) {
      console.error('Auth failure for exercises', e);
    }
    return '';
  },

  getAllExercises: async (retry = true): Promise<Exercise[]> => {
    try {
      const token = await ExerciseService.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/Exercises`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.status === 401 && retry) {
         // Token might be expired, clear cache and retry once
         exerciseTokenCache = '';
         return await ExerciseService.getAllExercises(false);
      }
      
      if (!response.ok) {
        console.warn(`Exercise API returned ${response.status}. Please check if the server is active.`);
        return []; // Return empty instead of throwing to avoid red screen
      }
      
      const data = await response.json();
      
      return data.map((ex: any) => ({
        id: ex.id || ex.Id,
        name: ex.name || ex.Name || ex.exerciseCode || 'AI Suggested',
        description: ex.description || ex.Description || '',
        exerciseType: ex.exerciseType || ex.ExerciseType || 'General',
        durationMinutes: ex.durationMinutes !== undefined ? ex.durationMinutes : (ex.DurationMinutes || 0),
        difficulty: ex.difficulty || ex.Difficulty || 'Medium',
        instructions: ex.instructions || ex.Instructions || '',
        isActive: ex.isActive !== undefined ? ex.isActive : true,
        exerciseCode: ex.exerciseCode || ex.ExerciseCode
      }));
    } catch (error) {
      console.warn('Network error while fetching exercises:', error);
      return [];
    }
  },

  // حفظ التمارين المقترحة من الـ AI
  saveSuggestedExercises: async (exercises: any[]): Promise<void> => {
    try {
      const mapped = exercises.map((ex: any) => {
        // Handle case where ex is just a string (the name of the exercise)
        if (typeof ex === 'string') {
          return {
            id: Date.now().toString() + Math.random(),
            name: ex.split('\n')[0].slice(0, 30), // first sentence/phrase
            description: ex,                      // The full string goes to Description
            exerciseType: 'General',
            durationMinutes: 5,
            difficulty: 'Medium',
            instructions: ex,
            isActive: true
          };
        }
        
        const name = ex.name || ex.Name || ex.title || ex.Title || ex.exerciseName || ex.ExerciseName || ex.label || ex.heading || ex.exercise || ex.Exercise;
        let description = ex.description || ex.Description || ex.content || ex.Content || ex.summary || ex.text || ex.body || '';
        const instructions = ex.instructions || ex.Instructions || ex.steps || ex.HowTo || description || '';
        
        // Ensure description is never empty for the Overview section
        if (!description) {
           description = instructions || name || 'A helpful wellness exercise designed for your current needs.';
        }

        // If name is still missing but we have a description, use the first part of description
        let finalName = name;
        if (!finalName || finalName === 'AI Suggested Exercise') {
           if (description && description.length > 5) {
              finalName = description.split('\n')[0].slice(0, 30);
              if (description.length > 30) finalName += '...';
           } else {
              finalName = 'Mindfulness Exercise';
           }
        }

        return {
          id: ex.id || ex.Id || Date.now().toString() + Math.random(),
          name: finalName,
          description: description,
          exerciseType: ex.exerciseType || ex.ExerciseType || ex.type || 'General',
          durationMinutes: ex.durationMinutes !== undefined ? ex.durationMinutes : (ex.DurationMinutes || ex.duration || 5),
          difficulty: ex.difficulty || ex.Difficulty || 'Medium',
          instructions: instructions,
          isActive: true
        };
      });
      const existingStr = await AsyncStorage.getItem('@suggested_exercises');
      let existing = existingStr ? JSON.parse(existingStr) : [];
      
      // Give them unique instance IDs so we can remove them specifically without affecting identical recommendations
      const timestamped = mapped.map(ex => ({ ...ex, queueId: Date.now().toString() + Math.random().toString() }));
      
      // Remove any existing pending exercises that are being re-suggested 
      // to avoid duplicates and move the latest suggestions to the top
      const cleanExisting = existing.filter((oldEx: any) => 
          !timestamped.some(newEx => newEx.id == oldEx.id || newEx.name == oldEx.name)
      );
      
      const updated = [...timestamped, ...cleanExisting];
      await AsyncStorage.setItem('@suggested_exercises', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save suggested exercises:', e);
    }
  },

  removeSuggestedExercise: async (queueId: string): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem('@suggested_exercises');
      if (stored) {
         let existing = JSON.parse(stored);
         // Filter out the specific exercise instance that was completed
         // Using loose inequality (!=) to handle string/number comparison issues
         existing = existing.filter((ex: any) => ex.queueId != queueId && ex.id != queueId);
         await AsyncStorage.setItem('@suggested_exercises', JSON.stringify(existing));
      }
    } catch(e) {}
  },

  // جلب التمارين المقترحة
  getSuggestedExercises: async (): Promise<Exercise[]> => {
    try {
      const stored = await AsyncStorage.getItem('@suggested_exercises');
      if (stored) {
         return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  getCompletedExercises: async (): Promise<Exercise[]> => {
    try {
      const stored = await AsyncStorage.getItem('@completed_exercises');
      return stored ? JSON.parse(stored) : [];
    } catch (error) { return []; }
  },

  saveCompletedExercise: async (exercise: Exercise) => {
    try {
      const completed = await ExerciseService.getCompletedExercises();
      // Remove any existing entry with the same ID, then add to the front
      const filtered = completed.filter((c: Exercise) => c.id !== exercise.id);
      const updated = [exercise, ...filtered];
      await AsyncStorage.setItem('@completed_exercises', JSON.stringify(updated));
    } catch (error) { console.error(error); }
  },

  // مسح التمارين المقترحة القديمة
  clearSuggestedExercises: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('@suggested_exercises');
    } catch (e) {
      console.error('Failed to clear suggested exercises:', e);
    }
  }
};
