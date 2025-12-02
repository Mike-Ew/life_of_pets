# Life of Pets

A comprehensive React Native mobile application for pet care management, backed by a Django REST Framework API.

## 📋 Project Overview

**Life of Pets** is designed to help pet owners manage every aspect of their pets' lives. From tracking health schedules and expenses to managing daily activities, this app provides a centralized solution for pet care.

### Key Features
-   **Pet Profiles**: Create and manage detailed profiles for multiple pets.
-   **Activity Tracking**: Log walks, playtime, and other daily activities.
-   **Health Management**: Track vaccinations, medications, and vet visits.
-   **Expense Tracking**: Monitor costs related to food, medical care, and supplies.
-   **Event Scheduling**: Set reminders for important dates and appointments.

---

## 🏗 Architecture

The project follows a decoupled client-server architecture:

### Frontend (Mobile App)
-   **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/).
-   **Routing**: React Router Native.
-   **State Management**: React Context API + `useState`.
-   **Styling**: Custom theming system (Light/Dark mode support).
-   **Authentication**: JWT (JSON Web Tokens) stored in `AsyncStorage`.

### Backend (API)
-   **Framework**: [Django](https://www.djangoproject.com/) + [Django REST Framework (DRF)](https://www.django-rest-framework.org/).
-   **Database**: SQLite (Development).
-   **Authentication**: Custom JWT implementation.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
-   [Node.js](https://nodejs.org/) (v14 or later)
-   [Python](https://www.python.org/) (v3.8 or later)
-   [Expo Go](https://expo.dev/client) app on your mobile device (or an emulator).

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    -   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    -   **Windows:**
        ```bash
        venv\Scripts\activate
        ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Create a superuser (optional):**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The API will be available at `http://127.0.0.1:8000/`.

### Frontend Setup

1.  **Navigate to the project root (if not already there):**
    ```bash
    cd ..
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API URL:**
    -   Open `src/services/api.js`.
    -   Ensure the `BASE_URL` matches your backend address.
        -   **iOS Simulator**: `http://localhost:8000`
        -   **Android Emulator**: `http://10.0.2.2:8000`
        -   **Physical Device**: Use your computer's LAN IP (e.g., `http://192.168.1.5:8000`).

4.  **Start the Expo development server:**
    ```bash
    npm start
    ```

5.  **Run on device/emulator:**
    -   Scan the QR code with the Expo Go app (Android) or Camera app (iOS).
    -   Or press `i` for iOS simulator, `a` for Android emulator.

---

## 📂 Codebase Structure

### Frontend (`src/`)

| Directory | Description |
| :--- | :--- |
| `pages/` | Screen components for different views (Dashboard, Login, PetDetails, etc.). |
| `components/` | Reusable UI components (Buttons, Cards, Inputs). |
| `services/` | API service modules for communicating with the backend (`api.js`). |
| `contexts/` | React Context definitions for global state (e.g., `AuthContext`). |
| `assets/` | Static assets like images and icons. |
| `App.js` | Main entry point and routing configuration. |

### Backend (`backend/`)

| Directory | Description |
| :--- | :--- |
| `life_of_pets_api/` | Main project configuration (`settings.py`, `urls.py`). |
| `users/` | App for user authentication and profile management. |
| `pets/` | App for pet profiles and related data. |
| `events/` | App for scheduling and reminders. |
| `manage.py` | Django's command-line utility. |

---

## 🔌 API Reference

The backend provides the following REST endpoints:

### Authentication (`/api/auth/`)
-   `POST /login/`: Authenticate user and receive JWT.
-   `POST /register/`: Register a new user account.

### Pets (`/api/pets/`)
-   `GET /`: List all pets for the authenticated user.
-   `POST /`: Create a new pet profile.
-   `GET /{id}/`: Retrieve details of a specific pet.
-   `PUT /{id}/`: Update a pet profile.
-   `DELETE /{id}/`: Delete a pet profile.

### Events (`/api/events/`)
-   `GET /`: List all upcoming events.
-   `POST /`: Create a new event.

---

## 🛠 Development Notes

-   **Demo Account**: You can use `demo` / `demo123` if the database is seeded.
-   **Linting**: Ensure code follows the project's style guidelines.
-   **Testing**: Run `python manage.py test` in the backend directory for unit tests.

For more specific development guidelines, refer to `CLAUDE.md`.
