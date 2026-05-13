import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, HIT_SLOP } from '../theme';
import { Card } from '../components';
import { FilterIcon, CloudIcon, CloudOutlineIcon, DocumentIcon, MicrophoneIcon, LockIcon } from '../components/Icons';
import { styles } from './JournalScreen.style';
import { API_BASE_URL } from '../config/env';
import { ExerciseService } from '../services/exerciseService';

let testTokenCache = '';

const getApiToken = async (): Promise<string> => {
  if (testTokenCache) return testTokenCache;
  try {
    const apiUrl = API_BASE_URL;
    
    // First, TRY TO LOGIN
    let res = await fetch(`${apiUrl}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' })
    });

    // If login fails (user doesn't exist on this local server), TRY TO REGISTER THEM
    if (!res.ok) {
       console.log('Login failed, attempting auto-registration...');
       await fetch(`${apiUrl}/Users`, {
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
       
       // Try login one more time after registering
       res = await fetch(`${apiUrl}/Auth/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'newmanar@gmail.com', password: 'Password123!' })
       });
    }

    if (res.ok) {
      const data = await res.json();
      testTokenCache = data.token;
      return testTokenCache;
    }
  } catch (e) {
    console.error('Failed to auto-login for token', e);
  }
  return '';
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', IconComponent: CloudOutlineIcon },
  { id: 'text', label: 'Text', IconComponent: DocumentIcon },
  { id: 'record', label: 'Record', IconComponent: MicrophoneIcon },
  { id: 'locked', label: 'Locked', IconComponent: LockIcon },
];


