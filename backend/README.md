# Life of Pets - Backend API

Node.js + Express + TypeScript + PostgreSQL backend for the Life of Pets mobile application.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb life_of_pets
```

Or using psql:

```sql
CREATE DATABASE life_of_pets;
```

Run the schema to create tables:

```bash
psql -d life_of_pets -f schema.sql
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=life_of_pets
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key_change_this
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 4. Run the Server

Development mode (with hot reload):

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

Check health: `http://localhost:3000/health`

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "location": "New York"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
  "token": "jwt_token_here"
}
```

### Pet Profiles

All pet endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer {token}
```

#### GET /api/me/pets
Get all pets for the authenticated user.

**Response:**
```json
{
  "pets": [
    {
      "id": 1,
      "name": "Max",
      "breed": "Golden Retriever",
      "age": 3,
      "main_photo_url": "https://..."
    }
  ]
}
```

#### GET /api/pets/:id
Get single pet by ID with all photos.

**Response:**
```json
{
  "pet": {
    "id": 1,
    "name": "Max",
    "breed": "Golden Retriever",
    "age": 3,
    "description": "Friendly dog",
    "temperament_tags": ["friendly", "energetic"],
    "photos": [
      { "id": 1, "url": "https://...", "is_main": true }
    ]
  }
}
```

#### POST /api/pets
Create a new pet.

**Request:**
```json
{
  "name": "Max",
  "age": 3,
  "breed": "Golden Retriever",
  "description": "Friendly dog",
  "temperament_tags": ["friendly", "energetic"]
}
```

#### PUT /api/pets/:id
Update pet information.

**Request:** (all fields optional)
```json
{
  "name": "Max Updated",
  "age": 4
}
```

#### POST /api/pets/:id/photos
Upload a photo for a pet.

**Request:**
```json
{
  "url": "https://example.com/photo.jpg",
  "is_main": true
}
```

#### PATCH /api/pet_photos/:photoId
Update photo (e.g., set as main).

**Request:**
```json
{
  "is_main": true
}
```

### Pet Care

#### GET /api/pets/:id/care/today
Get today's care tasks for a pet.

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Feeding AM",
      "due_at": "2025-10-19T08:00:00Z",
      "status": "upcoming"
    }
  ]
}
```

#### GET /api/pets/:id/care/events
Get upcoming care events (next 14 days).

**Response:**
```json
{
  "events": [
    {
      "id": 2,
      "title": "Rabies Vaccine",
      "due_at": "2025-10-25T10:00:00Z",
      "status": "upcoming"
    }
  ]
}
```

#### POST /api/pets/:id/care/logs
Create a care log entry.

**Request:**
```json
{
  "type": "weight",
  "title": "Weight Check",
  "value": "28.5 kg",
  "notes": "Healthy weight",
  "occurred_at": "2025-10-19T10:00:00Z"
}
```

#### GET /api/pets/:id/care/logs
Get care history (last 50 entries).

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "type": "weight",
      "title": "Weight Check",
      "value": "28.5 kg",
      "occurred_at": "2025-10-19T10:00:00Z"
    }
  ]
}
```

#### POST /api/pets/:id/care/templates
Create a recurring care template.

**Request:**
```json
{
  "type": "bath",
  "title": "Bath",
  "cadence": "P2W",
  "time_of_day": "18:00"
}
```

#### GET /api/pets/:id/care/templates
Get all care templates for a pet.

#### PATCH /api/care/events/:id
Update care event status.

**Request:**
```json
{
  "status": "done"
}
```

## Database Schema

See `schema.sql` for the complete database schema. Main tables:

- **users** - User accounts
- **pets** - Pet profiles
- **pet_photos** - Pet photos
- **care_templates** - Recurring care schedules
- **care_events** - Scheduled care events
- **care_logs** - Historical care records

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.ts     # Auth logic
│   │   ├── petController.ts      # Pet CRUD logic
│   │   └── careController.ts     # Care logic
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication
│   ├── routes/
│   │   ├── auth.ts               # Auth routes
│   │   ├── pets.ts               # Pet routes
│   │   └── care.ts               # Care routes
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── index.ts                  # Main server file
├── schema.sql                     # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Development Notes

- All passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days (configurable)
- All pet/care endpoints check ownership before allowing access
- Timestamps are automatically managed by PostgreSQL triggers
- The `updated_at` column auto-updates on record changes

## Testing the API

Use tools like Postman, Insomnia, or curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Create Pet (use token from login)
curl -X POST http://localhost:3000/api/pets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Max","breed":"Golden Retriever","age":3}'
```

## Next Steps

1. Set up PostgreSQL database
2. Configure `.env` file
3. Run schema.sql
4. Start the server with `npm run dev`
5. Test endpoints with Postman/curl
6. Connect frontend app to this API
