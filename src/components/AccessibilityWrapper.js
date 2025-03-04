import React from 'react';
import { AccessibilityInfo } from 'react-native';

const AccessibilityWrapper = ({ 
  children, 
  label, 
  hint,
  role = 'button',
  testID,
  ...props 
}) => {
  const accessibilityProps = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    testID: testID || label?.replace(/\s+/g, '_').toLowerCase(),
    ...props
  };

  return React.cloneElement(children, accessibilityProps);
};

export default AccessibilityWrapper;

// For announcements when content changes
export const announceForAccessibility = (message) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Check if screen reader is enabled
export const isScreenReaderEnabled = async () => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};