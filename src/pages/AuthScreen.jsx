import React from 'react';
// 1. Import ImageBackground
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-native';
import { styles } from './ScreenStyles'; 

// 2. Define the path to your background image
// (Assuming you named it 'auth_background.jpg' and put it in 'assets/Pet Pictures')
const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function AuthScreen() {
  const navigate = useNavigate();

  return (
    // 3. Use ImageBackground instead of the main View
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover" // This makes it fill the screen
      style={styles.background} // We will add this style
    >
      {/* 4. Add a semi-transparent overlay for better text readability */}
      <View style={styles.overlay}>
        
        {/* Your existing contentBox goes inside the overlay */}
        <View style={styles.contentBox}>
          <Text style={styles.title}>Welcome to my pet app</Text>
          <Text style={styles.subtitle}>Find playmates and manage your pet's life.</Text>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => navigate('/login')}
            >
              <Text style={styles.btnPrimaryText}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => navigate('/signup')}
            >
              <Text style={styles.btnSecondaryText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

export default AuthScreen;