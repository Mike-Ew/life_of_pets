// src/screens/LogActivityScreen.jsx

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, SafeAreaView } from 'react-native';
import { useNavigate } from 'react-router-native';
import { styles } from './ScreenStyles';

function LogActivityScreen() {
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  const handleSave = () => {
    // --- API CALL ---
    // Here you would send the activity data to your backend
    console.log('Saving activity:', { activity, notes });
    
    // After saving, go back to the dashboard
    navigate('/dashboard');
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={[styles.contentBox, styles.formBox]}>
        <Text style={styles.formTitle}>Log Activity</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Activity Type</Text>
          <TextInput
            style={styles.input}
            value={activity}
            onChangeText={setActivity}
            placeholder="e.g., Walk, Feed, Vet Visit"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 100 }]} // Make notes taller
            value={notes}
            onChangeText={setNotes}
            placeholder="Any extra details..."
            multiline={true}
            textAlignVertical="top" // For Android
          />
        </View>

        <View style={[styles.buttonGroup, { marginTop: 16 }]}>
          <Pressable
            style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
            onPress={() => navigate('/dashboard')}
          >
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
            onPress={handleSave}
          >
            <Text style={styles.btnPrimaryText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LogActivityScreen;