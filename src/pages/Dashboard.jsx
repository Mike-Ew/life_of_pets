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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import PetCard from '../components/PetCard';
import MenuModal from '../components/MenuModal';
import ActivityMonitor from '../components/ActivityMonitor';
import HealthFeeding from '../components/HealthFeeding';
import Expenses from '../components/Expenses';
import DiscoveryScreen from '../components/DiscoveryScreen';
import SettingsScreen from '../components/SettingsScreen';
import RemindersScreen from '../components/RemindersScreen';
import { petsAPI, eventsAPI } from '../services/api';

// Fallback images for pets without photos
const DEFAULT_IMAGES = [
  require("../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg"),
  require("../../assets/Pet Pictures/david-lezcano-m-Doa-GTrUw-unsplash.jpg"),
  require("../../assets/Pet Pictures/IMG_3229.jpeg"),
  require("../../assets/Pet Pictures/richard-brutyo-Sg3XwuEpybU-unsplash.jpg"),
  require("../../assets/Pet Pictures/alvan-nee-1VgfQdCuX-4-unsplash.jpg"),
  require("../../assets/Pet Pictures/alvan-nee-T-0EW-SEbsE-unsplash.jpg"), 
  require("../../assets/Pet Pictures/IMG_3356.jpeg"),
  require("../../assets/Pet Pictures/IMG_3077.jpeg"),
];

