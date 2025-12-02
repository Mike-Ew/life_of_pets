import { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { styles } from './ScreenStyles';

const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={[styles.contentBox, styles.formBox]}>
          <Text style={styles.formTitle}>Login</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter your username"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <Link to="/forgot-password" style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Link>

          <Pressable
            style={[
              styles.btn,
              styles.btnPrimary,
              { width: '100%', marginTop: 8 },
              isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Login</Text>
            )}
          </Pressable>

          <Text style={[styles.formLink, { marginTop: 16 }]}>
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
