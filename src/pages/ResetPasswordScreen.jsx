import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigate, useLocation } from 'react-router-native';
import { authAPI } from '../services/api';
import { styles } from './ScreenStyles';

const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setIsVerifying(false);
      setIsTokenValid(false);
      return;
    }

    try {
      const response = await authAPI.verifyResetToken(token);
      setIsTokenValid(response.valid);
    } catch (error) {
      setIsTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!password || !password2) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }

    if (password !== password2) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password, password2);
      setIsSuccess(true);
    } catch (error) {
      const message = error.response?.data?.message ||
                      error.response?.data?.password?.[0] ||
                      'Failed to reset password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <ImageBackground
        source={AUTH_BACKGROUND}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={[styles.contentBox, styles.formBox, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#FF8A65" />
            <Text style={[styles.formLink, { marginTop: 16 }]}>Verifying reset token...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Invalid or missing token
  if (!isTokenValid) {
    return (
      <ImageBackground
        source={AUTH_BACKGROUND}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={[styles.contentBox, styles.formBox]}>
            <Text style={styles.formTitle}>Invalid Link</Text>

            <Text style={[styles.formLink, { marginTop: 8, marginBottom: 16, textAlign: 'center' }]}>
              This password reset link is invalid or has expired. Please request a new one.
            </Text>

            <Pressable
              style={[styles.btn, styles.btnPrimary, { width: '100%', marginBottom: 12 }]}
              onPress={() => navigate('/forgot-password')}
            >
              <Text style={styles.btnPrimaryText}>Request New Link</Text>
            </Pressable>

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

  // Success state
  if (isSuccess) {
    return (
      <ImageBackground
        source={AUTH_BACKGROUND}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={[styles.contentBox, styles.formBox]}>
            <Text style={styles.formTitle}>Password Reset!</Text>

            <Text style={[styles.formLink, { marginTop: 8, marginBottom: 16, textAlign: 'center' }]}>
              Your password has been successfully reset. You can now login with your new password.
            </Text>

            <Pressable
              style={[styles.btn, styles.btnPrimary, { width: '100%' }]}
              onPress={() => navigate('/login')}
            >
              <Text style={styles.btnPrimaryText}>Go to Login</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Reset password form
  return (
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={[styles.contentBox, styles.formBox]}>
          <Text style={styles.formTitle}>Reset Password</Text>

          <Text style={[styles.formLink, { marginTop: 8, marginBottom: 16 }]}>
            Enter your new password below.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry
              placeholder="Confirm new password"
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
              <Text style={styles.btnPrimaryText}>Reset Password</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

export default ResetPasswordScreen;
