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
  completedAt?: string | number;
  goals?: string[];
  frequency?: string;
  researchBasis?: string;
  tips?: string;
  videoUrl?: string;
  videoTitle?: string;
}

// Load JSON exercises dynamically
let rawExercises: any[] = [];
try {
  const cdt = require('../../ex_cdt_eng_safe.json');
  const dep = require('../../ex_dep_anx.json');
  const str = require('../../ex_str_slp_soc.json');
  rawExercises = [...cdt, ...dep, ...str];
} catch (e) {
  console.warn('Failed to load JSON exercise files, using empty list', e);
}

export const EXERCISE_LIBRARY_MAP: Record<string, Partial<Exercise>> = {};

rawExercises.forEach((item: any) => {
  const code = item.id;
  const upperCode = code.toUpperCase();
  
  let exerciseType = 'General';
  const nameLower = (item.name || '').toLowerCase();
  const idLower = (item.id || '').toLowerCase();
  
  if (nameLower.includes('breathing') || idLower.includes('breathing')) {
    exerciseType = 'Breathing';
  } else if (nameLower.includes('mindfulness') || idLower.includes('mindfulness') || nameLower.includes('gratitude') || idLower.includes('gratitude')) {
    exerciseType = 'Mindfulness';
  } else if (item.parameters && item.parameters.length > 0) {
    const mainParam = item.parameters[0].toUpperCase();
    if (mainParam === 'CDT') exerciseType = 'CBT';
    else if (mainParam === 'DEP') exerciseType = 'CBT';
    else if (mainParam === 'ANX') exerciseType = 'Relaxation';
    else if (mainParam === 'STR') exerciseType = 'Relaxation';
    else if (mainParam === 'SLP') exerciseType = 'Sleep';
    else if (mainParam === 'SOC') exerciseType = 'Social';
    else if (mainParam === 'SAFE') exerciseType = 'Safety';
    else if (mainParam === 'ENG') exerciseType = 'Behavioral';
  }

  EXERCISE_LIBRARY_MAP[upperCode] = {
    id: item.id,
    name: item.name,
    description: item.description,
    exerciseType: exerciseType,
    durationMinutes: item.duration_minutes !== undefined ? item.duration_minutes : 5,
    difficulty: item.difficulty || 'Medium',
    instructions: Array.isArray(item.tutorial_steps) ? item.tutorial_steps.join('\n') : (item.tutorial_steps || ''),
    isActive: true,
    exerciseCode: item.id,
    goals: item.goals,
    frequency: item.frequency,
    researchBasis: item.research_basis,
    tips: item.tips,
    videoUrl: item.video_url,
    videoTitle: item.video_title
  };
});




export const EXCLUDED_EXERCISE_IDS = [
  'Reality_Check_Journal_Weekly',
  'No_Crisis_Action',
  'Daily_Reminder_Set',
  'App_Reminder_Setup',
  'Encourage_First_Checkin',
  'One_Exercise_Today'
];

