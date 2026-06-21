/*
# ReArm Database Schema — Initial Migration

1. New Tables
- `clinics` — Stores ReArm clinic locations with real geographic coordinates.
  - `id` (text, primary key) — short code like 'lon', 'man', 'edi'
  - `name` (text) — display name
  - `address` (text) — full street address
  - `latitude` (numeric) — real-world latitude
  - `longitude` (numeric) — real-world longitude
  - `times` (text[]) — available appointment slots
  - `created_at` (timestamptz)

- `clinic_availability` — Per-clinic available dates for booking.
  - `id` (uuid, primary key)
  - `clinic_id` (text, FK to clinics)
  - `available_date` (date) — a date when the clinic has slots open
  - `created_at` (timestamptz)

- `demo_bookings` — Private demo appointment requests.
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
  - `clinic_id` (text, FK to clinics)
  - `product_number` (text) — e.g. "HL230"
  - `finish` (text) — selected finish
  - `booking_date` (date)
  - `booking_time` (text)
  - `name` (text) — contact name
  - `email` (text) — contact email
  - `phone` (text, nullable)
  - `address` (text)
  - `notes` (text, nullable)
  - `agree_terms` (boolean)
  - `agree_privacy` (boolean)
  - `agree_marketing` (boolean)
  - `status` (text, default 'pending') — pending, confirmed, cancelled
  - `created_at` (timestamptz)

- `products` — Prosthetic product catalog.
  - `id` (text, primary key) — internal product number like "HL230"
  - `series` (text) — "HL", "RL", "SL"
  - `gen` (integer) — generation 1, 2, 3
  - `materials` (text[]) — available materials
  - `specs` (text[]) — feature list
  - `stock_qty` (integer, default 0)
  - `created_at` (timestamptz)

- `user_devices` — Paired prosthetic devices per user.
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
  - `device_id` (text) — unique device identifier
  - `model` (text) — e.g. "ReArm HL230"
  - `series` (text) — "HL", "RL", "SL"
  - `firmware` (text)
  - `update_available` (text, nullable)
  - `battery_pct` (integer)
  - `actuator_health_pct` (integer)
  - `hours_used` (numeric)
  - `grips_today` (integer)
  - `last_sync_at` (timestamptz)
  - `last_diag_at` (timestamptz, nullable)
  - `next_tendon_change_at` (timestamptz)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

- `device_diagnostics` — Diagnostic reports per device.
  - `id` (uuid, primary key)
  - `device_id` (uuid, FK to user_devices)
  - `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
  - `summary` (text)
  - `items` (jsonb) — array of {name, ok, details?}
  - `started_at` (timestamptz)
  - `finished_at` (timestamptz)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all new tables.
- Clinics and availability are public read (anon + authenticated).
- Bookings, devices, diagnostics are owner-scoped (authenticated only).

3. Indexes
- clinic_availability.clinic_id + available_date for fast lookup
- demo_bookings.user_id, clinic_id, booking_date
- user_devices.user_id, device_id
- device_diagnostics.device_id, user_id
*/

-- ============================================================
-- CLINICS
-- ============================================================
CREATE TABLE IF NOT EXISTS clinics (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  times text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinics_select_public" ON clinics;
CREATE POLICY "clinics_select_public" ON clinics FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================
-- CLINIC AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id text NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avail_select_public" ON clinic_availability;
CREATE POLICY "avail_select_public" ON clinic_availability FOR SELECT
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_avail_clinic_date ON clinic_availability(clinic_id, available_date);

-- ============================================================
-- DEMO BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  product_number text,
  finish text,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  notes text,
  agree_terms boolean NOT NULL DEFAULT false,
  agree_privacy boolean NOT NULL DEFAULT false,
  agree_marketing boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_own" ON demo_bookings;
CREATE POLICY "bookings_select_own" ON demo_bookings FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_insert_own" ON demo_bookings;
CREATE POLICY "bookings_insert_own" ON demo_bookings FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_update_own" ON demo_bookings;
CREATE POLICY "bookings_update_own" ON demo_bookings FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_delete_own" ON demo_bookings;
CREATE POLICY "bookings_delete_own" ON demo_bookings FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON demo_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON demo_bookings(clinic_id, booking_date);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  series text NOT NULL,
  gen integer NOT NULL,
  materials text[] NOT NULL DEFAULT '{}',
  specs text[] NOT NULL DEFAULT '{}',
  stock_qty integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public" ON products FOR SELECT
TO anon, authenticated USING (true);

-- ============================================================
-- USER DEVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text NOT NULL UNIQUE,
  model text NOT NULL,
  series text NOT NULL,
  firmware text NOT NULL DEFAULT '1.0.0',
  update_available text,
  battery_pct integer NOT NULL DEFAULT 0,
  actuator_health_pct integer NOT NULL DEFAULT 0,
  hours_used numeric NOT NULL DEFAULT 0,
  grips_today integer NOT NULL DEFAULT 0,
  last_sync_at timestamptz DEFAULT now(),
  last_diag_at timestamptz,
  next_tendon_change_at timestamptz NOT NULL DEFAULT (now() + interval '1 year'),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "devices_select_own" ON user_devices;
CREATE POLICY "devices_select_own" ON user_devices FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "devices_insert_own" ON user_devices;
CREATE POLICY "devices_insert_own" ON user_devices FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "devices_update_own" ON user_devices;
CREATE POLICY "devices_update_own" ON user_devices FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "devices_delete_own" ON user_devices;
CREATE POLICY "devices_delete_own" ON user_devices FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON user_devices(device_id);

-- ============================================================
-- DEVICE DIAGNOSTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS device_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  summary text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_diagnostics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "diags_select_own" ON device_diagnostics;
CREATE POLICY "diags_select_own" ON device_diagnostics FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "diags_insert_own" ON device_diagnostics;
CREATE POLICY "diags_insert_own" ON device_diagnostics FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "diags_update_own" ON device_diagnostics;
CREATE POLICY "diags_update_own" ON device_diagnostics FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "diags_delete_own" ON device_diagnostics;
CREATE POLICY "diags_delete_own" ON device_diagnostics FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_diags_device ON device_diagnostics(device_id);
CREATE INDEX IF NOT EXISTS idx_diags_user ON device_diagnostics(user_id);
