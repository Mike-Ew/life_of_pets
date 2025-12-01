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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useAuth } from '../contexts/AuthContext';
import { styles } from './ScreenStyles';

// Ensure web browser closes properly after auth
WebBrowser.maybeCompleteAuthSession();

const AUTH_BACKGROUND = require('../../assets/Pet Pictures/auth_background.jpg');

// OAuth Client IDs - Replace with your actual credentials
// To set up Google OAuth: https://console.cloud.google.com/
// To set up Facebook OAuth: https://developers.facebook.com/
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(null);
  const navigate = useNavigate();
  const { login, googleLogin, facebookLogin } = useAuth();

  // Google Auth setup
  const [, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  // Facebook Auth setup
  const [, facebookResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });

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

  const handleGoogleLogin = async () => {
    try {
      setIsSocialLoading('google');
      const result = await promptGoogleAsync();

      if (result?.type === 'success') {
        const { id_token } = result.params;
        const loginResult = await googleLogin(id_token);

        if (loginResult.success) {
          navigate('/dashboard');
        } else {
          Alert.alert('Google Login Failed', loginResult.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsSocialLoading('facebook');
      const result = await promptFacebookAsync();

      if (result?.type === 'success') {
        const { access_token } = result.params;
        const loginResult = await facebookLogin(access_token);

        if (loginResult.success) {
          navigate('/dashboard');
        } else {
          Alert.alert('Facebook Login Failed', loginResult.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Facebook login failed. Please try again.');
    } finally {
      setIsSocialLoading(null);
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

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <Pressable
              style={[
                styles.socialButton,
                styles.googleButton,
                isSocialLoading === 'google' && { opacity: 0.6 }
              ]}
              onPress={handleGoogleLogin}
              disabled={isLoading || isSocialLoading !== null}
            >
              {isSocialLoading === 'google' ? (
                <ActivityIndicator color="#333" />
              ) : (
                <>
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.socialButton,
                styles.facebookButton,
                isSocialLoading === 'facebook' && { opacity: 0.6 }
              ]}
              onPress={handleFacebookLogin}
              disabled={isLoading || isSocialLoading !== null}
            >
              {isSocialLoading === 'facebook' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={[styles.socialIcon, { color: '#fff' }]}>f</Text>
                  <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
                    Continue with Facebook
                  </Text>
                </>
              )}
            </Pressable>
          </View>

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
