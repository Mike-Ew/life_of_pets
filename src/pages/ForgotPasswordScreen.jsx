import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigate, Link } from 'react-router-native';
import { authAPI } from '../services/api';
import { styles } from './ScreenStyles';

const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setIsSubmitted(true);

      // In development mode, the API returns the token directly
      if (response.token) {
        setResetToken(response.token);
      }
    } catch (error) {
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToReset = () => {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  };

  if (isSubmitted) {
    return (
      <ImageBackground
        source={AUTH_BACKGROUND}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={[styles.contentBox, styles.formBox]}>
            <Text style={styles.formTitle}>Check Your Email</Text>

            <Text style={[styles.formLink, { marginTop: 8, marginBottom: 16, textAlign: 'center' }]}>
              If an account exists for {email}, you will receive a password reset link.
            </Text>

            {/* Development mode: show token and button */}
            {resetToken && (
              <>
                <Text style={[styles.label, { marginBottom: 8, color: '#666' }]}>
                  (Dev Mode) Your reset token:
                </Text>
                <Text style={[styles.label, { marginBottom: 16, fontSize: 10, color: '#999' }]} numberOfLines={1}>
                  {resetToken.substring(0, 20)}...
                </Text>
                <Pressable
                  style={[styles.btn, styles.btnPrimary, { width: '100%', marginBottom: 12 }]}
                  onPress={handleContinueToReset}
                >
                  <Text style={styles.btnPrimaryText}>Reset Password</Text>
                </Pressable>
              </>
            )}

            <Pressable
              style={[styles.btn, styles.btnSecondary, { width: '100%' }]}
              onPress={() => navigate('/login')}
            >
              <Text style={styles.btnSecondaryText}>Back to Login</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={[styles.contentBox, styles.formBox]}>
          <Text style={styles.formTitle}>Forgot Password</Text>

          <Text style={[styles.formLink, { marginTop: 8, marginBottom: 16 }]}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <Pressable
            style={[
              styles.btn,
              styles.btnPrimary,
              { width: '100%', marginTop: 16 },
              isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Send Reset Link</Text>
            )}
          </Pressable>

          <Text style={styles.formLink}>
            Remember your password?{' '}
            <Link to="/login">
              <Text style={styles.linkText}>Login</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

export default ForgotPasswordScreen;
