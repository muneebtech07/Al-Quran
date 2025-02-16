import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFonts, ScheherazadeNew_400Regular, ScheherazadeNew_700Bold } from '@expo-google-fonts/scheherazade-new';
import useQuranStore from '../../store/useQuranStore';
import { getSurah, getTafseers, getTafseerText } from '../../services/quranService';
import { Surah, Tafseer } from '../../types/quran';
import TafseerModal from '../../components/TafseerModal';

export default function SurahScreen() {
  const { surahId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentVerse, setCurrentVerse] = useState(0);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafseers, setTafseers] = useState<Tafseer[]>([]);
  const [selectedTafseer, setSelectedTafseer] = useState<string>();
  const [tafseerText, setTafseerText] = useState<string>();
  const [showTafseer, setShowTafseer] = useState(false);
  const [loadingTafseer, setLoadingTafseer] = useState(false);
  const scrollViewRef = useRef(null);
  const setLastRead = useQuranStore((state) => state.setLastRead);

  const [fontsLoaded] = useFonts({
    ScheherazadeNew_400Regular,
    ScheherazadeNew_700Bold
  });

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

  useEffect(() => {
    async function loadData() {
      try {
        const [surahData, tafseersData] = await Promise.all([
          getSurah(Number(surahId)),
          getTafseers()
        ]);
        setSurah(surahData);
        setTafseers(tafseersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load surah data');
        setLoading(false);
      }
    }
    loadData();
  }, [surahId]);

  const handleVersePress = async (verseId: number) => {
    setLastRead(Number(surahId), verseId);
    setCurrentVerse(verseId);
    setShowTafseer(true);
  };

  const handleSelectTafseer = async (tafseer: Tafseer) => {
    setSelectedTafseer(tafseer.id);
    setLoadingTafseer(true);
    try {
      const tafseerData = await getTafseerText(
        tafseer.id,
        Number(surahId),
        currentVerse
      );
      setTafseerText(tafseerData.text);
    } catch (err) {
      setError('Failed to load tafseer');
    } finally {
      setLoadingTafseer(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>{error || 'Surah not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.surahName}>{surah.name}</Text>
          <Text style={styles.surahInfo}>
            {surah.englishName} • {surah.numberOfAyahs} Verses
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.verseContainer}
        contentContainerStyle={styles.verseContent}>
        {surah.verses.map((verse, index) => (
          <Animated.View
            key={verse.id}
            entering={FadeIn.delay(index * 100)}
            style={[styles.verseCard, { backgroundColor: cardBg }]}>
            <TouchableOpacity
              style={styles.verseHeader}
              onPress={() => handleVersePress(verse.id)}>
              <View style={styles.verseNumber}>
                <Text style={styles.numberText}>{verse.id}</Text>
              </View>
              <View style={styles.verseActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleVersePress(verse.id)}>
                  <FontAwesome5 name="book" size={16} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome5 name="play" size={16} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.arabicText, { color: textColor }]}>
              {verse.text}
            </Text>
            
            <Text style={styles.transliteration}>
              {verse.transliteration}
            </Text>
            
            <Text style={[styles.translation, { color: textColor }]}>
              {verse.translation}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>

      <TafseerModal
        visible={showTafseer}
        onClose={() => setShowTafseer(false)}
        tafseers={tafseers}
        selectedTafseer={selectedTafseer}
        onSelectTafseer={handleSelectTafseer}
        tafseerText={tafseerText}
        loading={loadingTafseer}
      />

      <View style={[styles.bottomBar, { backgroundColor: cardBg }]}>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="bookmark-outline" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <FontAwesome5 name="share" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 1,
  },
  surahName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'ScheherazadeNew_700Bold',
  },
  surahInfo: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  verseContainer: {
    flex: 1,
  },
  verseContent: {
    padding: 20,
  },
  verseCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  verseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  verseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 28,
    textAlign: 'right',
    marginBottom: 15,
    lineHeight: 48,
    fontFamily: 'ScheherazadeNew_400Regular',
  },
  transliteration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomButton: {
    padding: 10,
  },
});
