-- Life of Pets Database Schema
-- Based on ToDo_Documentation.md specification

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS care_logs CASCADE;
DROP TABLE IF EXISTS care_events CASCADE;
DROP TABLE IF EXISTS care_templates CASCADE;
DROP TABLE IF EXISTS pet_photos CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  location VARCHAR(255),
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pets table
CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INT,
  breed VARCHAR(255),
  description TEXT,
  looking_for VARCHAR(255),
  temperament_tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pet photos table
CREATE TABLE pet_photos (
  id SERIAL PRIMARY KEY,
  pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Care templates table (what repeats)
CREATE TABLE care_templates (
  id SERIAL PRIMARY KEY,
  pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('vaccination','bath','feeding','medication','grooming','deworming','flea_tick','exercise')),
  title VARCHAR(255) NOT NULL,
  cadence TEXT,
  time_of_day TIME,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Care events table (what's next due)
CREATE TABLE care_events (
  id SERIAL PRIMARY KEY,
  pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  template_id INT REFERENCES care_templates(id),
  title VARCHAR(255) NOT NULL,
  due_at TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('upcoming','done','skipped','overdue')) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Care logs table (what actually happened)
CREATE TABLE care_logs (
  id SERIAL PRIMARY KEY,
  pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('vaccination','bath','feeding','medication','grooming','deworming','flea_tick','exercise','weight','note')),
  title VARCHAR(255),
  value VARCHAR(255),
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pet_photos_pet_id ON pet_photos(pet_id);
CREATE INDEX idx_pet_photos_is_main ON pet_photos(pet_id, is_main);
CREATE INDEX idx_care_templates_pet_id ON care_templates(pet_id);
CREATE INDEX idx_care_events_pet_id ON care_events(pet_id);
CREATE INDEX idx_care_events_due_at ON care_events(due_at);
CREATE INDEX idx_care_logs_pet_id ON care_logs(pet_id);
CREATE INDEX idx_care_logs_occurred_at ON care_logs(occurred_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_templates_updated_at BEFORE UPDATE ON care_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_events_updated_at BEFORE UPDATE ON care_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
