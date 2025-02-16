import React from 'react';
    import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
    import { Ionicons } from '@expo/vector-icons';
    import useSettingsStore from '../store/useSettingsStore';

    const SettingsScreen = () => {
      const colorScheme = useColorScheme();
      const isDark = colorScheme === 'dark';
      const settings = useSettingsStore();

      const bgColor = isDark ? '#121212' : '#fff';
      const textColor = isDark ? '#fff' : '#000';
      const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

      const SettingItem = ({ icon, title, subtitle, onPress }) => (
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardBg }]} onPress={onPress}>
          <View style={styles.settingIcon}>
            <Ionicons name={icon} size={24} color="#2E7D32" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      );

      return (
        <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Settings</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
            <SettingItem
              icon="color-palette-outline"
              title="Theme"
              subtitle={settings.theme}
              onPress={() => settings.updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
            />
            <SettingItem
              icon="text-outline"
              title="Font Size"
              subtitle={settings.fontSize}
              onPress={() => settings.updateSettings({ fontSize: settings.fontSize === 'medium' ? 'large' : 'medium' })}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Reading</Text>
            <SettingItem
              icon="book-outline"
              title="Translation"
              subtitle={settings.translation}
              onPress={() => settings.updateSettings({ translation: settings.translation === 'en' ? 'fr' : 'en' })}
            />
            <SettingItem
              icon="musical-notes-outline"
              title="Reciter"
              subtitle={settings.reciter}
              onPress={() => settings.updateSettings({ reciter: settings.reciter === 'mishary-rashid-alafasy' ? 'ahmed-alajamy' : 'mishary-rashid-alafasy' })}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Location</Text>
            <SettingItem
              icon="location-outline"
              title="Prayer Time Location"
              subtitle="New York, United States"
              onPress={() => {}} // Navigation to location settings
            />
            <SettingItem
              icon="calculator-outline"
              title="Calculation Method"
              subtitle="ISNA"
              onPress={() => {}} // Navigation to calculation method settings
            />
          </View>
        </ScrollView>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      header: {
        padding: 20,
        paddingTop: 60,
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
      },
      section: {
        padding: 20,
        paddingTop: 0,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
      },
      settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
      },
      settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
      },
      settingInfo: {
        flex: 1,
      },
      settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
      },
      settingSubtitle: {
        fontSize: 14,
        color: '#666',
      },
    });

    export default SettingsScreen;
