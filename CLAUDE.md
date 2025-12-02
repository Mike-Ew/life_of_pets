# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

React Native mobile app (Expo) for pet care management. Users can manage pet profiles, track activities, health schedules, and expenses.

## Quick Reference

- **Demo Account**: `demo` / `demo123`
- **Full docs**: See [README.md](README.md)

## Development Commands

```bash
# Frontend
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Backend
cd backend
source venv/bin/activate
python manage.py runserver
```

## Key Files

### Frontend (`src/`)
- `App.js` - Root component with routing
- `pages/Dashboard.jsx` - Main authenticated UI, theme system
- `pages/LoginScreen.jsx` - Email/password login
- `pages/SignUpScreen.jsx` - User registration
- `services/api.js` - API client with JWT handling
- `contexts/AuthContext.js` - Auth state management

### Backend (`backend/`)
- `users/` - User model and auth
- `pets/` - Pet CRUD
- `events/` - Events/reminders

## Architecture Notes

- **Routing**: React Router Native (not React Navigation)
- **Auth**: JWT tokens stored in AsyncStorage
- **State**: Local useState + AuthContext (no Redux)
- **Theming**: Light/dark via THEMES object in Dashboard.jsx
- **API URL**: Configure in `src/services/api.js` (localhost:8000 for iOS, 10.0.2.2:8000 for Android)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| POST `/api/auth/login/` | Login (returns JWT) |
| POST `/api/auth/register/` | Register user |
| GET/POST `/api/pets/` | List/create pets |
| GET/PUT/DELETE `/api/pets/{id}/` | Pet operations |
| GET/POST `/api/events/` | List/create events |

## Planned Features

- **High**: Matching algorithm, swipe functionality
- **Medium**: Real-time chat, push notifications
- **Low**: Search/filter, admin panel
