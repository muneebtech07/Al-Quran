import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles';

const SurahItem = ({ surah, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(surah.id, surah.name_simple)}>
      <Text style={globalStyles.arabicText}>{surah.name_arabic}</Text>
      <Text style={styles.surahName}>{surah.name_simple}</Text>
      <Text style={styles.verseCount}>{surah.verses_count} verses</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  verseCount: {
    color: '#888',
  },
});

export default SurahItem;