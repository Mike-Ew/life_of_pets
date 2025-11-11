# Default User Guide

## 🎯 Quick Start with Demo Account

Instead of creating a new account, you can login with the pre-configured demo user that has sample data already!

### Default Credentials

```
Username: demo
Password: demo123
```

### What's Included

The demo account comes with:
- ✅ **4 Sample Pets**:
  - Bella (Welsh Corgi, 3 yrs, playful)
  - Draco (German Shepherd, 4 yrs, calm)
  - Minx (Tabby Cat, 2 yrs, curious)
  - Luna (Golden Retriever, 5 yrs, gentle)

- ✅ **4 Upcoming Events**:
  - Vaccination reminder for Bella (in 7 days)
  - Grooming appointment for Draco (in 14 days)
  - Vet checkup for Minx (in 21 days)
  - Flea treatment for Luna (in 3 days)

### How to Use

1. **Start the backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

3. **Login with demo account:**
   - Open the app
   - Click "Login"
   - Enter:
     - Username: `demo`
     - Password: `demo123`
   - You'll see 4 pets already there!

### Create Your Own Default User

If you want to create another default user or the demo user doesn't exist:

```bash
cd backend
source venv/bin/activate
python create_default_user.py
```

This script will:
- Check if the user exists
- Create user `demo` with password `demo123`
- Add 4 sample pets
- Add 4 sample events
- Report what was created

### Managing Default Data

**View in Django Admin:**
```
http://localhost:8000/admin/
```
Login with your superuser account to:
- View all users and their pets
- Edit pet details
- Manage events
- Delete sample data if needed

**Reset Demo Data:**

If you want to start fresh:

```bash
cd backend
source venv/bin/activate

# Open Django shell
python manage.py shell

# Delete demo user and all their data
>>> from users.models import User
>>> User.objects.filter(username='demo').delete()
>>> exit()

# Recreate demo user
python create_default_user.py
```

### Testing Different Scenarios

**Empty State (New User):**
- Register a new account
- You'll see the empty state UI

**With Data (Demo User):**
- Login as `demo`
- You'll see pets immediately

**Adding More Data:**
- Login as `demo`
- Add more pets
- Create more events
- All saves to database

### Security Note

⚠️ **Important:** The demo account is for development/testing only!

- Password `demo123` is simple for easy testing
- In production, use strong passwords
- Delete or disable demo accounts before deploying
- Use environment variables for sensitive data

### Customizing Demo Data

Edit `create_default_user.py` to change:

**Username/Password:**
```python
username = "demo"
password = "demo123"
```

**Pet Details:**
```python
pets_data = [
    {
        "name": "YourPetName",
        "breed": "Breed",
        # ... etc
    }
]
```

**Event Types:**
```python
event_type choices:
- 'vaccination'
- 'vet_visit'
- 'grooming'
- 'feeding'
- 'medication'
- 'other'
```

Then run:
```bash
python create_default_user.py
```

### Troubleshooting

**"User already exists" error:**
- The demo user is already created
- Just login with `demo` / `demo123`
- Or delete and recreate (see "Reset Demo Data" above)

**No pets showing:**
- Make sure backend is running
- Check browser console / React Native debugger for errors
- Verify API_BASE_URL in `src/services/api.js`
- Try pull-to-refresh in the app

**Events not showing:**
- Events UI integration is pending
- You can see events in Django admin
- Will be implemented in next phase

## 🎉 Benefits of Demo User

✅ **Instant Testing** - No need to create data manually
✅ **Realistic Data** - See how the app looks with content
✅ **Quick Demos** - Show features to others immediately
✅ **Development** - Test features with existing data
✅ **Onboarding** - Help new developers get started fast

---

**Ready to go!** Just login with `demo` / `demo123` and start exploring! 🚀
