// src/App.jsx

import React, { useState } from 'react';
import { NativeRouter, Routes, Route, Navigate } from 'react-router-native';
import { View, StyleSheet } from 'react-native';

// Import your screen components
import AuthScreen from './src/pages/AuthScreen';
import LoginScreen from './src/pages/LoginScreen';
import SignUpScreen from './src/pages/SignUpScreen';
import Dashboard from './src/pages/Dashboard';
import PetProfile from './src/pages/PetProfile';
import LogActivityScreen from './src/pages/LogActivityScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // API call would go here
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <NativeRouter>
      <View style={styles.container}>
        <Routes>
          {/* Public Routes (if user is NOT logged in) */}
          {!isLoggedIn ? (
            <>
              <Route path="/" element={<AuthScreen />} />
              <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            /* Private Routes (if user IS logged in) */
            <>
              <Route
                path="/dashboard"
                element={<Dashboard onLogout={handleLogout} />}
              />
              <Route path="/pet/:id" element={<PetProfile />} />
              <Route path="/log-activity" element={<LogActivityScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </View>
    </NativeRouter>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;