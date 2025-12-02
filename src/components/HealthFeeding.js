import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { feedingAPI, eventsAPI } from '../services/api';

export default function HealthFeeding({ pets = [], t }) {
  const [feedingSchedules, setFeedingSchedules] = useState({});
  const [vetAppointments, setVetAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [newFeedingTime, setNewFeedingTime] = useState('');
  const [newFoodType, setNewFoodType] = useState('');
  const [newPortion, setNewPortion] = useState('');

  const fetchData = useCallback(async () => {
    try {
      // Fetch feeding schedules
      const schedules = await feedingAPI.getAll();
      const schedulesMap = {};
      schedules.forEach((schedule) => {
        if (!schedulesMap[schedule.pet]) {
          schedulesMap[schedule.pet] = [];
        }
        schedulesMap[schedule.pet].push(schedule);
      });
      setFeedingSchedules(schedulesMap);

      // Fetch vet appointments (events with type 'vet_visit')
      const events = await eventsAPI.getAll();
      const vetMap = {};
      events.forEach((event) => {
        if (event.event_type === 'vet_visit' && event.pet) {
          if (!vetMap[event.pet] || new Date(event.event_date) < new Date(vetMap[event.pet].event_date)) {
            vetMap[event.pet] = event;
          }
        }
      });
      setVetAppointments(vetMap);
    } catch (error) {
      console.log('Error fetching health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openAddFeedingModal = (pet) => {
    setSelectedPet(pet);
    setNewFeedingTime('');
    setNewFoodType('');
    setNewPortion('');
    setModalVisible(true);
  };

  const handleAddFeeding = async () => {
    if (!selectedPet || !newFeedingTime) {
      Alert.alert('Error', 'Please enter a feeding time');
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(newFeedingTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (e.g., 08:00)');
      return;
    }

    try {
      const result = await feedingAPI.create({
        pet: selectedPet.id,
        time: newFeedingTime + ':00', // Add seconds for backend
        food_type: newFoodType,
        portion: newPortion,
      });

      setFeedingSchedules((prev) => ({
        ...prev,
        [selectedPet.id]: [...(prev[selectedPet.id] || []), result],
      }));
      setModalVisible(false);
      Alert.alert('Success', 'Feeding schedule added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add feeding schedule.');
      console.error('Add feeding error:', error);
    }
  };

  const handleDeleteFeeding = async (scheduleId, petId) => {
    Alert.alert('Delete Feeding Time', 'Are you sure you want to delete this feeding time?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await feedingAPI.delete(scheduleId);
            setFeedingSchedules((prev) => ({
              ...prev,
              [petId]: prev[petId].filter((s) => s.id !== scheduleId),
            }));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete feeding schedule.');
          }
        },
      },
    ]);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Convert "HH:MM:SS" to "HH:MM"
    return timeStr.substring(0, 5);
  };

  const renderItem = ({ item: pet }) => {
    const schedules = feedingSchedules[pet.id] || [];
    const vetAppt = vetAppointments[pet.id];

    return (
      <View style={[styles.row, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]}>
        <Image
          source={pet.image || require('../../assets/Pet Pictures/alvan-nee-1VgfQdCuX-4-unsplash.jpg')}
          style={styles.thumb}
        />
        <View style={styles.body}>
          <Text style={[styles.name, { color: t.textPrimary }]}>{pet.name}</Text>
          <Text style={[styles.breed, { color: t.textSecondary }]}>{pet.breed}</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Feeding times</Text>
              <Pressable onPress={() => openAddFeedingModal(pet)}>
                <Text style={[styles.addButton, { color: t.accent }]}>+ Add</Text>
              </Pressable>
            </View>
            <View style={styles.feedingRow}>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <Pressable
                    key={schedule.id}
                    onLongPress={() => handleDeleteFeeding(schedule.id, pet.id)}
                    style={styles.feedPill}
                  >
                    <Text style={[styles.feedText, { color: t.textPrimary }]}>
                      {formatTime(schedule.time)}
                    </Text>
                    {schedule.food_type ? (
                      <Text style={[styles.feedSubtext, { color: t.textSecondary }]}>
                        {schedule.food_type}
                      </Text>
                    ) : null}
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.noData, { color: t.textSecondary }]}>
                  No feeding times set
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>Vet appointment</Text>
            {vetAppt ? (
              <View>
                <Text style={[styles.appointment, { color: t.textSecondary }]}>
                  {new Date(vetAppt.event_date).toLocaleDateString()} at{' '}
                  {new Date(vetAppt.event_date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={[styles.appointmentTitle, { color: t.textPrimary }]}>
                  {vetAppt.title}
                </Text>
              </View>
            ) : (
              <Text style={[styles.appointment, { color: t.textSecondary }]}>
                No upcoming appointment
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading health data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: t.background }}>
      <Text style={[styles.header, { color: t.titleText }]}>Health & Feeding</Text>
      <Text style={[styles.subheader, { color: t.textSecondary }]}>
        Long press feeding times to delete
      </Text>

      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Add Feeding Schedule Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t.cardBg }]}>
            <Text style={[styles.modalTitle, { color: t.textPrimary }]}>
              Add Feeding Time for {selectedPet?.name}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Time (HH:MM) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={newFeedingTime}
                onChangeText={setNewFeedingTime}
                placeholder="08:00"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Food Type (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={newFoodType}
                onChangeText={setNewFoodType}
                placeholder="e.g., Dry food, Wet food"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Portion (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={newPortion}
                onChangeText={setNewPortion}
                placeholder="e.g., 1 cup, 200g"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleAddFeeding}>
                <Text style={styles.saveButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 13,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    alignItems: 'flex-start',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  breed: {
    fontSize: 13,
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feedPill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EFE6E0',
  },
  feedText: {
    fontWeight: '700',
    fontSize: 14,
  },
  feedSubtext: {
    fontSize: 11,
  },
  noData: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  appointment: {
    fontSize: 13,
  },
  appointmentTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6495ED',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
