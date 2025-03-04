import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { addNote, updateNote, deleteNote, addHighlight, deleteHighlight } from '../store/slices/notesSlice';
import ColorPicker from './ColorPicker';

const { width } = Dimensions.get('window');

const HIGHLIGHT_COLORS = [
  '#FFEB3B', // Yellow
  '#FFA726', // Orange
  '#4CAF50', // Green
  '#29B6F6', // Blue
  '#EC407A', // Pink
  '#AB47BC', // Purple
];

const NOTE_COLORS = [
  '#FFD700', // Gold
  '#FF9800', // Orange
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#F44336', // Red
  '#9C27B0', // Purple
];

const NotesOverlay = ({ 
  visible, 
  onClose, 
  surahId, 
  ayahNumber, 
  ayahText,
  translationText,
}) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { notes, highlights } = useSelector(state => state.notes);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'highlights'
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [selectedTextRange, setSelectedTextRange] = useState(null);

  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // Filter notes and highlights for current ayah
  const ayahNotes = notes.filter(note => note.surahId === surahId && note.ayahNumber === ayahNumber);
  const ayahHighlights = highlights.filter(h => h.surahId === surahId && h.ayahNumber === ayahNumber);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Open note editor for new note
  const openNoteEditor = () => {
    setEditingNoteId(null);
    setNoteText('');
    setSelectedColor(NOTE_COLORS[0]);
    setShowNoteEditor(true);
  };

  // Open note editor for existing note
  const editNote = (note) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
    setSelectedColor(note.color || NOTE_COLORS[0]);
    setShowNoteEditor(true);
  };

  // Save note (create new or update existing)
  const saveNote = () => {
    if (!noteText.trim()) return;

    if (editingNoteId) {
      dispatch(updateNote({
        id: editingNoteId,
        text: noteText.trim(),
        color: selectedColor,
      }));
    } else {
      dispatch(addNote({
        surahId,
        ayahNumber,
        text: noteText.trim(),
        color: selectedColor,
      }));
    }

    setShowNoteEditor(false);
  };

  // Delete note with confirmation
  const confirmDeleteNote = (noteId) => {
    // In a real app, add a confirmation dialog here
    dispatch(deleteNote(noteId));
  };

  // Add highlight to selected text
  const addTextHighlight = (color) => {
    if (!selectedTextRange) return;
    
    dispatch(addHighlight({
      surahId,
      ayahNumber,
      color,
      textRange: selectedTextRange,
    }));
    
    setSelectedTextRange(null);
  };

  // When text is selected
  const handleTextSelection = (event) => {
    const { selection } = event.nativeEvent;
    
    if (selection.start !== selection.end) {
      setSelectedTextRange({
        start: selection.start,
        end: selection.end,
      });
    } else {
      setSelectedTextRange(null);
    }
  };

  const translateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.dismissOverlay} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.notesPanel, 
            { 
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              transform: [{ translateX }],
            }
          ]}
        >
          {/* Panel Header */}
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {surahId}:{ayahNumber} Notes
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Verse Text */}
          <View style={styles.verseContainer}>
            <Text 
              style={[styles.arabicVerse, { color: colors.arabic }]}
              selectable={activeTab === 'highlights'}
              onSelectionChange={activeTab === 'highlights' ? handleTextSelection : undefined}
            >
              {ayahText}
            </Text>
            
            <Text style={[styles.translationVerse, { color: colors.text }]}>
              {translationText}
            </Text>
          </View>
          
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'notes' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('notes')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={18} 
                color={activeTab === 'notes' ? colors.primary : colors.text} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  { 
                    color: activeTab === 'notes' ? colors.primary : colors.text
                  }
                ]}
              >
                Notes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'highlights' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('highlights')}
            >
              <Ionicons 
                name="color-fill-outline" 
                size={18} 
                color={activeTab === 'highlights' ? colors.primary : colors.text} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  { 
                    color: activeTab === 'highlights' ? colors.primary : colors.text
                  }
                ]}
              >
                Highlights
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Notes Content */}
          {activeTab === 'notes' && (
            <View style={styles.notesContent}>
              <TouchableOpacity
                style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
                onPress={openNoteEditor}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addNoteText}>Add Note</Text>
              </TouchableOpacity>
              
              <ScrollView style={styles.notesList}>
                {ayahNotes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={30} color={colors.text} />
                    <Text style={[styles.emptyStateText, { color: colors.text }]}>
                      No notes for this verse yet
                    </Text>
                  </View>
                ) : (
                  ayahNotes.map(note => (
                    <View 
                      key={note.id} 
                      style={[
                        styles.noteItem, 
                        { backgroundColor: note.color + '20', borderLeftColor: note.color }
                      ]}
                    >
                      <Text style={[styles.noteText, { color: colors.text }]}>
                        {note.text}
                      </Text>
                      <View style={styles.noteActions}>
                        <Text style={[styles.noteDate, { color: colors.text }]}>
                          {new Date(note.timestamp).toLocaleString()}
                        </Text>
                        <View style={styles.noteButtons}>
                          <TouchableOpacity 
                            style={styles.noteButton}
                            onPress={() => editNote(note)}
                          >
                            <Ionicons name="pencil-outline" size={16} color={colors.text} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.noteButton}
                            onPress={() => confirmDeleteNote(note.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}
          
          {/* Highlights Content */}
          {activeTab === 'highlights' && (
            <View style={styles.highlightsContent}>
              {selectedTextRange ? (
                <View style={styles.highlightOptions}>
                  <Text style={[styles.highlightInstructions, { color: colors.text }]}>
                    Choose a highlight color:
                  </Text>
                  <View style={styles.colorOptions}>
                    {HIGHLIGHT_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.colorButton, { backgroundColor: color }]}
                        onPress={() => addTextHighlight(color)}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <Text style={[styles.highlightInstructions, { color: colors.text }]}>
                  Select text above to highlight it
                </Text>
              )}
              
              <View style={styles.highlightsList}>
                {ayahHighlights.length > 0 && (
                  <>
                    <Text style={[styles.highlightsTitle, { color: colors.text }]}>
                      Current Highlights
                    </Text>
                    {ayahHighlights.map(highlight => (
                      <View 
                        key={highlight.id}
                        style={[styles.highlightItem, { borderLeftColor: highlight.color }]}
                      >
                        <View style={[
                          styles.highlightColorBadge, 
                          { backgroundColor: highlight.color }
                        ]} />
                        <Text style={[styles.highlightRange, { color: colors.text }]}>
                          Characters {highlight.textRange.start} to {highlight.textRange.end}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteHighlight}
                          onPress={() => dispatch(deleteHighlight(highlight.id))}
                        >
                          <Ionicons name="close-circle" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>
          )}
        </Animated.View>
        
        {/* Note Editor Modal */}
        <Modal
          visible={showNoteEditor}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNoteEditor(false)}
        >
          <View style={styles.editorModalOverlay}>
            <View style={[
              styles.editorContainer, 
              { backgroundColor: isDark ? colors.card : '#FFFFFF' }
            ]}>
              <Text style={[styles.editorTitle, { color: colors.text }]}>
                {editingNoteId ? 'Edit Note' : 'New Note'}
              </Text>
              
              <TextInput
                style={[
                  styles.noteInput,
                  { 
                    borderColor: colors.border,
                    backgroundColor: isDark ? '#333333' : '#F5F5F5',
                    color: colors.text
                  }
                ]}
                placeholder="Enter your note"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                multiline
                value={noteText}
                onChangeText={setNoteText}
                autoFocus
              />
              
              <Text style={[styles.colorPickerLabel, { color: colors.text }]}>
                Select Color:
              </Text>
              <ColorPicker
                colors={NOTE_COLORS}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
              
              <View style={styles.editorButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowNoteEditor(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={saveNote}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissOverlay: {
    flex: 1,
  },
  notesPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  verseContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },
  arabicVerse: {
    fontSize: 22,
    fontFamily: 'Scheherazade-Regular',
    textAlign: 'right',
    marginBottom: 12,
  },
  translationVerse: {
    fontSize: 16,
    lineHeight: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  notesContent: {
    flex: 1,
    padding: 16,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  addNoteText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  notesList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
  },
  noteItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  noteText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
  },
  noteButtons: {
    flexDirection: 'row',
  },
  noteButton: {
    padding: 4,
    marginLeft: 8,
  },
  highlightsContent: {
    flex: 1,
    padding: 16,
  },
  highlightInstructions: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  highlightOptions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  colorOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  highlightsList: {
    flex: 1,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderLeftWidth: 4,
  },
  highlightColorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  highlightRange: {
    flex: 1,
    fontSize: 14,
  },
  deleteHighlight: {
    padding: 4,
  },
  editorModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editorContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  editorButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default NotesOverlay;