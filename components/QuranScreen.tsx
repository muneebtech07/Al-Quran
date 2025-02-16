import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getSurahList } from '../services/quranService';
import { Surah } from '../types/quran';

const QuranScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

  useEffect(() => {
    async function loadSurahs() {
      try {
        const surahList = await getSurahList();
        setSurahs(surahList);
        setLoading(false);
      } catch (err) {
        setError('Failed to load surah list');
        setLoading(false);
      }
    }
    loadSurahs();
  }, []);


  const renderSurah = ({ item }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: cardBg }]}
      onPress={() => router.push(`/quran/${item.id}`)}>
      <View style={styles.surahNumber}>
        <Text style={[styles.numberText, { color: textColor }]}>{item.id}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: textColor }]}>{item.name}</Text>
        <Text style={styles.versesCount}>{item.numberOfAyahs} verses</Text>
      </View>
      <Text style={styles.arabicName}>{item.arabicName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Noble Quran</Text>
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesome5 name="search" size={20} color={textColor} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={surahs}
        renderItem={renderSurah}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 10,
  },
  list: {
    padding: 15,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  versesCount: {
    fontSize: 14,
    color: '#666',
  },
  arabicName: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default QuranScreen;
