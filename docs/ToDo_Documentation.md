# 🐾 Life of Pets App — MVP Documentation (v2.1)

**Last Updated:** October 2025  
**Scope (MVP):** Pet Profiles + Pet Care only  
**Out of Scope (Later):** Matching, Chat, Notifications, Search/Admin

---

## 🔖 Version & Status

| Module       | Version | Status      | Owner       |
| ------------ | ------- | ----------- | ----------- |
| Pet Profiles | 1.0     | In Progress | Frontend/BE |
| Pet Care     | 0.9     | Planned     | Full Stack  |

---

## 🗺️ UI Screens & Workflow (Trees)

### Screens (MVP)

```
App (MVP)
├─ Auth (existing/global)
│  └─ Login / Signup
├─ Home
│  ├─ My Pets (list)
│  └─ Add Pet (CTA)
├─ Pet Detail
│  ├─ Overview (profile + main photo)
│  ├─ Photos (gallery + set main)
│  └─ Care Tab
│     ├─ Today
│     ├─ Upcoming (7–14d)
│     └─ Log (history + quick add)
└─ Add/Edit Pet (form)
   ├─ Base Info
   ├─ Temperament
   └─ Photos (upload)
```

### Workflows (MVP)

```
Create Pet
→ Home: "Add Pet"
→ Add/Edit Pet (form)
→ Save → Pet Detail (Overview)

Upload/Set Main Photo
→ Pet Detail: Photos
→ Upload files (multipart)
→ Tap "Set as Main" → PATCH pet_photos/:id

Daily Care Tick (Feeding AM example)
→ Pet Detail: Care > Today
→ Tap "Done" on Feeding AM
→ POST care_logs + PATCH/CREATE next care_events
→ Item marked done; next due scheduled

Create Recurring Care (Bath every 2 weeks)
→ Pet Detail: Care > Templates
→ Add Template (type=Bath, cadence=P2W, time=18:00)
→ Auto create next care_event
→ Shows under Upcoming

Log Weight
→ Pet Detail: Care > Log
→ Quick Add "Weight" → enter value → Save
→ Row appears in history
```

---

## 🚀 1) Pet Profiles

**Goal:** Create, view, and edit pet profiles (with photos).

### Tasks

- [ ] Create/Edit Pet (name, age, breed, description, temperament tags)
- [ ] Link pet to owner (user_id)
- [ ] Upload multiple photos; choose main photo
- [ ] Pet dashboard view

### Endpoints

- `POST /api/pets`
- `PUT /api/pets/:id`
- `GET /api/pets/:id`
- `GET /api/me/pets`
- `POST /api/pets/:id/photos` (multipart)
- `PATCH /api/pet_photos/:photoId` → `{ is_main: true|false }`

### Database

```sql
TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR,
  location VARCHAR,
  profile_picture_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

TABLE pets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  age INT,
  breed VARCHAR,
  description TEXT,
  looking_for VARCHAR,                   -- optional, future use
  temperament_tags TEXT[],               -- ['calm','energetic',...]
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

TABLE pet_photos (
  id SERIAL PRIMARY KEY,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

## 🧪 2) Pet Care (MVP)

**Goal:** Daily checklist + simple recurring schedules + quick health logs.

### UX Overview

- **Pet → Care tab**
  - **Today:** AM/PM Feeding, Water, Exercise/Walk, Meds due today (tap to Done)
  - **Upcoming (7–14d):** Vaccines, Baths, Grooming, Deworming, Flea/Tick
  - **Log:** Quick-add chips → Weight, Bath, Feeding, Meds, Note

### Tasks

- [ ] Daily checklist (auto items for AM/PM feeding, water, exercise)
- [ ] Simple templates for recurring care (e.g., Bath every 2 weeks)
- [ ] Quick health logs (weight/notes/medication)
- [ ] Mark events done/skipped

### Endpoints

- **Checklist & Logs**
  - `GET /api/pets/:id/care/today`
  - `POST /api/pets/:id/care/logs`  
    Body: `{ type, title?, value?, notes?, occurred_at? }`
- **Schedules**
  - `POST /api/pets/:id/care/templates`
  - `GET /api/pets/:id/care/templates`
  - `PATCH /api/care/templates/:id`
  - `GET /api/pets/:id/care/events?range=today..+14d`
  - `PATCH /api/care/events/:id` → `{ status: 'done'|'skipped' }`

### Database

```sql
-- What repeats?
TABLE care_templates (
  id SERIAL PRIMARY KEY,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR CHECK (type IN ('vaccination','bath','feeding','medication','grooming','deworming','flea_tick','exercise')),
  title VARCHAR NOT NULL,     -- e.g., "Rabies", "Bath", "Feeding AM"
  cadence TEXT,               -- ISO-8601 period like "P1D","P2W","P12M"
  time_of_day TIME NULL,      -- optional for reminders
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP, updated_at TIMESTAMP
);

-- What’s next due?
TABLE care_events (
  id SERIAL PRIMARY KEY,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  template_id INT REFERENCES care_templates(id),
  title VARCHAR NOT NULL,
  due_at TIMESTAMP NOT NULL,
  status VARCHAR CHECK (status IN ('upcoming','done','skipped','overdue')) DEFAULT 'upcoming',
  created_at TIMESTAMP, updated_at TIMESTAMP
);

-- What actually happened?
TABLE care_logs (
  id SERIAL PRIMARY KEY,
  pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR CHECK (type IN ('vaccination','bath','feeding','medication','grooming','deworming','flea_tick','exercise','weight','note')),
  title VARCHAR,
  value VARCHAR,              -- e.g., "12.6 kg", "1 cup kibble"
  occurred_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);
```

### Minimal Generation Rules

- Creating a **template** auto-creates the next **care_event** based on `cadence`.
- Marking an **event** `done` → insert a **care_log**, then schedule the next event by adding `cadence`.
- **Today checklist** = generated from active templates for `feeding AM/PM`, `water`, `exercise`, plus any events due today.

---

## ✅ Acceptance Criteria

**Pet Profiles**

- Create, edit, view pet with ≥1 photo; select main photo.
- `GET /api/me/pets` returns only owner’s pets with main photo inline.

**Pet Care**

- `GET /api/pets/:id/care/today` shows feeding AM/PM items + any due events.
- Tapping Done on an item:
  - Creates a `care_logs` row,
  - Updates/creates the next `care_events` row if tied to a template,
  - Reflects immediately in UI on refresh.

---

## 🧭 Implementation Order (2 sprints)

**Sprint 1 — Profiles**

1. DB: `pets`, `pet_photos`
2. BE: CRUD for pets + photo upload + main photo switch
3. FE: Pet form + dashboard + gallery

**Sprint 2 — Care**

1. DB: `care_templates`, `care_events`, `care_logs`
2. BE: Templates, events, logs, today checklist
3. FE: Care tab (Today/Upcoming/Log), quick-add actions

---

## 🧱 Infra & Security Notes

- Auth: JWT (bearer) on all pet & care routes
- Storage: S3 (recommended) or local `/uploads`
- Validations: Ownership checks on all `:id` resources
- Testing: Unit (BE), light E2E for checklist flow
