#!/usr/bin/env python
"""
Create a default user with sample pets for testing.
This gives you a working account with data from the beginning.

Run this script after migrations:
    python create_default_user.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_of_pets_api.settings')
django.setup()

from users.models import User
from pets.models import Pet
from events.models import Event
from datetime import datetime, timedelta

def create_default_user():
    """Create a default user with sample pets and events."""

    # Default credentials
    username = "demo"
    email = "demo@lifeof pets.com"
    password = "demo123"

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"❌ User '{username}' already exists!")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        return

    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name="Demo",
        last_name="User"
    )
    print(f"✅ Created user: {username}")
    print(f"   Email: {email}")
    print(f"   Password: {password}")

    # Create sample pets
    pets_data = [
        {
            "name": "Bella",
            "breed": "Welsh Corgi",
            "age": "3 yrs",
            "personality": "playful",
            "height": "60 cm",
            "weight": "30 kg",
            "description": "A energetic and friendly Corgi who loves to play fetch and go on walks.",
        },
        {
            "name": "Draco",
            "breed": "German Shepherd",
            "age": "4 yrs",
            "personality": "calm",
            "height": "65 cm",
            "weight": "35 kg",
            "description": "A loyal and protective German Shepherd. Great with kids and very well-trained.",
        },
        {
            "name": "Minx",
            "breed": "Tabby Cat",
            "age": "2 yrs",
            "personality": "curious",
            "height": "25 cm",
            "weight": "4 kg",
            "description": "A curious and adventurous cat who loves to explore and play with toys.",
        },
        {
            "name": "Luna",
            "breed": "Golden Retriever",
            "age": "5 yrs",
            "personality": "gentle",
            "height": "55 cm",
            "weight": "28 kg",
            "description": "A gentle and loving Golden Retriever. Perfect family dog who loves everyone.",
        },
    ]

    created_pets = []
    for pet_data in pets_data:
        pet = Pet.objects.create(owner=user, **pet_data)
        created_pets.append(pet)
        print(f"✅ Created pet: {pet.name} ({pet.breed})")

    # Create sample events/reminders
    now = datetime.now()
    events_data = [
        {
            "pet": created_pets[0],  # Bella
            "title": "Vaccination Reminder",
            "event_type": "vaccination",
            "description": "Annual vaccination due",
            "event_date": now + timedelta(days=7),
            "send_reminder": True,
        },
        {
            "pet": created_pets[1],  # Draco
            "title": "Grooming Appointment",
            "event_type": "grooming",
            "description": "Regular grooming session at Pet Spa",
            "event_date": now + timedelta(days=14),
            "send_reminder": True,
        },
        {
            "pet": created_pets[2],  # Minx
            "title": "Vet Checkup",
            "event_type": "vet_visit",
            "description": "Regular health checkup",
            "event_date": now + timedelta(days=21),
            "send_reminder": True,
        },
        {
            "pet": created_pets[3],  # Luna
            "title": "Flea Treatment",
            "event_type": "medication",
            "description": "Monthly flea and tick treatment",
            "event_date": now + timedelta(days=3),
            "send_reminder": True,
        },
    ]

    for event_data in events_data:
        event = Event.objects.create(owner=user, **event_data)
        print(f"✅ Created event: {event.title} for {event.pet.name}")

    print("\n" + "="*60)
    print("🎉 Default user created successfully!")
    print("="*60)
    print(f"\nLogin credentials:")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"\nCreated:")
    print(f"  - 1 user account")
    print(f"  - 4 pets (Bella, Draco, Minx, Luna)")
    print(f"  - 4 upcoming events/reminders")
    print(f"\nYou can now login to the app with these credentials!")
    print("="*60)

if __name__ == "__main__":
    create_default_user()
