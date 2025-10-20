-- Test User Seed Data
-- Default test credentials for easy development and testing
-- Email: test@lifeofpets.com
-- Password: test123

-- Insert test user (password hash is for "test123")
INSERT INTO users (email, password_hash, name, location, created_at, updated_at)
VALUES (
  'test@lifeofpets.com',
  '$2b$10$YQmF7P7xN8iKYxGzKW7nVeX8Q6FZ.9qV3xK9WqGX3Q1L8BZ7X9Y1m',  -- bcrypt hash for "test123"
  'Test User',
  'San Francisco, CA',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Add a sample pet for the test user
INSERT INTO pets (user_id, name, age, breed, description, temperament_tags, created_at, updated_at)
SELECT
  u.id,
  'Buddy',
  3,
  'Golden Retriever',
  'Friendly and energetic dog who loves to play fetch and go for long walks.',
  ARRAY['friendly', 'energetic', 'playful'],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'test@lifeofpets.com'
ON CONFLICT DO NOTHING;

SELECT '✅ Test user created successfully!' as message;
SELECT '📧 Email: test@lifeofpets.com' as credentials;
SELECT '🔑 Password: test123' as password;
