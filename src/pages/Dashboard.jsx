import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useNavigate } from 'react-router-native';
import { styles } from './ScreenStyles'; // Assuming ScreenStyles has styles for petGrid, petCard, etc.

// --- CHANGED HERE ---
// 1. We now use require() to load local images.
// The path must be static (it can't be a variable).
// The path is relative from this file (src/pages/Dashboard.jsx)
const mockPets = [
  { 
    id: 1, 
    name: 'Buddy', 
    photo: require('../../assets/Pet Pictures/IMG_3233.jpeg') 
  },
  { 
    id: 2, 
    name: 'Lucy', 
    photo: require('../../assets/Pet Pictures/IMG_3286.jpeg') 
  },
  {
    id: 3,
    name: 'Max',
    photo: require('../../assets/Pet Pictures/IMG_0131.jpeg')
  }
];

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Your Pets</Text>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onLogout}>
            <Text style={styles.btnSecondaryText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.petGrid}>
          {mockPets.map((pet) => (
            <Pressable
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigate(`/pet/${pet.id}`)}
            >
              {/* --- CHANGED HERE --- */}
              {/* 2. The source prop now takes the require() result directly */}
              <Image source={pet.photo} style={styles.petImage} />
              
              <Text style={styles.petName}>{pet.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* This is the '+' button (FAB) */}
      <Pressable style={styles.fab} onPress={() => navigate('/log-activity')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default Dashboard;