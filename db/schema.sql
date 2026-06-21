-- Local SQLite schema for ReArm
-- Run: sqlite3 rearm.db < db/schema.sql

PRAGMA foreign_keys = ON;

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  times TEXT NOT NULL, -- JSON array of strings
  created_at TEXT DEFAULT (datetime('now'))
);

-- Availability table
CREATE TABLE IF NOT EXISTS clinic_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  available_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Demo bookings table
CREATE TABLE IF NOT EXISTS demo_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id TEXT NOT NULL REFERENCES clinics(id),
  product_number TEXT,
  finish TEXT,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  notes TEXT,
  agree_terms INTEGER NOT NULL DEFAULT 0,
  agree_privacy INTEGER NOT NULL DEFAULT 0,
  agree_marketing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed clinics (UK locations)
INSERT OR IGNORE INTO clinics (id, name, address, latitude, longitude, times) VALUES
  ('lon', 'ReArm London Clinic', '221B Baker St, London NW1 6XE', 51.5203, -0.1568, '["09:00","10:30","13:00","15:30"]'),
  ('man', 'ReArm Manchester Clinic', '1 St Peter''s Sq, Manchester M2 3AE', 53.4781, -2.2437, '["09:30","11:00","14:00","16:00"]'),
  ('edi', 'ReArm Edinburgh Clinic', '10 Princes St, Edinburgh EH2 2AN', 55.9533, -3.1883, '["10:00","12:00","14:30","17:00"]'),
  ('bri', 'ReArm Bristol Clinic', '1 Cabot Circus, Bristol BS1 3BX', 51.4545, -2.5879, '["09:00","11:30","14:00","16:30"]'),
  ('car', 'ReArm Cardiff Clinic', 'St David''s Hall, Cardiff CF10 1SL', 51.4816, -3.1791, '["09:15","11:45","14:15","16:45"]'),
  ('bir', 'ReArm Birmingham Clinic', 'Bullring, Birmingham B5 4BP', 52.4779, -1.8942, '["09:00","10:45","13:15","15:45"]'),
  ('gla', 'ReArm Glasgow Clinic', 'Buchanan Galleries, Glasgow G1 2GF', 55.8642, -4.2518, '["09:30","12:00","14:30","17:00"]'),
  ('liv', 'ReArm Liverpool Clinic', 'Liverpool ONE, Liverpool L1 8JQ', 53.4044, -2.9814, '["09:00","11:00","13:30","16:00"]'),
  ('lee', 'ReArm Leeds Clinic', 'Trinity Leeds, Leeds LS1 5AT', 53.7963, -1.5478, '["09:15","11:30","14:00","16:30"]'),
  ('new', 'ReArm Newcastle Clinic', 'Eldon Square, Newcastle upon Tyne NE1 7ST', 54.9783, -1.6178, '["09:00","11:00","13:30","16:00"]');

-- Seed availability (green days) for Aug/Sep 2025
INSERT OR IGNORE INTO clinic_availability (clinic_id, available_date) VALUES
  ('lon', '2025-08-18'), ('lon', '2025-08-21'), ('lon', '2025-08-25'), ('lon', '2025-09-02'), ('lon', '2025-09-05'), ('lon', '2025-09-12'),
  ('man', '2025-08-20'), ('man', '2025-08-27'), ('man', '2025-09-03'), ('man', '2025-09-10'),
  ('edi', '2025-08-19'), ('edi', '2025-08-22'), ('edi', '2025-08-29'), ('edi', '2025-09-06'), ('edi', '2025-09-13'),
  ('bri', '2025-08-18'), ('bri', '2025-08-26'), ('bri', '2025-09-03'), ('bri', '2025-09-10'),
  ('car', '2025-08-19'), ('car', '2025-08-28'), ('car', '2025-09-04'), ('car', '2025-09-11'),
  ('bir', '2025-08-20'), ('bir', '2025-08-27'), ('bir', '2025-09-05'), ('bir', '2025-09-12'),
  ('gla', '2025-08-21'), ('gla', '2025-08-28'), ('gla', '2025-09-06'), ('gla', '2025-09-13'),
  ('liv', '2025-08-22'), ('liv', '2025-08-29'), ('liv', '2025-09-07'), ('liv', '2025-09-14'),
  ('lee', '2025-08-23'), ('lee', '2025-08-30'), ('lee', '2025-09-08'), ('lee', '2025-09-15'),
  ('new', '2025-08-24'), ('new', '2025-08-31'), ('new', '2025-09-09'), ('new', '2025-09-16');
