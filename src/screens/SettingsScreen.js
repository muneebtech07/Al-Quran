import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Linking, 
  Alert,
  Share
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import i18n, { setLocale } from '../localization/i18n';
import * as Haptics from 'expo-haptics';
import * as Application from 'expo-application';
import {
  setTheme,
  setFontSize,
  setTranslation,
  setArabicTextType,
  toggleArabicText,
  toggleTranslation,
  toggleTransliteration,
  setAppLanguage,
  toggleTajweedColors,
  toggleAutoPlayNext,
  toggleVibration,
  updateNotificationSettings,
  updatePrayerSettings
} from '../store/slices/settingsSlice';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const settings = useSelector(state => state.settings);

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
    if (settings.vibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleSystemTheme = () => {
    const newTheme = settings.theme === 'system' ? (isDark ? 'dark' : 'light') : 'system';
    dispatch(setTheme(newTheme));
    if (settings.vibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => changeLanguage('en') },
        { text: 'العربية', onPress: () => changeLanguage('ar') },
        { text: 'اردو', onPress: () => changeLanguage('ur') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const changeLanguage = (lang) => {
    dispatch(setAppLanguage(lang));
    setLocale(lang);
  };

  const handleFontSizeChange = () => {
    Alert.alert(
      'Font Size',
      'Choose your preferred font size',
      [
        { text: i18n.t('settings.fontSizeOptions.small'), onPress: () => dispatch(setFontSize('small')) },
        { text: i18n.t('settings.fontSizeOptions.medium'), onPress: () => dispatch(setFontSize('medium')) },
        { text: i18n.t('settings.fontSizeOptions.large'), onPress: () => dispatch(setFontSize('large')) },
        { text: i18n.t('settings.fontSizeOptions.xlarge'), onPress: () => dispatch(setFontSize('xlarge')) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleTranslationChange = () => {
    Alert.alert(
      'Translation',
      'Choose your preferred translation',
      [
        { text: 'English - Saheeh International', onPress: () => dispatch(setTranslation('en.sahih')) },
        { text: 'English - Yusuf Ali', onPress: () => dispatch(setTranslation('en.yusufali')) },
        { text: 'English - Muhammad Asad', onPress: () => dispatch(setTranslation('en.asad')) },
        { text: 'Arabic - King Fahad Quran Complex', onPress: () => dispatch(setTranslation('ar.muyassar')) },
        { text: 'Urdu - Ahmed Ali', onPress: () => dispatch(setTranslation('ur.ahmedali')) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleArabicTextTypeChange = () => {
    Alert.alert(
      'Arabic Text Type',
      'Choose your preferred Arabic script',
      [
        { text: 'Uthmani', onPress: () => dispatch(setArabicTextType('uthmani')) },
        { text: 'Indopak', onPress: () => dispatch(setArabicTextType('indopak')) },
        { text: 'Simple', onPress: () => dispatch(setArabicTextType('simple')) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSendFeedback = () => {
    Linking.openURL('mailto:support@quranapp.com?subject=Quran%20App%20Feedback');
  };

  const handleRateApp = () => {
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/id1234567890'
      : 'https://play.google.com/store/apps/details?id=com.muneebtech07.quranapp';
    
    Linking.openURL(storeUrl);
  };

  const handleShareApp = () => {
    const message = 'Check out this amazing Quran App! Download it now:';
    const url = 'https://quranapp.com/download';
    
    Share.share({
      message: `${message} ${url}`,
      title: 'Quran App',
    });
  };

  const getVersionNumber = () => {
    return Application.nativeApplicationVersion || '1.0.0';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('settings.appearance')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleToggleTheme}
        >
          <View style={styles.settingContent}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {i18n.t('settings.theme')}
            </Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.muted }]}>
            {isDark ? 'Dark' : 'Light'}
          </Text>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="phone-portrait" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Use System Theme
            </Text>
          </View>
          <Switch
            value={settings.theme === 'system'}
            onValueChange={handleToggleSystemTheme}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleLanguageChange}
        >
          <View style={styles.settingContent}>
            <Ionicons name="language" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Language
            </Text>
          </View>
          <View style={styles.settingValueContainer}>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {settings.appLanguage === 'en' ? 'English' : 
               settings.appLanguage === 'ar' ? 'العربية' : 
               settings.appLanguage === 'ur' ? 'اردو' : 'English'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleFontSizeChange}
        >
          <View style={styles.settingContent}>
            <Ionicons name="text" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Font Size
            </Text>
          </View>
          <View style={styles.settingValueContainer}>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Reading Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quran Reading
        </Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleTranslationChange}
        >
          <View style={styles.settingContent}>
            <Ionicons name="globe" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Translation
            </Text>
          </View>
          <View style={styles.settingValueContainer}>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {settings.translation.includes('en') ? 'English' : 
               settings.translation.includes('ar') ? 'العربية' : 
               settings.translation.includes('ur') ? 'اردو' : 'English'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleArabicTextTypeChange}
        >
          <View style={styles.settingContent}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Arabic Script
            </Text>
          </View>
          <View style={styles.settingValueContainer}>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {settings.arabicTextType.charAt(0).toUpperCase() + settings.arabicTextType.slice(1)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="text-outline" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Show Arabic Text
            </Text>
          </View>
          <Switch
            value={settings.showArabicText}
            onValueChange={() => dispatch(toggleArabicText())}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="language-outline" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Show Translation
            </Text>
          </View>
          <Switch
            value={settings.showTranslation}
            onValueChange={() => dispatch(toggleTranslation())}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Show Transliteration
            </Text>
          </View>
          <Switch
            value={settings.showTransliteration}
            onValueChange={() => dispatch(toggleTransliteration())}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleSendFeedback}
        >
          <View style={styles.settingContent}>
            <Ionicons name="mail" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Send Feedback
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleRateApp}
        >
          <View style={styles.settingContent}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Rate App
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={handleShareApp}
        >
          <View style={styles.settingContent}>
            <Ionicons name="share-social" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Share App
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Version
            </Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.muted }]}>
            {getVersionNumber()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    marginRight: 5,
  }
});

export default SettingsScreen;