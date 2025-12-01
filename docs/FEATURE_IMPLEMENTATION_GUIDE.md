# Feature Implementation Guide

This document provides a consolidated guide for implementing the new features requested for the Pet Care Mobile Application.

# Suggested Changes for Upcoming Reminders

Here are the suggested changes to add the "Upcoming Reminders" feature to your `Dashboard.jsx` file.

## 1. Add State for Reminders

In `Dashboard.jsx`, add a new state variable to hold the reminders.

```javascript
export default function Dashboard({ onLogout }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState("Dashboard");
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]); // Add this line
```

## 2. Create a Function to Load Reminders

Create a new function called `loadReminders` to populate the `reminders` state with mock data.

```javascript
  // Load pets on mount
  useEffect(() => {
    loadPets();
    loadReminders(); // Call the new function
  }, []);

  const loadReminders = () => {
    const mockReminders = [
      { id: 1, title: 'Vet Appointment', pet: 'Buddy', date: '2025-11-20T14:00:00', image: require('../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg') },
      { id: 2, title: 'Grooming', pet: 'Lucy', date: '2025-11-22T11:00:00', image: require('../../assets/Pet Pictures/david-lezcano-m-Doa-GTrUw-unsplash.jpg') },
      { id: 3, title: 'Feed Luna', pet: 'Luna', date: '2025-11-19T18:00:00', image: require('../../assets/Pet Pictures/IMG_3229.jpeg') },
    ];
    setReminders(mockReminders);
  };
```

## 3. Render the Reminders

In the `return` statement of the `Dashboard` component, add the JSX to render the reminders. This should go inside the `selectedScreen === "Dashboard"` block, right before the `<FlatList>` component.

```javascript
      {selectedScreen === "Dashboard" ? (
        <>
          {/* Add this entire block for reminders */}
          <View style={styles.remindersContainer}>
            <Text style={styles.remindersTitle}>Upcoming Reminders</Text>
            {reminders.length > 0 ? (
              reminders.map((reminder, index) => (
                <View key={reminder.id} style={[styles.reminderItem, index === reminders.length - 1 && { borderBottomWidth: 0 }]}>
                  <Image source={reminder.image} style={styles.reminderThumb} />
                  <View style={styles.reminderBody}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderPet}>{reminder.pet}</Text>
                  </View>
                  <Text style={styles.reminderDate}>{new Date(reminder.date).toLocaleDateString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noRemindersText}>No upcoming reminders.</Text>
            )}
          </View>

          <FlatList
            data={pets}
            // ... (rest of the FlatList props)
          />
        </>
      ) : // ... (rest of the component)
```

## 4. Add New Styles

Finally, add the following styles to your `StyleSheet.create` object at the bottom of `Dashboard.jsx`.

```javascript
// ... (existing styles)
  placeholderText: {
    fontSize: 14,
    color: "#8A6F64",
  },
  // Add these new styles for the reminders section
  remindersContainer: {
    marginTop: 18,
    backgroundColor: '#FFF6F2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E3DF',
    marginHorizontal: 12,
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
// ... (rest of the styles)
```

# Suggested Changes for Adding Pet Pictures

Here are the suggested changes to add the "Add Pet Pictures" feature.

## 1. Install `expo-image-picker`

First, you need to install the `expo-image-picker` library. Open your terminal in the project root and run the following command:

```bash
npx expo install expo-image-picker
```

This command will install the library and link it to your project.

## 2. Import `ImagePicker` in `Dashboard.jsx`

In `Dashboard.jsx`, import the `ImagePicker` library at the top of the file.

```javascript
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  // ... other imports
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from 'expo-image-picker'; // Add this line
import PetCard from '../components/PetCard';
// ... rest of the imports
```

## 3. Add State for Pet Image

In the `Dashboard` component, add a new state variable to hold the selected image URI.

```javascript
  // Add Pet modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formBreed, setFormBreed] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formPersonality, setFormPersonality] = useState("calm");
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState(null); // Add this line
  const [isSavingPet, setIsSavingPet] = useState(false);
```

## 4. Add Image Picker Function

Create a new function `handleChoosePhoto` to open the image library and let the user select a photo.

```javascript
  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormImage(result.assets[0].uri);
    }
  };
```

## 5. Add Image Picker UI to the "Add Pet" Modal

In the "Add Pet" modal, add a button to trigger the `handleChoosePhoto` function and a preview of the selected image.

```javascript
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Personality</Text>
            {/* ... personality row ... */}

            {/* Add this block for the image picker */}
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Photo</Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: '#ddd', marginTop: 8 }]}
                onPress={handleChoosePhoto}
              >
                <Text style={{ color: '#333', fontWeight: '700' }}>Choose Photo</Text>
              </TouchableOpacity>
              {formImage && (
                <Image source={{ uri: formImage }} style={{ width: 100, height: 100, borderRadius: 8, marginTop: 8 }} />
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              {/* ... cancel and add pet buttons ... */}
            </View>
```

