-- Create the database (run this manually if needed)
-- CREATE DATABASE dressform;

-- Create the dress entries table
CREATE TABLE IF NOT EXISTS dress_entries (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  age INTEGER,
  dress_type VARCHAR(50),
  dress_size VARCHAR(10),
  preferred_styles TEXT[],
  favorite_colors VARCHAR(200),
  budget_range VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
