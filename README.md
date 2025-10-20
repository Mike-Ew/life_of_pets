# 🐾 Life of Pets

A mobile application for pet owners to manage pet profiles, track daily care tasks, health records, and schedules. Built with React Native (Expo) and a Node.js backend with PostgreSQL.

## 📱 Overview

**Life of Pets** helps pet owners:

- Create and manage detailed pet profiles with photos
- Track daily care tasks (feeding, exercise, medication)
- Schedule recurring care events (grooming, vet visits, vaccinations)
- Log health records and notes
- View care history and upcoming events

**Current Status**: MVP - Pet Profiles and Pet Care modules complete (backend + frontend UI with mock data). Integration in progress.

## ✨ Features

### 🐕 Pet Profiles

- ✅ Create, view, and edit pet profiles
- ✅ Upload multiple photos with main photo selection
- ✅ Add pet details: name, age, breed, description
- ✅ Temperament tags (calm, energetic, friendly, etc.)
- ✅ View all your pets in a card-based dashboard

### 📋 Pet Care Management

- ✅ **Today's Tasks**: AM/PM feeding, water, exercise, medication checklist
- ✅ **Upcoming Events**: 7-14 day view of scheduled care (vaccines, grooming, baths)
- ✅ **Care History**: Log and view past care activities
- ✅ Quick-add actions: Weight, bath, feeding, medication, notes
- ✅ Recurring care templates (e.g., bath every 2 weeks)
- ✅ Mark tasks as done or skipped

### 🔐 Authentication

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Secure password hashing (bcrypt)

### 📸 Photo Management

- ✅ Multi-photo upload for each pet
- ✅ Set main profile photo
- ✅ Photo gallery view

## 🛠️ Tech Stack

### Frontend

- **Framework**: React Native 0.81.4
- **Build Tool**: Expo ~54.0.13 (with new architecture enabled)
- **Navigation**: React Navigation v7 (Stack + Bottom Tabs)
- **Language**: JavaScript/TypeScript
- **HTTP Client**: Axios
- **Storage**: AsyncStorage (for tokens)

### Backend

- **Runtime**: Node.js
- **Framework**: Express v5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **File Uploads**: Multer
- **Environment**: dotenv

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18+ (recommended: v20)
- **npm**: v9+ (or yarn/pnpm)
- **PostgreSQL**: v14+ (local or hosted)
- **Expo CLI**: `npm install -g expo-cli` (optional, npx also works)
- **iOS Simulator** (macOS only) or **Android Studio** (for Android development)

### macOS-specific (for iOS development)

- Xcode 15+
- CocoaPods: `sudo gem install cocoapods`

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Mike-Ew/life_of_pets.git
cd life_of_pets
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Set Up PostgreSQL Database

#### Option A: Using Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb life_of_pets

# Create user (if needed)
psql postgres -c "CREATE USER postgres WITH PASSWORD 'your_password';"
psql postgres -c "ALTER USER postgres WITH SUPERUSER;"
```

#### Option B: Using Docker

```bash
docker run --name life_of_pets_pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=life_of_pets \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Initialize Database Schema

```bash
# Connect to database and run schema
psql -U postgres -d life_of_pets -f backend/schema.sql

# Or if using Docker:
docker exec -i life_of_pets_pg psql -U postgres -d life_of_pets < backend/schema.sql
```

### 6. Configure Backend Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=life_of_pets
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## 🏃 Running the App

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`.

**Verify it's running:**

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Start the Frontend (Expo)

In a new terminal (from the project root):

```bash
npm start
```

This will start the Expo dev server and show a QR code.

### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

Or press `i` in the Expo terminal.

### Run on Android Emulator

```bash
npm run android
```

Or press `a` in the Expo terminal.

### Run on Physical Device

1. Install the **Expo Go** app on your phone
2. Scan the QR code from the Expo dev server
3. The app will load on your device

## 📁 Project Structure

```

life_of_pets/
├── App.js                      # Main app entry point
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript config
│
├── assets/                     # Images, icons, splash screens
│   └── Pet Pictures/           # Sample pet photos
│
├── src/                        # Frontend source code
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React contexts (auth, etc.)
│   ├── data/                   # Mock data for development
│   │   └── mockData.js         # Sample pets and care data
│   ├── navigation/             # Navigation setup
│   │   └── AppNavigator.js     # Stack and tab navigators
│   ├── screens/                # Screen components
│   │   ├── HomeScreen.js       # Pet list dashboard
│   │   ├── PetDetailScreen.js  # Pet profile (tabs: Overview, Photos, Care)
│   │   ├── AddEditPetScreen.js # Create/edit pet form
│   │   ├── LoginScreen.js      # User login
│   │   └── RegisterScreen.js   # User registration
│   ├── services/               # API client (axios)
│   └── types/                  # TypeScript types
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/             # Database connection
│   │   ├── controllers/        # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── petController.ts
│   │   │   └── careController.ts
│   │   ├── middleware/         # Auth middleware (JWT)
│   │   ├── models/             # Database models/queries
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts         # /api/auth/*
│   │   │   ├── pets.ts         # /api/pets/*
│   │   │   └── care.ts         # /api/pets/:id/care/*
│   │   ├── types/              # TypeScript types
│   │   └── index.ts            # Express app setup
│   ├── schema.sql              # PostgreSQL schema
│   ├── .env.example            # Environment template
│   └── package.json            # Backend dependencies
│
├── docs/                       # Documentation
│   ├── ToDo_Documentation.md   # Feature specs and API docs
│   ├── Architecture1.png       # Architecture diagram
│   └── ai/                     # AI assistant handoff docs
│       ├── current-state.md    # Implementation status
│       ├── decisions.md        # Technical decisions
│       └── handoff.md          # Next steps
│
└── ios/                        # iOS native build (generated)
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Pets

