"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = exports.EXCLUDED_EXERCISE_IDS = exports.EXERCISE_LIBRARY_MAP = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const env_1 = require("../config/env");
// Load JSON exercises dynamically
let rawExercises = [];
try {
    const cdt = require('../../ex_cdt_eng_safe.json');
    const dep = require('../../ex_dep_anx.json');
    const str = require('../../ex_str_slp_soc.json');
    rawExercises = [...cdt, ...dep, ...str];
}
catch (e) {
    console.warn('Failed to load JSON exercise files, using empty list', e);
}
exports.EXERCISE_LIBRARY_MAP = {};
rawExercises.forEach((item) => {
    const code = item.id;
    const upperCode = code.toUpperCase();
    let exerciseType = 'General';
    const nameLower = (item.name || '').toLowerCase();
    const idLower = (item.id || '').toLowerCase();
    if (nameLower.includes('breathing') || idLower.includes('breathing')) {
        exerciseType = 'Breathing';
    }
    else if (nameLower.includes('mindfulness') || idLower.includes('mindfulness') || nameLower.includes('gratitude') || idLower.includes('gratitude')) {
        exerciseType = 'Mindfulness';
    }
    else if (item.parameters && item.parameters.length > 0) {
        const mainParam = item.parameters[0].toUpperCase();
        if (mainParam === 'CDT')
            exerciseType = 'CBT';
        else if (mainParam === 'DEP')
            exerciseType = 'CBT';
        else if (mainParam === 'ANX')
            exerciseType = 'Relaxation';
        else if (mainParam === 'STR')
            exerciseType = 'Relaxation';
        else if (mainParam === 'SLP')
            exerciseType = 'Sleep';
        else if (mainParam === 'SOC')
            exerciseType = 'Social';
        else if (mainParam === 'SAFE')
            exerciseType = 'Safety';
        else if (mainParam === 'ENG')
            exerciseType = 'Behavioral';
    }
    exports.EXERCISE_LIBRARY_MAP[upperCode] = {
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
// In-memory cache for exercise details fetched from server (clears on app restart)
const _exerciseDetailsCache = {};
exports.EXCLUDED_EXERCISE_IDS = [
    'Reality_Check_Journal_Weekly',
    'No_Crisis_Action',
    'Daily_Reminder_Set',
    'App_Reminder_Setup',
    'Encourage_First_Checkin',
    'One_Exercise_Today'
];
exports.ExerciseService = {
    getExerciseDetailsByCode: (code) => {
        if (!code)
            return {};
        const codeStr = String(code);
        const upperCode = codeStr.toUpperCase();
        if (exports.EXERCISE_LIBRARY_MAP[upperCode])
            return exports.EXERCISE_LIBRARY_MAP[upperCode];
        // Check for mixed casing match just in case
        const match = Object.keys(exports.EXERCISE_LIBRARY_MAP).find(k => k.toUpperCase() === upperCode);
        if (match)
            return exports.EXERCISE_LIBRARY_MAP[match];
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
    getExerciseDetailsFromServer: async (idName) => {
        // 1. Get local fallback details to merge rich content
        const local = exports.ExerciseService.getExerciseDetailsByCode(idName) || {};
        // 2. Return from in-memory cache instantly if already fetched this session
        if (_exerciseDetailsCache[idName]) {
            return _exerciseDetailsCache[idName];
        }
        try {
            const token = await exports.ExerciseService.getAuthToken();
            const response = await fetch(`${env_1.API_BASE_URL}/Exercises/id-name/${idName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Check if server instructions are generic or empty
                const isServerInstructionsPlaceholder = !data.instructions ||
                    data.instructions.trim().toLowerCase() === 'frequency: once daily' ||
                    data.instructions.trim().toLowerCase().startsWith('frequency:');
                let finalInstructions = '';
                if (isServerInstructionsPlaceholder) {
                    finalInstructions = local.instructions || data.instructions || '';
                }
                else {
                    finalInstructions = data.instructions || local.instructions || '';
                }
                // Parse tips: can be array or string
                let finalTips = '';
                if (Array.isArray(data.tips) && data.tips.length > 0) {
                    finalTips = data.tips.join('\n');
                }
                else if (typeof data.tips === 'string' && data.tips.trim()) {
                    finalTips = data.tips;
                }
                else {
                    finalTips = typeof local.tips === 'string' ? local.tips : (Array.isArray(local.tips) ? local.tips.join('\n') : '');
                }
                // Parse goals
                let finalGoals = [];
                if (Array.isArray(data.goals) && data.goals.length > 0) {
                    finalGoals = data.goals;
                }
                else if (local.goals && local.goals.length > 0) {
                    finalGoals = local.goals;
                }
                const result = {
                    id: data.id || data.Id || local.id || idName,
                    name: data.name || data.Name || local.name || idName,
                    description: data.fullDescription || data.Description || data.description || local.description || '',
                    exerciseType: data.exerciseType || data.type || data.ExerciseType || local.exerciseType || 'General',
                    durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : (data.DurationMinutes || local.durationMinutes || 5),
                    difficulty: data.difficulty || data.Difficulty || local.difficulty || 'Medium',
                    instructions: finalInstructions,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    exerciseCode: data.externalId || data.exerciseCode || data.ExerciseCode || idName,
                    goals: finalGoals,
                    frequency: data.frequency || data.Frequency || local.frequency,
                    researchBasis: data.researchBasis || data.ResearchBasis || local.researchBasis,
                    tips: finalTips,
                    videoUrl: data.videoUrl || data.VideoUrl || local.videoUrl,
                    videoTitle: data.videoTitle || data.VideoTitle || local.videoTitle
                };
                // Store in cache for instant access next time
                _exerciseDetailsCache[idName] = result;
                return result;
            }
            else {
                console.warn(`Exercise details API returned ${response.status} for ${idName}. Falling back to local.`);
            }
        }
        catch (error) {
            console.warn(`Network error fetching details for ${idName}, falling back to local:`, error);
        }
        // Cache the local fallback too so we don't retry every time
        _exerciseDetailsCache[idName] = local;
        return local;
    },
    getUserKey: async (baseKey) => {
        try {
            const email = await async_storage_1.default.getItem('@mentora_user_email');
            return email ? `${baseKey}_${email.trim().toLowerCase()}` : baseKey;
        }
        catch {
            return baseKey;
        }
    },
    // Always read the current user's token from AsyncStorage (set by AuthContext on login/signup)
    getAuthToken: async () => {
        try {
            const { getOrRefreshToken } = require('./authHelper');
            return await getOrRefreshToken();
        }
        catch (e) {
            console.error('Failed to get auth token', e);
            return '';
        }
    },
    getLocalLibraryExercises: () => {
        return Object.entries(exports.EXERCISE_LIBRARY_MAP)
            .filter(([code]) => !exports.EXCLUDED_EXERCISE_IDS.includes(code))
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
    getAllExercises: () => {
        // Return local library instantly — no network wait needed for the list
        return exports.ExerciseService.getLocalLibraryExercises();
    },
    // Background-only: refresh exercise list from server (does not block UI)
    refreshExercisesFromServer: async () => {
        try {
            const token = await exports.ExerciseService.getAuthToken();
            const response = await fetch(`${env_1.API_BASE_URL}/Exercises`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok)
                return exports.ExerciseService.getLocalLibraryExercises();
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0)
                return exports.ExerciseService.getLocalLibraryExercises();
            return data
                .filter((ex) => {
                const id = ex.id || ex.Id || ex.exerciseCode || ex.ExerciseCode || '';
                return !exports.EXCLUDED_EXERCISE_IDS.includes(id);
            })
                .map((ex) => ({
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
        }
        catch (error) {
            console.warn('Network error while fetching exercises, falling back to local library:', error);
            return exports.ExerciseService.getLocalLibraryExercises();
        }
    },
    // حفظ التمارين المقترحة من الـ AI
    saveSuggestedExercises: async (exercises, timestamp) => {
        try {
            const filteredInput = exercises.filter((ex) => {
                const id = typeof ex === 'string' ? ex : (ex.id || ex.exerciseCode || ex.exercise_code || '');
                return !exports.EXCLUDED_EXERCISE_IDS.includes(id);
            });
            const allExercises = exports.ExerciseService.getAllExercises();
            const mapped = filteredInput.map((ex, idx) => {
                // Handle case where ex is just a string (the name or code of the exercise)
                if (typeof ex === 'string') {
                    const details = exports.ExerciseService.getExerciseDetailsByCode(ex);
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
                const exerciseId = ex.id || ex.exerciseId || ex.ExerciseId;
                const code = ex.exerciseCode || ex.exercise_code || ex.code || (typeof ex.id === 'string' && ex.id.includes('_') ? ex.id : '');
                const dbMatch = allExercises.find(dbEx => (exerciseId && dbEx.id === exerciseId) ||
                    (code && dbEx.exerciseCode === code));
                const libraryDetails = exports.ExerciseService.getExerciseDetailsByCode(code || dbMatch?.exerciseCode);
                if (dbMatch) {
                    const isNameCode = dbMatch.name === code || dbMatch.name?.includes('_');
                    return {
                        id: exerciseId || dbMatch.id || Date.now().toString() + Math.random(),
                        name: ex.name || ex.Name || ((isNameCode && libraryDetails.name) ? libraryDetails.name : (dbMatch.name || libraryDetails.name)),
                        description: ex.description || ex.Description || dbMatch.description || libraryDetails.description || '',
                        exerciseType: ex.exerciseType || ex.ExerciseType || dbMatch.exerciseType || libraryDetails.exerciseType || 'General',
                        durationMinutes: ex.durationMinutes !== undefined ? ex.durationMinutes : ((libraryDetails.durationMinutes !== undefined) ? libraryDetails.durationMinutes : (dbMatch.durationMinutes || 5)),
                        difficulty: ex.difficulty || ex.Difficulty || dbMatch.difficulty || libraryDetails.difficulty || 'Medium',
                        instructions: ex.instructions || ex.Instructions || dbMatch.instructions || libraryDetails.instructions || '',
                        exerciseCode: code || dbMatch.exerciseCode,
                        isActive: true
                    };
                }
                const name = ex.name || ex.Name || ex.title || ex.Title || libraryDetails.name || 'Mindfulness Exercise';
                const description = ex.description || ex.Description || libraryDetails.description || 'A recommended wellness exercise designed for your current needs.';
                const instructions = ex.instructions || ex.Instructions || libraryDetails.instructions || description || '';
                const exerciseType = ex.exerciseType || ex.ExerciseType || libraryDetails.exerciseType || 'General';
                const durationMinutes = ex.durationMinutes !== undefined ? ex.durationMinutes : (libraryDetails.durationMinutes !== undefined ? libraryDetails.durationMinutes : 5);
                const difficulty = ex.difficulty || ex.Difficulty || libraryDetails.difficulty || 'Medium';
                return {
                    id: exerciseId || code || Date.now().toString() + Math.random(),
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
            const key = await exports.ExerciseService.getUserKey('@suggested_exercises');
            const existingStr = await async_storage_1.default.getItem(key);
            let existing = existingStr ? JSON.parse(existingStr) : [];
            console.log('[saveSuggested] incoming raw:', exercises.length, '→ after EXCLUDED filter:', filteredInput.length, '→ mapped:', mapped.length);
            console.log('[saveSuggested] existing in storage:', existing.length);
            // Deduplicate the incoming mapped list itself first (same exercise may appear in multiple AI responses)
            const seenIncoming = new Set();
            const dedupedMapped = mapped.filter((ex) => {
                const k = (ex.exerciseCode || ex.name || String(ex.id)).toLowerCase().trim();
                if (seenIncoming.has(k))
                    return false;
                seenIncoming.add(k);
                return true;
            });
            console.log('[saveSuggested] after incoming dedup:', dedupedMapped.length);
            // Give them unique instance IDs so we can remove them specifically
            const timestamped = dedupedMapped.map((ex) => ({
                ...ex,
                queueId: Date.now().toString() + Math.random().toString(),
                suggestedAt: timestamp || Date.now()
            }));
            // Remove existing exercises only if the new batch has the SAME exerciseCode or same id.
            // Do NOT remove by name alone — different exercises can share a similar name
            // and name-based removal was causing the queue to never grow.
            const cleanExisting = existing.filter((oldEx) => !timestamped.some((newEx) => {
                // Only deduplicate by exerciseCode (most reliable identifier)
                const sameCode = newEx.exerciseCode && oldEx.exerciseCode &&
                    newEx.exerciseCode.toLowerCase().trim() === oldEx.exerciseCode.toLowerCase().trim();
                // Also deduplicate by numeric/string id when both are present and stable
                const sameId = newEx.id && oldEx.id &&
                    String(newEx.id) === String(oldEx.id) &&
                    !String(newEx.id).includes('.'); // skip random float IDs
                return sameCode || sameId;
            }));
            const updated = [...timestamped, ...cleanExisting];
            console.log('[saveSuggested] cleanExisting kept:', cleanExisting.length, '→ total saved to storage:', updated.length);
            console.log('[saveSuggested] codes in storage:', updated.map((x) => x.exerciseCode || x.name).join(', '));
            await async_storage_1.default.setItem(key, JSON.stringify(updated));
        }
        catch (e) {
            console.error('Failed to save suggested exercises:', e);
        }
    },
    removeSuggestedExercise: async (queueId) => {
        try {
            const key = await exports.ExerciseService.getUserKey('@suggested_exercises');
            const stored = await async_storage_1.default.getItem(key);
            if (stored) {
                let existing = JSON.parse(stored);
                // Filter out the specific exercise instance that was completed
                // Using loose inequality (!=) to handle string/number comparison issues
                existing = existing.filter((ex) => ex.queueId != queueId && ex.id != queueId);
                await async_storage_1.default.setItem(key, JSON.stringify(existing));
            }
        }
        catch (e) { }
    },
    // جلب التمارين المقترحة المحفوظة محلياً
    // Note: exercises are saved by ChatService.endChat() and ChatService.summarizeChat()
    // — no auto-syncing here to avoid unintended side effects
    getSuggestedExercises: async () => {
        try {
            const key = await exports.ExerciseService.getUserKey('@suggested_exercises');
            const stored = await async_storage_1.default.getItem(key);
            if (!stored)
                return [];
            const list = JSON.parse(stored);
            return list.filter((ex) => !exports.EXCLUDED_EXERCISE_IDS.includes(ex.id || ex.exerciseCode));
        }
        catch (error) {
            return [];
        }
    },
    getCompletedExercises: async () => {
        try {
            const key = await exports.ExerciseService.getUserKey('@completed_exercises');
            const stored = await async_storage_1.default.getItem(key);
            if (!stored)
                return [];
            const list = JSON.parse(stored);
            return list.filter((ex) => !exports.EXCLUDED_EXERCISE_IDS.includes(ex.id || ex.exerciseCode));
        }
        catch (error) {
            return [];
        }
    },
    saveCompletedExercise: async (exercise) => {
        try {
            if (exports.EXCLUDED_EXERCISE_IDS.includes(String(exercise.id)) || exports.EXCLUDED_EXERCISE_IDS.includes(String(exercise.exerciseCode))) {
                return;
            }
            const key = await exports.ExerciseService.getUserKey('@completed_exercises');
            const completed = await exports.ExerciseService.getCompletedExercises();
            // Remove any existing entry with the same ID, then add to the front
            const filtered = completed.filter((c) => c.id !== exercise.id);
            const updated = [{ ...exercise, completedAt: Date.now() }, ...filtered];
            await async_storage_1.default.setItem(key, JSON.stringify(updated));
            // Fire-and-forget: immediate local notification for exercise completion
            try {
                const { NotificationService } = require('./notificationService');
                NotificationService.sendExerciseCompletedNotification(exercise.name);
            }
            catch (_) { }
            // Fire-and-forget: post silent sync log to server for cross-device restore
            // Uses __sync__ prefix so JournalScreen will always skip displaying it
            exports.ExerciseService.getAuthToken().then(token => {
                if (!token)
                    return;
                const bodyPayload = {
                    journal_text: `__sync__ Completed exercise: ${exercise.name} (Code: ${exercise.exerciseCode || exercise.id})`
                };
                fetch(`${env_1.API_BASE_URL}/Journals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(bodyPayload)
                }).catch(() => { });
            }).catch(() => { });
        }
        catch (error) {
            console.error(error);
        }
    },
    // مسح التمارين المقترحة القديمة
    clearSuggestedExercises: async () => {
        try {
            const key = await exports.ExerciseService.getUserKey('@suggested_exercises');
            await async_storage_1.default.removeItem(key);
        }
        catch (e) {
            console.error('Failed to clear suggested exercises:', e);
        }
    },
    clearCache: () => {
        // Keep as a no-op for AuthContext compatibility during logout
    },
    restoreUserData: async () => {
        try {
            const token = await exports.ExerciseService.getAuthToken();
            if (!token)
                return;
            const restoredKey = await exports.ExerciseService.getUserKey('@processed_restorations');
            const processedStr = await async_storage_1.default.getItem(restoredKey);
            const processedList = processedStr ? JSON.parse(processedStr) : [];
            const processedSet = new Set(processedList);
            // Helper: restore a single completed exercise by name or code
            const restoreCompletedExercise = async (rawText, createdAt) => {
                // Format: "Completed exercise: [Name] (Code: [code])" OR just "Completed exercise: [Name]"
                const codeMatch = rawText.match(/\(Code:\s*([^)]+)\)/i);
                const nameOnly = rawText
                    .replace(/\(Code:[^)]+\)/i, '')
                    .replace('Completed exercise:', '')
                    .trim();
                const exerciseCode = codeMatch ? codeMatch[1].trim() : null;
                const localLibrary = exports.ExerciseService.getLocalLibraryExercises();
                // Try match by code first, then by name
                let matchedEx;
                if (exerciseCode) {
                    matchedEx = localLibrary.find(ex => (ex.exerciseCode || '').toUpperCase() === exerciseCode.toUpperCase() ||
                        String(ex.id).toUpperCase() === exerciseCode.toUpperCase());
                }
                if (!matchedEx && nameOnly) {
                    matchedEx = localLibrary.find(ex => ex.name.toLowerCase() === nameOnly.toLowerCase());
                }
                if (matchedEx) {
                    const compKey = await exports.ExerciseService.getUserKey('@completed_exercises');
                    const storedCompleted = await async_storage_1.default.getItem(compKey);
                    let completedList = storedCompleted ? JSON.parse(storedCompleted) : [];
                    const alreadyExists = completedList.some((c) => c.id === matchedEx.id ||
                        (c.exerciseCode && c.exerciseCode === matchedEx.exerciseCode));
                    if (!alreadyExists) {
                        const completedAt = createdAt ? new Date(createdAt).getTime() : Date.now();
                        completedList.push({ ...matchedEx, completedAt });
                        await async_storage_1.default.setItem(compKey, JSON.stringify(completedList));
                        console.log('[ExerciseService] Restored completed exercise:', matchedEx.name);
                    }
                }
            };
            // 1. Fetch journals list
            const journalsRes = await fetch(`${env_1.API_BASE_URL}/Journals?PageSize=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (journalsRes.ok) {
                const journalsData = await journalsRes.json();
                const items = journalsData.items || [];
                for (const item of items) {
                    const idStr = String(item.id);
                    if (processedSet.has(idStr))
                        continue;
                    // Fetch details
                    try {
                        const detailRes = await fetch(`${env_1.API_BASE_URL}/Journals/${item.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (detailRes.ok) {
                            const details = await detailRes.json();
                            // Restore suggested exercises from AI response
                            // Only re-add exercises that haven't been completed yet
                            const rawSuggestions = details.suggested_exercises || details.suggestedExercises || details.SuggestedExercises || [];
                            if (rawSuggestions.length > 0) {
                                const completedList = await exports.ExerciseService.getCompletedExercises();
                                const completedIds = new Set(completedList.map((c) => String(c.exerciseCode || c.id || '').toUpperCase()));
                                const completedNames = new Set(completedList.map((c) => String(c.name || '').toLowerCase().trim()));
                                const filteredSuggestions = rawSuggestions.filter((s) => {
                                    const sCode = String(s.exerciseCode || s.exercise_code || s.code || s.id || '').toUpperCase();
                                    const sName = String(s.name || s.Name || s.title || '').toLowerCase().trim();
                                    return !completedIds.has(sCode) && !completedNames.has(sName);
                                });
                                if (filteredSuggestions.length > 0) {
                                    const journalTime = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();
                                    await exports.ExerciseService.saveSuggestedExercises(filteredSuggestions, journalTime);
                                }
                            }
                            // Path A: Parse raw journal_text directly (our sync log format)
                            const journalText = details.content || details.Content || details.journal_text || details.journalText || details.JournalText || '';
                            // Support new __sync__ prefix and old 'Completed exercise:' format
                            const normalizedText = journalText.startsWith('__sync__')
                                ? journalText.replace('__sync__', '').trim()
                                : journalText;
                            if (normalizedText.startsWith('Completed exercise:')) {
                                await restoreCompletedExercise(normalizedText, item.createdAt);
                            }
                            // Path B: Parse matched_items (AI may echo the text back)
                            const matchedItems = details.matched_items || [];
                            for (const mItem of matchedItems) {
                                const subItems = mItem.items || [];
                                for (const sub of subItems) {
                                    const matchText = sub.match_text || '';
                                    const normalizedMatch = matchText.startsWith('__sync__')
                                        ? matchText.replace('__sync__', '').trim()
                                        : matchText;
                                    if (normalizedMatch.startsWith('Completed exercise:')) {
                                        await restoreCompletedExercise(normalizedMatch, item.createdAt);
                                    }
                                }
                            }
                            processedSet.add(idStr);
                        }
                    }
                    catch (e) {
                        console.warn('[ExerciseService] restore journal error for id ' + item.id, e);
                    }
                }
            }
            // 2. Fetch chats list to restore suggested exercises
            const chatsRes = await fetch(`${env_1.API_BASE_URL}/Chats?pageSize=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (chatsRes.ok) {
                const chatsData = await chatsRes.json();
                const chatItems = chatsData.items || [];
                for (const item of chatItems) {
                    const idStr = 'chat_' + item.id;
                    if (processedSet.has(idStr))
                        continue;
                    try {
                        const summaryRes = await fetch(`${env_1.API_BASE_URL}/Chats/${item.id}/summary`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (summaryRes.ok) {
                            const summaryData = await summaryRes.json();
                            const rawSuggestions = summaryData.suggestedExercises || summaryData.suggested_exercises || [];
                            if (rawSuggestions.length > 0) {
                                // Only re-add exercises that haven't been completed yet
                                const completedList = await exports.ExerciseService.getCompletedExercises();
                                const completedIds = new Set(completedList.map((c) => String(c.exerciseCode || c.id || '').toUpperCase()));
                                const completedNames = new Set(completedList.map((c) => String(c.name || '').toLowerCase().trim()));
                                const filteredSuggestions = rawSuggestions.filter((s) => {
                                    const sCode = String(s.exerciseCode || s.exercise_code || s.code || s.id || '').toUpperCase();
                                    const sName = String(s.name || s.Name || s.title || '').toLowerCase().trim();
                                    return !completedIds.has(sCode) && !completedNames.has(sName);
                                });
                                if (filteredSuggestions.length > 0) {
                                    const chatTime = item.createdAt ? new Date(item.createdAt).getTime() : Date.now();
                                    await exports.ExerciseService.saveSuggestedExercises(filteredSuggestions, chatTime);
                                }
                            }
                            processedSet.add(idStr);
                        }
                    }
                    catch (e) {
                        console.warn('[ExerciseService] restore chat error for id ' + item.id, e);
                    }
                }
            }
            await async_storage_1.default.setItem(restoredKey, JSON.stringify(Array.from(processedSet)));
            console.log('[ExerciseService] restoreUserData completed successfully.');
        }
        catch (err) {
            console.warn('[ExerciseService] restoreUserData failed:', err);
        }
    },
    filterActiveSuggestions: (suggested, completed) => {
        const active = (suggested || []).filter(s => {
            const sTime = s.suggestedAt || 0;
            // Check if this exercise was completed (at any time if suggestedAt=0, or after it was suggested)
            const wasCompleted = (completed || []).some(c => {
                const cTime = typeof c.completedAt === 'number' ? c.completedAt : (typeof c.completedAt === 'string' ? parseInt(c.completedAt, 10) : 0);
                const isSameEx = (c.id && s.id && String(c.id) === String(s.id)) ||
                    (c.exerciseCode && s.exerciseCode && c.exerciseCode.toUpperCase() === s.exerciseCode.toUpperCase()) ||
                    (c.name && s.name && c.name.toLowerCase().trim() === s.name.toLowerCase().trim());
                return isSameEx && (sTime === 0 ? cTime > 0 : cTime > sTime);
            });
            return !wasCompleted;
        });
        console.log('[filterActive] suggested input:', suggested?.length, '→ after completion filter:', active.length, '(completed pool:', completed?.length, ')');
        // Deduplicate: one entry per exerciseCode (newest first), fallback by name.
        const deduplicated = [];
        const seenCodes = new Set();
        const seenNames = new Set();
        for (const ex of active) {
            if (ex.exerciseCode) {
                const k = ex.exerciseCode.toLowerCase().trim();
                if (!seenCodes.has(k)) {
                    seenCodes.add(k);
                    deduplicated.push(ex);
                }
            }
            else {
                const k = (ex.name || String(ex.id)).toLowerCase().trim();
                if (!seenNames.has(k)) {
                    seenNames.add(k);
                    deduplicated.push(ex);
                }
            }
        }
        console.log('[filterActive] after dedup:', deduplicated.length, '→ codes:', deduplicated.map(x => x.exerciseCode || x.name).join(', '));
        return deduplicated;
    }
};
