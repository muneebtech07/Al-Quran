import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  createPlan, 
  updatePlan, 
  deletePlan, 
  setActivePlan,
  markDayComplete
} from '../store/slices/readingPlansSlice';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressChart from '../components/ProgressChart';
import analytics from '../utils/analytics';

const ReadingPlansScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { plans, activeId } = useSelector(state => state.readingPlans);
  const [showModal, setShowModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    duration: '30',
    type: 'fixed',
    targetPages: '20',
  });
  const [editingId, setEditingId] = useState(null);
  
  const activePlan = plans.find(plan => plan.id === activeId);
  
  // Calculate percentage for circular progress
  const getCompletionPercentage = (plan) => {
    if (plan.type === 'fixed') {
      const targetTotal = plan.targetPages * plan.duration;
      return Math.min(100, Math.round((plan.progress.completed / targetTotal) * 100));
    } else {
      return Math.min(100, Math.round((plan.progress.streak / 30) * 100)); // Show streak progress up to 30 days
    }
  };
  
  // Add new reading
  const trackReading = (plan, pages) => {
    dispatch(markDayComplete({
      planId: plan.id,
      date: new Date().toISOString(),
      pages
    }));
    
    // Show success message
    Alert.alert(
      'Reading Tracked',
      `Great job! You've read ${pages} page(s) today.`,
      [{ text: 'OK' }]
    );
    
    // Log analytics
    analytics.logEvent('reading_tracked', {
      plan_id: plan.id,
      plan_name: plan.name,
      pages_read: pages,
      streak: plan.progress.streak + 1,
    });
  };
  
  // Open the form to create or edit a plan
  const openPlanForm = (plan = null) => {
    if (plan) {
      setEditingId(plan.id);
      setPlanForm({
        name: plan.name,
        description: plan.description,
        duration: String(plan.duration),
        type: plan.type,
        targetPages: String(plan.targetPages),
      });
    } else {
      setEditingId(null);
      setPlanForm({
        name: '',
        description: '',
        duration: '30',
        type: 'fixed',
        targetPages: '20',
      });
    }
    setShowModal(true);
  };
  
  // Save the plan (create or update)
  const savePlan = () => {
    // Validate form
    if (!planForm.name.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }
    
    const planData = {
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      duration: parseInt(planForm.duration, 10) || 30,
      type: planForm.type,
      targetPages: parseInt(planForm.targetPages, 10) || 1,
    };
    
    if (editingId) {
      dispatch(updatePlan({ id: editingId, updates: planData }));
    } else {
      dispatch(createPlan(planData));
    }
    
    setShowModal(false);
    
    // Log analytics
    analytics.logEvent(editingId ? 'plan_updated' : 'plan_created', {
      plan_name: planData.name,
      plan_type: planData.type,
      plan_duration: planData.duration,
    });
  };
  
  // Delete a plan with confirmation
  const confirmDeletePlan = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this reading plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deletePlan(id));
            analytics.logEvent('plan_deleted', { plan_id: id });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Reading Plans
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => openPlanForm()}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.createButtonText}>New Plan</Text>
        </TouchableOpacity>
      </View>
      
      {/* Active Plan Card */}
      {activePlan ? (
        <View style={[styles.activePlanCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
          <View style={styles.activePlanHeader}>
            <Text style={[styles.activePlanTitle, { color: colors.text }]}>
              {activePlan.name}
            </Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color="#FFA000" />
              <Text style={styles.streakText}>{activePlan.progress.streak} days</Text>
            </View>
          </View>
          
          <Text style={[styles.activePlanDesc, { color: colors.text }]}>
            {activePlan.description}
          </Text>
          
          <View style={styles.planProgressRow}>
            <AnimatedCircularProgress
              size={80}
              width={8}
              fill={getCompletionPercentage(activePlan)}
              tintColor={colors.primary}
              backgroundColor={isDark ? '#444444' : '#EEEEEE'}
              rotation={0}
              lineCap="round"
            >
              {() => (
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {getCompletionPercentage(activePlan)}%
                </Text>
              )}
            </AnimatedCircularProgress>
            
            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {activePlan.progress.completed}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  Pages Read
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {activePlan.type === 'fixed' ? activePlan.duration : '∞'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  Duration
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {activePlan.targetPages}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  Daily Goal
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.trackReadingContainer}>
            <Text style={[styles.trackTitle, { color: colors.text }]}>
              Track Today's Reading
            </Text>
            
            <View style={styles.pageButtons}>
              {[1, 2, 5, 10].map(pages => (
                <TouchableOpacity
                  key={`pages-${pages}`}
                  style={[styles.pageButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => trackReading(activePlan, pages)}
                >
                  <Text style={[styles.pageButtonText, { color: colors.primary }]}>
                    {pages} {pages === 1 ? 'page' : 'pages'}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.customButton, { borderColor: colors.border }]}
                onPress={() => {
                  Alert.prompt(
                    'Custom Pages',
                    'Enter number of pages read:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Submit',
                        onPress: (pages) => {
                          const numPages = parseInt(pages, 10);
                          if (numPages > 0) {
                            trackReading(activePlan, numPages);
                          }
                        }
                      }
                    ],
                    'plain-text',
                    '',
                    'numeric'
                  );
                }}
              >
                <Text style={[styles.customButtonText, { color: colors.text }]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Weekly progress chart */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              7-Day Activity
            </Text>
            <ProgressChart
              data={activePlan.progress.completedDays}
              primaryColor={colors.primary}
              secondaryColor={isDark ? '#444444' : '#EEEEEE'}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.noActivePlan, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
          <Ionicons name="book-outline" size={50} color={colors.primary} />
          <Text style={[styles.noActivePlanText, { color: colors.text }]}>
            No active reading plan
          </Text>
          <Text style={[styles.noActivePlanDesc, { color: colors.text }]}>
            Create a new plan to track your Quran reading progress
          </Text>
        </View>
      )}
      
      {/* All Plans List */}
      <View style={styles.allPlansHeader}>
        <Text style={[styles.allPlansTitle, { color: colors.text }]}>
          My Reading Plans
        </Text>
        <Text style={[styles.allPlansSubtitle, { color: colors.text }]}>
          {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
        </Text>
      </View>
      
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.planItem,
              { backgroundColor: isDark ? colors.card : '#FFFFFF' },
              item.id === activeId && styles.activePlanItem
            ]}
            onPress={() => dispatch(setActivePlan(item.id))}
          >
            <View style={styles.planItemContent}>
              <View style={styles.planNameRow}>
                <Text style={[styles.planName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <View style={[
                  styles.smallProgressCircle, 
                  { borderColor: getCompletionPercentage(item) > 50 ? colors.primary : '#DDDDDD' }
                ]}>
                  <Text style={{ color: colors.text, fontSize: 10 }}>
                    {getCompletionPercentage(item)}%
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.planDescription, { color: colors.text }]} numberOfLines={1}>
                {item.description}
              </Text>
              
              <View style={styles.planItemFooter}>
                <View style={styles.streakRow}>
                  <Ionicons name="flame" size={12} color="#FFA000" />
                  <Text style={[styles.smallText, { color: colors.text }]}>
                    {item.progress.streak} day streak
                  </Text>
                </View>
                
                <View style={styles.planActions}>
                  <TouchableOpacity
                    style={styles.planActionButton}
                    onPress={() => openPlanForm(item)}
                  >
                    <Ionicons name="pencil" size={14} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.planActionButton, { marginLeft: 8 }]}
                    onPress={() => confirmDeletePlan(item.id)}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {item.id === activeId && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.plansList}
      />
      
      {/* Create/Edit Plan Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingId ? 'Edit Reading Plan' : 'Create Reading Plan'}
            </Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Plan Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    borderColor: colors.border,
                    backgroundColor: isDark ? '#333333' : '#F5F5F5',
                    color: colors.text
                  }
                ]}
                placeholder="Enter plan name"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                value={planForm.name}
                onChangeText={(text) => setPlanForm({...planForm, name: text})}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { 
                    borderColor: colors.border,
                    backgroundColor: isDark ? '#333333' : '#F5F5F5',
                    color: colors.text
                  }
                ]}
                placeholder="Enter plan description"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                value={planForm.description}
                onChangeText={(text) => setPlanForm({...planForm, description: text})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Plan Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    planForm.type === 'fixed' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setPlanForm({...planForm, type: 'fixed'})}
                >
                  <Ionicons 
                    name="calendar" 
                    size={20} 
                    color={planForm.type === 'fixed' ? '#FFFFFF' : colors.text} 
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      marginLeft: 8,
                      color: planForm.type === 'fixed' ? '#FFFFFF' : colors.text
                    }}
                  >
                    Fixed Duration
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    planForm.type === 'continuous' && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setPlanForm({...planForm, type: 'continuous'})}
                >
                  <Ionicons 
                    name="infinite" 
                    size={20} 
                    color={planForm.type === 'continuous' ? '#FFFFFF' : colors.text} 
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      marginLeft: 8,
                      color: planForm.type === 'continuous' ? '#FFFFFF' : colors.text
                    }}
                  >
                    Ongoing
                  </Text>
                </TouchableOpacity>
              </View>
              
              {planForm.type === 'fixed' && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (days)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        borderColor: colors.border,
                        backgroundColor: isDark ? '#333333' : '#F5F5F5',
                        color: colors.text
                      }
                    ]}
                    placeholder="Enter plan duration"
                    placeholderTextColor={isDark ? '#888888' : '#999999'}
                    value={planForm.duration}
                    onChangeText={(text) => setPlanForm({...planForm, duration: text})}
                    keyboardType="number-pad"
                  />
                </>
              )}
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Daily Target (pages)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    borderColor: colors.border,
                    backgroundColor: isDark ? '#333333' : '#F5F5F5',
                    color: colors.text
                  }
                ]}
                placeholder="Enter daily page target"
                placeholderTextColor={isDark ? '#888888' : '#999999'}
                value={planForm.targetPages}
                onChangeText={(text) => setPlanForm({...planForm, targetPages: text})}
                keyboardType="number-pad"
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={savePlan}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  activePlanCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  activePlanDesc: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  planProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#DDDDDD',
    opacity: 0.5,
  },
  trackReadingContainer: {
    marginBottom: 16,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  pageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pageButtonText: {
    fontWeight: '500',
  },
  customButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  customButtonText: {
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  noActivePlan: {
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noActivePlanText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  noActivePlanDesc: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  allPlansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12