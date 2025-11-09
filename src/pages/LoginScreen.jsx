import React, { useState } from 'react';
// 1. Import ImageBackground
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ImageBackground // <-- Add this
} from 'react-native';
import { useNavigate, Link } from 'react-router-native';
import { styles } from './ScreenStyles';

// 2. Define the path to your background image
const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    // --- API CALL ---
    console.log('Logging in with:', email, password);
    onLogin();
    navigate('/dashboard');
  };

  return (
    // 3. Use ImageBackground instead of the main View
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      style={styles.background} // Use the style from ScreenStyles.js
    >
      {/* 4. Add the overlay for readability */}
      <View style={styles.overlay}>

        {/* This contentBox holds your form */}
        <View style={[styles.contentBox, styles.formBox]}>
          <Text style={styles.formTitle}>Login</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
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
              placeholder="Your password"
              placeholderTextColor="#999"
            />
          </View>

          <Pressable
            style={[styles.btn, styles.btnPrimary, { width: '100%', marginTop: 16 }]}
            onPress={handleSubmit}
          >
            <Text style={styles.btnPrimaryText}>Login</Text>
          </Pressable>

          <Text style={styles.formLink}>
            Need an account?{' '}
            <Link to="/signup">
              <Text style={styles.linkText}>Sign Up</Text>
            </Link>
          </Text>
        </View>

      </View>
    </ImageBackground>
  );
}

export default LoginScreen;