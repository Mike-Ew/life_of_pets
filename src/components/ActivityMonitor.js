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
import { activitiesAPI } from '../services/api';

export default function ActivityMonitor({ pets = [], t }) {
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    walking_minutes: '',
    steps: '',
    play_minutes: '',
    notes: '',
  });

  const fetchActivities = useCallback(async () => {
    try {
      const todayActivities = await activitiesAPI.getToday();
      // Convert array to object keyed by pet id for easy lookup
      const activitiesMap = {};
      todayActivities.forEach((activity) => {
        activitiesMap[activity.pet] = activity;
      });
      setActivities(activitiesMap);
    } catch (error) {
      console.log('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const openEditModal = (pet) => {
    const existing = activities[pet.id];
    setSelectedPet(pet);
    setFormData({
      walking_minutes: existing?.walking_minutes?.toString() || '0',
      steps: existing?.steps?.toString() || '0',
      play_minutes: existing?.play_minutes?.toString() || '0',
      notes: existing?.notes || '',
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedPet) return;

    try {
      const result = await activitiesAPI.logActivity(selectedPet.id, {
        walking_minutes: parseInt(formData.walking_minutes, 10) || 0,
        steps: parseInt(formData.steps, 10) || 0,
        play_minutes: parseInt(formData.play_minutes, 10) || 0,
        notes: formData.notes,
      });

      setActivities((prev) => ({
        ...prev,
        [selectedPet.id]: result,
      }));
      setEditModalVisible(false);
      Alert.alert('Success', 'Activity logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save activity. Please try again.');
      console.error('Save activity error:', error);
    }
  };

  const getActivityForPet = (pet) => {
    return activities[pet.id] || { walking_minutes: 0, steps: 0, play_minutes: 0 };
  };

  const renderItem = ({ item: pet }) => {
    const activity = getActivityForPet(pet);

    return (
      <Pressable
        onPress={() => openEditModal(pet)}
        style={[styles.row, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]}
      >
        <Image
          source={pet.image || require('../../assets/Pet Pictures/alvan-nee-1VgfQdCuX-4-unsplash.jpg')}
          style={styles.thumb}
        />
        <View style={styles.body}>
          <Text style={[styles.name, { color: t.textPrimary }]}>{pet.name}</Text>
          <Text style={[styles.breed, { color: t.textSecondary }]}>{pet.breed}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: t.textPrimary }]}>
                {activity.walking_minutes} min
              </Text>
              <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Walk today</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: t.textPrimary }]}>{activity.steps}</Text>
              <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Steps</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: t.textPrimary }]}>
                {activity.play_minutes} min
              </Text>
              <Text style={[styles.metricLabel, { color: t.textSecondary }]}>Playtime</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.editHint, { color: t.accent }]}>Tap to log</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: t.background }}>
      <Text style={[styles.header, { color: t.titleText }]}>Activity Monitor</Text>
      <Text style={[styles.subheader, { color: t.textSecondary }]}>
        Tap a pet to log today's activity
      </Text>

      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Edit Activity Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t.cardBg }]}>
            <Text style={[styles.modalTitle, { color: t.textPrimary }]}>
              Log Activity for {selectedPet?.name}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Walking (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={formData.walking_minutes}
                onChangeText={(text) => setFormData({ ...formData, walking_minutes: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Steps</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={formData.steps}
                onChangeText={(text) => setFormData({ ...formData, steps: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Playtime (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, color: t.textPrimary }]}
                value={formData.play_minutes}
                onChangeText={(text) => setFormData({ ...formData, play_minutes: text })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={t.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textSecondary }]}>Notes (optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: t.background, color: t.textPrimary },
                ]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any notes about today's activity..."
                placeholderTextColor={t.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
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
    alignItems: 'center',
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
  },
  editHint: {
    fontSize: 12,
    fontWeight: '600',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
