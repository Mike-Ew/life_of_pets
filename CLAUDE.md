# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo for tracking pet care activities. The app is in early development stages and currently displays project requirements and goals. The planned features include:

- Creating and managing feeding schedules for pets
- Recording vaccination information (date and vaccine type)
- Tracking other events (vet visits, grooming appointments) with notes
- Displaying a list of all pets with ability to add new ones

## Technology Stack

- **Framework**: React Native 0.81.4 with React 19.1.0
- **Platform**: Expo ~54.0.13 (with new architecture enabled)
- **Development**: Expo Dev Client for custom native code
- **Entry Point**: `index.js` (registers the root component)
- **Main Component**: `App.js`

## Development Commands

**Starting the app**:
```bash
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser
```

Note: There are no test, lint, or build commands configured yet in this early-stage project.

## Architecture

The project is currently in the prototype/planning phase with a simple single-component structure:

- `index.js` - Expo entry point that registers the App component
- `App.js` - Main application component displaying project requirements
- `app.json` - Expo configuration (bundle identifiers, icons, splash screen, orientation)
- `docs/` - Contains architecture diagrams (Architecture1.png, Architecture2.png)
- `assets/` - Contains app icons, splash screens, and pet pictures

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

## Development Notes

- The app uses inline styles with `StyleSheet.create` following standard React Native conventions
- Native iOS and Android folders are gitignored as Expo manages them
- The codebase currently has no navigation, state management, or data persistence implemented
- The MVP is scoped to Pet Profiles and Pet Care only (matching, chat, notifications deferred)
