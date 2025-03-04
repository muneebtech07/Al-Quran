import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../localization/i18n';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t('privacy.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={[styles.section, { color: colors.text }]}>
          {i18n.t('privacy.lastUpdated')} March 1, 2025
        </Text>
        
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.intro')}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('privacy.dataCollection.title')}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.dataCollection.content')}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('privacy.dataUsage.title')}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.dataUsage.content')}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('privacy.permissions.title')}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.permissions.content')}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('privacy.thirdParty.title')}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.thirdParty.content')}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {i18n.t('privacy.contact.title')}
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          {i18n.t('privacy.contact.content')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default PrivacyPolicyScreen;