import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { processTajweedText } from '../utils/tajweedUtils';

const TajweedText = ({ text, fontSize, disableTajweed = false }) => {
  // If tajweed is disabled, return plain text
  if (disableTajweed) {
    return (
      <Text style={[styles.arabicText, { fontSize }]}>
        {text}
      </Text>
    );
  }

  // Process text for tajweed rules
  const processedSegments = processTajweedText(text);

  return (
    <Text style={[styles.arabicText, { fontSize }]}>
      {processedSegments.map((segment, index) => (
        <Text
          key={`tajweed-${index}`}
          style={[
            { color: segment.color || '#000000' },
            segment.isBold && styles.boldText,
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};

const styles = StyleSheet.create({
  arabicText: {
    fontFamily: 'Scheherazade-Regular',
    lineHeight: 50,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  boldText: {
    fontFamily: 'Scheherazade-Bold',
    fontWeight: 'bold',
  },
});

export default TajweedText;