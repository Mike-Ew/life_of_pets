// src/App.jsx

import React from 'react';
import { NativeRouter, Routes, Route, Navigate } from 'react-router-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import your screen components
import AuthScreen from './src/pages/AuthScreen';
import LoginScreen from './src/pages/LoginScreen';
import SignUpScreen from './src/pages/SignUpScreen';
import Dashboard from './src/pages/Dashboard';

function AppNavigator() {
  const { isLoggedIn, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF8A65" />
      </View>
    );
  }

  return (
    <NativeRouter>
      <View style={styles.container}>
        <Routes>
          {/* Public Routes (if user is NOT logged in) */}
          {!isLoggedIn ? (
            <>
              <Route path="/" element={<AuthScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            /* Private Routes (if user IS logged in) */
            <>
              <Route
                path="/dashboard"
                element={<Dashboard onLogout={logout} />}
              />
              {/* All other app routes are now handled inside Dashboard.jsx */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </View>
    </NativeRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
  },
});

export default App;
