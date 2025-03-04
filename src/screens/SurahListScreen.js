import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { fetchSurahs } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const SurahListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSurahs();
      setSurahs(data);
    } catch (err) {
      console.error('Failed to fetch surahs:', err);
      setError('Failed to load Surahs. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurahPress = (surahId, surahName) => {
    navigation.navigate('SurahDetail', { surahId, surahName });
  };

  const renderSurahItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.surahItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSurahPress(item.number, item.englishName)}
      testID="surah-item"
    >
      <View style={[styles.surahNumber, { borderColor: colors.border }]}>
        <Text style={[styles.numberText, { color: colors.primary }]}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: colors.text }]}>{item.englishName}</Text>
        <Text style={[styles.verseCount, { color: colors.muted }]}>
          {item.numberOfAyahs} verses • {item.revelationType}
        </Text>
      </View>
      <Text style={[styles.arabicName, { color: colors.primary }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading Surahs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline" size={50} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={loadSurahs}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={surahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContent}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 10,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '600',
  },
  verseCount: {
    fontSize: 14,
    marginTop: 3,
  },
  arabicName: {
    fontSize: 20,
    fontFamily: 'Scheherazade-Regular',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SurahListScreen;