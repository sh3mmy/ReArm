// src/lib/db.ts
// Local SQLite database client for ReArm.
// Uses sql.js (WebAssembly SQLite) so it runs entirely in the browser.
// The DB is persisted to localStorage as a base64 string.

import initSqlJs from "sql.js";

let dbInstance: any = null;
let SQL: any = null;

const DB_KEY = "rearm_sqlite_db_v1";

export type ClinicRow = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  times: string[];
  created_at: string;
};

export type AvailabilityRow = {
  id: number;
  clinic_id: string;
  available_date: string;
  created_at: string;
};

export type BookingRow = {
  id: number;
  clinic_id: string;
  product_number: string | null;
  finish: string | null;
  booking_date: string;
  booking_time: string;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  notes: string | null;
  agree_terms: number;
  agree_privacy: number;
  agree_marketing: number;
  created_at: string;
};

async function getSQL() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return SQL;
}

async function loadOrCreateDB(): Promise<any> {
  const SQLLib = await getSQL();

  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const binary = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));
      return new SQLLib.Database(binary);
    } catch {
      // fall through to create fresh
    }
  }

  const db = new SQLLib.Database();
  seedDB(db);
  persistDB(db);
  return db;
}

function seedDB(db: any) {
  db.run(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clinics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      times TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clinic_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
      available_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

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
  `);

  const clinics: ClinicRow[] = [
    { id: "lon", name: "ReArm London Clinic", address: "221B Baker St, London NW1 6XE", latitude: 51.5203, longitude: -0.1568, times: ["09:00", "10:30", "13:00", "15:30"], created_at: new Date().toISOString() },
    { id: "man", name: "ReArm Manchester Clinic", address: "1 St Peter's Sq, Manchester M2 3AE", latitude: 53.4781, longitude: -2.2437, times: ["09:30", "11:00", "14:00", "16:00"], created_at: new Date().toISOString() },
    { id: "edi", name: "ReArm Edinburgh Clinic", address: "10 Princes St, Edinburgh EH2 2AN", latitude: 55.9533, longitude: -3.1883, times: ["10:00", "12:00", "14:30", "17:00"], created_at: new Date().toISOString() },
    { id: "bri", name: "ReArm Bristol Clinic", address: "1 Cabot Circus, Bristol BS1 3BX", latitude: 51.4545, longitude: -2.5879, times: ["09:00", "11:30", "14:00", "16:30"], created_at: new Date().toISOString() },
    { id: "car", name: "ReArm Cardiff Clinic", address: "St David's Hall, Cardiff CF10 1SL", latitude: 51.4816, longitude: -3.1791, times: ["09:15", "11:45", "14:15", "16:45"], created_at: new Date().toISOString() },
    { id: "bir", name: "ReArm Birmingham Clinic", address: "Bullring, Birmingham B5 4BP", latitude: 52.4779, longitude: -1.8942, times: ["09:00", "10:45", "13:15", "15:45"], created_at: new Date().toISOString() },
    { id: "gla", name: "ReArm Glasgow Clinic", address: "Buchanan Galleries, Glasgow G1 2GF", latitude: 55.8642, longitude: -4.2518, times: ["09:30", "12:00", "14:30", "17:00"], created_at: new Date().toISOString() },
    { id: "liv", name: "ReArm Liverpool Clinic", address: "Liverpool ONE, Liverpool L1 8JQ", latitude: 53.4044, longitude: -2.9814, times: ["09:00", "11:00", "13:30", "16:00"], created_at: new Date().toISOString() },
    { id: "lee", name: "ReArm Leeds Clinic", address: "Trinity Leeds, Leeds LS1 5AT", latitude: 53.7963, longitude: -1.5478, times: ["09:15", "11:30", "14:00", "16:30"], created_at: new Date().toISOString() },
    { id: "new", name: "ReArm Newcastle Clinic", address: "Eldon Square, Newcastle upon Tyne NE1 7ST", latitude: 54.9783, longitude: -1.6178, times: ["09:00", "11:00", "13:30", "16:00"], created_at: new Date().toISOString() },
  ];

  for (const c of clinics) {
    db.run(
      `INSERT OR IGNORE INTO clinics (id, name, address, latitude, longitude, times, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.address, c.latitude, c.longitude, JSON.stringify(c.times), c.created_at]
    );
  }

  const availability: [string, string][] = [
    ["lon", "2025-08-18"], ["lon", "2025-08-21"], ["lon", "2025-08-25"], ["lon", "2025-09-02"], ["lon", "2025-09-05"], ["lon", "2025-09-12"],
    ["man", "2025-08-20"], ["man", "2025-08-27"], ["man", "2025-09-03"], ["man", "2025-09-10"],
    ["edi", "2025-08-19"], ["edi", "2025-08-22"], ["edi", "2025-08-29"], ["edi", "2025-09-06"], ["edi", "2025-09-13"],
    ["bri", "2025-08-18"], ["bri", "2025-08-26"], ["bri", "2025-09-03"], ["bri", "2025-09-10"],
    ["car", "2025-08-19"], ["car", "2025-08-28"], ["car", "2025-09-04"], ["car", "2025-09-11"],
    ["bir", "2025-08-20"], ["bir", "2025-08-27"], ["bir", "2025-09-05"], ["bir", "2025-09-12"],
    ["gla", "2025-08-21"], ["gla", "2025-08-28"], ["gla", "2025-09-06"], ["gla", "2025-09-13"],
    ["liv", "2025-08-22"], ["liv", "2025-08-29"], ["liv", "2025-09-07"], ["liv", "2025-09-14"],
    ["lee", "2025-08-23"], ["lee", "2025-08-30"], ["lee", "2025-09-08"], ["lee", "2025-09-15"],
    ["new", "2025-08-24"], ["new", "2025-08-31"], ["new", "2025-09-09"], ["new", "2025-09-16"],
  ];

  for (const [cid, date] of availability) {
    db.run(
      `INSERT OR IGNORE INTO clinic_availability (clinic_id, available_date) VALUES (?, ?)`,
      [cid, date]
    );
  }
}

