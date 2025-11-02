-- Create tracking table for data migrations
CREATE TABLE IF NOT EXISTS data_migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);
