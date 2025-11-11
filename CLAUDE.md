# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo for pet care management and social networking. The app allows users to manage their pets' profiles, track activities, health and feeding schedules, expenses, and includes planned features for matching pets with playmates/adopters.

## Technology Stack

- **Framework**: React Native 0.81.5 with React 19.1.0
- **Platform**: Expo ~54.0.13 (with new architecture enabled)
- **Routing**: React Router Native v6.30.0 (`react-router-native`)
- **Navigation**: React Navigation v7.1.18 libraries installed but using React Router
- **Development**: Expo Dev Client v6.0.15 for custom native code
- **Entry Point**: `index.js` → `App.js`

## Development Commands

```bash
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser
```

Note: No test, lint, or production build commands are configured yet.

## Architecture

### Routing Structure

The app uses `react-router-native` with authentication-based route protection:

- **[App.js](App.js)**: Root component with `NativeRouter`
  - Public routes (when `!isLoggedIn`): `/`, `/login`, `/signup`
  - Private routes (when `isLoggedIn`): `/dashboard` and nested routes
  - Authentication state managed via `isLoggedIn` state and `handleLogin`/`handleLogout` callbacks

### Screen Organization

**Public Screens** (`src/pages/`):
- [AuthScreen.jsx](src/pages/AuthScreen.jsx) - Initial landing/welcome screen
- [LoginScreen.jsx](src/pages/LoginScreen.jsx) - Email/password login with `onLogin` prop
- [SignUpScreen.jsx](src/pages/SignUpScreen.jsx) - User registration

**Main Dashboard** ([src/pages/Dashboard.jsx](src/pages/Dashboard.jsx)):
- Acts as the main container for all authenticated features
- Manages screen switching internally (Dashboard, Activity Monitor, Health & Feeding, Expenses, Settings)
- Contains pet management UI (list view, add/edit modals, detail view)
- Implements dark/light theme switching
- Contains logout functionality in Settings

**Component Structure** (`src/components/`):
- [PetCard.js](src/components/PetCard.js) - Individual pet card display
- [MenuModal.js](src/components/MenuModal.js) - Navigation menu overlay
- [ActivityMonitor.js](src/components/ActivityMonitor.js) - Pet activity tracking screen
- [HealthFeeding.js](src/components/HealthFeeding.js) - Health and feeding management
- [Expenses.js](src/components/Expenses.js) - Pet expense tracking

### State Management

Currently using local component state (React `useState`):
- Authentication state in `App.js` (`isLoggedIn`)
- Pet data in `Dashboard.jsx` (initialized with `INITIAL_PETS` hardcoded data)
- Modal states for add/edit/detail views
- Theme preference (light/dark mode)

No global state management library (Redux, Zustand, Context) is implemented yet.

### Data Model

Pets are stored as objects with this structure:
```javascript
{
  id: string,
  name: string,
  breed: string,
  age: string,
  personality: 'calm' | 'playful' | 'curious' | 'gentle',
  height: string,
  weight: string,
  image: require(...) // Local asset reference
}
```

### Theming System

The app has a complete theming system defined in [Dashboard.jsx](src/pages/Dashboard.jsx:76-103):
- `THEMES` object with `light` and `dark` variants
- Theme colors for background, cards, text, accents, shadows
- Theme state managed with `theme` and `setTheme`
- Components receive theme via `t` prop

### Planned Features

Detailed implementation plans are documented in [docs/ToDo_Documentation.md](docs/ToDo_Documentation.md):
- **High Priority**: User authentication (social login, password reset), pet profile management, matching algorithm with swipe functionality
- **Medium Priority**: Real-time chat, notifications (matches, messages, event reminders)
- **Low Priority**: Search/filter, user settings/privacy, admin panel

## Expo Configuration

Configuration in [app.json](app.json):
- New React Native architecture enabled (`newArchEnabled: true`)
- Portrait-only orientation
- Edge-to-edge display on Android
- Bundle identifier: `com.anonymous.life-of-pets`
- iOS tablet support enabled

## Backend API (Django)

The project now includes a fully functional Django REST API in the `backend/` directory.

### Backend Technology Stack

- **Framework**: Django 5.2.8 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-spectacular (Swagger/OpenAPI)
- **CORS**: django-cors-headers (configured for React Native dev servers)
- **Media Handling**: Pillow for image processing

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### API Structure

**Apps:**
- `users/` - Custom user model with profile fields and privacy settings
- `pets/` - Pet profiles with multiple photo support
- `events/` - Event/reminder system for vet visits, vaccinations, etc.

**Models:**
- `User` (extends AbstractUser) - profile_picture, location, phone_number, bio, privacy settings
- `Pet` - name, breed, age, personality, height, weight, description, owner (FK to User)
- `PetPhoto` - image, is_main, pet (FK to Pet)
- `Event` - title, event_type, description, event_date, pet (FK to Pet), owner (FK to User)

**API Endpoints:**
- `POST /api/auth/register/` - User registration (returns JWT tokens)
- `POST /api/auth/login/` - Login (JWT authentication)
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET/PUT /api/auth/me/` - Current user profile
- `GET/POST /api/pets/` - List/create pets (user-scoped)
- `GET/PUT/PATCH/DELETE /api/pets/{id}/` - Pet detail operations
- `POST /api/pets/{id}/upload-photo/` - Upload pet photo
- `GET /api/pets/{id}/photos/` - List pet photos
- `GET/POST /api/events/` - List/create events (user-scoped)
- `GET/PUT/PATCH/DELETE /api/events/{id}/` - Event detail operations

**API Documentation:**
- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`
- Admin Panel: `http://localhost:8000/admin/`

### Backend Configuration

Environment variables are configured in `backend/.env`:
- JWT token lifetimes (default: 60min access, 24hr refresh)
- CORS allowed origins (React Native dev servers)
- Media/static file paths
- Database configuration

### Integration Notes

- Frontend currently uses hardcoded data - needs to be connected to backend API
- JWT tokens should be stored securely in React Native (use AsyncStorage or SecureStore)
- CORS is configured for `http://localhost:19006` and `http://localhost:8081` (Expo dev servers)
- Media files served at `/media/` in development
- All API endpoints require JWT authentication except `/api/auth/register/` and `/api/auth/login/`

## Frontend Development Notes

- All styles use `StyleSheet.create` following React Native conventions
- Pet images are currently static assets in `assets/Pet Pictures/`
- **Backend integration pending** - needs to connect to Django API endpoints
- **Data persistence**: Backend provides full persistence via SQLite/PostgreSQL
- Navigation uses React Router Native (not React Navigation despite deps being installed)
