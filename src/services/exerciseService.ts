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
  'CBT_THOUGHT_RECORD_DAILY': { name: 'CBT Thought Record', description: 'A daily journal to challenge negative thoughts.', exerciseType: 'CBT', durationMinutes: 10 },
  'WORRY_SCHEDULING_15MIN': { name: 'Worry Scheduling', description: 'Allocate 15 minutes to process your worries.', exerciseType: 'CBT', durationMinutes: 15 },
  'SLEEP_HYGIENE_CHECKLIST': { name: 'Sleep Hygiene Checklist', description: 'Review your pre-sleep habits for better rest.', exerciseType: 'Sleep', durationMinutes: 5 },
  'GRATITUDE_JOURNAL_3XWEEK': { name: 'Gratitude Journal', description: 'Write down things you are grateful for.', exerciseType: 'Mindfulness', durationMinutes: 5 },
  'SIMPLE_BREATHING_1XDAY': { name: 'Simple Breathing', description: 'A basic deep breathing exercise to relax.', exerciseType: 'Breathing', durationMinutes: 3 },
  'MAINTAIN_SLEEP_SCHEDULE': { name: 'Maintain Sleep Schedule', description: 'Set a consistent sleep and wake time.', exerciseType: 'Sleep', durationMinutes: 0 },
  'CONTACT_ONE_TRUSTED_PERSON': { name: 'Reach Out', description: 'Contact a trusted friend or family member.', exerciseType: 'Social', durationMinutes: 5 },
  'REALITY_CHECK_JOURNAL_WEEKLY': { name: 'Reality Check Journal', description: 'A weekly check-in to ground your thoughts.', exerciseType: 'CBT', durationMinutes: 10 },
  'NO_CRISIS_ACTION': { name: 'Stay Safe', description: 'Follow your safety plan and stay grounded.', exerciseType: 'Safety', durationMinutes: 0 },
  'ENCOURAGE_FIRST_CHECKIN': { name: 'First Check-in', description: 'Encourage yourself to log your feelings.', exerciseType: 'Behavioral', durationMinutes: 2 },
  '5_SENSES_GROUNDING': { name: '5 Senses Grounding', description: 'Ground yourself using your 5 senses.', exerciseType: 'Relaxation', durationMinutes: 5 },
  'BOX_BREATHING_3MIN': { name: 'Box Breathing', description: 'Inhale, hold, exhale, and hold for 4 seconds each.', exerciseType: 'Breathing', durationMinutes: 3 },
  'APP_REMINDER_SETUP': { name: 'App Reminder Setup', description: 'Set up reminders to check in daily.', exerciseType: 'Behavioral', durationMinutes: 2 },
  'ONE_EXERCISE_TODAY': { name: 'One Exercise Today', description: 'Commit to completing just one exercise today.', exerciseType: 'Behavioral', durationMinutes: 5 },
  'NORMAL_COPING_SUPPORT': { name: 'Coping Support', description: 'Use your normal coping mechanisms.', exerciseType: 'Safety', durationMinutes: 5 },
  'THOUGHT_AWARENESS_DAILY': { name: 'Thought Awareness', description: 'Pay attention to your thoughts today.', exerciseType: 'Mindfulness', durationMinutes: 5 },
  'CRISIS_LINE_INFO': { name: 'Crisis Line Info', description: 'Keep crisis line numbers handy.', exerciseType: 'Safety', durationMinutes: 0 },
  'ONLINE_SUPPORT_GROUPS': { name: 'Online Support Groups', description: 'Join an online group for support.', exerciseType: 'Social', durationMinutes: 15 },
  'EVENING_ROUTINE_CHECK': { name: 'Evening Routine', description: 'Review your evening routine.', exerciseType: 'Sleep', durationMinutes: 5 },
  'LIGHT_DAILY_MOVEMENT': { name: 'Light Movement', description: 'Engage in light physical activity.', exerciseType: 'Behavioral', durationMinutes: 10 },
  'ROUTINE_BREAKS': { name: 'Routine Breaks', description: 'Take breaks throughout your day.', exerciseType: 'Relaxation', durationMinutes: 5 },
  'HOBBY_TIME_WEEKLY': { name: 'Hobby Time', description: 'Dedicate time to a hobby this week.', exerciseType: 'Behavioral', durationMinutes: 30 },
  'SOCIAL_ACTIVITY_WEEKLY': { name: 'Social Activity', description: 'Plan a social activity this week.', exerciseType: 'Social', durationMinutes: 30 },
  'LIGHT_STRETCHING_10MIN': { name: 'Light Stretching', description: 'Stretch your body for 10 minutes.', exerciseType: 'Relaxation', durationMinutes: 10 },
  'ROUTINE_SELFCARE_CHECKLIST': { name: 'Self-Care Checklist', description: 'Complete your self-care routine.', exerciseType: 'Behavioral', durationMinutes: 5 },
  'LIGHT_JOURNALING_3XWEEK': { name: 'Light Journaling', description: 'Journal lightly 3 times a week.', exerciseType: 'Mindfulness', durationMinutes: 10 },
  'BASIC_BREATHING_1XDAY': { name: 'Basic Breathing', description: 'Practice basic breathing once a day.', exerciseType: 'Breathing', durationMinutes: 3 }
};

let exerciseTokenCache = '';

export const ExerciseService = {
  getExerciseDetailsByCode: (code: string): Partial<Exercise> => {
    if (!code) return {};
    if (EXERCISE_LIBRARY_MAP[code]) return EXERCISE_LIBRARY_MAP[code];
    
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
        description: ex.description || ex.Description || 'A helpful wellness exercise.',
        exerciseType: ex.exerciseType || ex.ExerciseType || 'General',
        durationMinutes: ex.durationMinutes !== undefined ? ex.durationMinutes : (ex.DurationMinutes || 5),
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
