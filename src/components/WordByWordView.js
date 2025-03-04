import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const WordByWordView = ({ ayah, onWordPress }) => {
  const { colors, isDark } = useTheme();
  const { arabicFontSize, translationFontSize, showWordByWordTranslation } = useSelector(state => state.settings);
  const [expandedWordId, setExpandedWordId] = useState(null);
  
  if (!ayah || !ayah.words || !showWordByWordTranslation) return null;
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.wordByWordContainer}>
        {ayah.words.map((word, index) => {
          const isExpanded = expandedWordId === word.id;
          
          return (
            <TouchableOpacity
              key={word.id || index}
              style={[styles.wordContainer, isExpanded && styles.expandedWordContainer]}
              onPress={() => {
                setExpandedWordId(isExpanded ? null : word.id);
                onWordPress && onWordPress(word);
              }}
              activeOpacity={0.7}
            >
              {/* Arabic Text */}
              <Text style={[
                styles.arabicWord, 
                { 
                  fontSize: arabicFontSize * 0.8,
                  color: colors.arabic 
                }
              ]}>
                {word.text_uthmani || word.text_indopak}
              </Text>
              
              {/* Transliteration */}
              <Text style={[
                styles.transliteration, 
                { 
                  fontSize: translationFontSize * 0.8,
                  color: colors.text
                }
              ]}>
                {word.transliteration?.text || ''}
              </Text>
              
              {/* Translation */}
              <Text style={[
                styles.translation, 
                { 
                  fontSize: translationFontSize * 0.7,
                  color: colors.text
                }
              ]}>
                {word.translation?.text || ''}
              </Text>
              
              {/* Expanded details */}
              {isExpanded && (
                <View style={[styles.wordDetailsContainer, { backgroundColor: isDark ? colors.card : '#f5f5f5' }]}>
                  {word.charType && (
                    <Text style={[styles.morphologyText, { color: colors.text }]}>
                      Type: {word.charType}
                    </Text>
                  )}
                  
                  {word.code && (
                    <Text style={[styles.morphologyText, { color: colors.text }]}>
                      Root: {word.code}
                    </Text>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.audioButton, { backgroundColor: colors.primary }]}
                    onPress={() => onWordPress && onWordPress(word, true)}
                  >
                    <Ionicons name="volume-medium" size={16} color="#fff" />
                    <Text style={styles.audioButtonText}>Play</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wordByWordContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'nowrap',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  wordContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    maxWidth: 120,
  },
  expandedWordContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  arabicWord: {
    fontFamily: 'Scheherazade-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  transliteration: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  translation: {
    textAlign: 'center',
    opacity: 0.8,
  },
  wordDetailsContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  morphologyText: {
    fontSize: 12,
    marginBottom: 4,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default WordByWordView;