export interface JournalEntry {
  id: string;
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
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [writeSheetVisible, setWriteSheetVisible] = useState(false);
  const [mentoraModalVisible, setMentoraModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [lockedChecked, setLockedChecked] = useState(false);
  const [lockedConfirmed, setLockedConfirmed] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@mentora_journal_entries').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as JournalEntry[];
          // Auto-delete old entries that do not have fullContent
          const validEntries = parsed.filter(e => e.fullContent !== undefined);
          setEntries(validEntries);
          
          if (validEntries.length !== parsed.length) {
            AsyncStorage.setItem('@mentora_journal_entries', JSON.stringify(validEntries));
          }
        } catch (e) {
          console.error('Error parsing stored journals', e);
        }
      }
    }).catch(e => console.error('Failed to load journals', e));
  }, []);

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

  const onLockedPress = (): void => {
    if (!lockedChecked && !lockedConfirmed) {
      setMentoraModalVisible(true);
      return;
    }
    if (lockedChecked) {
      setLockedChecked(false);
      setLockedConfirmed(false);
    } else {
      setLockedChecked(true);
    }
  };

  const onMentoraOk = (): void => {
    setLockedConfirmed(true);
    setLockedChecked(true);
    setMentoraModalVisible(false);
  };

  const saveEntry = async (): Promise<void> => {
    if (!newTitle.trim() && !newContent.trim()) {
      closeWrite();
      return;
    }

    setIsSaving(true);
    try {
      const payloadContent = newContent.trim() || newTitle.trim();
      
      // Get the real token from the API
      const token = await getApiToken();

      const apiUrl = API_BASE_URL;
      console.log('Saving entry to:', `${apiUrl}/Journals`);

      const response = await fetch(`${apiUrl}/Journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ journal_text: payloadContent }),
      });

      let tags: string[] = [];
      if (response.ok) {
        const data = await response.json();
        const apiTags = data.tags || data.Tags;
        if (Array.isArray(apiTags)) {
          tags = apiTags;
        } else if (typeof apiTags === 'string') {
          try {
            const parsed = JSON.parse(apiTags);
            if (Array.isArray(parsed)) {
              tags = parsed;
            } else {
              tags = apiTags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
          } catch (e) {
            tags = apiTags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        }
        
        // === DEBUG: Log full API response to see exact fields ===
        console.log('=== JOURNAL API FULL RESPONSE ===');
        console.log(JSON.stringify(data, null, 2));

        // === UNIQUE LIBRARY MAPPING ===
        // We map the suggested exercises from the backend to our library exercises
        const aiSuggested = data.suggested_exercises || data.suggestedExercises || data.SuggestedExercises || [];
        
        // --- Gibberish / AI Validation ---
        // If the AI couldn't extract any tags, it means the text was random or not meaningful.
        if (tags.length === 0) {
            // Delete the invalid entry from the backend to keep history clean
            const entryId = data.id || data.Id;
            if (entryId && token) {
                fetch(`${apiUrl}/Journals/${entryId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(e => console.log('Silently failed to delete gibberish entry', e));
            }

            Alert.alert(
              'Entry Not Understood',
              'Mentora couldn’t understand your entry. Please write clear and meaningful sentences so we can help you better.'
            );
            setIsSaving(false);
            return; // Prevent saving the journal entry locally
        }
        
        if (aiSuggested && aiSuggested.length > 0) {
            const allExercises = await ExerciseService.getAllExercises();
            
            console.log('--- Matching AI Suggestions ---');
            console.log('AI Suggestions count:', aiSuggested.length);
            console.log('Database exercises count:', allExercises.length);

            const enrichedSuggestions = aiSuggested.map((aiEx: any, idx: number) => {
                const exerciseId = aiEx.id || aiEx.exerciseId || aiEx.ExerciseId;
                const code = aiEx.exerciseCode || aiEx.ExerciseCode || aiEx.id || '';
                
                // 1. Try to find the real exercise in our database library by ID or Code
                const dbMatch = allExercises.find(ex => 
                    (exerciseId && ex.id === exerciseId) || 
                    (code && ex.exerciseCode === code)
                );
                
                // 2. Get beautiful details from our library map using the code
                const libraryDetails = ExerciseService.getExerciseDetailsByCode(code || (dbMatch as any)?.exerciseCode);
                
                if (dbMatch) {
                   console.log(`Matched exercise: ${dbMatch.name} (${code || exerciseId})`);
                   // If the database name is just the code, use our library name instead
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

                console.log(`No match found for: ${code || exerciseId}. Using fallback library.`);
                // 3. Fallback to our hardcoded map if not found in DB at all
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
            
            // Keep only unique exercises
            const uniqueMap = new Map();
            enrichedSuggestions.forEach((ex: any) => {
              const key = ex.id || ex.name;
              if (!uniqueMap.has(key)) {
                uniqueMap.set(key, ex);
              }
            });
            const uniqueExercises = Array.from(uniqueMap.values());
            
            console.log('=== DISPLAYING UNIQUE AI EXERCISES ===', uniqueExercises.length);
            await ExerciseService.saveSuggestedExercises(uniqueExercises);
        }
        
      } else {
        Alert.alert(
          'API Error',
          `The API returned ${response.status}. It likely requires a Bearer Token for Auth. Tags will not be generated.`
        );
      }

      setEntries((prev) => {
        const updated: JournalEntry[] = [
          {
            id: Date.now().toString(),
            title: newTitle.trim() || 'Untitled',
            preview:
              newContent.trim().slice(0, 80) + (newContent.trim().length > 80 ? '…' : ''),
            fullContent: newContent.trim(),
            date: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            tags,
            type: 'text',
            locked: lockedChecked,
          },
          ...prev,
        ];
        AsyncStorage.setItem('@mentora_journal_entries', JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } catch (error) {
      console.error('Failed to save entry to API:', error);
      setEntries((prev) => {
        const updated: JournalEntry[] = [
          {
            id: Date.now().toString(),
            title: newTitle.trim() || 'Untitled',
            preview:
              newContent.trim().slice(0, 80) + (newContent.trim().length > 80 ? '…' : ''),
            date: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            tags: [],
            type: 'text',
            locked: lockedChecked,
          },
          ...prev,
        ];
        AsyncStorage.setItem('@mentora_journal_entries', JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } finally {
      setIsSaving(false);
      closeWrite();
    }
  };

  const JournalEntryCard = ({ item }: { item: JournalEntry }) => {
    const handlePress = () => {
      setSelectedEntry(item);
    };

    // Create a garbled/distorted version of the preview if locked
    const displayPreview = item.locked 
      ? item.preview.replace(/[a-zA-Z0-9]/g, '█').substring(0, 80) + '...'
      : item.preview;

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Card style={styles.entryCard} accessibilityRole="button" accessibilityLabel={`Entry: ${item.title}`}>
          <View style={styles.entryCardInner}>
            {item.locked && (
              <View style={styles.entryBadge}>
                <Text style={styles.entryBadgeLock}>🔒</Text>
              </View>
            )}
            
            {!item.locked && item.type === 'record' && (
               <View style={styles.entryBadge}>
                 <Text style={styles.entryBadgeMic}>🎤</Text>
               </View>
            )}

            <View style={styles.entryContent}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {item.title}
              </Text>
              
              <Text 
                style={[
                  styles.entryPreview, 
                  item.locked && styles.entryPreviewBlurred
                ]} 
                numberOfLines={2}
              >
                {displayPreview}
              </Text>

              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{item.date}</Text>
                {item.tags.length > 0 && (
                  <View style={styles.tags}>
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
    <View style={styles.container} accessibilityLabel="Journal screen">
      {/* Top: Search + Filter */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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
        <View style={styles.newEntryHeader}>
          <View>
            <Text style={styles.newEntryTitle}>New Entry</Text>
            <Text style={styles.newEntrySubtitle}>Capture your thoughts</Text>
          </View>
          <CloudIcon color={colors.white} size={40} />
        </View>
        <View style={styles.newEntryActions}>
          <TouchableOpacity style={styles.writeButton} onPress={openWrite} activeOpacity={0.8}>
            <Text style={styles.writeButtonText}>+ Write</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
            <Text style={styles.recordIcon}>🎤</Text>
            <Text style={styles.recordButtonText}>Record</Text>
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
            <Text style={styles.listEmptyText}>No entries match your search or filter.</Text>
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
                    ]}
                    onPress={() => {
                      setFilter(opt.id);
                      setFilterPopupVisible(false);
                    }}
                  >
                    <opt.IconComponent color={filter === opt.id ? colors.textPrimary : colors.textMuted} size={20} />
                    <Text style={[styles.filterPopupOptionText, { marginLeft: 12 }]}>{opt.label}</Text>
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
                  <View style={styles.writeCardHeader}>
                    <TouchableOpacity onPress={closeWrite} style={styles.writeCloseBtn} hitSlop={HIT_SLOP}>
                      <Text style={styles.writeCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.writeInputTitle}
                    placeholder="Entry title..."
                    placeholderTextColor={colors.textMuted}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                  <TextInput
                    style={styles.writeInputBody}
                    placeholder="What's your mind?"
                    placeholderTextColor={colors.textMuted}
                    value={newContent}
                    onChangeText={setNewContent}
                    multiline
                    numberOfLines={5}
                  />
                  <TouchableOpacity style={styles.lockedRow} onPress={onLockedPress} activeOpacity={0.8}>
                    <View style={[styles.lockedCheckbox, lockedChecked && styles.lockedCheckboxChecked]}>
                      {lockedChecked ? <Text style={{ color: colors.white, fontSize: 14 }}>✓</Text> : null}
                    </View>
                    <Text style={styles.lockedLabel}>Locked</Text>
                    <Text style={styles.lockedIcon}>🔒</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveEntryButton} onPress={saveEntry} activeOpacity={0.9} disabled={isSaving}>
                    {isSaving ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.saveEntryButtonText}>Save Entry</Text>
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
            <Text style={styles.mentoraModalText}>
              Mentora has access to this message if you don't want it, go to the settings
            </Text>
            <View style={styles.mentoraModalActions}>
              <TouchableOpacity
                style={styles.mentoraCancelBtn}
                onPress={() => setMentoraModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.mentoraCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mentoraOkBtn} onPress={onMentoraOk} activeOpacity={0.8}>
                <Text style={styles.mentoraOkText}>Ok</Text>
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
                <View style={[styles.writeCardHeader, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 18, color: colors.white, fontWeight: 'bold' }}>Entry Details</Text>
                  <TouchableOpacity onPress={() => setSelectedEntry(null)} style={styles.writeCloseBtn} hitSlop={HIT_SLOP}>
                    <Text style={styles.writeCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.writeInputTitle, { marginTop: 16, marginBottom: 8 }]}>
                  {selectedEntry?.title}
                </Text>
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={{ marginVertical: 8 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 16, lineHeight: 28 }}>
                    {selectedEntry?.fullContent || selectedEntry?.preview}
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
}

export default JournalScreen;
