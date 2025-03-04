import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { FlashList } from '@shopify/flash-list';

// Use FlashList instead of FlatList for better performance with large lists
export const OptimizedList = ({
  data,
  renderItem,
  keyExtractor,
  ...props
}) => {
  // Use key memoization for better performance
  const keyExtractorMemo = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : String(index);
  }, [keyExtractor]);

  const renderItemMemo = useCallback(({ item, index }) => {
    return renderItem({ item, index });
  }, [renderItem]);

  return (
    <FlashList
      data={data}
      renderItem={renderItemMemo}
      keyExtractor={keyExtractorMemo}
      estimatedItemSize={100}
      {...props}
    />
  );
};

// Apply React.memo to frequently re-rendered components
export const memoizeComponent = (Component) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic if needed
    return false; // Return true if should NOT update
  });
};