# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack React Native mobile application built with Expo for tracking pet care activities. The app features a Node.js + TypeScript backend with PostgreSQL database, and a React Native frontend with complete authentication and pet management capabilities.

**Current Status**: MVP features are implemented and functional. The app is running successfully in iOS Simulator with full backend integration.

### Implemented Features

- **Authentication**: User registration, login, logout with JWT tokens
- **Pet Profiles**: Complete CRUD operations for pet management
- **Pet Care Tracking**: View daily tasks, upcoming events, and care history
- **Photo Management**: Backend endpoints ready (UI pending)
- **iOS Development**: Running in simulator with Metro bundler

## Technology Stack

### Frontend

- **Framework**: React Native 0.81.4 with React 19.1.0
- **Platform**: Expo ~54.0.13 (with new architecture enabled)
- **Development**: Expo Dev Client with Metro bundler
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios with JWT token injection
- **Storage**: In-memory storage (temporary, will migrate to AsyncStorage)
- **Entry Point**: `index.js` (registers the root component)
- **Main Component**: `App.js`

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Direct SQL queries with pg library
- **Authentication**: JWT with bcrypt password hashing
- **Development**: ts-node-dev for hot reloading
- **Port**: 3000

## Development Commands

### Frontend

```bash
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser
```

### Backend

```bash
cd backend
npm run dev           # Start backend server with hot reload (port 3000)
```

### Running Both (Recommended)

Open two terminal windows:

1. Terminal 1: `cd backend && npm run dev` (starts backend on port 3000)
2. Terminal 2: `npx expo start` (starts frontend, press 'i' for iOS)

Note: There are no test, lint, or build commands configured yet.

## Architecture

The project follows a full-stack architecture with clear separation between frontend and backend:

### Frontend Structure

```
/
├── index.js                    # Expo entry point
├── App.js                      # Root component with AuthProvider
├── src/
│   ├── contexts/
│   │   └── AuthContext.js      # Global auth state
│   ├── navigation/
│   │   └── AppNavigator.js     # Auth/App stack routing
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PetDetailScreen.js
│   │   └── AddEditPetScreen.js
│   └── services/
│       └── api.js              # Axios client + API methods
├── assets/                     # Icons, splash screens, images
└── docs/                       # Architecture diagrams & documentation
```

### Backend Structure

```
backend/
├── src/
│   ├── index.ts                # Express app entry point
│   ├── config/
│   │   └── database.ts         # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.ts   # Register, login
│   │   ├── petController.ts    # Pet CRUD
│   │   └── careController.ts   # Care tracking
│   ├── middleware/
│   │   └── auth.ts             # JWT verification
│   └── routes/
│       ├── authRoutes.ts
│       ├── petRoutes.ts
│       └── careRoutes.ts
├── schema.sql                  # Database schema
└── .env                        # Environment variables
```

### Expo Configuration

The app is configured in `app.json` with:
- New React Native architecture enabled (`newArchEnabled: true`)
- Portrait-only orientation
- Edge-to-edge display on Android
- Bundle identifier: `com.anonymous.life-of-pets`
- iOS tablet support enabled

## Project Documentation

**IMPORTANT**: Before starting any work, read these files in order:

1. **`/docs/ToDo_Documentation.md`** - Complete MVP specification including:
   - Feature requirements and scope (Sprint 1: Pet Profiles, Sprint 2: Pet Care)
   - Database schemas for all tables
   - API endpoint specifications
   - UI workflows and acceptance criteria

2. **`/docs/ai/current-state.md`** - Current implementation status:
   - What's actually built vs. what's planned
   - Dependencies that need to be installed
   - Current blockers

3. **`/docs/ai/handoff.md`** - Context from the last AI session:
   - What was just completed
   - Recommended next steps
   - Open questions that need decisions

4. **`/docs/Architecture1.png`** & **`/docs/Architecture2.png`** - Complete UI/UX flow diagrams

### Working with Other AIs

This project uses multiple AI assistants (Claude, Gemini). The `/docs/ai/` folder coordinates work between sessions:

- **Always read** `current-state.md` and `handoff.md` before starting work
- **Update** `handoff.md` with your progress and next steps when done
- **Update** `current-state.md` after completing features
- **Document decisions** in `decisions.md` when making architectural choices
- **Optional**: Add detailed notes to `/docs/ai/work-logs/claude/`

## Important Implementation Notes

### Storage Solution (Temporary)

The app currently uses an **in-memory storage wrapper** instead of AsyncStorage:

- **File**: `src/services/api.js:5-18`
- **Reason**: Native AsyncStorage requires Xcode build which had module resolution errors
- **Trade-off**: Sessions work during runtime but don't persist between app restarts
- **Future**: Will migrate to AsyncStorage when native build issues are resolved

### API Configuration

- **Base URL**: `http://localhost:3000/api` (for iOS Simulator)
- **For Android Emulator**: Change to `10.0.2.2:3000/api`
- **For Physical Device**: Use your computer's local IP (e.g., `192.168.1.x:3000/api`)
- **File**: `src/services/api.js:24`

### Database Setup

PostgreSQL database must be running with:

- **Database Name**: `life_of_pets`
- **Schema**: Located in `backend/schema.sql`
- **Connection**: Configured in `backend/.env`

### Development Best Practices

- The app uses inline styles with `StyleSheet.create` following React Native conventions
- Native iOS and Android folders are gitignored as Expo manages them
- Navigation uses React Navigation with conditional auth/app stacks
- State management via React Context API (AuthContext for global auth state)
- API calls centralized in `src/services/api.js` with automatic JWT injection
- The MVP is scoped to Pet Profiles and Pet Care only (matching, chat, notifications deferred)
