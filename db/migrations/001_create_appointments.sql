-- Create appointments table for tasksphere
-- Run with: psql "$DATABASE_URL" -f db/migrations/001_create_appointments.sql

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer TEXT NOT NULL,
  service TEXT NOT NULL,
  technician TEXT,
  booking_type TEXT,
  store_location TEXT,
  preferred_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status TEXT DEFAULT 'Scheduled',
  created_by TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);
