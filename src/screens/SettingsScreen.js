import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  Switch,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import i18n, { setLocale } from '../localization/i18n';
import * as Haptics from 'expo-haptics';
// Replace Application import with Constants
import Constants from 'expo-constants';
import {
  setTheme,
  setFontSize,
  setLanguage,
  setNotifications
} from '../store/slices/settingsSlice';

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, setScheme } = useTheme();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  
  // Get app version from Constants instead of Application
  const appVersion = Constants.manifest?.version || '1.0.0';
  // Get app build number 
  const buildNumber = Platform.select({
    ios: Constants.manifest?.ios?.buildNumber || '1',
    android: Constants.manifest?.android?.versionCode?.toString() || '1'
  });
  
  const fontSizeOptions = [
    { key: 'small', label: i18n.t('settings.fontSizeOptions.small') },
    { key: 'medium', label: i18n.t('settings.fontSizeOptions.medium') },
    { key: 'large', label: i18n.t('settings.fontSizeOptions.large') },
    { key: 'xlarge', label: i18n.t('settings.fontSizeOptions.xlarge') }
  ];
  
  const languageOptions = [
    { key: 'en', label: 'English' },
    { key: 'ar', label: 'العربية' },
    { key: 'ur', label: 'اردو' }
  ];
  
  const handleThemeChange = (theme) => {
    Haptics.selectionAsync();
    setScheme(theme);
    dispatch(setTheme(theme));
  };
  
  const handleFontSizeChange = (size) => {
    Haptics.selectionAsync();
    dispatch(setFontSize(size));
  };
  
  const handleLanguageChange = (language) => {
    Haptics.selectionAsync();
    setLocale(language);
    dispatch(setLanguage(language));
  };
  
  const handleNotificationToggle = (value) => {
    Haptics.selectionAsync();
    dispatch(setNotifications(value));
    
    // Here you would also register or unregister for actual notifications
    if (value) {
      // Request notification permissions & schedule prayer notifications
    } else {
      // Cancel scheduled notifications
    }
  };
  
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open the link');
    });
  };
  
  const shareApp = () => {
    // Share app link implementation
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.appearance')}
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {i18n.t('settings.theme')}
          </Text>
          
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                settings.theme === 'light' && 
                { backgroundColor: colors.primary }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Text 
                style={[
                  styles.optionText,
                  settings.theme === 'light' ? 
                  { color: '#FFFFFF' } : { color: colors.text }
                ]}
              >
                {i18n.t('settings.light')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                settings.theme === 'dark' && 
                { backgroundColor: colors.primary }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Text 
                style={[
                  styles.optionText,
                  settings.theme === 'dark' ? 
                  { color: '#FFFFFF' } : { color: colors.text }
                ]}
              >
                {i18n.t('settings.dark')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                settings.theme === 'system' && 
                { backgroundColor: colors.primary }
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <Text 
                style={[
                  styles.optionText,
                  settings.theme === 'system' ? 
                  { color: '#FFFFFF' } : { color: colors.text }
                ]}
              >
                {i18n.t('settings.system')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Reading Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.reading')}
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Font Size
          </Text>
          
          <View style={styles.optionsRow}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  settings.fontSize === option.key && 
                  { backgroundColor: colors.primary }
                ]}
                onPress={() => handleFontSizeChange(option.key)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    settings.fontSize === option.key ? 
                    { color: '#FFFFFF' } : { color: colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Language Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.language')}
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.optionsColumn}>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.languageOption,
                  settings.language === lang.key && 
                  { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => handleLanguageChange(lang.key)}
              >
                <Text 
                  style={[
                    styles.languageText,
                    { color: colors.text }
                  ]}
                >
                  {lang.label}
                </Text>
                {settings.language === lang.key && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={colors.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.notifications')}
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {i18n.t('prayer.notifications')}
            </Text>
            <Switch
              value={settings.notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ 
                false: colors.border, 
                true: colors.primaryLight 
              }}
              thumbColor={settings.notifications ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.about')}
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => openLink('mailto:feedback@quranapp.com')}
          >
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {i18n.t('settings.feedback')}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => openLink('https://play.google.com/store/apps/details?id=com.quranapp')}
          >
            <Ionicons name="star-outline" size={22} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {i18n.t('settings.rate')}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.muted} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={shareApp}
          >
            <Ionicons name="share-outline" size={22} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {i18n.t('settings.share')}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.muted} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.versionText, { color: colors.muted }]}>
          {i18n.t('settings.version')} {appVersion} ({buildNumber})
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionsColumn: {
    
  },
  optionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});

export default SettingsScreen;