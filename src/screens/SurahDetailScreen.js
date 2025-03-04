import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { fetchSurahWithTranslation } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { addBookmark } from '../store/slices/bookmarksSlice';
import { updateLastRead } from '../store/slices/settingsSlice';

const SurahDetailScreen = ({ route, navigation }) => {
  const { surahId, surahName, scrollToVerse } = route.params || {};
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { fontSize, translation, showArabicText, showTranslation } = useSelector(state => state.settings);
  
  const [surahData, setSurahData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const verseRefs = useRef({});

  useEffect(() => {
    loadSurah();
    
    // Update last read position in settings
    if (surahId) {
      dispatch(updateLastRead({
        surahId,
        ayahNumber: scrollToVerse || 1
      }));
    }
  }, [surahId, translation]);

  useEffect(() => {
    // Scroll to specific verse if needed, after content is loaded
    if (scrollToVerse && !loading && surahData && scrollViewRef.current) {
      setTimeout(() => {
        if (verseRefs.current[scrollToVerse]) {
          verseRefs.current[scrollToVerse].measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current.scrollTo({ y, animated: true });
            },
            error => console.error('Failed to measure verse position:', error)
          );
        }
      }, 500); // Small delay to ensure layout is complete
    }
  }, [loading, surahData, scrollToVerse]);

  const loadSurah = async () => {
    if (!surahId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSurahWithTranslation(surahId, translation);
      setSurahData(data);
    } catch (err) {
      console.error(`Failed to fetch surah ${surahId}:`, err);
      setError('Failed to load Surah. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (ayahNumber) => {
    dispatch(addBookmark({
      surahId,
      ayahNumber,
      timestamp: Date.now()
    }));
    
    // Show success feedback
    alert(`Bookmark added: ${surahName || 'Surah'} (${ayahNumber})`);
  };

  const handlePlayAudio = (ayahNumber) => {
    navigation.navigate('AudioPlayer', {
      surahId,
      ayahNumber
    });
  };

  const getFontSize = () => {
    switch(fontSize) {
      case 'small': return { arabic: 24, translation: 14 };
      case 'large': return { arabic: 34, translation: 18 };
      case 'xlarge': return { arabic: 38, translation: 20 };
      case 'medium':
      default: return { arabic: 30, translation: 16 };
    }
  };

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading Surah...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadSurah}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!surahData) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No surah data available</Text>
      </View>
    );
  }

  const fontSizes = getFontSize();

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.surahTitle, { color: colors.text }]}>
          {surahData.englishName} • {surahData.englishNameTranslation}
        </Text>
        <Text style={[styles.surahInfo, { color: colors.muted }]}>
          {surahData.revelationType} • {surahData.numberOfAyahs} verses
        </Text>
        {surahId !== 9 && ( // Surah At-Tawbah doesn't have Bismillah
          <Text style={[styles.bismillah, { color: colors.arabic }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        )}
      </View>

      {surahData.ayahs.map((verse) => (
        <View 
          key={verse.numberInSurah} 
          ref={ref => verseRefs.current[verse.numberInSurah] = ref}
          style={[
            styles.verseContainer, 
            { borderBottomColor: colors.border },
            scrollToVerse === verse.numberInSurah && styles.highlightedVerse
          ]}
        >
          <View style={styles.verseHeader}>
            <View style={[styles.verseNumberContainer, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.verseNumber, { color: colors.primary }]}>
                {verse.numberInSurah}
              </Text>
            </View>
            <View style={styles.verseActions}>
              <TouchableOpacity 
                onPress={() => handleBookmark(verse.numberInSurah)}
                style={styles.actionButton}
              >
                <Ionicons name="bookmark-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handlePlayAudio(verse.numberInSurah)}
                style={styles.actionButton}
              >
                <Ionicons name="play-circle-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {showArabicText && (
            <Text style={[
              styles.arabicText, 
              { color: colors.arabic, fontSize: fontSizes.arabic }
            ]}>
              {verse.text}
            </Text>
          )}
          
          {showTranslation && (
            <Text style={[
              styles.translationText, 
              { color: colors.text, fontSize: fontSizes.translation }
            ]}>
              {verse.translation}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  surahTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  surahInfo: {
    fontSize: 14,
    marginBottom: 15,
  },
  bismillah: {
    fontSize: 26,
    fontFamily: 'Scheherazade-Bold',
    marginVertical: 20,
  },
  verseContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  highlightedVerse: {
    backgroundColor: '#FFD70020',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verseNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  verseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  arabicText: {
    fontFamily: 'Scheherazade-Regular',
    textAlign: 'right',
    lineHeight: 50,
    marginBottom: 10,
  },
  translationText: {
    lineHeight: 24,
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

export default SurahDetailScreen;