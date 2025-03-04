import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useQuery } from 'react-query';
import { fetchTranslations } from '../api/quranApi';

const Filters = ({ activeFilters, onApplyFilters, onClose, surahList }) => {
  const { colors, isDark } = useTheme();
  const [filters, setFilters] = useState({ ...activeFilters });
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showSurahModal, setShowSurahModal] = useState(false);
  
  // Get available translations
  const { data: translationsData } = useQuery('translations', fetchTranslations, {
    staleTime: Infinity,
  });
  
  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };
  
  const resetFilters = () => {
    setFilters({
      translations: ['en.sahih'],
      surah: null,
      juz: null,
      page: null,
      hizb: null,
      language: 'en',
    });
  };
  
  const selectTranslation = (translationId) => {
    setFilters(prev => ({
      ...prev,
      translations: prev.translations.includes(translationId) 
        ? prev.translations.filter(id => id !== translationId) 
        : [...prev.translations, translationId]
    }));
  };
  
  const selectSurah = (surahId) => {
    setFilters(prev => ({
      ...prev,
      surah: surahId
    }));
    setShowSurahModal(false);
  };
  
  return (
    <View style={styles.filtersContainer}>
      <View style={styles.filterHeader}>
        <Text style={[styles.filterTitle, { color: colors.text }]}>Search Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.filtersContent}>
        {/* Translations filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
            Translations
          </Text>
          <TouchableOpacity 
            style={[styles.pickerButton, { borderColor: colors.border }]}
            onPress={() => setShowTranslationModal(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>
              {filters.translations.length === 1 
                ? translationsData?.translations.find(t => t.id === filters.translations[0])?.name || 'Sahih International' 
                : `${filters.translations.length} translations selected`}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Surah filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
            Surah
          </Text>
          <TouchableOpacity 
            style={[styles.pickerButton, { borderColor: colors.border }]}
            onPress={() => setShowSurahModal(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>
              {filters.surah 
                ? surahList.find(s => s.id === filters.surah)?.name_simple || `Surah ${filters.surah}`
                : 'All Surahs'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Other filter sections could be added here */}
      </ScrollView>
      
      <View style={[styles.filterActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={resetFilters}
        >
          <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: colors.primary }]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
      
      {/* Translations Modal */}
      <Modal
        visible={showTranslationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTranslationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Translations</Text>
              <TouchableOpacity onPress={() => setShowTranslationModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={translationsData?.translations || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.translationItem}
                  onPress={() => selectTranslation(item.id)}
                >
                  <Text style={[styles.translationName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {filters.translations.includes(item.id) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.translationsList}
            />
            
            <TouchableOpacity 
              style={[styles.modalDoneButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTranslationModal(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Surah Selection Modal */}
      <Modal
        visible={showSurahModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSurahModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Surah</Text>
              <TouchableOpacity onPress={() => setShowSurahModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.surahItem}
              onPress={() => selectSurah(null)}
            >
              <Text style={[styles.surahName, { color: colors.text }]}>
                All Surahs
              </Text>
              {filters.surah === null && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            
            <FlatList
              data={surahList}
              keyExtractor={(item) => `surah-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.surahItem}
                  onPress={() => selectSurah(item.id)}
                >
                  <View style={styles.surahDetails}>
                    <Text style={[styles.surahNumber, { color: colors.primary }]}>
                      {item.id}
                    </Text>
                    <Text style={[styles.surahName, { color: colors.text }]}>
                      {item.name_simple}
                    </Text>
                  </View>
                  {filters.surah === item.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.surahsList}
            />
            
            <TouchableOpacity 
              style={[styles.modalDoneButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSurahModal(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filtersContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 16,
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    max