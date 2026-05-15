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
          body: JSON.stringify({ journal_text: message.trim() })
        });

        if (response.ok) {
          const data = await response.json();
          const aiSuggested = data.suggested_exercises || data.suggestedExercises || data.SuggestedExercises || [];
          
          if (aiSuggested && aiSuggested.length > 0) {
            // Re-use the complex logic from JournalScreen to match exercises to library
            const allExercises = await ExerciseService.getAllExercises();
            const enrichedSuggestions = aiSuggested.map((aiEx: any, idx: number) => {
                const exerciseId = aiEx.id || aiEx.exerciseId || aiEx.ExerciseId;
                const code = aiEx.exerciseCode || aiEx.ExerciseCode || aiEx.id || '';
                
                const dbMatch = allExercises.find(ex => 
                    (exerciseId && ex.id === exerciseId) || 
                    (code && ex.exerciseCode === code)
                );
                
                const libraryDetails = ExerciseService.getExerciseDetailsByCode(code || (dbMatch as any)?.exerciseCode);
                
                if (dbMatch) {
                   const isNameCode = dbMatch.name === code || dbMatch.name?.includes('_');
                   return {
                      ...dbMatch,
                      name: (isNameCode && libraryDetails.name) ? libraryDetails.name : (dbMatch.name || libraryDetails.name),
                      description: dbMatch.description || libraryDetails.description,
                      exerciseType: dbMatch.exerciseType || libraryDetails.exerciseType,
                      durationMinutes: (libraryDetails.durationMinutes !== undefined) ? libraryDetails.durationMinutes : (dbMatch.durationMinutes || 5),
                      instructions: dbMatch.instructions || libraryDetails.instructions,
                      exerciseCode: code || dbMatch.exerciseCode
                   };
                }

                return {
                    id: exerciseId || code || `ai_${Date.now()}_${idx}`,
                    name: libraryDetails.name || 'AI Suggested Exercise',
                    description: libraryDetails.description || `Recommended for ${aiEx.parameter || 'wellness'}`,
                    exerciseType: libraryDetails.exerciseType || 'AI Suggestion',
                    durationMinutes: libraryDetails.durationMinutes || 5,
                    difficulty: 'Medium',
                    instructions: libraryDetails.instructions || 'Follow the on-screen prompts.',
                    isActive: true,
                    exerciseCode: code
                };
            });
            
            await ExerciseService.saveSuggestedExercises(enrichedSuggestions);
            return { success: true, exercises: enrichedSuggestions };
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
