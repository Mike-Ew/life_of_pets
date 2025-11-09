// src/screens/PetProfile.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useParams, useNavigate } from 'react-router-native';
import { styles } from './ScreenStyles';

function PetProfile() {
  // Get the ':id' from the URL (e.g., /pet/1)
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Mock Data Fetching ---
  // In a real app, you'd fetch data based on the 'id'
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // You would replace this with:
      // const petData = await api.getPetById(id);
      const petData = { 
        id: id, 
        name: id === '1' ? 'Buddy' : 'Lucy', 
        age: id === '1' ? 3 : 2,
        breed: id === '1' ? 'Golden Retriever' : 'Tabby Cat',
        photo: `https://placehold.co/300x300/${id === '1' ? '6495ED' : 'FFB6C1'}/white?text=${id === '1' ? 'Buddy' : 'Lucy'}`
      };
      setPet(petData);
      setLoading(false);
    }, 500);
  }, [id]);
  // --- End Mock Data ---

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <ActivityIndicator size="large" color="#6495ED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView>
        <View style={styles.contentBox}>
          <Image 
            source={{ uri: pet.photo }} 
            style={localStyles.profileImage}
          />
          <Text style={localStyles.petName}>{pet.name}</Text>
          
          <View style={localStyles.detailRow}>
            <Text style={localStyles.detailLabel}>Breed:</Text>
            <Text style={localStyles.detailValue}>{pet.breed}</Text>
          </View>
          <View style={localStyles.detailRow}>
            <Text style={localStyles.detailLabel}>Age:</Text>
            <Text style={localStyles.detailValue}>{pet.age} years old</Text>
          </View>

          {/* Add more profile details here */}
          
          <Pressable
            style={[styles.btn, styles.btnSecondary, { marginTop: 24 }]}
            onPress={() => navigate('/dashboard')}
          >
            <Text style={styles.btnSecondaryText}>Back to Dashboard</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// You can add component-specific styles here
const localStyles = StyleSheet.create({
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#6495ED',
  },
  petName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize: 18,
    color: '#333',
  }
});

export default PetProfile;