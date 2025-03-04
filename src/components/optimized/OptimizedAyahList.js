import React, { memo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';

// Using memo to prevent unnecessary re-renders
const AyahItem = memo(({ ayah, onPress, isHighlighted, settings }) => {
  const { arabicFontSize, translationFontSize } = settings;
  
  return (
    <View style={[
      styles.ayahContainer, 
      isHighlighted && styles.highlightedAyah
    ]}>
      <Text style={[styles.arabicText, { fontSize: arabicFontSize }]}>
        {ayah.text_uthmani}
      </Text>
      <Text style={[styles.translationText, { fontSize: translationFontSize }]}>
        {ayah.translations[0]?.text}
      </Text>
    </View>
  );
});

const OptimizedAyahList = ({ ayahs, currentAyah, settings, onAyahPress }) => {
  // Using keyExtractor for optimization
  const keyExtractor = (item) => `ayah-${item.verse_number}`;
  
  // Memoized render item function
  const renderItem = React.useCallback(({ item }) => (
    <AyahItem 
      ayah={item}
      isHighlighted={currentAyah === item.verse_number}
      settings={settings}
      onPress={() => onAyahPress(item.verse_number)}
    />
  ), [currentAyah, settings, onAyahPress]);

  return (
    <FlashList
      data={ayahs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={150}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  ayahContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  highlightedAyah: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  arabicText: {
    fontFamily: 'Scheherazade-Regular',
    lineHeight: 50,
    textAlign: 'right',
    marginBottom: 10,
  },
  translationText: {
    lineHeight: 24,
  },
});

export default OptimizedAyahList;