import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tafseer } from '../types/quran';

interface TafseerModalProps {
  visible: boolean;
  onClose: () => void;
  tafseers: Tafseer[];
  selectedTafseer?: string;
  onSelectTafseer: (tafseer: Tafseer) => void;
  tafseerText?: string;
  loading: boolean;
}

export default function TafseerModal({
  visible,
  onClose,
  tafseers,
  selectedTafseer,
  onSelectTafseer,
  tafseerText,
  loading,
}: TafseerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Tafseer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal style={styles.tafseerList}>
            {tafseers.map((tafseer) => (
              <TouchableOpacity
                key={tafseer.id}
                style={[
                  styles.tafseerButton,
                  {
                    backgroundColor:
                      selectedTafseer === tafseer.id ? '#2E7D32' : cardBg,
                  },
                ]}
                onPress={() => onSelectTafseer(tafseer)}>
                <Text
                  style={[
                    styles.tafseerName,
                    {
                      color:
                        selectedTafseer === tafseer.id ? '#fff' : textColor,
                    },
                  ]}>
                  {tafseer.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.tafseerContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : (
              <Text style={[styles.tafseerText, { color: textColor }]}>
                {tafseerText || 'Select a tafseer to view the explanation'}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  tafseerList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  tafseerButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
  },
  tafseerName: {
    fontSize: 16,
    textAlign: 'center',
  },
  tafseerContent: {
    flex: 1,
  },
  tafseerText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
