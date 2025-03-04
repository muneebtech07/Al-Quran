import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { fetchRelatedHadith } from '../api/hadithApi';
import analytics from '../utils/analytics';

const RelatedHadith = ({ surahNumber, ayahNumber, visible = false, onClose }) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState({});
  
  // Fetch related hadith when component is visible
  const {
    data: hadithData