export const ExerciseService = {
  getExerciseDetailsByCode: (code: any): Partial<Exercise> => {
    if (!code) return {};
    const codeStr = String(code);
    const upperCode = codeStr.toUpperCase();
    if (EXERCISE_LIBRARY_MAP[upperCode]) return EXERCISE_LIBRARY_MAP[upperCode];
    
    // Check for mixed casing match just in case
    const match = Object.keys(EXERCISE_LIBRARY_MAP).find(k => k.toUpperCase() === upperCode);
    if (match) return EXERCISE_LIBRARY_MAP[match];
    
    // Fallback formatter if it's a new code not in the map
    const formattedName = codeStr.split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
        
    return {
        name: formattedName,
        description: 'A recommended wellness exercise.',
        exerciseType: 'General',
        durationMinutes: 5
    };
  },

  getUserKey: async (baseKey: string): Promise<string> => {
    try {
      const email = await AsyncStorage.getItem('@mentora_user_email');
      return email ? `${baseKey}_${email.trim().toLowerCase()}` : baseKey;
    } catch {
      return baseKey;
    }
  },

  // Always read the current user's token from AsyncStorage (set by AuthContext on login/signup)
  getAuthToken: async (): Promise<string> => {
    try {
      const { getOrRefreshToken } = require('./authHelper');
      return await getOrRefreshToken();
    } catch (e) {
      console.error('Failed to get auth token', e);
      return '';
    }
  },

  getLocalLibraryExercises: (): Exercise[] => {
    return Object.entries(EXERCISE_LIBRARY_MAP)
      .filter(([code]) => !EXCLUDED_EXERCISE_IDS.includes(code))
      .map(([code, ex]) => ({
        id: code,
        name: ex.name || 'Mindfulness Exercise',
        description: ex.description || '',
        exerciseType: ex.exerciseType || 'General',
        durationMinutes: ex.durationMinutes !== undefined ? ex.durationMinutes : 5,
        difficulty: ex.difficulty || 'Medium',
        instructions: ex.instructions || '',
        isActive: true,
        exerciseCode: code
      }));
  },

  getAllExercises: async (): Promise<Exercise[]> => {
    try {
      const token = await ExerciseService.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/Exercises`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        console.warn(`Exercise API returned ${response.status}. Falling back to local library.`);
        return ExerciseService.getLocalLibraryExercises();
      }
      
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return ExerciseService.getLocalLibraryExercises();
      }
      
      return data
        .filter((ex: any) => {
          const id = ex.id || ex.Id || ex.exerciseCode || ex.ExerciseCode || '';
          return !EXCLUDED_EXERCISE_IDS.includes(id);
        })
        .map((ex: any) => ({
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
      console.warn('Network error while fetching exercises, falling back to local library:', error);
      return ExerciseService.getLocalLibraryExercises();
    }
  },

  // حفظ التمارين المقترحة من الـ AI
  saveSuggestedExercises: async (exercises: any[]): Promise<void> => {
    try {
      const filteredInput = exercises.filter((ex: any) => {
        const id = typeof ex === 'string' ? ex : (ex.id || ex.exerciseCode || ex.exercise_code || '');
        return !EXCLUDED_EXERCISE_IDS.includes(id);
      });

      const mapped = filteredInput.map((ex: any) => {
        // Handle case where ex is just a string (the name or code of the exercise)
        if (typeof ex === 'string') {
          const details = ExerciseService.getExerciseDetailsByCode(ex);
          return {
            id: Date.now().toString() + Math.random(),
            name: details.name || ex.split('\n')[0].slice(0, 30),
            description: details.description || ex,
            exerciseType: details.exerciseType || 'General',
            durationMinutes: details.durationMinutes !== undefined ? details.durationMinutes : 5,
            difficulty: details.difficulty || 'Medium',
            instructions: details.instructions || ex,
            exerciseCode: ex.includes('_') ? ex : undefined,
            isActive: true
          };
        }
        
        // Find code and look up details in local library map
        const code = ex.exerciseCode || ex.exercise_code || ex.code || (typeof ex.id === 'string' && ex.id.includes('_') ? ex.id : '');
        const details = code ? ExerciseService.getExerciseDetailsByCode(code) : {};

        const name = ex.name || ex.Name || ex.title || ex.Title || details.name || 'Mindfulness Exercise';
        const description = ex.description || ex.Description || details.description || 'A recommended wellness exercise designed for your current needs.';
        const instructions = ex.instructions || ex.Instructions || details.instructions || description || '';
        const exerciseType = ex.exerciseType || ex.ExerciseType || details.exerciseType || 'General';
        const durationMinutes = ex.durationMinutes !== undefined ? ex.durationMinutes : (details.durationMinutes !== undefined ? details.durationMinutes : 5);
        const difficulty = ex.difficulty || ex.Difficulty || details.difficulty || 'Medium';

        return {
          id: ex.id || ex.Id || Date.now().toString() + Math.random(),
          name,
          description,
          exerciseType,
          durationMinutes,
          difficulty,
          instructions,
          exerciseCode: code || ex.exerciseCode,
          isActive: true
        };
      });
      const key = await ExerciseService.getUserKey('@suggested_exercises');
      const existingStr = await AsyncStorage.getItem(key);
      let existing = existingStr ? JSON.parse(existingStr) : [];
      
      // Give them unique instance IDs so we can remove them specifically without affecting identical recommendations
      const timestamped = mapped.map(ex => ({ 
        ...ex, 
        queueId: Date.now().toString() + Math.random().toString(),
        suggestedAt: Date.now()
      }));
      
      // Remove any existing pending exercises that are being re-suggested 
      // to avoid duplicates and move the latest suggestions to the top
      const cleanExisting = existing.filter((oldEx: any) => 
          !timestamped.some(newEx => newEx.id == oldEx.id || newEx.name == oldEx.name)
      );
      
      const updated = [...timestamped, ...cleanExisting];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save suggested exercises:', e);
    }
  },

  removeSuggestedExercise: async (queueId: string): Promise<void> => {
    try {
      const key = await ExerciseService.getUserKey('@suggested_exercises');
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
         let existing = JSON.parse(stored);
         // Filter out the specific exercise instance that was completed
         // Using loose inequality (!=) to handle string/number comparison issues
         existing = existing.filter((ex: any) => ex.queueId != queueId && ex.id != queueId);
         await AsyncStorage.setItem(key, JSON.stringify(existing));
      }
    } catch(e) {}
  },

  // جلب التمارين المقترحة المحفوظة محلياً
  // Note: exercises are saved by ChatService.endChat() and ChatService.summarizeChat()
  // — no auto-syncing here to avoid unintended side effects
  getSuggestedExercises: async (): Promise<Exercise[]> => {
    try {
      const key = await ExerciseService.getUserKey('@suggested_exercises');
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return [];
      const list = JSON.parse(stored);
      return list.filter((ex: any) => !EXCLUDED_EXERCISE_IDS.includes(ex.id || ex.exerciseCode));
    } catch (error) {
      return [];
    }
  },

  getCompletedExercises: async (): Promise<Exercise[]> => {
    try {
      const key = await ExerciseService.getUserKey('@completed_exercises');
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return [];
      const list = JSON.parse(stored);
      return list.filter((ex: any) => !EXCLUDED_EXERCISE_IDS.includes(ex.id || ex.exerciseCode));
    } catch (error) { return []; }
  },

  saveCompletedExercise: async (exercise: Exercise) => {
    try {
      if (EXCLUDED_EXERCISE_IDS.includes(String(exercise.id)) || EXCLUDED_EXERCISE_IDS.includes(String(exercise.exerciseCode))) {
        return;
      }
      const key = await ExerciseService.getUserKey('@completed_exercises');
      const completed = await ExerciseService.getCompletedExercises();
      // Remove any existing entry with the same ID, then add to the front
      const filtered = completed.filter((c: Exercise) => c.id !== exercise.id);
      const updated = [exercise, ...filtered];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) { console.error(error); }
  },

  // مسح التمارين المقترحة القديمة
  clearSuggestedExercises: async (): Promise<void> => {
    try {
      const key = await ExerciseService.getUserKey('@suggested_exercises');
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear suggested exercises:', e);
    }
  },

  clearCache: () => {
    // Keep as a no-op for AuthContext compatibility during logout
  }
};