function persistDB(db: any) {
  try {
    const data = db.export();
    const binary = Array.from(data)
      .map((b: number) => String.fromCharCode(b))
      .join("");
    localStorage.setItem(DB_KEY, btoa(binary));
  } catch {
    // ignore quota errors
  }
}

async function getDB(): Promise<any> {
  if (!dbInstance) {
    dbInstance = await loadOrCreateDB();
  }
  return dbInstance;
}

function queryAll<T>(stmt: any): T[] {
  const rows: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push(row as T);
  }
  stmt.free();
  return rows;
}

// ---------- Public API ----------

export async function getClinics(): Promise<ClinicRow[]> {
  const db = await getDB();
  const stmt = db.prepare("SELECT * FROM clinics ORDER BY id");
  const rows = queryAll<ClinicRow>(stmt);
  return rows.map((r) => ({ ...r, times: JSON.parse(r.times as unknown as string) }));
}

export async function getAvailability(): Promise<AvailabilityRow[]> {
  const db = await getDB();
  const stmt = db.prepare("SELECT * FROM clinic_availability");
  return queryAll<AvailabilityRow>(stmt);
}

export async function getAvailabilityMap(): Promise<Record<string, Set<string>>> {
  const rows = await getAvailability();
  const map: Record<string, Set<string>> = {};
  for (const r of rows) {
    if (!map[r.clinic_id]) map[r.clinic_id] = new Set();
    map[r.clinic_id].add(r.available_date);
  }
  return map;
}

export async function insertBooking(payload: {
  clinic_id: string;
  product_number: string | null;
  finish: string | null;
  booking_date: string;
  booking_time: string;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  notes: string | null;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing: boolean;
}): Promise<{ error?: string }> {
  const db = await getDB();
  try {
    db.run(
      `INSERT INTO demo_bookings
        (clinic_id, product_number, finish, booking_date, booking_time, name, email, phone, address, notes, agree_terms, agree_privacy, agree_marketing)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.clinic_id,
        payload.product_number,
        payload.finish,
        payload.booking_date,
        payload.booking_time,
        payload.name,
        payload.email,
        payload.phone,
        payload.address,
        payload.notes,
        payload.agree_terms ? 1 : 0,
        payload.agree_privacy ? 1 : 0,
        payload.agree_marketing ? 1 : 0,
      ]
    );
    persistDB(db);
    return {};
  } catch (e: any) {
    return { error: e?.message || "Insert failed" };
  }
}

export async function getBookings(): Promise<BookingRow[]> {
  const db = await getDB();
  const stmt = db.prepare("SELECT * FROM demo_bookings ORDER BY created_at DESC");
  return queryAll<BookingRow>(stmt);
}

export function resetDB() {
  localStorage.removeItem(DB_KEY);
  dbInstance = null;
}
