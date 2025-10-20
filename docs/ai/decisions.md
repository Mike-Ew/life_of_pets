# Design Decisions

This document tracks important technical and architectural decisions made during development.

**Format**: Each decision includes the date, who made it, the decision, and the rationale.

---

## Decision Log

### 2025-10-17 | AI Coordination Structure

**Decision**: Created `/docs/ai/` folder with current-state.md, handoff.md, and decisions.md for AI coordination.

**Rationale**:
- Multiple AIs (Claude, Gemini) will work on this project
- Need a clear way to track what's implemented vs. planned
- Handoff context between AI sessions prevents repeated work
- Separates living documentation (current state) from static specs (ToDo_Documentation.md)

**Alternatives Considered**:
- Using git commit messages only (not visible enough)
- Separate AI folders with duplicated info (leads to sync issues)

---

### 2025-10-17 | MVP Scope Definition

**Decision**: Focus MVP on Pet Profiles + Pet Care only. Defer matching, chat, notifications, and admin features.

**Rationale**:
- Core value proposition is pet care tracking
- Reduces initial complexity
- Can iterate based on user feedback before building social features

**Reference**: See `ToDo_Documentation.md` for full scope details.

---

### 2025-10-19 | Backend Technology Stack

**Decision**: Use Node.js + Express + TypeScript with PostgreSQL database, JWT authentication, and local project structure (`/backend` folder).

**Rationale**:
- **Node.js + Express**: Industry standard, simple, lots of resources, easy to deploy
- **TypeScript**: Type safety prevents bugs, better IDE support, matches frontend (React Native can use TS)
- **PostgreSQL**: Robust relational database, perfect for our schema with foreign keys, triggers, and complex queries
- **JWT**: Stateless authentication, works well with mobile apps, no server-side session storage needed
- **Local structure**: Keeps frontend and backend together for easier development, can split later if needed

**Alternatives Considered**:
- NestJS: More structured but steeper learning curve, overkill for MVP
- Supabase: Backend-as-a-service, fast setup but less control and potential vendor lock-in
- Firebase: Similar to Supabase, good for prototypes but harder to migrate away from
- Separate backend repo: More complex deployment, harder to coordinate during development

**Impact**:
- Developer needs PostgreSQL installed locally
- Both backend and frontend dependencies in same repo
- Can easily deploy backend to Heroku, Railway, Render, or any Node.js host
- Frontend can deploy to Expo/EAS separately

---

### 2025-10-19 | Navigation Pattern

**Decision**: React Navigation with Stack Navigator (native-stack).

**Rationale**:
- Industry standard for React Native navigation
- Stack pattern matches the app flow (Home → Detail → Edit)
- Native stack uses native navigation primitives for better performance
- Easy to add bottom tabs or drawer later if needed

**Alternatives Considered**:
- Expo Router: File-based routing, but adds complexity and we don't need web URL routing
- Bottom tabs from the start: Decided to implement later once we have more sections

**Impact**:
- Simple navigation pattern for MVP
- Can add tabs for different sections later (Pets, Social, Settings)

---

### 2025-10-19 | Mock Data Approach

**Decision**: Use local mock data files during frontend development, to be replaced with API calls later.

**Rationale**:
- Allows frontend development without waiting for backend
- Easy to iterate on UI/UX with predictable data
- Can test all screen states (empty, loading, error) easily
- Clear separation: mock data in `/src/data`, real API calls will go in `/src/services`

**Impact**:
- Frontend works standalone for demos
- Need to replace with real API calls before production
- Provides good test data examples for backend development

---

## Future Decisions to Document

When making these decisions, add them here:

- State management library (React Query? Zustand? Context?)
- Photo storage solution (S3, Cloudinary, local uploads?)
- Form validation library (React Hook Form? Formik?)
- Testing strategy (Jest? Testing Library? E2E with Detox?)
- Deployment targets (Expo EAS? TestFlight? Play Store?)

---

**Template for New Decisions**:

```markdown
### YYYY-MM-DD | Decision Title

**Decision**: What was decided

**Rationale**: Why this was the best choice

**Alternatives Considered**: What else was evaluated

**Impact**: What this affects going forward
```
