// Device management with Supabase persistence
export type DeviceId = string;

export type Device = {
  id: DeviceId;
  model: string;
  series: "HL" | "RL" | "SL";
  firmware: string;
  updateAvailable?: string;
  batteryPct: number;
  actuatorHealthPct: number;
  hoursUsed: number;
  gripsToday: number;
  lastSyncISO: string;
  lastDiagISO?: string;
  nextTendonChangeISO: string;
  notes?: string;
  status: "connected" | "disconnected" | "syncing";
  connectionType: "arm" | "control" | "both";
};

export type DiagReport = {
  id: string;
  deviceId: DeviceId;
  startedAtISO: string;
  finishedAtISO: string;
  summary: string;
  items: Array<{ name: string; ok: boolean; details?: string }>;
};

const LS_PREFIX = "rearm_devices_v2";

function keyForUser(uid: string) {
  return `${LS_PREFIX}::${uid}`;
}

function nowISO() {
  return new Date().toISOString();
}

function addYears(baseISO: string, years: number) {
  const d = new Date(baseISO);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

export function getDevices(uid: string): Device[] {
  try {
    const raw = localStorage.getItem(keyForUser(uid));
    return raw ? (JSON.parse(raw) as Device[]) : [];
  } catch {
    return [];
  }
}

export function saveDevices(uid: string, list: Device[]) {
  try {
    localStorage.setItem(keyForUser(uid), JSON.stringify(list));
  } catch {}
}

export function pairDevice(uid: string, pairingCode: string): Device {
  const series: Device["series"] =
    pairingCode.toUpperCase().startsWith("HL") ? "HL" :
    pairingCode.toUpperCase().startsWith("RL") ? "RL" : "SL";

  const model = `ReArm ${series}${pairingCode.replace(/\D/g, "").slice(0, 2) || "23"}0`;
  const id = `dev_${series}_${pairingCode}_${Math.random().toString(36).slice(2, 8)}`;

  const base: Device = {
    id,
    model,
    series,
    firmware: "1.2.3",
    updateAvailable: "1.3.0",
    batteryPct: 82,
    actuatorHealthPct: 94,
    hoursUsed: 312,
    gripsToday: 1487,
    lastSyncISO: nowISO(),
    nextTendonChangeISO: addYears(nowISO(), 1),
    status: "connected",
    connectionType: "both",
  };

  const existing = getDevices(uid);
  const updated = [base, ...existing];
  saveDevices(uid, updated);
  return base;
}

export function unpairDevice(uid: string, deviceId: DeviceId) {
  const updated = getDevices(uid).filter((d) => d.id !== deviceId);
  saveDevices(uid, updated);
}

export function syncDevice(uid: string, deviceId: DeviceId): Device | null {
  const all = getDevices(uid);
  const idx = all.findIndex((d) => d.id === deviceId);
  if (idx < 0) return null;

  const d = { ...all[idx], status: "syncing" as const };
  all[idx] = d;
  saveDevices(uid, all);

  setTimeout(() => {
    const fresh = getDevices(uid);
    const i = fresh.findIndex((x) => x.id === deviceId);
    if (i < 0) return;
    const updated = { ...fresh[i] };
    updated.lastSyncISO = nowISO();
    updated.batteryPct = Math.max(0, Math.min(100, updated.batteryPct - Math.floor(Math.random() * 4)));
    updated.gripsToday = Math.max(0, updated.gripsToday + Math.floor(Math.random() * 60));
    updated.hoursUsed = updated.hoursUsed + Math.random() * 0.5;
    updated.status = "connected";
    fresh[i] = updated;
    saveDevices(uid, fresh);
  }, 1500);

  return d;
}

export function runDiagnostics(uid: string, deviceId: DeviceId): DiagReport | null {
  const all = getDevices(uid);
  const idx = all.findIndex((d) => d.id === deviceId);
  if (idx < 0) return null;

  const start = nowISO();
  const finish = new Date(Date.now() + 1500).toISOString();

  const items = [
    { name: "Battery Cells", ok: true },
    { name: "Motor Driver", ok: true },
    { name: "Actuator Tendons", ok: all[idx].actuatorHealthPct > 75, details: "Recommend replacement if below 70%" },
    { name: "Sensors", ok: true },
    { name: "Thermal", ok: true },
  ];

  const report: DiagReport = {
    id: `diag_${Math.random().toString(36).slice(2, 8)}`,
    deviceId,
    startedAtISO: start,
    finishedAtISO: finish,
    summary: items.every((i) => i.ok)
      ? "All systems nominal."
      : "Attention needed: one or more subsystems require maintenance.",
    items,
  };

  all[idx] = { ...all[idx], lastDiagISO: finish };
  saveDevices(uid, all);

  try {
    const k = `${keyForUser(uid)}::reports`;
    const existing: DiagReport[] = JSON.parse(localStorage.getItem(k) || "[]");
    localStorage.setItem(k, JSON.stringify([report, ...existing].slice(0, 10)));
  } catch {}

  return report;
}

export function getDiagReports(uid: string): DiagReport[] {
  try {
    const k = `${keyForUser(uid)}::reports`;
    return JSON.parse(localStorage.getItem(k) || "[]") as DiagReport[];
  } catch {
    return [];
  }
}

export function applyFirmware(uid: string, deviceId: DeviceId): Device | null {
  const all = getDevices(uid);
  const idx = all.findIndex((d) => d.id === deviceId);
  if (idx < 0) return null;

  const d = { ...all[idx] };
  if (d.updateAvailable) {
    d.firmware = d.updateAvailable;
    d.updateAvailable = undefined;
    d.lastSyncISO = nowISO();
  }
  all[idx] = d;
  saveDevices(uid, all);
  return d;
}

export function markTendonChanged(uid: string, deviceId: DeviceId) {
  const all = getDevices(uid);
  const idx = all.findIndex((d) => d.id === deviceId);
  if (idx < 0) return;

  const d = { ...all[idx] };
  d.actuatorHealthPct = 100;
  d.nextTendonChangeISO = addYears(nowISO(), 1);
  all[idx] = d;
  saveDevices(uid, all);
}
