import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { setReadingMode, setReadingView } from '../store/slices/settingsSlice';

const ReadingModeToggle = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { readingMode, readingView } = useSelector(state => state.settings);
  
  const modes = [
    { 
      id: 'translation', 
      title: 'Translation Mode', 
      description: 'Shows Arabic text with translations beneath each verse',
      icon: 'language-outline'
    },
    { 
      id: 'reading', 
      title: 'Reading Mode', 
      description: 'Simplified interface focused on Arabic text',
      icon: 'book-outline'
    },
    { 
      id: 'study', 
      title: 'Study Mode', 
      description: 'Detailed view with word-by-word translation and tafsir',
      icon: 'school-outline'
    }
  ];
  
  const views = [
    { 
      id: 'surah', 
      title: 'Surah View', 
      description: 'Display verses continuously by surah', 
      icon: 'list-outline' 
    },
    { 
      id: 'page', 
      title: 'Page View', 
      description: 'Traditional mushaf page layout', 
      icon: 'document-text-outline' 
    }
  ];
  
  const handleSelectMode = (mode) => {
    dispatch(setReadingMode(mode));
  };
  
  const handleSelectView = (view) => {
    dispatch(setReadingView(view));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: isDark ? colors.card : '#FFFFFF',
              borderColor: colors.border,
            }
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Reading Mode
          </Text>
          
          <ScrollView>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Display Mode
            </Text>
            
            <View style={styles.optionsContainer}>
              {modes.map(mode => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.optionButton,
                    readingMode === mode.id && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + '15',
                    }
                  ]}
                  onPress={() => handleSelectMode(mode.id)}
                >
                  <Ionicons 
                    name={mode.icon} 
                    size={24} 
                    color={readingMode === mode.id ? colors.primary : colors.text} 
                  />
                  <View style={styles.optionTextContainer}>
                    <Text 
                      style={[
                        styles.optionTitle, 
                        { 
                          color: readingMode === mode.id ? colors.primary : colors.text 
                        }
                      ]}
                    >
                      {mode.title}
                    </Text>
                    <Text 
                      style={[
                        styles.optionDescription,
                        { color: colors.text }
                      ]}
                    >
                      {mode.description}
                    </Text>
                  </View>
                  {readingMode === mode.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
              Layout View
            </Text>
            
            <View style={styles.optionsContainer}>
              {views.map(view => (
                <TouchableOpacity
                  key={view.id}
                  style={[
                    styles.optionButton,
                    readingView === view.id && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + '15',
                    }
                  ]}
                  onPress={() => handleSelectView(view.id)}
                >
                  <Ionicons 
                    name={view.icon} 
                    size={24} 
                    color={readingView === view.id ? colors.primary : colors.text} 
                  />
                  <View style={styles.optionTextContainer}>
                    <Text 
                      style={[
                        styles.optionTitle, 
                        { 
                          color: readingView === view.id ? colors.primary : colors.text 
                        }
                      ]}
                    >
                      {view.title}
                    </Text>
                    <Text 
                      style={[
                        styles.optionDescription,
                        { color: colors.text }
                      ]}
                    >
                      {view.description}
                    </Text>
                  </View>
                  {readingView === view.id && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    padding