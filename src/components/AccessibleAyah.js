import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AccessibleAyah = ({ 
  ayah, 
  translation, 
  ayahNumber,
  surahNumber,
  surahName,
  onPress,
  settings,
  isPlaying,
}) => {
  const { colors, isDark } = useTheme();
  const { arabicFontSize, translationFontSize } = settings;

  // Format accessibility label
  const getAccessibilityLabel = () => {
    return `Surah ${surahName}, Ayah ${ayahNumber}. ${translation}`;
  };
  
  // Announce when ay