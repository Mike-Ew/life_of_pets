import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { petAPI } from "../services/api";

export default function AddEditPetScreen({ route, navigation }) {
  const { petId } = route.params || {};
  const isEditing = !!petId;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPet();
    }
  }, [petId]);

  const loadPet = async () => {
    try {
      setLoading(true);
      const pet = await petAPI.getById(petId);
      setName(pet.name);
      setAge(pet.age.toString());
      setBreed(pet.breed);
      setDescription(pet.description || "");
      setSelectedTags(pet.temperament_tags || []);
    } catch (error) {
      console.error('Error loading pet:', error);
      Alert.alert('Error', 'Failed to load pet details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const availableTags = [
    "friendly",
    "energetic",
    "playful",
    "calm",
    "affectionate",
    "independent",
    "loyal",
    "intelligent",
    "gentle",
    "protective",
    "social",
    "shy",
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a pet name");
      return;
    }

    if (!breed.trim()) {
      Alert.alert("Error", "Please enter a breed");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      Alert.alert("Error", "Please enter a valid age");
      return;
    }

    try {
      setSaving(true);
      const petData = {
        name: name.trim(),
        age: ageNum,
        breed: breed.trim(),
        description: description.trim() || null,
        temperament_tags: selectedTags,
      };

      if (isEditing) {
        await petAPI.update(petId, petData);
      } else {
        await petAPI.create(petData);
      }

      Alert.alert(
        "Success",
        `Pet ${isEditing ? "updated" : "created"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to save pet. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Base Information</Text>

        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Max"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="Age in years"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Golden Retriever"
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your pet..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temperament</Text>
        <Text style={styles.helperText}>
          Select all tags that describe your pet
        </Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                selectedTags.includes(tag) && styles.tagChipSelected,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagChipText,
                  selectedTags.includes(tag) && styles.tagChipTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>+ Upload Photos</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          You can add photos after creating the pet profile
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? "Update Pet" : "Create Pet"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1976d2",
    backgroundColor: "#fff",
  },
  tagChipSelected: {
    backgroundColor: "#1976d2",
  },
  tagChipText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
  tagChipTextSelected: {
    color: "#fff",
  },
  uploadButton: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1976d2",
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  uploadButtonText: {
    color: "#1976d2",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#1976d2",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 20,
  },
});
