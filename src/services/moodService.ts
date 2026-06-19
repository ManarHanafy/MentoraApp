import { API_BASE_URL } from '../config/env';
import { ExerciseService } from './exerciseService';

export const MoodService = {
  submitMood: async (moodLevel: number, message: string): Promise<any> => {
    try {
      const token = await ExerciseService.getAuthToken();
      
      // 1. Submit the numeric mood to /api/Moods if it exists
      // The swagger shows it takes { mood: int }
      try {
        await fetch(`${API_BASE_URL}/Moods`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ mood: moodLevel })
        });
      } catch (e) {
        console.warn('Moods API not available or failed, falling back to Journal for analysis');
      }

      // 2. If there is a message, submit it as a Journal entry to get AI analysis and exercises
      if (message.trim()) {
        const response = await fetch(`${API_BASE_URL}/Journals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: message.trim() })
        });

        if (response.ok) {
          const data = await response.json();
          const aiSuggested = data.suggested_exercises || data.suggestedExercises || data.SuggestedExercises || [];
          
          if (aiSuggested && aiSuggested.length > 0) {
            await ExerciseService.saveSuggestedExercises(aiSuggested);
            return { success: true, exercises: aiSuggested };
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Mood submission error:', error);
      throw error;
    }
  }
};
