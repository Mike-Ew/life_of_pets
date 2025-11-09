import React, { useState } from 'react';
// 1. Import ImageBackground
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  SafeAreaView, 
  ImageBackground // <-- Add this
} from 'react-native';
import { useNavigate, Link } from 'react-router-native';
import { styles } from './ScreenStyles';

// 2. Define the path to your background image
const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    // --- API CALL ---
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Signing up with:', email, password);
    navigate('/login');
  };

  return (
    // 3. Replace the main SafeAreaView with ImageBackground
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      style={styles.background} // Use the style from ScreenStyles.js
    >
      {/* 4. Add the overlay for readability */}
      <View style={styles.overlay}>
        
        {/* 5. Move SafeAreaView inside the overlay to protect content */}
        <SafeAreaView style={{ flex: 1 }}> 
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={[styles.contentBox, styles.formBox]}>
              <Text style={styles.formTitle}>Create Account</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@example.com"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Create a password"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                />
              </View>

              <Pressable
                style={[styles.btn, styles.btnPrimary, { width: '100%', marginTop: 16 }]}
                onPress={handleSubmit}
              >
                <Text style={styles.btnPrimaryText}>Sign Up</Text>
              </Pressable>

              <Text style={styles.formLink}>
                Already have an account?{' '}
                <Link to="/login">
                  <Text style={styles.linkText}>Login</Text>
                </Link>
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
        
      </View>
    </ImageBackground>
  );
}

export default SignUpScreen;