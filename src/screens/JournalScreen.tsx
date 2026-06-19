import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, HIT_SLOP } from '../theme';
import { Card } from '../components';
import { FilterIcon, CloudIcon, CloudOutlineIcon, DocumentIcon, MicrophoneIcon, LockIcon, SearchIcon } from '../components/Icons';
import { styles } from './JournalScreen.style';
import { API_BASE_URL } from '../config/env';
import { ExerciseService } from '../services/exerciseService';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Always fetch fresh token from storage (don't cache across sessions)
const getApiToken = async (): Promise<string> => {
  try {
    const { getOrRefreshToken } = require('../services/authHelper');
    return await getOrRefreshToken();
  } catch {
    const token = await AsyncStorage.getItem('@mentora_auth_token');
    return token ? token.trim() : '';
  }
};

const getJournalKey = async (): Promise<string> => {
  const email = await AsyncStorage.getItem('@mentora_user_email');
  return email ? `@mentora_journal_entries_${email.trim().toLowerCase()}` : '@mentora_journal_entries';
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', IconComponent: CloudOutlineIcon },
  { id: 'text', label: 'Text', IconComponent: DocumentIcon },
  { id: 'record', label: 'Record', IconComponent: MicrophoneIcon },
  { id: 'locked', label: 'Locked', IconComponent: LockIcon },
];


export interface JournalEntry {
  id: string;
  serverId?: number;
  title: string;
  preview: string;
  fullContent?: string;
  date: string;
  tags: string[];
  type: 'text' | 'record';
  locked?: boolean;
}

function matchSearch(entry: JournalEntry, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const title = entry.title.toLowerCase();
  const preview = entry.preview.toLowerCase();
  const tags = entry.tags.join(' ').toLowerCase();
  return title.indexOf(q) !== -1 || preview.indexOf(q) !== -1 || tags.indexOf(q) !== -1;
}

export function JournalScreen(): React.ReactElement {
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [writeSheetVisible, setWriteSheetVisible] = useState(false);
  const [mentoraModalVisible, setMentoraModalVisible] = useState(false);
  const [journalCrisisVisible, setJournalCrisisVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [lockedChecked, setLockedChecked] = useState(false);
  const [lockedConfirmed, setLockedConfirmed] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const navigation = useNavigation<any>();
  const { email } = useAuth();
  
  // PIN states
  const [pinSetupVisible, setPinSetupVisible] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [setupStep, setSetupStep] = useState(1);
  
  const [pinUnlockVisible, setPinUnlockVisible] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockTargetEntry, setUnlockTargetEntry] = useState<JournalEntry | null>(null);
  
  const pinInputRef = useRef<TextInput>(null);

  const getPinKey = (): string => {
    const userEmail = email ? email.trim().toLowerCase() : '';
    return `@mentora_journal_pin_${userEmail}`;
  };

  useEffect(() => {
    if (pinSetupVisible || pinUnlockVisible) {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pinSetupVisible, pinUnlockVisible]);

  const renderPinDigits = (pin: string) => {
    const digits = [0, 1, 2, 3];
    return (
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => pinInputRef.current?.focus()}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 16, marginVertical: 20, justifyContent: 'center' }}
      >
        {digits.map((index) => {
          const char = pin[index];
          const hasValue = char !== undefined;
          return (
            <View
              key={index}
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: hasValue ? colors.primary : '#E2E8F0',
                backgroundColor: hasValue ? '#EFF6FF' : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {hasValue ? (
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary }} />
              ) : null}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  // Root cause fix #4: track language in a ref so the sync effect
  // does not re-run every time the user switches language (which was
  // causing a full re-merge and creating duplicate reconstructed entries).
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);

  useEffect(() => {
    (async () => {
      let localList: JournalEntry[] = [];
      const key = await getJournalKey();
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as JournalEntry[];
          // Auto-delete old entries that are silent exercise sync logs
          const isExerciseLog = (e: JournalEntry) =>
            (e.fullContent || '').startsWith('__sync__') ||
            (e.fullContent || '').startsWith('Completed exercise:');
          localList = parsed.filter(e => e.fullContent !== undefined && !isExerciseLog(e));
          setEntries(localList);
          if (localList.length !== parsed.length) {
            await AsyncStorage.setItem(key, JSON.stringify(localList));
          }
        } else {
          setEntries([]); // Clear state if no stored entries exist for this user!
        }
      } catch (e) {
        console.warn('Failed to load journals locally', e);
        setEntries([]);
      }

      // Sync with server
      try {
        const token = await getApiToken();
        if (token) {
          const response = await fetch(`${API_BASE_URL}/Journals?PageSize=100`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const serverItems = data.items || [];
            
            // Match and merge
            const serverIdSet = new Set(localList.map(e => e.serverId).filter(Boolean));
            
            // Read skipped journal IDs
            const skippedKey = email ? `@mentora_skipped_journals_${email.trim().toLowerCase()}` : '@mentora_skipped_journals';
            let skippedIds: string[] = [];
            try {
              const skippedStr = await AsyncStorage.getItem(skippedKey);
              if (skippedStr) skippedIds = JSON.parse(skippedStr);
            } catch (err) {
              console.warn('Failed to parse skipped journals list:', err);
            }
            const skippedSet = new Set(skippedIds.map(String));
            
            const newReconstructed: JournalEntry[] = [];
            let updatedLocalList = [...localList];
            
            for (const sItem of serverItems) {
              const sItemIdStr = String(sItem.id);
               if (serverIdSet.has(sItem.id) || skippedSet.has(sItemIdStr)) {
                continue;
              }
              
              // Try to match with an existing local entry without serverId by timestamp
              const sTime = new Date(sItem.createdAt).getTime();
              let matchedIdx = updatedLocalList.findIndex(le => {
                if (le.serverId) return false;
                const leTime = parseInt(le.id, 10);
                if (isNaN(leTime)) return false;
                // Root cause fix #1: tightened from 30 min to 2 min.
                // A 30-min window caused ANY clock skew > 2 min between client and server
                // to miss the match, reconstructing a second copy of the same entry.
                return Math.abs(leTime - sTime) < 120000; // 2 min tolerance
              });
              
              if (matchedIdx !== -1) {
                updatedLocalList[matchedIdx] = {
                  ...updatedLocalList[matchedIdx],
                  serverId: sItem.id
                };
              } else {
                // Fetch detail to see actual text and check if it is a silent Completed exercise log
                try {
                  const detailRes = await fetch(`${API_BASE_URL}/Journals/${sItem.id}`, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  if (detailRes.ok) {
                    const details = await detailRes.json();
                    
                    // Reconstruct content by joining match_text if main text is empty
                    const rawText = details.content || details.Content || details.journal_text || details.journalText || details.JournalText || '';
                    const matchedItems = details.matched_items || [];
                    const matchTexts: string[] = [];

                    for (const mItem of matchedItems) {
                      const subItems = mItem.items || [];
                      for (const sub of subItems) {
                        if (sub.match_text && !matchTexts.includes(sub.match_text)) {
                          matchTexts.push(sub.match_text);
                        }
                      }
                    }

                    const journalText = rawText || matchTexts.join('\n');
                    const normalizedText = journalText.trim();

                    // Skip completed exercise sync logs or empty entries (e.g. dummy/sync logs with empty matches)
                    const isCompletedOrEmpty = 
                      !normalizedText || 
                      normalizedText.startsWith('__sync__') || 
                      normalizedText.startsWith('Completed exercise:') || 
                      normalizedText.includes('Completed exercise') || 
                      normalizedText.includes('__sync__');

                    if (isCompletedOrEmpty) {
                      skippedSet.add(sItemIdStr);
                      continue;
                    }

                    const dateStr = new Date(sItem.createdAt).toLocaleString(languageRef.current === 'ar' ? 'ar-EG' : 'en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    });
                    const tagsList = sItem.tags || [];
                    const titleText = details.title ||
                      (languageRef.current === 'ar' ? 'بلا عنوان' : 'Untitled');

                    const reconstructed: JournalEntry = {
                      id: sTime.toString(),
                      serverId: sItem.id,
                      title: titleText,
                      preview: normalizedText.substring(0, 80) + (normalizedText.length > 80 ? '…' : ''),
                      fullContent: journalText,
                      date: dateStr,
                      tags: tagsList,
                      type: 'text',
                      locked: false
                    };
                    newReconstructed.push(reconstructed);
                  }
                } catch (err) {
                  console.warn(`[JournalScreen] Failed to fetch details for journal ${sItem.id}`, err);
                }
              }
            }
            
            // Save updated skipped journal list
            if (skippedSet.size > skippedIds.length) {
              try {
                await AsyncStorage.setItem(skippedKey, JSON.stringify(Array.from(skippedSet)));
              } catch (err) {
                console.warn('Failed to save skipped journals list:', err);
              }
            }
            
            if (newReconstructed.length > 0 || updatedLocalList.some((le, idx) => le.serverId !== localList[idx]?.serverId)) {
              const raw = [...newReconstructed, ...updatedLocalList];
              // Root cause fix #5: deduplicate by serverId then by local id
              // before writing to state and storage. This prevents a server entry
              // that was both timestamp-matched AND reconstructed from appearing twice.
              const seenServerIds = new Set<number>();
              const seenLocalIds = new Set<string>();
              const merged = raw.filter(e => {
                if (e.serverId !== undefined) {
                  if (seenServerIds.has(e.serverId)) return false;
                  seenServerIds.add(e.serverId);
                }
                if (seenLocalIds.has(e.id)) return false;
                seenLocalIds.add(e.id);
                return true;
              });
              // Sort by ID descending (newest first)
              merged.sort((a, b) => {
                const aVal = parseInt(a.id, 10) || 0;
                const bVal = parseInt(b.id, 10) || 0;
                return bVal - aVal;
              });

              setEntries(merged);
              await AsyncStorage.setItem(key, JSON.stringify(merged));
              console.log(`[JournalSync] Merged ${newReconstructed.length} new entries. Total after dedup: ${merged.length}.`);
            }
          }
        }
        // Sync exercises and goals in the background
        ExerciseService.restoreUserData().catch(e => {
          console.warn('Failed to sync exercises/goals', e);
        });
      } catch (syncErr) {
        console.warn('Failed to sync journals with server', syncErr);
      }
    })();
  // Root cause fix #4: removed `language` from deps — language changes are
  // tracked via languageRef so the effect does not re-run on language switch.
  }, [email]);

  useEffect(() => {
    console.log('FILTER:', filter);
  }, [filter]);

  const filteredEntries = useMemo(() => {
    let list = entries;

    // Filter by type or status
    if (filter === 'locked') {
      list = list.filter((e) => e.locked === true);
    } else if (filter === 'text') {
      list = list.filter((e) => e.type === 'text' && !e.locked);
    } else if (filter === 'record') {
      list = list.filter((e) => e.type === 'record' && !e.locked);
    }

    // Apply search on top
    return list.filter((e) => matchSearch(e, searchQuery));
  }, [entries, filter, searchQuery]);

  const openWrite = (): void => {
    setWriteSheetVisible(true);
    setLockedChecked(false);
    setLockedConfirmed(false);
  };

  const closeWrite = (): void => {
    setWriteSheetVisible(false);
    setNewTitle('');
    setNewContent('');
    setLockedChecked(false);
    setLockedConfirmed(false);
    setMentoraModalVisible(false);
  };

  const onLockedPress = async (): Promise<void> => {
    if (!lockedChecked && !lockedConfirmed) {
      setMentoraModalVisible(true);
      return;
    }
    if (lockedChecked) {
      setLockedChecked(false);
    } else {
      const key = getPinKey();
      const storedPin = await AsyncStorage.getItem(key);
      if (!storedPin) {
        setSetupPin('');
        setSetupPinConfirm('');
        setSetupStep(1);
        setPinSetupVisible(true);
      } else {
        setLockedChecked(true);
      }
    }
  };

  const onMentoraOk = async (): Promise<void> => {
    setMentoraModalVisible(false);
    const key = getPinKey();
    const storedPin = await AsyncStorage.getItem(key);
    if (!storedPin) {
      setSetupPin('');
      setSetupPinConfirm('');
      setSetupStep(1);
      setPinSetupVisible(true);
    } else {
      setLockedConfirmed(true);
      setLockedChecked(true);
    }
  };

  const getFilterLabel = (id: string) => {
    if (language !== 'ar') {
      const labels: Record<string, string> = { all: 'All', text: 'Text', record: 'Record', locked: 'Locked' };
      return labels[id] || id;
    }
    const labels: Record<string, string> = { all: 'الكل', text: 'نصي', record: 'صوتي', locked: 'مغلق بكلمة مرور' };
    return labels[id] || id;
  };

  const saveEntry = async (): Promise<void> => {
    if (!newTitle.trim() && !newContent.trim()) {
      closeWrite();
      return;
    }

    setIsSaving(true);
    try {
      const payloadContent = newContent.trim() || newTitle.trim();
      
      // Client-side crisis / safety risk check (matches ChatScreen safety filtering with Arabic support)
      const lowerText = payloadContent.toLowerCase();
      const riskPhrases = [
        'suicide', 'kill myself', 'want to die', 'end my life', 'harm myself', 
        'killmy self', 'end mylife', 'suicidal', 'better off dead',
        'انتحر', 'أنتحر', 'انتحار', 'هموت نفسي', 'اموت نفسي', 'أموت نفسي', 
        'اقتل نفسي', 'أقتل نفسي', 'انهي حياتي', 'أنهي حياتي', 'ايذاء نفسي', 
        'إيذاء نفسي', 'اريد الموت', 'أريد الموت', 'الافضل ان اموت', 'الافضل أن أموت'
      ];
      const containsRisk = riskPhrases.some(phrase => lowerText.includes(phrase));
      
      if (containsRisk) {
        setJournalCrisisVisible(true);
        // Save locally without calling backend (safeguard)
        const defaultTitle = language === 'ar' ? 'تنبيه سلامة' : 'Safety Alert';
        const safetyTags = language === 'ar' ? ['أمان', 'دعم'] : ['Safety', 'Support'];
        const defaultTitleText = newTitle.trim() || defaultTitle;
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          title: defaultTitleText,
          preview: newContent.trim().slice(0, 80) + (newContent.trim().length > 80 ? '…' : ''),
          fullContent: newContent.trim(),
          date: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
          }),
          tags: safetyTags,
          type: 'text',
          locked: lockedChecked,
        };
        setEntries((prev) => {
          const updated = [newEntry, ...prev];
          getJournalKey().then(key =>
            AsyncStorage.setItem(key, JSON.stringify(updated)).catch(console.warn)
          );
          return updated;
        });
        setIsSaving(false);
        closeWrite();
        return;
      }

      // === SEND TO AI AND SAVE (blocking flow to ensure tags and server response are complete) ===
      const token = await getApiToken();
      const response = await fetch(`${API_BASE_URL}/Journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ journal_text: payloadContent }),
      });
      console.log('Journal API response status:', response.status);

      if (response.ok) {
        const data = await response.json();

        // Parse tags from AI response
        let tags: string[] = [];
        const apiTags = data.tags || data.Tags;
        if (Array.isArray(apiTags)) {
          tags = apiTags;
        } else if (typeof apiTags === 'string') {
          try {
            const parsed = JSON.parse(apiTags);
            tags = Array.isArray(parsed) ? parsed : apiTags.split(',').map((t: string) => t.trim()).filter(Boolean);
          } catch {
            tags = apiTags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        }

        // Save suggested exercises from AI
        const aiSuggested = data.suggested_exercises || data.suggestedExercises || data.SuggestedExercises || [];
        if (aiSuggested && aiSuggested.length > 0) {
          await ExerciseService.saveSuggestedExercises(aiSuggested);
          console.log('Saved', aiSuggested.length, 'suggested exercises from journal');
          
          Alert.alert(
            languageRef.current === 'ar' ? 'تم اقتراح تمارين جديدة' : 'New Exercises Suggested',
            languageRef.current === 'ar' 
              ? `تمت إضافة تمارين مخصصة بناءً على كتابتك.` 
              : `Added personalized exercises based on your entry.`,
            [
              { 
                text: languageRef.current === 'ar' ? 'ابدأ الآن' : 'Start Now', 
                onPress: () => navigation.navigate('Exercises', { openSuggested: true }) 
              },
              { 
                text: languageRef.current === 'ar' ? 'لاحقاً' : 'Later', 
                style: 'cancel' 
              }
            ]
          );
        }

        // Crisis detection from AI
        const apiRiskLevel = (data.risk_level || data.riskLevel || data.RiskLevel || 'normal').toLowerCase();
        const isApiCrisis = apiRiskLevel === 'crisis' || apiRiskLevel === 'danger';
        if (isApiCrisis) {
          setJournalCrisisVisible(true);
        }

        // Root cause fix #2: the POST response (JournalResponse) already contains
        // the new entry's Id. Using a secondary GET?PageSize=1 was a race condition —
        // if another entry was created simultaneously (e.g. mood service), the list
        // fetch could return the WRONG serverId, breaking sync deduplication.
        const serverId: number | undefined = data.id ?? data.Id ?? undefined;
        console.log('[JournalScreen] New journal serverId from POST response:', serverId);

        const defaultTitle = languageRef.current === 'ar' ? 'بلا عنوان' : 'Untitled';
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          serverId,
          title: newTitle.trim() || defaultTitle,
          preview: newContent.trim().slice(0, 80) + (newContent.trim().length > 80 ? '…' : ''),
          fullContent: newContent.trim(),
          date: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
          }),
          tags,
          type: 'text',
          locked: lockedChecked,
        };

        // Root cause fix #3: use functional setState to read the current live
        // React state instead of re-reading AsyncStorage (which may be stale if
        // the sync useEffect ran between our getItem and setItem calls).
        const key = await getJournalKey();
        setEntries(prev => {
          // Guard: skip insert if an entry with the same serverId or local id already exists
          const isDuplicate = prev.some(e =>
            (newEntry.serverId !== undefined && e.serverId === newEntry.serverId) ||
            e.id === newEntry.id
          );
          if (isDuplicate) {
            console.warn('[JournalScreen] Prevented duplicate insert for serverId:', newEntry.serverId);
            return prev;
          }
          const updated = [newEntry, ...prev];
          AsyncStorage.setItem(key, JSON.stringify(updated)).catch(e =>
            console.warn('[JournalScreen] Failed to persist new entry', e)
          );
          return updated;
        });

        setIsSaving(false);
        closeWrite();
      } else {
        // AI API failed — show alert, do not save (user can retry)
        const statusCode = response.status;
        let errBody = '';
        try { errBody = await response.text(); } catch {}
        console.warn(`Journal AI failed — HTTP ${statusCode}:`, errBody);
        Alert.alert(
          language === 'ar' ? 'فشل التحليل' : 'Analysis Failed',
          language === 'ar' ? 'خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة مرة أخرى.' : 'The AI service is temporarily unavailable. Please try again in a moment.',
          [{ text: t.common.ok, style: 'default' }]
        );
        setIsSaving(false);
        return;
      }
    } catch (error) {
      console.warn('Failed to save entry:', error);
      Alert.alert(
        language === 'ar' ? 'فشل الحفظ' : 'Failed to Save',
        language === 'ar' ? 'حدث خطأ أثناء حفظ اليومية. يرجى المحاولة مرة أخرى.' : 'An error occurred while saving the journal entry. Please try again.',
        [{ text: t.common.ok, style: 'default' }]
      );
      setIsSaving(false);
    }
  };


  const JournalEntryCard = ({ item }: { item: JournalEntry }) => {
    const handlePress = async () => {
      if (item.locked) {
        const key = getPinKey();
        const storedPin = await AsyncStorage.getItem(key);
        if (storedPin) {
          setUnlockTargetEntry(item);
          setUnlockPin('');
          setPinUnlockVisible(true);
          return;
        }
      }
      setSelectedEntry(item);
    };

    // Create a garbled/distorted version of the preview if locked
    const displayPreview = item.locked 
      ? item.preview.replace(/[a-zA-Z0-9]/g, '█').substring(0, 80) + '...'
      : item.preview;

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Card style={styles.entryCard} accessibilityRole="button" accessibilityLabel={`Entry: ${item.title}`}>
          <View style={[styles.entryCardInner, isRTL && { flexDirection: 'row-reverse' }]}>
            {item.locked && (
              <View style={[styles.entryBadge, isRTL ? { marginLeft: 0, marginRight: 10 } : { marginRight: 10 }]}>
                <LockIcon size={16} color={colors.primary} />
              </View>
            )}
            
            {!item.locked && item.type === 'record' && (
               <View style={[styles.entryBadge, isRTL ? { marginLeft: 0, marginRight: 10 } : { marginRight: 10 }]}>
                 <MicrophoneIcon size={16} color={colors.primary} />
               </View>
            )}

            <View style={[styles.entryContent, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.entryTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                {item.title}
              </Text>
              
              <Text 
                style={[
                  styles.entryPreview, 
                  item.locked && styles.entryPreviewBlurred,
                  isRTL && { textAlign: 'right' }
                ]} 
                numberOfLines={2}
              >
                {displayPreview}
              </Text>

              <View style={[styles.entryMeta, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.entryDate}>{item.date}</Text>
                {item.tags.length > 0 && (
                  <View style={[styles.tags, isRTL && { flexDirection: 'row-reverse' }]}>
                    {item.tags.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEntry = ({ item }: { item: JournalEntry }): React.ReactElement => (
    <JournalEntryCard item={item} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} accessibilityLabel="Journal screen">
      {/* Top: Search + Filter */}
      <View style={[styles.topBar, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={[styles.searchWrap, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ marginRight: 8 }}><SearchIcon size={18} color={colors.textSecondary} /></View>
          <TextInput
            style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
            placeholder={t.journal.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search entries"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterPopupVisible(true)}
          hitSlop={HIT_SLOP}
          accessibilityLabel="Filter options"
        >
          <FilterIcon color={colors.textPrimary} size={20} />
        </TouchableOpacity>
      </View>


      {/* New Entry card */}
      <View style={styles.newEntryCard}>
        <View style={[styles.newEntryHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.newEntryTitle}>{t.journal.newEntry}</Text>
            <Text style={styles.newEntrySubtitle}>
              {language === 'ar' ? 'سجّل أفكارك ومشاعرك' : 'Capture your thoughts'}
            </Text>
          </View>
          <CloudIcon color={colors.white} size={40} />
        </View>
        <View style={[styles.newEntryActions, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={styles.writeButton} onPress={openWrite} activeOpacity={0.8}>
            <Text style={styles.writeButtonText}>
              {language === 'ar' ? '+ كتابة' : '+ Write'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
            <View style={{ marginRight: 6 }}><MicrophoneIcon size={16} color={colors.white} /></View>
            <Text style={styles.recordButtonText}>
              {language === 'ar' ? 'صوتي' : 'Record'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Entry list */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <Text style={styles.listEmptyText}>
              {language === 'ar' ? 'لا توجد يوميات تطابق بحثك أو تصنيفك.' : 'No entries match your search or filter.'}
            </Text>
          </View>
        }
      />

      {/* Filter popup */}
      <Modal
        visible={filterPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterPopupVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterPopupVisible(false)}>
          <View style={styles.filterPopupOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterPopupCard}>
                <TouchableOpacity
                  style={styles.filterPopupClose}
                  onPress={() => setFilterPopupVisible(false)}
                  hitSlop={HIT_SLOP}
                >
                  <Text style={styles.filterPopupCloseText}>✕</Text>
                </TouchableOpacity>

                {FILTER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.filterPopupRow,
                      filter === opt.id && styles.filterPopupRowSelected,
                      isRTL && { flexDirection: 'row-reverse' }
                    ]}
                    onPress={() => {
                      setFilter(opt.id);
                      setFilterPopupVisible(false);
                    }}
                  >
                    <opt.IconComponent color={filter === opt.id ? colors.textPrimary : colors.textMuted} size={20} />
                    <Text style={[styles.filterPopupOptionText, isRTL ? { marginRight: 12 } : { marginLeft: 12 }]}>{getFilterLabel(opt.id)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Write bottom sheet */}
      <Modal
        visible={writeSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={closeWrite}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={closeWrite}>
            <View style={styles.writeOverlay}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={styles.writeCard}>
                  <View style={[styles.writeCardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity onPress={closeWrite} style={styles.writeCloseBtn} hitSlop={HIT_SLOP}>
                      <Text style={styles.writeCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.writeInputTitle, isRTL && { textAlign: 'right' }]}
                    placeholder={language === 'ar' ? 'عنوان اليومية...' : 'Entry title...'}
                    placeholderTextColor={colors.textMuted}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                  <TextInput
                    style={[styles.writeInputBody, isRTL && { textAlign: 'right' }]}
                    placeholder={language === 'ar' ? 'ما الذي يدور في ذهنك؟' : "What's on your mind?"}
                    placeholderTextColor={colors.textMuted}
                    value={newContent}
                    onChangeText={setNewContent}
                    multiline
                    numberOfLines={5}
                  />
                  <TouchableOpacity style={[styles.lockedRow, isRTL && { flexDirection: 'row-reverse' }]} onPress={onLockedPress} activeOpacity={0.8}>
                    <View style={[styles.lockedCheckbox, lockedChecked && styles.lockedCheckboxChecked]}>
                      {lockedChecked ? <Text style={{ color: colors.white, fontSize: 14 }}>✓</Text> : null}
                    </View>
                    <Text style={[styles.lockedLabel, isRTL ? { marginRight: 8 } : { marginLeft: 8 }]}>
                      {language === 'ar' ? 'مغلق بكلمة مرور' : 'Locked'}
                    </Text>
                    <LockIcon size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveEntryButton} onPress={saveEntry} activeOpacity={0.9} disabled={isSaving}>
                    {isSaving ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.saveEntryButtonText}>{t.journal.addEntry}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Mentora locked confirmation */}
      <Modal
        visible={mentoraModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMentoraModalVisible(false)}
      >
        <View style={styles.mentoraModalOverlay}>
          <View style={styles.mentoraModalCard}>
            <Text style={[styles.mentoraModalText, isRTL && { textAlign: 'right' }]}>
              {language === 'ar' 
                ? 'منتورا لديها الصلاحية للوصول لهذه الرسالة لتجربتها وتحليلها. إذا كنت لا تفضل ذلك، يرجى التوجه للإعدادات.'
                : "Mentora has access to this message. If you don't want it, please configure this in Settings."
              }
            </Text>
            <View style={[styles.mentoraModalActions, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                style={styles.mentoraCancelBtn}
                onPress={() => setMentoraModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.mentoraCancelText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mentoraOkBtn} onPress={onMentoraOk} activeOpacity={0.8}>
                <Text style={styles.mentoraOkText}>{t.common.ok}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Entry Modal */}
      <Modal
        visible={!!selectedEntry}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedEntry(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedEntry(null)}>
          <View style={styles.writeOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={[styles.writeCard, { maxHeight: '80%' }]}>
                <View style={[styles.writeCardHeader, { justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 18, color: colors.white, fontWeight: 'bold' }}>
                    {language === 'ar' ? 'تفاصيل اليومية' : 'Entry Details'}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedEntry(null)} style={styles.writeCloseBtn} hitSlop={HIT_SLOP}>
                    <Text style={styles.writeCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.writeInputTitle, { marginTop: 16, marginBottom: 8 }, isRTL && { textAlign: 'right' }]}>
                  {selectedEntry?.title}
                </Text>
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={{ marginVertical: 8 }}>
                  <Text style={[{ color: colors.textPrimary, fontSize: 16, lineHeight: 28 }, isRTL && { textAlign: 'right' }]}>
                    {selectedEntry?.fullContent || selectedEntry?.preview}
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Red Crisis warning alert modal */}
      <Modal
        visible={journalCrisisVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJournalCrisisVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: '#FFF5F5',
            borderRadius: 28,
            borderWidth: 2,
            borderColor: '#FCA5A5',
            padding: 24,
            alignItems: 'center',
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8
          }}>
            {/* Warning Icon Header */}
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FEE2E2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth={2} />
                <Path d="M12 8v4" stroke="#DC2626" strokeWidth={2} strokeLinecap="round" />
                <Circle cx="12" cy="16" r="1.5" fill="#DC2626" />
              </Svg>
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#991B1B',
              textAlign: 'center',
              marginBottom: 10
            }}>
              {language === 'ar' ? 'تنبيه هـام جداً' : 'Emergency Alert'}
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#7F1D1D',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 20,
              paddingHorizontal: 8
            }}>
              {language === 'ar' 
                ? 'سلامتك هي أهم شيء بالنسبة لنا. يرجى التواصل فوراً مع شخص مقرب منك أو عائلتك، أو الاتصال بخط المساعدة المباشر للحصول على دعم فوري. أنت لست وحدك وهناك من يريد مساعدتك.'
                : 'Your safety is our absolute priority. Please reach out to someone close to you (family or friends) or contact a crisis support service immediately. Help is always available and you are not alone.'
              }
            </Text>

            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#DC2626',
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#DC2626',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={() => Linking.openURL('tel:988').catch(() => Alert.alert('Error', 'Could not dial 988. Please call directly.'))}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
                  {language === 'ar' ? 'الاتصال بخط المساعدة (988)' : 'Call Crisis Lifeline (988)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#FCA5A5'
                }}
                onPress={() => setJournalCrisisVisible(false)}
              >
                <Text style={{ color: '#7F1D1D', fontWeight: '700', fontSize: 14 }}>
                  {language === 'ar' ? 'إغلاق التنبيه' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal
        visible={pinSetupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPinSetupVisible(false);
          setSetupPin('');
          setSetupPinConfirm('');
          setSetupStep(1);
          setLockedChecked(false);
          setLockedConfirmed(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setPinSetupVisible(false);
          setSetupPin('');
          setSetupPinConfirm('');
          setSetupStep(1);
          setLockedChecked(false);
          setLockedConfirmed(false);
        }}>
          <View style={styles.pinModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pinModalCard}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                  {t.journal.setPinTitle}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 }}>
                  {setupStep === 1 ? t.journal.setPinDesc : t.journal.enterPinDesc}
                </Text>
                
                {renderPinDigits(setupStep === 1 ? setupPin : setupPinConfirm)}
                
                <TextInput
                  ref={pinInputRef}
                  style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}
                  keyboardType="numeric"
                  maxLength={4}
                  value={setupStep === 1 ? setupPin : setupPinConfirm}
                  onChangeText={(val) => {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    if (setupStep === 1) {
                      setSetupPin(cleanVal);
                      if (cleanVal.length === 4) {
                        setSetupStep(2);
                      }
                    } else {
                      setSetupPinConfirm(cleanVal);
                      if (cleanVal.length === 4) {
                        if (cleanVal === setupPin) {
                          (async () => {
                            const key = getPinKey();
                            await AsyncStorage.setItem(key, setupPin);
                            setLockedConfirmed(true);
                            setLockedChecked(true);
                            setPinSetupVisible(false);
                            setSetupPin('');
                            setSetupPinConfirm('');
                            setSetupStep(1);
                            Alert.alert(t.common.success, language === 'ar' ? 'تم تعيين رمز PIN لليوميات بنجاح.' : 'Journal PIN has been set successfully.');
                          })();
                        } else {
                          Alert.alert(t.common.error, t.journal.pinMismatch);
                          setSetupPinConfirm('');
                        }
                      }
                    }
                  }}
                />
                
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity
                    style={styles.mentoraCancelBtn}
                    onPress={() => {
                      setPinSetupVisible(false);
                      setSetupPin('');
                      setSetupPinConfirm('');
                      setSetupStep(1);
                      setLockedChecked(false);
                      setLockedConfirmed(false);
                    }}
                  >
                    <Text style={styles.mentoraCancelText}>{t.common.cancel}</Text>
                  </TouchableOpacity>
                  {setupStep === 2 && (
                    <TouchableOpacity
                      style={[styles.mentoraCancelBtn, { backgroundColor: '#F1F5F9' }]}
                      onPress={() => {
                        setSetupPinConfirm('');
                        setSetupStep(1);
                      }}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{t.common.back}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* PIN Unlock Modal */}
      <Modal
        visible={pinUnlockVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPinUnlockVisible(false);
          setUnlockPin('');
          setUnlockTargetEntry(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setPinUnlockVisible(false);
          setUnlockPin('');
          setUnlockTargetEntry(null);
        }}>
          <View style={styles.pinModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pinModalCard}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                  {t.journal.enterPinTitle}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 }}>
                  {t.journal.enterPinDesc}
                </Text>
                
                {renderPinDigits(unlockPin)}
                
                <TextInput
                  ref={pinInputRef}
                  style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}
                  keyboardType="numeric"
                  maxLength={4}
                  value={unlockPin}
                  onChangeText={(val) => {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    setUnlockPin(cleanVal);
                    if (cleanVal.length === 4) {
                      (async () => {
                        const key = getPinKey();
                        const storedPin = await AsyncStorage.getItem(key);
                        if (cleanVal === storedPin) {
                          setPinUnlockVisible(false);
                          setUnlockPin('');
                          if (unlockTargetEntry) {
                            setSelectedEntry(unlockTargetEntry);
                          }
                        } else {
                          Alert.alert(t.common.error, t.journal.incorrectPin);
                          setUnlockPin('');
                        }
                      })();
                    }
                  }}
                />
                
                <TouchableOpacity
                  style={{ alignSelf: 'center', marginVertical: 8 }}
                  onPress={() => {
                    setPinUnlockVisible(false);
                    setUnlockPin('');
                    setUnlockTargetEntry(null);
                    navigation.navigate('Profile', { screen: 'Settings' });
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' }}>
                    {t.journal.forgotPin}
                  </Text>
                </TouchableOpacity>
                
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity
                    style={styles.mentoraCancelBtn}
                    onPress={() => {
                      setPinUnlockVisible(false);
                      setUnlockPin('');
                      setUnlockTargetEntry(null);
                    }}
                  >
                    <Text style={styles.mentoraCancelText}>{t.common.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
}

export default JournalScreen;
