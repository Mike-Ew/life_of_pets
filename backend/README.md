# Life of Pets - Django Backend

Backend API for the Life of Pets mobile application.

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Initialize Database

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (for admin panel)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`
Admin panel: `http://localhost:8000/admin/`
API documentation: `http://localhost:8000/api/schema/swagger-ui/`

## Project Structure

```
backend/
├── life_of_pets/          # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/                 # User authentication app
│   ├── models.py
│   ├── serializers.py
│   └── views.py
├── pets/                  # Pet management app
│   ├── models.py
│   ├── serializers.py
│   └── views.py
├── events/                # Events/reminders app
│   ├── models.py
│   ├── serializers.py
│   └── views.py
├── manage.py
└── requirements.txt
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset

### Pets
- `GET /api/pets/` - List all pets for authenticated user
- `POST /api/pets/` - Create new pet
- `GET /api/pets/{id}/` - Get pet details
- `PUT /api/pets/{id}/` - Update pet
- `DELETE /api/pets/{id}/` - Delete pet
- `POST /api/pets/{id}/photos/` - Upload pet photo

### Events/Reminders
- `GET /api/events/` - List events for user's pets
- `POST /api/events/` - Create event/reminder
- `GET /api/events/{id}/` - Get event details
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event

### User Profile
- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/me/` - Update user profile
- `POST /api/users/me/avatar/` - Upload profile picture

## Running with Celery (for scheduled tasks)

In separate terminals:

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery worker
celery -A life_of_pets worker -l info

# Terminal 3: Celery beat (for scheduled tasks)
celery -A life_of_pets beat -l info
```

## Development Notes

- SQLite is used by default for development
- For production, switch to PostgreSQL by updating DATABASE_URL in .env
- Media files are stored in `backend/media/`
- CORS is configured to allow requests from React Native dev server
