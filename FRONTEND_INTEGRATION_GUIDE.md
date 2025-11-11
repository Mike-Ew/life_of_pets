# Frontend-Backend Integration Guide

## ✅ Completed Integration

The following has been successfully integrated:

1. **API Client Setup** (`src/services/api.js`)
   - Axios configured with JWT authentication
   - Token management with AsyncStorage
   - Automatic token refresh on 401 errors
   - API endpoints for auth, pets, and events

2. **Authentication Context** (`src/contexts/AuthContext.js`)
   - Global auth state management
   - Login, register, logout functions
   - Automatic token persistence

3. **Updated Screens**
   - **App.js**: Now uses AuthProvider and shows loading state
   - **LoginScreen**: Connected to backend with error handling
   - **SignUpScreen**: Full registration with validation

## 🔄 Next Steps: Dashboard Integration

### Update Dashboard.jsx to Use Backend API

Replace the hardcoded `INITIAL_PETS` with API calls. Here's how:

**Step 1: Add imports at the top**

```javascript
import { petsAPI, eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
```

**Step 2: Replace INITIAL_PETS state with API data**

```javascript
export default function Dashboard({ onLogout }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch pets on component mount
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      const data = await petsAPI.getAll();
      setPets(data);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };
```

**Step 3: Update the Add Pet functionality**

```javascript
const onAddPet = async () => {
  if (!formName.trim()) {
    Alert.alert('Validation', 'Please enter a name');
    return;
  }

  try {
    const newPet = await petsAPI.create({
      name: formName,
      breed: formBreed,
      age: formAge,
      height: formHeight,
      weight: formWeight,
      personality: formPersonality,
    });

    setPets([newPet, ...pets]);
    setAddModalVisible(false);
    Alert.alert('Success', 'Pet added successfully!');
  } catch (error) {
    console.error('Error adding pet:', error);
    Alert.alert('Error', 'Failed to add pet');
  }
};
```

**Step 4: Add delete functionality**

```javascript
const deletePet = async (petId) => {
  Alert.alert(
    'Delete Pet',
    'Are you sure you want to delete this pet?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await petsAPI.delete(petId);
            setPets(pets.filter(p => p.id !== petId));
            Alert.alert('Success', 'Pet deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete pet');
          }
        }
      }
    ]
  );
};
```

**Step 5: Show loading state**

```javascript
if (isLoading) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    </SafeAreaView>
  );
}
```

## 📸 Image Upload Integration

### For Pet Photos

When implementing image upload, use the `petsAPI.uploadPhoto()` method:

```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async (petId) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    try {
      await petsAPI.uploadPhoto(petId, result.assets[0].uri);
      Alert.alert('Success', 'Photo uploaded!');
      loadPets(); // Reload to get updated photos
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    }
  }
};
```

**Note**: You'll need to install expo-image-picker:
```bash
npx expo install expo-image-picker
```

## 📅 Events/Reminders Integration

Update the events/reminders section to use the backend:

```javascript
const [events, setEvents] = useState([]);

useEffect(() => {
  loadEvents();
}, []);

const loadEvents = async () => {
  try {
    const data = await eventsAPI.getAll();
    setEvents(data);
  } catch (error) {
    console.error('Error loading events:', error);
  }
};

const createEvent = async (eventData) => {
  try {
    const newEvent = await eventsAPI.create(eventData);
    setEvents([...events, newEvent]);
    Alert.alert('Success', 'Event created!');
  } catch (error) {
    Alert.alert('Error', 'Failed to create event');
  }
};
```

## 🔧 API Configuration

### For Development

The API base URL is configured in `src/services/api.js`. Update it based on your platform:

```javascript
// iOS Simulator
const API_BASE_URL = 'http://localhost:8000/api';

// Android Emulator
const API_BASE_URL = 'http://10.0.2.2:8000/api';

// Physical Device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

### Testing the Integration

1. **Start the Django backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start the React Native app**:
   ```bash
   npm start
   ```

3. **Test the flow**:
   - Register a new user
   - Login
   - Add a pet
   - View pets
   - Create an event

## 🐛 Common Issues & Solutions

### Issue: Network Request Failed
**Solution**: Check that:
- Django server is running
- API_BASE_URL matches your platform
- CORS is configured in Django (already done)

### Issue: 401 Unauthorized
**Solution**: Token might be expired or invalid
- Try logging out and logging back in
- Check browser dev tools / React Native debugger for errors

### Issue: Images not loading
**Solution**:
- Backend images are stored at `/media/`
- In development, Django serves them automatically
- Make sure the image URLs from the API include the full path

## 📝 Summary of Changes Needed

To complete the integration, update these files:

1. **Dashboard.jsx**:
   - Replace INITIAL_PETS with API calls
   - Add loadPets(), createPet(), updatePet(), deletePet()
   - Add loading states

2. **Install additional packages**:
   ```bash
   npx expo install expo-image-picker
   ```

3. **Update API_BASE_URL** in `src/services/api.js` for your platform

4. **Test everything** with the backend running

The heavy lifting is done! The authentication, API client, and token management are all working. You just need to replace the hardcoded data with API calls.
