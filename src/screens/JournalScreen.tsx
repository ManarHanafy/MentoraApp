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
} from 'react-native';
import { colors, HIT_SLOP } from '../theme';
import { Card } from '../components';
import { FilterIcon, CloudIcon, CloudOutlineIcon, DocumentIcon, MicrophoneIcon, LockIcon } from '../components/Icons';
import { styles } from './JournalScreen.style';

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
  date: string;
  tags: string[];
  type: 'text' | 'record';
  locked?: boolean;
}

const SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'A peaceful morning',
    preview:
      'Woke up feeling refreshed. The morning meditation really helped set a positive tone for the day.',
    date: 'Dec 19, 2025, 8:30 AM',
    tags: ['Morning', 'Meditation'],
    type: 'record',
    locked: false,
  },
  {
    id: '2',
    title: 'Thoughts on work-life balance',
    preview:
      'Struggling to switch off after work. Need to set clearer boundaries and stick to a wind-down routine.',
    date: 'Dec 18, 2025, 9:15 PM',
    tags: ['Work', 'Reflection'],
    type: 'text',
    locked: false,
  },
  {
    id: '3',
    title: 'My hidden thoughts',
    preview: 'This is a private entry that should only appear in the Locked filter.',
    date: 'Dec 17, 2025, 7:00 PM',
    tags: ['Private'],
    type: 'text',
    locked: true,
  },

];

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
  const [entries, setEntries] = useState<JournalEntry[]>(SAMPLE_ENTRIES);

  // Force reset entries when component mounts to ensure verified data is shown
  React.useEffect(() => {
    setEntries(SAMPLE_ENTRIES);
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

  const saveEntry = (): void => {
    if (newTitle.trim() || newContent.trim()) {
      setEntries((prev) => [
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
      ]);
    }
    closeWrite();
  };

  const renderEntry = ({ item }: { item: JournalEntry }): React.ReactElement => (
    <Card style={styles.entryCard} accessibilityRole="button" accessibilityLabel={`Entry: ${item.title}`}>
      <View style={styles.entryCardInner}>
        {(item.type === 'record' || item.locked) && (
          <View style={styles.entryBadge}>
            <Text style={item.type === 'record' ? styles.entryBadgeMic : styles.entryBadgeLock}>
              {item.type === 'record' ? '🎤' : '🔒'}
            </Text>
          </View>
        )}
        <View style={styles.entryContent}>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.entryPreview} numberOfLines={2}>
            {item.preview}
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
                  <TouchableOpacity style={styles.saveEntryButton} onPress={saveEntry} activeOpacity={0.9}>
                    <Text style={styles.saveEntryButtonText}>Save Entry</Text>
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
    </View >
  );
}

export default JournalScreen;
