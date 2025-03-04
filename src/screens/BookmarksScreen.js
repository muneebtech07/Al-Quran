import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { removeBookmark, deleteCollection } from '../store/slices/bookmarksSlice';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { fetchSurahByNumber } from '../services/api';

const BookmarksScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const bookmarks = useSelector(state => state.bookmarks.items);
  const collections = useSelector(state => state.bookmarks.collections);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [surahNames, setSurahNames] = useState({});

  useEffect(() => {
    const fetchSurahNames = async () => {
      try {
        // Get unique surah IDs from bookmarks
        const uniqueSurahIds = [...new Set(bookmarks.map(bookmark => bookmark.surahId))];
        
        // Fetch each surah's name
        const names = {};
        for (const surahId of uniqueSurahIds) {
          const surah = await fetchSurahByNumber(surahId);
          names[surahId] = surah.name;
        }
        
        setSurahNames(names);
      } catch (error) {
        console.error('Error fetching surah names:', error);
      }
    };

    fetchSurahNames();
  }, [bookmarks]);

  const filteredBookmarks = selectedCollection === 'all' 
    ? bookmarks 
    : bookmarks.filter(bookmark => bookmark.collectionId === selectedCollection);

  const handleBookmarkPress = (item) => {
    navigation.navigate('SurahDetail', {
      surahId: item.surahId,
      surahName: surahNames[item.surahId] || `Surah ${item.surahId}`,
      scrollToVerse: item.ayahNumber
    });
  };

  const handleRemoveBookmark = (id) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          onPress: () => dispatch(removeBookmark({ id })),
          style: 'destructive'
        }
      ]
    );
  };

  const handleDeleteCollection = (id) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? All bookmarks in this collection will also be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            dispatch(deleteCollection({ id }));
            setSelectedCollection('all');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.bookmarkItem, { backgroundColor: colors.card }]}
      onPress={() => handleBookmarkPress(item)}
    >
      <View style={styles.bookmarkContent}>
        <Text style={[styles.surahName, { color: colors.text }]}>
          {surahNames[item.surahId] || `Surah ${item.surahId}`}
        </Text>
        <Text style={[styles.verseNumber, { color: colors.muted }]}>
          Verse {item.ayahNumber}
        </Text>
        <Text style={[styles.timestamp, { color: colors.muted }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveBookmark(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={22} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCollectionTab = (collection) => {
    const isSelected = selectedCollection === collection.id;
    return (
      <TouchableOpacity 
        key={collection.id}
        style={[
          styles.collectionTab,
          isSelected && { backgroundColor: collection.color || colors.primary },
        ]}
        onPress={() => setSelectedCollection(collection.id)}
      >
        <Text style={[
          styles.collectionName,
          { color: isSelected ? '#fff' : colors.text }
        ]}>
          {collection.name}
        </Text>
        {isSelected && (
          <TouchableOpacity
            style={styles.deleteCollectionButton}
            onPress={() => handleDeleteCollection(collection.id)}
          >
            <Ionicons name="close-circle" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.collectionsScrollView}
        contentContainerStyle={styles.collectionsContainer}
      >
        <TouchableOpacity 
          style={[
            styles.collectionTab,
            selectedCollection === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedCollection('all')}
        >
          <Text style={[
            styles.collectionName,
            { color: selectedCollection === 'all' ? '#fff' : colors.text }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {collections.map(renderCollectionTab)}
        <TouchableOpacity 
          style={[styles.addCollectionButton, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('AddCollection')}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
          <Text style={[styles.addCollectionText, { color: colors.primary }]}>New</Text>
        </TouchableOpacity>
      </ScrollView>

      {filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookmarksList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Bookmarks you add will appear here
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
  collectionsScrollView: {
    maxHeight: 50,
  },
  collectionsContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  collectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionName: {
    fontWeight: '600',
    fontSize: 14,
  },
  deleteCollectionButton: {
    marginLeft: 6,
  },
  addCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  addCollectionText: {
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
  bookmarksList: {
    padding: 15,
  },
  bookmarkItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  bookmarkContent: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 14,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BookmarksScreen;