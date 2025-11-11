// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import PetCard from '../components/PetCard';
import MenuModal from '../components/MenuModal';
import ActivityMonitor from '../components/ActivityMonitor';
import HealthFeeding from '../components/HealthFeeding';
import Expenses from '../components/Expenses';
import { petsAPI, eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Fallback images for pets without photos
const DEFAULT_IMAGES = [
  require("../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg"),
  require("../../assets/Pet Pictures/david-lezcano-m-Doa-GTrUw-unsplash.jpg"),
  require("../../assets/Pet Pictures/IMG_3229.jpeg"),
  require("../../assets/Pet Pictures/richard-brutyo-Sg3XwuEpybU-unsplash.jpg"),
];

const PERSONALITY_COLORS = {
  calm: "#C7E7DB",
  playful: "#FFE1B5",
  curious: "#F7D6E0",
  gentle: "#E0E0E0",
};

const THEMES = {
  light: {
    background: '#FFF8F2',
    headerBg: '#FFF6EE',
    headerShadow: '#E7CFC2',
    titleText: '#5A3E36',
    cardBg: '#fffaf6',
    cardShadow: '#E6CFC3',
    textPrimary: '#4A2F28',
    textSecondary: '#8A6F64',
    accent: '#FF8A65',
    modalBg: '#FFF8F2',
    inputBg: '#FFF',
  },
  dark: {
    background: '#121212',
    headerBg: '#1E1E1E',
    headerShadow: '#000000',
    titleText: '#FFF1EB',
    cardBg: '#1B1B1B',
    cardShadow: '#000000',
    textPrimary: '#F5EDE9',
    textSecondary: '#CFC0B8',
    accent: '#FF8A65',
    modalBg: '#1A1A1A',
    inputBg: '#222222',
  }
};

export default function Dashboard({ onLogout }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState("Dashboard");
  const { user } = useAuth();

  // Add Pet modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBreed, setFormBreed] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formPersonality, setFormPersonality] = useState("calm");
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSavingPet, setIsSavingPet] = useState(false);

  // Pet detail modal state
  const [petDetailVisible, setPetDetailVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [theme, setTheme] = useState('light');
  const t = THEMES[theme];

  const SCREENS = [
    "Dashboard",
    "Activity Monitor",
    "Health & Feeding",
    "Expenses",
    "Settings",
  ];

  // Load pets on mount
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      const data = await petsAPI.getAll();

      // Add default images to pets without photos
      // Use pet ID for consistent image assignment
      const petsWithImages = data.map((pet) => {
        let imageSource;

        if (pet.photos && pet.photos.length > 0) {
          // Pet has uploaded photos - use the main photo or first one
          const photoUrl = pet.photos.find(p => p.is_main)?.image || pet.photos[0].image;
          imageSource = { uri: photoUrl };
        } else {
          // No photos - assign a default image based on pet ID
          const imageIndex = (pet.id - 1) % DEFAULT_IMAGES.length;
          imageSource = DEFAULT_IMAGES[imageIndex];
        }

        return {
          ...pet,
          image: imageSource
        };
      });

      setPets(petsWithImages);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPets();
    setIsRefreshing(false);
  };

  const onAddPet = () => {
    // Reset form
    setFormName("");
    setFormBreed("");
    setFormAge("");
    setFormPersonality("calm");
    setFormHeight("");
    setFormWeight("");
    setFormDescription("");
    setAddModalVisible(true);
  };

  const handleSavePet = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Please enter a pet name');
      return;
    }

    try {
      setIsSavingPet(true);
      const newPet = await petsAPI.create({
        name: formName.trim(),
        breed: formBreed.trim(),
        age: formAge.trim(),
        height: formHeight.trim(),
        weight: formWeight.trim(),
        personality: formPersonality,
        description: formDescription.trim(),
      });

      // Add default image for display
      const petWithImage = {
        ...newPet,
        image: DEFAULT_IMAGES[pets.length % DEFAULT_IMAGES.length]
      };

      setPets([petWithImage, ...pets]);
      setAddModalVisible(false);
      Alert.alert('Success', 'Pet added successfully!');
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setIsSavingPet(false);
    }
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await petsAPI.delete(pet.id);
              setPets(pets.filter(p => p.id !== pet.id));
              setPetDetailVisible(false);
              Alert.alert('Success', 'Pet deleted successfully');
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('Error', 'Failed to delete pet');
            }
          }
        }
      ]
    );
  };

  const onNavPress = () => {
    setModalVisible(true);
  };

  const selectScreen = (screen) => {
    setSelectedScreen(screen);
    setModalVisible(false);
  };

  const openDetail = (pet) => {
    setSelectedPet(pet);
    setPetDetailVisible(true);
  };

  const renderPet = ({ item }) => (
    <PetCard item={item} onPress={openDetail} t={t} personalityColors={PERSONALITY_COLORS} />
  );

  const NUM_COLUMNS = 1;

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[{ marginTop: 16, color: t.textSecondary }]}>Loading your pets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  const EmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
      <Text style={[styles.placeholderTitle, { color: t.titleText }]}>No Pets Yet</Text>
      <Text style={[styles.placeholderText, { color: t.textSecondary, textAlign: 'center' }]}>
        Tap the "+ Add" button above to add your first pet!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.header, { backgroundColor: t.headerBg, shadowColor: t.headerShadow }]}>
        <TouchableOpacity onPress={onNavPress} style={styles.headerLeft}>
          <Text style={[styles.headerIcon, { color: t.textPrimary }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: t.titleText }]}>
          {selectedScreen === "Dashboard" ? "My Pets" : selectedScreen}
        </Text>

        {selectedScreen === "Dashboard" && (
          <TouchableOpacity onPress={onAddPet} style={styles.headerRight}>
            <Text style={[styles.addText, { color: t.accent }]}>+ Add</Text>
          </TouchableOpacity>
        )}
        {selectedScreen !== "Dashboard" && <View style={styles.headerRight} />}
      </View>

      <MenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        screens={SCREENS}
        onSelect={selectScreen}
        t={t}
      />

      {selectedScreen === "Dashboard" ? (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPet}
          contentContainerStyle={pets.length === 0 ? { flex: 1 } : styles.list}
          numColumns={NUM_COLUMNS}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={EmptyState}
        />
      ) : selectedScreen === 'Activity Monitor' ? (
        <ActivityMonitor pets={pets} t={t} />
      ) : selectedScreen === 'Health & Feeding' ? (
        <HealthFeeding pets={pets} t={t} />
      ) : selectedScreen === 'Expenses' ? (
        <Expenses t={t} />
      ) : selectedScreen === 'Settings' ? (
        <View style={[styles.placeholderContainer, { backgroundColor: t.background }]}>
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text style={[styles.menuTitle, { color: t.titleText }]}>Settings</Text>

            {user && (
              <View style={{ marginTop: 16, marginBottom: 16 }}>
                <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Account</Text>
                <Text style={{ color: t.textPrimary, fontSize: 16, marginTop: 4 }}>
                  {user.username}
                </Text>
                {user.email && (
                  <Text style={{ color: t.textSecondary, fontSize: 14, marginTop: 2 }}>
                    {user.email}
                  </Text>
                )}
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Display</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: t.textPrimary, fontWeight: '600' }}>Dark mode</Text>
                <Switch
                  value={theme === 'dark'}
                  onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                  thumbColor={t.accent}
                />
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: t.accent }]}
                onPress={onLogout}
              >
                <Text style={styles.submitText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderTitle, { color: t.titleText }]}>{selectedScreen}</Text>
          <Text style={[styles.placeholderText, { color: t.textSecondary }]}>
            Coming soon...
          </Text>
        </View>
      )}

      {/* Pet Detail Modal */}
      <Modal visible={petDetailVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setPetDetailVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.detailModalContainer, { backgroundColor: t.modalBg, shadowColor: t.cardShadow }]}>
          {selectedPet && (
            <View>
              <Image source={selectedPet.image} style={styles.detailImage} />
              <View style={{ padding: 12 }}>
                <Text style={[styles.menuTitle, { color: t.titleText }]}>{selectedPet.name}</Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary }]}>Breed</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>
                  {selectedPet.breed || '—'}
                </Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Age</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>
                  {selectedPet.age || '—'}
                </Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Height</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>
                  {selectedPet.height || '—'}
                </Text>

                <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Weight</Text>
                <Text style={[styles.detailValue, { color: t.textPrimary }]}>
                  {selectedPet.weight || '—'}
                </Text>

                {selectedPet.description && (
                  <>
                    <Text style={[styles.detailLabel, { color: t.textSecondary, marginTop: 8 }]}>Description</Text>
                    <Text style={[styles.detailValue, { color: t.textPrimary }]}>
                      {selectedPet.description}
                    </Text>
                  </>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }]}
                    onPress={() => handleDeletePet(selectedPet)}
                  >
                    <Text style={[styles.cancelText, { color: '#FFF' }]}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]}
                    onPress={() => setPetDetailVisible(false)}
                  >
                    <Text style={[styles.cancelText, { color: t.textPrimary }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Add Pet Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.addModalContainer, { backgroundColor: t.inputBg, shadowColor: t.cardShadow }]}>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            <Text style={[styles.menuTitle, { color: t.titleText }]}>Add a new pet</Text>

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Name *</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              placeholder="e.g. Buddy"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              editable={!isSavingPet}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Breed</Text>
            <TextInput
              value={formBreed}
              onChangeText={setFormBreed}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              placeholder="e.g. Labrador"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              editable={!isSavingPet}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Age</Text>
            <TextInput
              value={formAge}
              onChangeText={setFormAge}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              placeholder="e.g. 2 yrs"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              editable={!isSavingPet}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Height</Text>
            <TextInput
              value={formHeight}
              onChangeText={setFormHeight}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              placeholder="e.g. 55 cm"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              editable={!isSavingPet}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Weight</Text>
            <TextInput
              value={formWeight}
              onChangeText={setFormWeight}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              placeholder="e.g. 12 kg"
              placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
              editable={!isSavingPet}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Personality</Text>
            <View style={styles.personalityRow}>
              {Object.keys(PERSONALITY_COLORS).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.personalityOption,
                    formPersonality === p ? styles.personalityOptionActive : null,
                    { backgroundColor: t.modalBg }
                  ]}
                  onPress={() => setFormPersonality(p)}
                  disabled={isSavingPet}
                >
                  <View style={[styles.personalitySwatch, { backgroundColor: PERSONALITY_COLORS[p] }]} />
                  <Text style={[styles.personalityOptionText, { color: t.textPrimary }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]}
                onPress={() => setAddModalVisible(false)}
                disabled={isSavingPet}
              >
                <Text style={[styles.cancelText, { color: t.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: t.accent }, isSavingPet && { opacity: 0.6 }]}
                onPress={handleSavePet}
                disabled={isSavingPet}
              >
                {isSavingPet ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Add Pet</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F2",
  },
  header: {
    backgroundColor: "#FFF6EE",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E7CFC2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A3E36",
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fffaf6",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    shadowColor: "#E6CFC3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  petImageLeft: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  cardBodyHorizontal: {
    flex: 1,
    paddingVertical: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  personalityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
  },
  personalityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A3E36',
  },
  petName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#4A2F28",
  },
  petDetails: {
    fontSize: 14,
    color: "#8A6F64",
  },
  headerLeft: {
    padding: 6,
  },
  headerRight: {
    padding: 6,
  },
  headerIcon: {
    fontSize: 20,
    color: "#7A4B3A",
  },
  addText: {
    fontSize: 16,
    color: "#FF8A65",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "#FFF8F2",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#E6CFC3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#5A3E36",
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#6A4A40",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#5A3E36",
  },
  placeholderText: {
    fontSize: 14,
    color: "#8A6F64",
  },
  remindersContainer: {
    marginTop: 18,
    backgroundColor: '#FFF6F2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E3DF',
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A3E36',
    marginBottom: 8,
  },
  noRemindersText: {
    color: '#8A6F64',
    fontSize: 14,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E9E6',
  },
  reminderThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },
  reminderBody: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A2F28',
  },
  reminderPet: {
    fontSize: 12,
    color: '#8A6F64',
  },
  reminderDate: {
    fontSize: 12,
    color: '#6A4A40',
    marginLeft: 10,
  },
  addModalContainer: {
    position: 'absolute',
    top: 90,
    left: 18,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '75%',
    shadowColor: '#E6CFC3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: '#6A4A40',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EFE6E0',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  personalityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personalityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#FFF8F2',
  },
  personalityOptionActive: {
    borderWidth: 1,
    borderColor: '#E6CFC3',
    shadowColor: '#E6CFC3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  personalitySwatch: {
    width: 36,
    height: 18,
    borderRadius: 6,
    marginBottom: 6,
  },
  personalityOptionText: {
    fontSize: 12,
    color: '#5A3E36',
    fontWeight: '600',
  },
  imagePickerRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageThumbWrap: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageThumb: {
    width: 64,
    height: 64,
  },
  imageThumbActive: {
    borderWidth: 2,
    borderColor: '#FF8A65',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE6E0',
  },
  cancelText: {
    color: '#6A4A40',
    fontWeight: '700',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FF8A65',
    minWidth: 100,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  detailModalContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
  },
  detailImage: {
    width: '100%',
    height: 180,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8A6F64',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#4A2F28',
    fontWeight: '600',
  },
});
