import React from 'react';
import { Text } from 'react-native';

const Highlighter = ({ text, searchWords, style, highlightStyle }) => {
  if (!text) return null;
  
  // Function to escape regex special characters
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  // Create a regex pattern from search words
  const searchPattern = searchWords
    .filter((word) => word.length > 0)
    .map((word) => escapeRegExp(word))
    .join('|');
    
  if (!searchPattern) {
    return <Text style={style}>{text}</Text>;
  }
  
  const regex = new RegExp(`(${searchPattern})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        const isMatch = parts.length > 1 && 
          searchWords.some(word => part.toLowerCase() === word.toLowerCase());
          
        return (
          <Text
            key={`${part}-${i}`}
            style={isMatch ? [style, highlightStyle] : style}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

export default Highlighter;