# Getting Started with Life of Pets

Complete guide to set up and run both the frontend and backend of the Life of Pets application.

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn
- Expo CLI (will be installed via npx)
- iOS Simulator or Android Emulator (optional, for testing)

## Quick Start

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (admin)
python manage.py createsuperuser
# Follow prompts to set username, email, password

# Start the server
python manage.py runserver
```

Backend is now running at:
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/schema/swagger-ui/

### 2. Frontend Setup (React Native + Expo)

Open a **new terminal window** (keep backend running):

```bash
# Navigate to project root
cd /path/to/life_of_pets

# Install dependencies
npm install

# Start Expo
npm start
```

This will open the Expo DevTools in your browser.

### 3. Configure API URL

Before running the app, update the API base URL in `src/services/api.js`:

```javascript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:8000/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:8000/api';

// For Physical Device - use your computer's IP
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api';
```

To find your computer's IP:
- **macOS**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` and look for IPv4 Address
- **Linux**: `ip addr show` or `hostname -I`

### 4. Run the App

From Expo DevTools, press:
- `i` - Run on iOS Simulator
- `a` - Run on Android Emulator
- Scan QR code with Expo Go app on your phone

## Testing the Full Stack

### Test Backend API

Open a new terminal and run the test script:

```bash
cd backend
python test_api.py
```

This will test all API endpoints and show you the responses.

### Test Frontend Authentication

1. Open the app in your simulator/device
2. Click "Sign Up"
3. Fill in the form:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123!
   - Confirm Password: Test123!
4. Click "Sign Up"
5. You should be logged in and see the Dashboard

### Test Pet Management

1. Once logged in, click "+ Add" in the Dashboard
2. Fill in pet details:
   - Name: Buddy
   - Breed: Golden Retriever
   - Age: 3 yrs
   - Personality: playful
   - Height: 60 cm
   - Weight: 30 kg
3. Click "Add Pet"
4. Pet should appear in your list!

## Project Structure

```
life_of_pets/
├── backend/                 # Django REST API
│   ├── users/              # User authentication app
│   ├── pets/               # Pet management app
│   ├── events/             # Events/reminders app
│   ├── life_of_pets_api/  # Main Django project
│   ├── manage.py
│   ├── requirements.txt
│   └── README.md
│
├── src/                     # React Native source
│   ├── components/         # Reusable components
│   ├── pages/              # Screen components
│   ├── services/           # API client
│   └── contexts/           # React contexts
│
├── assets/                  # Images and static files
├── App.js                   # Main React Native component
├── package.json
└── app.json                # Expo configuration
```

## Development Workflow

### Running Both Servers

You'll need **two terminal windows**:

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Terminal 2 - Frontend**:
```bash
npm start
```

### Making Changes

**Backend Changes**:
- Edit Python files in `backend/`
- Django auto-reloads on file changes
- For model changes: `python manage.py makemigrations` then `python manage.py migrate`

**Frontend Changes**:
- Edit React Native files in `src/` or `App.js`
- Expo auto-reloads in the simulator
- Press `r` in terminal to manually reload

### Viewing Logs

**Backend Logs**:
- Check terminal where `python manage.py runserver` is running
- All API requests and errors appear here

**Frontend Logs**:
- Press `j` in Expo terminal to open debugger
- Or use React Native Debugger app
- Check Console in Expo DevTools browser tab

## Common Commands

### Backend

```bash
# Make migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Access Python shell
python manage.py shell

# Run tests (when you add them)
python manage.py test
```

### Frontend

```bash
# Start Expo
npm start

# Clear cache and restart
npm start -- --clear

# Install new package
npm install package-name

# Install Expo package
npx expo install package-name
```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError`
**Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**Problem**: Database errors
**Solution**: Delete `db.sqlite3` and run `python manage.py migrate` again

**Problem**: Port 8000 already in use
**Solution**: `python manage.py runserver 8001` (use different port)

### Frontend Issues

**Problem**: Network request failed
**Solution**:
1. Check backend is running
2. Verify API_BASE_URL in `src/services/api.js`
3. For Android emulator, use `10.0.2.2` instead of `localhost`

**Problem**: Expo won't start
**Solution**:
1. Clear cache: `npm start -- --clear`
2. Delete `node_modules` and run `npm install` again

**Problem**: Can't find module
**Solution**: Run `npm install` to install all dependencies

## Next Steps

1. ✅ **Backend is set up** - You can manage data via Django admin
2. ✅ **Frontend is set up** - Authentication works
3. 🔄 **Complete Dashboard integration** - Follow FRONTEND_INTEGRATION_GUIDE.md
4. 📸 **Add image upload** - Install expo-image-picker
5. 📅 **Implement events** - Connect events/reminders to backend

## Useful Links

- **Django Admin**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/schema/swagger-ui/
- **Expo Documentation**: https://docs.expo.dev/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Native**: https://reactnative.dev/

## Support

- Check `CLAUDE.md` for project architecture details
- Check `FRONTEND_INTEGRATION_GUIDE.md` for API integration examples
- Check `backend/README.md` for backend-specific documentation
- Check `backend/QUICKSTART.md` for API examples

## Quick Test Checklist

- [ ] Backend server starts without errors
- [ ] Can access Django admin at http://localhost:8000/admin/
- [ ] Frontend app opens in simulator/device
- [ ] Can register a new user
- [ ] Can login with created user
- [ ] Dashboard loads without errors
- [ ] Can view API documentation at Swagger UI

If all boxes are checked, you're ready to develop! 🎉
