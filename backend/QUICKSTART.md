# Backend Quick Start Guide

## First-Time Setup

1. **Create and activate virtual environment:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py migrate
```

4. **Create a superuser (admin):**
```bash
python manage.py createsuperuser
# Follow the prompts to create username, email, and password
```

5. **Start the development server:**
```bash
python manage.py runserver
```

The API will be available at:
- **API Base**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/schema/swagger-ui/

## Testing the API

### 1. Register a new user

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Response will include JWT tokens and user data.

### 2. Login (get JWT tokens)

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

Save the `access` token from the response.

### 3. Create a pet (requires authentication)

```bash
curl -X POST http://localhost:8000/api/pets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Buddy",
    "breed": "Golden Retriever",
    "age": "3 yrs",
    "personality": "playful",
    "height": "60 cm",
    "weight": "30 kg",
    "description": "A friendly and energetic dog"
  }'
```

### 4. List all pets

```bash
curl -X GET http://localhost:8000/api/pets/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Create an event/reminder

```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pet": 1,
    "title": "Vet Appointment",
    "event_type": "vet_visit",
    "description": "Annual checkup",
    "event_date": "2025-11-15T10:00:00Z",
    "send_reminder": true
  }'
```

## Using the Admin Panel

1. Visit http://localhost:8000/admin/
2. Login with your superuser credentials
3. You can manage:
   - Users
   - Pets and Pet Photos
   - Events/Reminders

## Environment Variables

The backend uses environment variables from `.env` file (already created):
- `DEBUG=True` - Development mode
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of CORS origins
- `JWT_ACCESS_TOKEN_LIFETIME` - Access token lifetime in minutes (default: 60)
- `JWT_REFRESH_TOKEN_LIFETIME` - Refresh token lifetime in minutes (default: 1440)

## Common Tasks

### Create migrations after model changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Create sample data:
```bash
python manage.py shell
```
Then in the Python shell:
```python
from users.models import User
from pets.models import Pet

# Create a user
user = User.objects.create_user(username='demo', email='demo@example.com', password='demo123')

# Create pets for the user
Pet.objects.create(owner=user, name='Max', breed='Beagle', age='2 yrs', personality='playful')
Pet.objects.create(owner=user, name='Luna', breed='Persian Cat', age='1 yr', personality='calm')
```

### Reset database (careful - deletes all data):
```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## API Authentication Flow

1. **Register** or **Login** to get JWT tokens
2. Use the `access` token in the `Authorization` header: `Bearer YOUR_ACCESS_TOKEN`
3. When access token expires (60 min), use the `refresh` token to get a new access token:
   ```bash
   curl -X POST http://localhost:8000/api/auth/token/refresh/ \
     -H "Content-Type: application/json" \
     -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
   ```

## Next Steps

- Connect the React Native frontend to these API endpoints
- Implement file upload for pet photos
- Set up proper production database (PostgreSQL)
- Configure email backend for password resets
- Add more filtering and search capabilities
