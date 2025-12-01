import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ t, theme, setTheme, onLogout }) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editPhone, setEditPhone] = useState(user?.phone_number || '');
  const [profileImage, setProfileImage] = useState(user?.profile_picture || null);

  // Notification preferences
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUser({
        username: editUsername.trim(),
        email: editEmail.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        phone_number: editPhone.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(user?.username || '');
    setEditEmail(user?.email || '');
    setEditBio(user?.bio || '');
    setEditLocation(user?.location || '');
    setEditPhone(user?.phone_number || '');
    setProfileImage(user?.profile_picture || null);
    setIsEditing(false);
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Section */}
      <View style={[styles.section, { backgroundColor: t.cardBg }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.titleText }]}>Profile</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editButton, { color: t.accent }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <TouchableOpacity
            onPress={isEditing ? handlePickImage : undefined}
            style={styles.profilePictureWrapper}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={[styles.profilePicturePlaceholder, { backgroundColor: t.accent }]}>
                <Text style={styles.profilePictureInitial}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={[styles.editBadge, { backgroundColor: t.accent }]}>
                <Text style={styles.editBadgeText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Username *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Username"
              placeholderTextColor={t.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              placeholderTextColor={t.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={t.textSecondary}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="City, Country"
              placeholderTextColor={t.textSecondary}
            />

            <Text style={[styles.inputLabel, { color: t.textSecondary }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBg, borderColor: t.cardShadow, color: t.textPrimary }]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone number"
              placeholderTextColor={t.textSecondary}
              keyboardType="phone-pad"
            />

            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: t.cardShadow }]}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={[styles.cancelBtnText, { color: t.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: t.accent }, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: t.textPrimary }]}>{user?.username}</Text>
            {user?.email && (
              <Text style={[styles.profileDetail, { color: t.textSecondary }]}>{user.email}</Text>
            )}
            {user?.bio && (
              <Text style={[styles.profileBio, { color: t.textPrimary }]}>{user.bio}</Text>
            )}
            {user?.location && (
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileIcon}>📍</Text>
                <Text style={[styles.profileDetail, { color: t.textSecondary }]}>{user.location}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: t.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: t.titleText }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <Text style={[styles.settingLabel, { color: t.textPrimary }]}>Dark Mode</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, { backgroundColor: t.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: t.titleText }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💕</Text>
            <Text style={[styles.settingLabel, { color: t.textPrimary }]}>New Matches</Text>
          </View>
          <Switch
            value={notifyMatches}
            onValueChange={setNotifyMatches}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💬</Text>
            <Text style={[styles.settingLabel, { color: t.textPrimary }]}>Messages</Text>
          </View>
          <Switch
            value={notifyMessages}
            onValueChange={setNotifyMessages}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={[styles.settingLabel, { color: t.textPrimary }]}>Pet Reminders</Text>
          </View>
          <Switch
            value={notifyReminders}
            onValueChange={setNotifyReminders}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={[styles.section, { backgroundColor: t.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: t.titleText }]}>Privacy</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>👁️</Text>
            <View>
              <Text style={[styles.settingLabel, { color: t.textPrimary }]}>Profile Visible</Text>
              <Text style={[styles.settingHint, { color: t.textSecondary }]}>Others can see your profile</Text>
            </View>
          </View>
          <Switch
            value={profileVisible}
            onValueChange={setProfileVisible}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📍</Text>
            <View>
              <Text style={[styles.settingLabel, { color: t.textPrimary }]}>Show Location</Text>
              <Text style={[styles.settingHint, { color: t.textSecondary }]}>Display your city on profile</Text>
            </View>
          </View>
          <Switch
            value={showLocation}
            onValueChange={setShowLocation}
            trackColor={{ false: '#E0E0E0', true: t.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* App Info Section */}
      <View style={[styles.section, { backgroundColor: t.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: t.titleText }]}>About</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: t.textSecondary }]}>Version</Text>
          <Text style={[styles.infoValue, { color: t.textPrimary }]}>1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={[styles.linkText, { color: t.textPrimary }]}>Terms of Service</Text>
          <Text style={[styles.linkArrow, { color: t.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={[styles.linkText, { color: t.textPrimary }]}>Privacy Policy</Text>
          <Text style={[styles.linkArrow, { color: t.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={[styles.linkText, { color: t.textPrimary }]}>Help & Support</Text>
          <Text style={[styles.linkArrow, { color: t.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#FF6B6B' }]}
        onPress={confirmLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePictureWrapper: {
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14,
  },
  profileBio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  profileIcon: {
    fontSize: 14,
  },
  editForm: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingHint: {
    fontSize: 12,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  linkText: {
    fontSize: 16,
  },
  linkArrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
