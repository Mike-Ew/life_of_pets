import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { eventsAPI } from '../services/api';

const EVENT_TYPES = [
  { key: 'vaccination', label: 'Vaccination', icon: '💉', color: '#E3F2FD' },
  { key: 'vet_visit', label: 'Vet Visit', icon: '🏥', color: '#F3E5F5' },
  { key: 'grooming', label: 'Grooming', icon: '✂️', color: '#FFF3E0' },
  { key: 'feeding', label: 'Feeding', icon: '🍖', color: '#E8F5E9' },
  { key: 'medication', label: 'Medication', icon: '💊', color: '#FFEBEE' },
  { key: 'other', label: 'Other', icon: '📝', color: '#ECEFF1' },
];

const DEFAULT_PET_IMAGE = require('../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg');

export default function RemindersScreen({ pets, t }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('other');
  const [formDescription, setFormDescription] = useState('');
  const [formPetId, setFormPetId] = useState(null);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsAPI.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormTitle('');
    setFormType('other');
    setFormDescription('');
    setFormPetId(pets.length > 0 ? pets[0].id : null);
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDate(tomorrow.toISOString().split('T')[0]);
    setFormTime('10:00');
    setAddModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formPetId) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }
    if (!formDate || !formTime) {
      Alert.alert('Error', 'Please enter date and time');
      return;
    }

    setIsSaving(true);
    try {
      const eventDateTime = new Date(`${formDate}T${formTime}:00`);

      const newEvent = await eventsAPI.create({
        title: formTitle.trim(),
        event_type: formType,
        description: formDescription.trim(),
        pet: formPetId,
        event_date: eventDateTime.toISOString(),
      });

      setEvents([...events, newEvent].sort((a, b) =>
        new Date(a.event_date) - new Date(b.event_date)
      ));
      setAddModalVisible(false);
      Alert.alert('Success', 'Reminder created!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = (event) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsAPI.delete(event.id);
              setEvents(events.filter(e => e.id !== event.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          }
        }
      ]
    );
  };

  const getPetById = (petId) => pets.find(p => p.id === petId);

  const getEventTypeInfo = (type) =>
    EVENT_TYPES.find(t => t.key === type) || EVENT_TYPES[EVENT_TYPES.length - 1];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateString) => new Date(dateString) < new Date();

  // Separate upcoming and past events
  const upcomingEvents = events.filter(e => !isOverdue(e.event_date));
  const pastEvents = events.filter(e => isOverdue(e.event_date));

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: t.accent }]}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>

        {/* Upcoming Events */}
        <Text style={[styles.sectionTitle, { color: t.titleText }]}>
          Upcoming ({upcomingEvents.length})
        </Text>

        {upcomingEvents.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: t.cardBg }]}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: t.textSecondary }]}>
              No upcoming reminders
            </Text>
          </View>
        ) : (
          upcomingEvents.map(event => {
            const pet = getPetById(event.pet);
            const typeInfo = getEventTypeInfo(event.event_type);
            return (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: t.cardBg }]}
                onLongPress={() => handleDeleteEvent(event)}
              >
                <View style={[styles.eventTypeIcon, { backgroundColor: typeInfo.color }]}>
                  <Text style={styles.eventTypeEmoji}>{typeInfo.icon}</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: t.textPrimary }]}>{event.title}</Text>
                  <Text style={[styles.eventDate, { color: t.accent }]}>{formatDate(event.event_date)}</Text>
                  {event.description && (
                    <Text style={[styles.eventDescription, { color: t.textSecondary }]} numberOfLines={1}>
                      {event.description}
                    </Text>
                  )}
                </View>
                {pet && (
                  <Image
                    source={pet.image || DEFAULT_PET_IMAGE}
                    style={styles.petThumb}
                  />
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: t.titleText, marginTop: 24 }]}>
              Past ({pastEvents.length})
            </Text>
            {pastEvents.slice(0, 5).map(event => {
              const pet = getPetById(event.pet);
              const typeInfo = getEventTypeInfo(event.event_type);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, styles.pastEvent, { backgroundColor: t.cardBg }]}
                  onLongPress={() => handleDeleteEvent(event)}
                >
                  <View style={[styles.eventTypeIcon, { backgroundColor: typeInfo.color, opacity: 0.6 }]}>
                    <Text style={styles.eventTypeEmoji}>{typeInfo.icon}</Text>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTitle, { color: t.textSecondary }]}>{event.title}</Text>
                    <Text style={[styles.eventDate, { color: t.textSecondary }]}>{formatDate(event.event_date)}</Text>
                  </View>
                  {pet && (
                    <Image
                      source={pet.image || DEFAULT_PET_IMAGE}
                      style={[styles.petThumb, { opacity: 0.6 }]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Text style={[styles.hint, { color: t.textSecondary }]}>
          Long press a reminder to delete it
        </Text>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalContainer, { backgroundColor: t.modalBg }]}>
          <ScrollView>
            <Text style={[styles.modalTitle, { color: t.titleText }]}>New Reminder</Text>

            {/* Title */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="e.g., Vet appointment"
              placeholderTextColor={t.textSecondary}
            />

            {/* Event Type */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Type</Text>
            <View style={styles.typeGrid}>
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeOption,
                    { backgroundColor: type.color },
                    formType === type.key && styles.typeOptionActive
                  ]}
                  onPress={() => setFormType(type.key)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pet Selection */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Pet *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    { borderColor: formPetId === pet.id ? t.accent : t.cardShadow }
                  ]}
                  onPress={() => setFormPetId(pet.id)}
                >
                  <Image source={pet.image || DEFAULT_PET_IMAGE} style={styles.petOptionImage} />
                  <Text style={[styles.petOptionName, { color: t.textPrimary }]}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Date *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
                  value={formDate}
                  onChangeText={setFormDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={t.textSecondary}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Time *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
                  value={formTime}
                  onChangeText={setFormTime}
                  placeholder="HH:MM"
                  placeholderTextColor={t.textSecondary}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Optional notes..."
              placeholderTextColor={t.textSecondary}
              multiline
              numberOfLines={3}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: t.cardShadow }]}
                onPress={() => setAddModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={[styles.cancelBtnText, { color: t.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: t.accent }, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveEvent}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pastEvent: {
    opacity: 0.7,
  },
  eventTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventTypeEmoji: {
    fontSize: 20,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  petThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    borderColor: '#5A3E36',
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A3E36',
  },
  petSelector: {
    marginTop: 8,
  },
  petOption: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  petOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  petOptionName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
