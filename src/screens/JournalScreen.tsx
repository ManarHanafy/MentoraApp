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

  useEffect(() => {
    (async () => {
      try {
        const key = await getJournalKey();
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as JournalEntry[];
          // Auto-delete old entries that do not have fullContent
          const validEntries = parsed.filter(e => e.fullContent !== undefined);
          setEntries(validEntries);
          if (validEntries.length !== parsed.length) {
            await AsyncStorage.setItem(key, JSON.stringify(validEntries));
          }
        } else {
          setEntries([]); // Clear state if no stored entries exist for this user!
        }
      } catch (e) {
        console.warn('Failed to load journals', e);
        setEntries([]);
      }
    })();
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
      
      // Get the real token from the API
      const token = await getApiToken();

      // Debug: log what token we have
      console.log('=== JOURNAL DEBUG ===');
      console.log('Token found:', token ? `YES (${token.substring(0, 20)}...)` : 'NO TOKEN');
      console.log('Token is mock?', token.startsWith('mock_'));

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
      console.log('Journal API response status:', response.status);

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
        
        // Process AI suggested exercises if present
        if (aiSuggested && aiSuggested.length > 0) {
            await ExerciseService.saveSuggestedExercises(aiSuggested);
            console.log('Saved', aiSuggested.length, 'suggested exercises from journal');
        }

        // === CRISIS DETECTION FROM API ===
        // Show crisis modal only if AI detects crisis or danger risk
        const apiRiskLevel = (data.risk_level || data.riskLevel || data.RiskLevel || 'normal').toLowerCase();
        const isApiCrisis = apiRiskLevel === 'crisis' || apiRiskLevel === 'danger';
        if (isApiCrisis) {
          setJournalCrisisVisible(true);
        }
        
      } else {
        // AI API failed — do NOT save the entry (strict blocking behavior)
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

      const defaultTitle = language === 'ar' ? 'بلا عنوان' : 'Untitled';
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
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
      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        getJournalKey().then(key =>
          AsyncStorage.setItem(key, JSON.stringify(updated)).catch(console.warn)
        );
        return updated;
      });
    } catch (error) {
      console.warn('Failed to save entry to API:', error);
      Alert.alert(
        language === 'ar' ? 'فشل الحفظ' : 'Failed to Save',
        language === 'ar' ? 'حدث خطأ أثناء حفظ اليومية. يرجى المحاولة مرة أخرى.' : 'An error occurred while saving the journal entry. Please try again.',
        [{ text: t.common.ok, style: 'default' }]
      );
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
    </View >
  );
}

export default JournalScreen;
