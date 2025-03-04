import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { searchQuran } from '../services/api';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { translation } = useSelector(state => state.settings);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search to prevent excessive API calls
  const performSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchQuran(searchTerm, translation);
        setResults(data.matches || []);
      } catch (err) {
        setError('Failed to search. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [translation]
  );

  const handleSearch = (text) => {
    setQuery(text);
    performSearch(text);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const navigateToVerse = (item) => {
    navigation.navigate('SurahDetail', {
      surahId: item.surah.number,
      surahName: item.surah.englishName,
      scrollToVerse: item.numberInSurah
    });
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToVerse(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.surahName, { color: colors.primary }]}>
          {item.surah.englishName} ({item.surah.number})
        </Text>
        <Text style={[styles.verseNumber, { color: colors.muted }]}>
          Verse {item.numberInSurah}
        </Text>
      </View>
      <Text style={[styles.verseText, { color: colors.text }]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBarContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search the Quran"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item.surah.number}-${item.numberInSurah}-${index}`}
          contentContainerStyle={styles.resultsList}
        />
      )}

      {!loading && !error && query.length > 0 && results.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={48} color={colors.muted} />
          <Text style={[styles.noResultsText, { color: colors.text }]}>No results found</Text>
          <Text style={[styles.noResultsSubText, { color: colors.muted }]}>
            Try different keywords or check spelling
          </Text>
        </View>
      )}

      {!loading && !error && query.length < 3 && (
        <View style={styles.initialStateContainer}>
          <Ionicons name="search" size={48} color={colors.muted} />
          <Text style={[styles.initialStateText, { color: colors.text }]}>
            Enter at least 3 characters to search
          </Text>
          <Text style={[styles.initialStateSubText, { color: colors.muted }]}>
            Search by keywords, phrases or topics
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 15,
  },
  resultItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  surahName: {
    fontWeight: '600',
    fontSize: 16,
  },
  verseNumber: {
    fontSize: 14,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 16,
    textAlign: 'center',
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  initialStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  initialStateSubText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SearchScreen;