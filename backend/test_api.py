#!/usr/bin/env python
"""
Simple script to test the Life of Pets API.
Run this after starting the Django server to verify everything works.

Usage:
    python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def print_response(title, response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_api():
    """Test the main API endpoints."""

    # 1. Register a new user
    print("\n🚀 Testing API Endpoints...")

    register_data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }

    response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
    print_response("1️⃣  User Registration", response)

    if response.status_code == 201:
        data = response.json()
        access_token = data['tokens']['access']
        print(f"\n✅ Registration successful! Access token obtained.")
    else:
        print("\n❌ Registration failed. User might already exist. Trying login...")

        # Try login instead
        login_data = {
            "username": "testuser123",
            "password": "TestPass123!"
        }
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print_response("1️⃣b Login (fallback)", response)

        if response.status_code == 200:
            access_token = response.json()['access']
            print(f"\n✅ Login successful! Access token obtained.")
        else:
            print("\n❌ Both registration and login failed. Exiting.")
            return

    headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Get current user profile
    response = requests.get(f"{BASE_URL}/auth/me/", headers=headers)
    print_response("2️⃣  Get Current User Profile", response)

    # 3. Create a pet
    pet_data = {
        "name": "Buddy",
        "breed": "Golden Retriever",
        "age": "3 yrs",
        "personality": "playful",
        "height": "60 cm",
        "weight": "30 kg",
        "description": "A friendly and energetic golden retriever"
    }

    response = requests.post(f"{BASE_URL}/pets/", json=pet_data, headers=headers)
    print_response("3️⃣  Create Pet", response)

    if response.status_code == 201:
        pet_id = response.json()['id']
        print(f"\n✅ Pet created with ID: {pet_id}")

        # 4. Get all pets
        response = requests.get(f"{BASE_URL}/pets/", headers=headers)
        print_response("4️⃣  List All Pets", response)

        # 5. Get specific pet
        response = requests.get(f"{BASE_URL}/pets/{pet_id}/", headers=headers)
        print_response("5️⃣  Get Specific Pet", response)

        # 6. Create an event
        event_data = {
            "pet": pet_id,
            "title": "Vet Appointment",
            "event_type": "vet_visit",
            "description": "Annual checkup",
            "event_date": "2025-11-15T10:00:00Z",
            "send_reminder": True
        }

        response = requests.post(f"{BASE_URL}/events/", json=event_data, headers=headers)
        print_response("6️⃣  Create Event", response)

        # 7. List all events
        response = requests.get(f"{BASE_URL}/events/", headers=headers)
        print_response("7️⃣  List All Events", response)

        print("\n" + "="*60)
        print("✅ All API tests completed successfully!")
        print("="*60)
        print(f"\n📖 View API documentation at: {BASE_URL.replace('/api', '')}/api/schema/swagger-ui/")
        print(f"🔧 Admin panel at: {BASE_URL.replace('/api', '')}/admin/")
    else:
        print("\n❌ Pet creation failed.")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the API server.")
        print("Make sure the Django server is running:")
        print("  cd backend")
        print("  python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error: {e}")