## 6. Update `handleSavePet`

Modify the `handleSavePet` function to include the `formImage` when creating a new pet. For now, we'll just add it to the pet object. In a real application, you would upload the image to a server and store the URL.

```javascript
  const handleSavePet = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Please enter a pet name');
      return;
    }

    try {
      setIsSavingPet(true);
      const newPetData = {
        name: formName.trim(),
        breed: formBreed.trim(),
        age: formAge.trim(),
        height: formHeight.trim(),
        weight: formWeight.trim(),
        personality: formPersonality,
        description: formDescription.trim(),
      };

      // In a real app, you would upload the image here
      // For now, we just add the local URI to the object
      if (formImage) {
        newPetData.image = { uri: formImage };
      }

      const newPet = await petsAPI.create(newPetData);

      // Add default image for display if no image was selected
      const petWithImage = {
        ...newPet,
        image: formImage ? { uri: formImage } : DEFAULT_IMAGES[pets.length % DEFAULT_IMAGES.length]
      };

      setPets([petWithImage, ...pets]);
      setAddModalVisible(false);
      setFormImage(null); // Reset the image form state
      Alert.alert('Success', 'Pet added successfully!');
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'Failed to add pet. Please try again.');
    } finally {
      setIsSavingPet(false);
    }
  };
```

## 7. Reset Image Form State

In the `onAddPet` function, reset the `formImage` state.

```javascript
  const onAddPet = () => {
    // Reset form
    setFormName("");
    setFormBreed("");
    setFormAge("");
    setFormPersonality("calm");
    setFormHeight("");
    setFormWeight("");
    setFormDescription("");
    setFormImage(null); // Add this line
    setAddModalVisible(true);
  };
```

# Suggested Changes for Playmate Feature

Here are the suggested changes to add the "Playmate" feature to your app. This is the first part of a larger feature, and it focuses on setting up the screen and displaying a list of all pets.

## 1. Create a "Playmates" Screen

First, create a new file `src/pages/PlaymatesScreen.jsx` and add the following code. This will create a new screen that fetches and displays a list of all pets.

```javascript
// src/pages/PlaymatesScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { petsAPI } from '../services/api';
import { THEMES } from './Dashboard'; // Assuming THEMES is exported from Dashboard.jsx

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

export default function PlaymatesScreen({ t = THEMES.light }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const data = await petsAPI.getAll();
        const petsWithImages = data.map((pet, index) => ({
          ...pet,
          image: pet.photos?.length > 0 ? { uri: pet.photos[0].image } : DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
        }));
        setPets(petsWithImages);
      } catch (error) {
        console.error('Error loading pets for playmates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ color: t.textSecondary, marginTop: 10 }}>Finding new friends...</Text>
      </View>
    );
  }

  const renderPetCard = ({ item }) => (
    <View style={[styles.petCard, { backgroundColor: t.cardBg, shadowColor: t.cardShadow }]}>
      <Image source={item.image} style={styles.petImage} />
      <Text style={[styles.petName, { color: t.textPrimary }]}>{item.name}</Text>
      <Text style={[styles.petBreed, { color: t.textSecondary }]}>{item.breed}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <Text style={[styles.header, { color: t.titleText }]}>Find Playmates</Text>
      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    justifyContent: 'space-between',
  },
  petCard: {
    width: '48%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
  },
  petBreed: {
    fontSize: 13,
  },
});
```

## 2. Add "Playmates" to the Main Menu

In `Dashboard.jsx`, add "Playmates" to the `SCREENS` array.

```javascript
  const SCREENS = [
    "Dashboard",
    "Activity Monitor",
    "Health & Feeding",
    "Expenses",
    "Playmates", // Add this line
    "Settings",
  ];
```

## 3. Render the "Playmates" Screen

In `Dashboard.jsx`, import the new `PlaymatesScreen` and add a case for it in the main view.

```javascript
// ... other imports
import Expenses from '../components/Expenses';
import PlaymatesScreen from './PlaymatesScreen'; // Add this line
import { petsAPI, eventsAPI } from '../services/api';
// ...

// ... inside the Dashboard component's return statement

      ) : selectedScreen === 'Expenses' ? (
        <Expenses t={t} />
      ) : selectedScreen === 'Playmates' ? ( // Add this block
        <PlaymatesScreen t={t} />
      ) : selectedScreen === 'Settings' ? (
        // ... settings screen
```

## 4. Export THEMES from Dashboard.jsx

To make the theme available to other components, you need to export the `THEMES` constant from `Dashboard.jsx`.

```javascript
// ...
  }
};

export const THEMES = { // Add export here
  light: {
// ...
```

# Suggested Changes for Editing Pet Details

Here are the suggested changes to add the "Edit Pet" feature to your dashboard.

