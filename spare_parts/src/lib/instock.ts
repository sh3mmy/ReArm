// src/lib/instock.ts
// Tiny inventory store for ReArm internal product numbers (e.g., "HL230").
// Persists to localStorage and exposes safe helpers for reading/updating stock.
//
// Usage examples:
//   import * as Stock from '@/lib/instock';
//   Stock.setStock('HL230', 5);
//   if (Stock.isAvailable('HL230', 1)) { Stock.reserve('HL230', 1); }
//
//   // Validate a cart / booking:
//   const check = Stock.validateOrder([{ id: 'HL230', qty: 1 }, { id: 'RL210', qty: 2 }]);
//   if (!check.ok) console.warn(check.issues);
//
// NOTE: Local-only by default. If you add an API, replace load/save with fetch/POST.

export type ProductId = string; // e.g., "HL230", "RL210", "SL310"

export type StockRecord = {
  qty: number;              // current available units
  updatedAt: string;        // ISO timestamp
};

export type Inventory = Record<ProductId, StockRecord>;

export type OrderLine = { id: ProductId; qty: number };

const STORAGE_KEY = 'rearm_inventory_v1';

// --- Default seed (optional). Adjust or remove in production.
const DEFAULT_SEED: Inventory = {
  // HL (TransHumeral)
  HL130: { qty: 3, updatedAt: new Date().toISOString() },
  HL230: { qty: 2, updatedAt: new Date().toISOString() },
  HL231: { qty: 1, updatedAt: new Date().toISOString() },
  HL233: { qty: 0, updatedAt: new Date().toISOString() },

  // RL (TransRadial)
  RL110: { qty: 4, updatedAt: new Date().toISOString() },
  RL210: { qty: 5, updatedAt: new Date().toISOString() },

  // SL (Shoulder Disarticulation)
  SL210: { qty: 2, updatedAt: new Date().toISOString() },
};

/** Safely parse JSON. */
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Load inventory from storage (or seed). */
export function loadInventory(): Inventory {
  const stored = safeParse<Inventory>(localStorage.getItem(STORAGE_KEY));
  if (stored && typeof stored === 'object') return stored;
  // Initialize with seed once
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
  return { ...DEFAULT_SEED };
}

/** Save inventory to storage. */
export function saveInventory(inv: Inventory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
}

/** Clear inventory (dangerous; mostly for tests). */
export function clearInventory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Ensure a product key exists in the map. */
function ensure(inv: Inventory, id: ProductId): void {
  if (!inv[id]) {
    inv[id] = { qty: 0, updatedAt: new Date().toISOString() };
  }
}

/** Get current stock for a product. */
export function getStock(id: ProductId): number {
  const inv = loadInventory();
  return inv[id]?.qty ?? 0;
}

/** Set absolute stock for a product (cannot go below 0). */
export function setStock(id: ProductId, qty: number): StockRecord {
  const inv = loadInventory();
  ensure(inv, id);
  inv[id].qty = Math.max(0, Math.floor(qty));
  inv[id].updatedAt = new Date().toISOString();
  saveInventory(inv);
  broadcast(); // notify subscribers
  return inv[id];
}

/** Adjust stock by a delta (positive or negative). Floors at 0. */
export function adjustStock(id: ProductId, delta: number): StockRecord {
  const inv = loadInventory();
  ensure(inv, id);
  inv[id].qty = Math.max(0, inv[id].qty + Math.floor(delta));
  inv[id].updatedAt = new Date().toISOString();
  saveInventory(inv);
  broadcast();
  return inv[id];
}

/** Is there at least `qty` available for this product? */
export function isAvailable(id: ProductId, qty = 1): boolean {
  return getStock(id) >= qty;
}

/** Attempt to reserve (decrement) stock. Returns true if successful. */
export function reserve(id: ProductId, qty = 1): boolean {
  const inv = loadInventory();
  ensure(inv, id);
  if (inv[id].qty < qty) return false;
  inv[id].qty -= Math.floor(qty);
  inv[id].updatedAt = new Date().toISOString();
  saveInventory(inv);
  broadcast();
  return true;
}

/** Release (increment) stock, e.g., on cancellation. */
export function release(id: ProductId, qty = 1): StockRecord {
  return adjustStock(id, Math.floor(qty));
}

/** Validate an order (list of product/qty). */
export function validateOrder(lines: OrderLine[]): { ok: boolean; issues: string[] } {
  const inv = loadInventory();
  const issues: string[] = [];

  for (const line of lines) {
    const s = inv[line.id]?.qty ?? 0;
    if (line.qty <= 0) {
      issues.push(`Invalid quantity for ${line.id}: ${line.qty}`);
    } else if (s < line.qty) {
      issues.push(`Insufficient stock for ${line.id}: requested ${line.qty}, in stock ${s}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

/** Apply a whole order, atomically (all-or-nothing). */
export function commitOrder(lines: OrderLine[]): { ok: boolean; issues: string[] } {
  const check = validateOrder(lines);
  if (!check.ok) return check;

  const inv = loadInventory();
  for (const line of lines) {
    ensure(inv, line.id);
    inv[line.id].qty -= Math.floor(line.qty);
    inv[line.id].updatedAt = new Date().toISOString();
  }
  saveInventory(inv);
  broadcast();
  return { ok: true, issues: [] };
}

/** List all SKUs and stock, sorted by series then SKU. */
export function listAll(): Array<{ id: ProductId; qty: number; updatedAt: string }> {
  const inv = loadInventory();
  return Object.entries(inv)
    .map(([id, r]) => ({ id, qty: r.qty, updatedAt: r.updatedAt }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Remove a SKU from inventory. */
export function removeSKU(id: ProductId): void {
  const inv = loadInventory();
  if (inv[id]) {
    delete inv[id];
    saveInventory(inv);
    broadcast();
  }
}

// -----------------------------
// Change subscriptions (UI sync)
// -----------------------------
type Listener = () => void;
const CHANNEL = 'rearm_inventory_channel';
let listeners = new Set<Listener>();

/** Subscribe to inventory changes (local + cross-tab). */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Internal: notify all listeners. */
function broadcast() {
  listeners.forEach((fn) => fn());
  // Also notify other tabs via localStorage event
  try {
    localStorage.setItem(CHANNEL, String(Date.now()));
    localStorage.removeItem(CHANNEL);
  } catch {}
}

/** Cross-tab sync: listen to storage events. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === CHANNEL) {
      listeners.forEach((fn) => fn());
    }
  });
}

// ----------------------------------
// Optional helpers for YourArm/Book
// ----------------------------------

/** Guard: block booking if SKU is out of stock. */
export function canBook(productNumber: ProductId): boolean {
  return isAvailable(productNumber, 1);
}

/** Use this right before confirming a demo to decrement parts. */
export function consumeForDemo(productNumber: ProductId): boolean {
  // Example policy: reserve exactly 1 unit of the configured SKU
  return reserve(productNumber, 1);
}