const PERSONALITY_COLORS = {
  calm: "#C7E7DB",
  playful: "#FFE1B5",
  curious: "#F7D6E0",
  gentle: "#E0E0E0",
  energetic: "#FFD3D3",
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

  // Add Pet modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBreed, setFormBreed] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formPersonality, setFormPersonality] = useState("calm");
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [isSavingPet, setIsSavingPet] = useState(false);

  // Pet detail modal state
  const [petDetailVisible, setPetDetailVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [theme, setTheme] = useState('light');
  const t = THEMES[theme];

  // Discovery state
  const [selectedDiscoveryPetId, setSelectedDiscoveryPetId] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPersonalityFilter, setSelectedPersonalityFilter] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name'

  const SCREENS = [
    "Dashboard",
    "Discover",
    "Reminders",
    "Activity Monitor",
    "Health & Feeding",
    "Expenses",
    "Settings",
  ];

  // Filter and sort pets
  const getFilteredPets = () => {
    let filtered = [...pets];

    // Search by name or breed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        pet =>
          pet.name.toLowerCase().includes(query) ||
          (pet.breed && pet.breed.toLowerCase().includes(query))
      );
    }

    // Filter by personality
    if (selectedPersonalityFilter) {
      filtered = filtered.filter(pet => pet.personality === selectedPersonalityFilter);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return filtered;
  };

  const filteredPets = getFilteredPets();
  const hasActiveFilters = searchQuery || selectedPersonalityFilter || sortBy !== 'newest';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPersonalityFilter(null);
    setSortBy('newest');
  };

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
    setFormImage(null);
    setAddModalVisible(true);
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add pet photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take pet photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormImage(result.assets[0].uri);
    }
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

      // Upload photo if one was selected
      let imageSource;
      if (formImage) {
        try {
          await petsAPI.uploadPhoto(newPet.id, formImage);
          imageSource = { uri: formImage };
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          // Continue without photo, use default
          imageSource = DEFAULT_IMAGES[pets.length % DEFAULT_IMAGES.length];
        }
      } else {
        imageSource = DEFAULT_IMAGES[pets.length % DEFAULT_IMAGES.length];
      }

      const petWithImage = {
        ...newPet,
        image: imageSource
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
        <View style={{ flex: 1 }}>
          {/* Search and Filter Bar */}
          <View style={[styles.searchContainer, { backgroundColor: t.background }]}>
            <View style={[styles.searchInputWrapper, { backgroundColor: t.cardBg, borderColor: t.cardShadow }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: t.textPrimary }]}
                placeholder="Search by name or breed..."
                placeholderTextColor={t.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={[styles.clearSearchIcon, { color: t.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: t.cardBg, borderColor: hasActiveFilters ? t.accent : t.cardShadow }]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={[styles.filterIcon, hasActiveFilters && { color: t.accent }]}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <View style={[styles.activeFiltersRow, { backgroundColor: t.background }]}>
              {selectedPersonalityFilter && (
                <View style={[styles.filterChip, { backgroundColor: PERSONALITY_COLORS[selectedPersonalityFilter] }]}>
                  <Text style={styles.filterChipText}>
                    {selectedPersonalityFilter.charAt(0).toUpperCase() + selectedPersonalityFilter.slice(1)}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedPersonalityFilter(null)}>
                    <Text style={styles.filterChipClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              {sortBy !== 'newest' && (
                <View style={[styles.filterChip, { backgroundColor: t.cardBg }]}>
                  <Text style={[styles.filterChipText, { color: t.textPrimary }]}>
                    Sort: {sortBy === 'name' ? 'A-Z' : 'Oldest'}
                  </Text>
                  <TouchableOpacity onPress={() => setSortBy('newest')}>
                    <Text style={[styles.filterChipClose, { color: t.textPrimary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearAllText, { color: t.accent }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results Count */}
          {pets.length > 0 && (
            <Text style={[styles.resultsCount, { color: t.textSecondary }]}>
              {filteredPets.length} of {pets.length} pets
            </Text>
          )}

          <FlatList
            data={filteredPets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPet}
            contentContainerStyle={filteredPets.length === 0 ? { flex: 1 } : styles.list}
            numColumns={NUM_COLUMNS}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              pets.length === 0 ? EmptyState : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
                  <Text style={[styles.placeholderTitle, { color: t.titleText }]}>No Results</Text>
                  <Text style={[styles.placeholderText, { color: t.textSecondary, textAlign: 'center' }]}>
                    No pets match your search. Try different filters.
                  </Text>
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: t.accent, marginTop: 16 }]}
                    onPress={clearFilters}
                  >
                    <Text style={styles.submitText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        </View>
      ) : selectedScreen === 'Discover' ? (
        <DiscoveryScreen
          pets={pets}
          selectedPetId={selectedDiscoveryPetId || (pets.length > 0 ? pets[0].id : null)}
          t={t}
          onBack={() => setSelectedScreen('Dashboard')}
        />
      ) : selectedScreen === 'Reminders' ? (
        <RemindersScreen pets={pets} t={t} />
      ) : selectedScreen === 'Activity Monitor' ? (
        <ActivityMonitor pets={pets} t={t} />
      ) : selectedScreen === 'Health & Feeding' ? (
        <HealthFeeding pets={pets} t={t} />
      ) : selectedScreen === 'Expenses' ? (
        <Expenses t={t} />
      ) : selectedScreen === 'Settings' ? (
        <SettingsScreen
          t={t}
          theme={theme}
          setTheme={setTheme}
          onLogout={onLogout}
        />
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

            <Text style={[styles.inputLabel, { color: t.textSecondary, marginTop: 12 }]}>Photo</Text>
            <View style={styles.photoPickerContainer}>
              {formImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: formImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormImage(null)}
                    disabled={isSavingPet}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity
                    style={[styles.photoButton, { backgroundColor: t.modalBg, borderColor: t.cardShadow }]}
                    onPress={pickImage}
                    disabled={isSavingPet}
                  >
                    <Text style={styles.photoButtonIcon}>🖼️</Text>
                    <Text style={[styles.photoButtonText, { color: t.textPrimary }]}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoButton, { backgroundColor: t.modalBg, borderColor: t.cardShadow }]}
                    onPress={takePhoto}
                    disabled={isSavingPet}
                  >
                    <Text style={styles.photoButtonIcon}>📷</Text>
                    <Text style={[styles.photoButtonText, { color: t.textPrimary }]}>Camera</Text>
                  </TouchableOpacity>
                </View>
              )}
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

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.filterModalContainer, { backgroundColor: t.modalBg, shadowColor: t.cardShadow }]}>
          <Text style={[styles.menuTitle, { color: t.titleText }]}>Filter & Sort</Text>

          {/* Personality Filter */}
          <Text style={[styles.inputLabel, { color: t.textSecondary, marginTop: 16 }]}>Personality</Text>
          <View style={styles.filterPersonalityGrid}>
            <TouchableOpacity
              style={[
                styles.filterPersonalityOption,
                !selectedPersonalityFilter && styles.filterPersonalityOptionActive,
                { backgroundColor: t.cardBg }
              ]}
              onPress={() => setSelectedPersonalityFilter(null)}
            >
              <Text style={[styles.filterPersonalityText, { color: t.textPrimary }]}>All</Text>
            </TouchableOpacity>
            {Object.keys(PERSONALITY_COLORS).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.filterPersonalityOption,
                  selectedPersonalityFilter === p && styles.filterPersonalityOptionActive,
                  { backgroundColor: PERSONALITY_COLORS[p] }
                ]}
                onPress={() => setSelectedPersonalityFilter(p)}
              >
                <Text style={styles.filterPersonalityText}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort Options */}
          <Text style={[styles.inputLabel, { color: t.textSecondary, marginTop: 20 }]}>Sort By</Text>
          <View style={styles.sortOptionsContainer}>
            {[
              { key: 'newest', label: 'Newest First' },
              { key: 'oldest', label: 'Oldest First' },
              { key: 'name', label: 'Name (A-Z)' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && [styles.sortOptionActive, { borderColor: t.accent }],
                  { backgroundColor: t.cardBg }
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Text style={[
                  styles.sortOptionText,
                  { color: sortBy === option.key ? t.accent : t.textPrimary }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]}
              onPress={clearFilters}
            >
              <Text style={[styles.cancelText, { color: t.textPrimary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: t.accent }]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.submitText}>Apply</Text>
            </TouchableOpacity>
          </View>
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
  photoPickerContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  photoButtonIcon: {
    fontSize: 20,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  clearSearchIcon: {
    fontSize: 16,
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A3E36',
  },
  filterChipClose: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A3E36',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterModalContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  filterPersonalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterPersonalityOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterPersonalityOptionActive: {
    borderColor: '#5A3E36',
  },
  filterPersonalityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A3E36',
  },
  sortOptionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    borderWidth: 2,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});