## 1. Add an "Edit" button to the Pet Detail Modal

In `Dashboard.jsx`, find the "Pet Detail Modal" and add an "Edit" button next to the "Delete" button. This button will open the edit modal.

```javascript
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }]}
                    onPress={() => handleDeletePet(selectedPet)}
                  >
                    <Text style={[styles.cancelText, { color: '#FFF' }]}>Delete</Text>
                  </TouchableOpacity>

                  {/* Add this Edit Button */}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: t.accent }]}
                    onPress={() => {
                      setPetDetailVisible(false);
                      onEditPet(selectedPet);
                    }}
                  >
                    <Text style={styles.submitText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: t.inputBg, borderColor: t.cardShadow }]}
                    onPress={() => setPetDetailVisible(false)}
                  >
                    <Text style={[styles.cancelText, { color: t.textPrimary }]}>Close</Text>
                  </TouchableOpacity>
                </View>
```

## 2. Add State for the Edit Modal

In `Dashboard.jsx`, add state to manage the visibility of the "Edit Pet" modal and to hold the pet being edited.

```javascript
  // ... existing state
  const [isSavingPet, setIsSavingPet] = useState(false);

  // Pet detail modal state
  const [petDetailVisible, setPetDetailVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Edit Pet modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
```

## 3. Create Functions to Handle Editing

Create two new functions: `onEditPet` to open the modal and pre-fill the form, and `handleUpdatePet` to save the changes.

```javascript
  const onEditPet = (pet) => {
    setEditingPet(pet);
    setFormName(pet.name);
    setFormBreed(pet.breed);
    setFormAge(String(pet.age));
    setFormPersonality(pet.personality);
    setFormHeight(String(pet.height));
    setFormWeight(String(pet.weight));
    setFormDescription(pet.description);
    setEditModalVisible(true);
  };

  const handleUpdatePet = async () => {
    if (!editingPet) return;

    try {
      setIsSavingPet(true);
      const updatedPetData = {
        name: formName.trim(),
        breed: formBreed.trim(),
        age: formAge.trim(),
        height: formHeight.trim(),
        weight: formWeight.trim(),
        personality: formPersonality,
        description: formDescription.trim(),
      };

      const updatedPet = await petsAPI.update(editingPet.id, updatedPetData);

      setPets(pets.map(p => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p)));
      setEditModalVisible(false);
      setEditingPet(null);
      Alert.alert('Success', 'Pet details updated successfully!');
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet. Please try again.');
    } finally {
      setIsSavingPet(false);
    }
  };
```

## 4. Create the "Edit Pet" Modal

In `Dashboard.jsx`, add a new `Modal` component for editing a pet. This will be very similar to the "Add Pet" modal.

```javascript
      {/* ... Pet Detail Modal ... */}

      {/* Edit Pet Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.addModalContainer, { backgroundColor: t.inputBg, shadowColor: t.cardShadow }]}>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            <Text style={[styles.menuTitle, { color: t.titleText }]}>Edit {editingPet?.name}</Text>

            {/* Form fields are the same as the "Add Pet" modal */}
            {/* Name */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Name *</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              editable={!isSavingPet}
            />

            {/* Breed */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Breed</Text>
            <TextInput
              value={formBreed}
              onChangeText={setFormBreed}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              editable={!isSavingPet}
            />

            {/* Age */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Age</Text>
            <TextInput
              value={formAge}
              onChangeText={setFormAge}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              editable={!isSavingPet}
            />

            {/* Height */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Height</Text>
            <TextInput
              value={formHeight}
              onChangeText={setFormHeight}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              editable={!isSavingPet}
            />

            {/* Weight */}
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Weight</Text>
            <TextInput
              value={formWeight}
              onChangeText={setFormWeight}
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: theme === 'dark' ? '#333' : '#EFE6E0', color: t.textPrimary }]}
              editable={!isSavingPet}
            />

            {/* Personality */}
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
                onPress={() => setEditModalVisible(false)}
                disabled={isSavingPet}
              >
                <Text style={[styles.cancelText, { color: t.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: t.accent }, isSavingPet && { opacity: 0.6 }]}
                onPress={handleUpdatePet}
                disabled={isSavingPet}
              >
                {isSavingPet ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ... Add Pet Modal ... */}
```

## 5. Update the `petsAPI` service

In `src/services/api.js`, add a new `update` function to the `petsAPI` object.

```javascript
// ... in src/services/api.js

export const petsAPI = {
  getAll: async () => { /* ... */ },
  create: async (petData) => { /* ... */ },
  delete: async (petId) => { /* ... */ },

  // Add this update function
  update: async (petId, petData) => {
    try {
      const token = await getToken();
      const response = await api.put(`/pets/${petId}/`, petData, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating pet ${petId}:`, error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to update pet');
    }
  },
};
```