- `GET /api/me/pets` - Get all pets for current user
- `POST /api/pets` - Create a new pet
- `GET /api/pets/:id` - Get pet details
- `PUT /api/pets/:id` - Update pet
- `POST /api/pets/:id/photos` - Upload pet photos
- `PATCH /api/pet_photos/:photoId` - Update photo (e.g., set as main)

### Pet Care

- `GET /api/pets/:id/care/today` - Get today's tasks
- `GET /api/pets/:id/care/events` - Get upcoming care events
- `GET /api/pets/:id/care/logs` - Get care history
- `POST /api/pets/:id/care/logs` - Add care log entry
- `POST /api/pets/:id/care/templates` - Create recurring care template
- `GET /api/pets/:id/care/templates` - Get all templates
- `PATCH /api/care/events/:id` - Update event status (done/skipped)

### Health Check

- `GET /health` - Check server status

## 🧪 Testing the API

### Using curl

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get pets (replace TOKEN with JWT from login)
curl http://localhost:3000/api/me/pets \
  -H "Authorization: Bearer TOKEN"
```

### Using a GUI Client

- **Postman**: Import the endpoints from `docs/ToDo_Documentation.md`
- **Insomnia**: Create requests for each endpoint
- **VS Code REST Client**: Use the `.http` files (if you create them)

## 🐛 Troubleshooting

### Backend won't start

- **Port 3000 already in use**: Change `PORT` in `backend/.env` or kill the existing process
- **Database connection error**: Verify PostgreSQL is running and credentials in `.env` are correct
  ```bash
  # Check if PostgreSQL is running
  brew services list | grep postgresql
  # Or for Docker
  docker ps | grep postgres
  ```

### Frontend build errors

- **Metro bundler cache issues**:
  ```bash
  npm start -- --clear
  ```
- **iOS build fails**:
  ```bash
  cd ios
  pod install
  cd ..
  npm run ios
  ```
- **Android build fails**: Clean Gradle cache
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npm run android
  ```

### Database schema errors

- **Table doesn't exist**: Re-run `backend/schema.sql`
  ```bash
  psql -U postgres -d life_of_pets -f backend/schema.sql
  ```

### Expo "Couldn't start project" error

- Clear Expo cache:
  ```bash
  expo start -c
  # or
  npx expo start --clear
  ```

## 🔄 Current Development Status

| Feature        | Backend     | Frontend UI        | Integration    |
| -------------- | ----------- | ------------------ | -------------- |
| Authentication | ✅ Complete | ✅ Complete        | ⏳ In Progress |
| Pet Profiles   | ✅ Complete | ✅ Complete        | ⏳ In Progress |
| Photo Upload   | ✅ Complete | ✅ Complete        | ⏳ In Progress |
| Pet Care Tasks | ✅ Complete | ✅ Complete (mock) | ⏳ In Progress |
| Care Templates | ✅ Complete | ⚠️ Partial         | ⏳ In Progress |
| Care Logs      | ✅ Complete | ✅ Complete (mock) | ⏳ In Progress |

**Next Steps**:

1. Connect frontend screens to backend APIs
2. Implement token storage with AsyncStorage
3. Add error handling and loading states
4. Implement photo upload with Expo ImagePicker
5. Add form validation

See `docs/ai/handoff.md` for detailed next steps.

## 📖 Documentation

- **Feature Specs**: `docs/ToDo_Documentation.md`
- **Current State**: `docs/ai/current-state.md`
- **Architecture**: `docs/Architecture1.png`, `docs/Architecture2.png`
- **Handoff Guide**: `docs/ai/handoff.md`

## 🤝 Contributing

This is currently a private project. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and not licensed for public use.

## 👤 Author

**Mike-Ew**

- GitHub: [@Mike-Ew](https://github.com/Mike-Ew)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Express](https://expressjs.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Pet photos from [Unsplash](https://unsplash.com/)

---

**Happy Pet Parenting! 🐾**
