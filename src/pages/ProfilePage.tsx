// src/pages/ProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  applyFirmware,
  Device,
  DiagReport,
  getDiagReports,
  getDevices,
  markTendonChanged,
  pairDevice,
  runDiagnostics,
  syncDevice,
  unpairDevice,
} from "../lib/devices";

// Reuse the configurator summary if present
const LS_SELECTION = "rearmSelection"; // { productNumber, finish }

const BatteryBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-3 rounded bg-white/10 overflow-hidden">
    <div
      className={`h-full ${
        pct > 40 ? "bg-green-400" : pct > 15 ? "bg-yellow-400" : "bg-red-400"
      }`}
      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
    />
  </div>
);

const HealthBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-3 rounded bg-white/10 overflow-hidden">
    <div
      className={`h-full ${
        pct > 80 ? "bg-green-400" : pct > 60 ? "bg-yellow-400" : "bg-red-400"
      }`}
      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
    />
  </div>
);

function fmt(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [reports, setReports] = useState<DiagReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pairCode, setPairCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Load configurator summary
  const selection = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_SELECTION);
      return raw ? (JSON.parse(raw) as { productNumber?: string; finish?: string }) : null;
    } catch {
      return null;
    }
  }, []);

  // Load devices and reports for user
  useEffect(() => {
    if (!user?.uid) return;
    setDevices(getDevices(user.uid));
    setReports(getDiagReports(user.uid));
  }, [user?.uid]);

  // Keep note field in sync with selected device
  useEffect(() => {
    if (!user?.uid) return;
    const selected = devices.find((d) => d.id === (selectedId || devices[0]?.id));
    setNoteDraft(selected?.notes || "");
  }, [devices, selectedId, user?.uid]);

  const selected = devices.find((d) => d.id === (selectedId || devices[0]?.id)) || null;

  // Pair a new device
  const onPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !pairCode.trim()) return;
    setBusy("pair");
    setTimeout(() => {
      const dev = pairDevice(user.uid!, pairCode.trim());
      setDevices(getDevices(user.uid!));
      setSelectedId(dev.id);
      setPairCode("");
      setBusy(null);
    }, 350);
  };

  // Save note to storage
  const saveNote = () => {
    if (!user?.uid || !selected) return;
    const updated = devices.map((d) => (d.id === selected.id ? { ...d, notes: noteDraft } : d));
    localStorage.setItem(`rearm_devices_v1::${user.uid}`, JSON.stringify(updated));
    setDevices(updated);
  };

  // Device actions
  const doSync = () => {
    if (!user?.uid || !selected) return;
    setBusy("sync");
    setTimeout(() => {
      const d = syncDevice(user.uid!, selected.id);
      if (d) setDevices((prev) => prev.map((x) => (x.id === d.id ? d : x)));
      setBusy(null);
    }, 500);
  };
  const doDiag = () => {
    if (!user?.uid || !selected) return;
    setBusy("diag");
    setTimeout(() => {
      const r = runDiagnostics(user.uid!, selected.id);
      if (r) setReports((prev) => [r, ...prev].slice(0, 10));
      setBusy(null);
    }, 900);
  };
  const doOTA = () => {
    if (!user?.uid || !selected) return;
    setBusy("ota");
    setTimeout(() => {
      const d = applyFirmware(user.uid!, selected.id);
      if (d) setDevices((prev) => prev.map((x) => (x.id === d.id ? d : x)));
      setBusy(null);
    }, 800);
  };
  const doUnpair = () => {
    if (!user?.uid || !selected) return;
    setBusy("unpair");
    setTimeout(() => {
      unpairDevice(user.uid!, selected.id);
      const fresh = getDevices(user.uid!);
      setDevices(fresh);
      setSelectedId(fresh[0]?.id || null);
      setBusy(null);
    }, 300);
  };
  const doTendonChange = () => {
    if (!user?.uid || !selected) return;
    setBusy("tendon");
    setTimeout(() => {
      markTendonChanged(user.uid!, selected.id);
      setDevices(getDevices(user.uid!));
      setBusy(null);
    }, 400);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">Device Hub</h1>
          <p className="text-white/70 mt-2">
            You’re not signed in. Use the Account button to sign in or “Skip login (dev)”.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1100px_600px_at_50%_-140px,rgba(255,255,255,0.12),transparent)]" />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 relative">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Device Hub</h1>
            <p className="text-white/70 text-sm">
              Pair your prosthetic, get OTA updates, run diagnostics, and track maintenance.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5"
          >
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* LEFT: List + Pair */}
          <aside className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur p-5 h-fit">
            <div className="text-lg font-medium">My Devices</div>
            <ul className="mt-3 space-y-2">
              {devices.map((d, i) => {
                const isActive = (selectedId ?? devices[0]?.id) === d.id || (!selectedId && i === 0);
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelectedId(d.id)}
                      className={`w-full text-left rounded-xl px-3 py-2 border transition ${
                        isActive
                          ? "border-white bg-white/10"
                          : "border-white/20 hover:border-white/40 hover:bg-white/5"
                      }`}
                    >
                      <div className="font-medium">{d.model}</div>
                      <div className="text-white/60 text-xs">
                        FW {d.firmware} {d.updateAvailable ? `• Update → ${d.updateAvailable}` : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
              {devices.length === 0 && (
                <li className="text-white/60 text-sm">No devices yet.</li>
              )}
            </ul>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-white/80 text-sm mb-2">Pair a device</div>
              <form onSubmit={onPair} className="flex gap-2">
                <input
                  value={pairCode}
                  onChange={(e) => setPairCode(e.target.value)}
                  placeholder="Enter pairing code (e.g. HL230A1)"
                  className="flex-1 rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={!pairCode.trim() || !!busy}
                  className={`px-3 py-2 rounded-xl transition ${
                    !pairCode.trim() || !!busy
                      ? "bg-white/10 text-white/40"
                      : "bg-white text-black hover:opacity-90"
                  }`}
                >
                  {busy === "pair" ? "Pairing…" : "Pair"}
                </button>
              </form>
              <div className="text-white/40 text-xs mt-2">
                Use the code shown in the ReArm app or on your clinic sheet.
              </div>
            </div>
          </aside>

          {/* RIGHT: Detail */}
          <section className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur p-5">
            {!selected ? (
              <div className="text-white/60">Select or pair a device to view details.</div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">{selected.model}</div>
                    <div className="text-white/60 text-sm">Last sync: {fmt(selected.lastSyncISO)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={doSync}
                      disabled={busy === "sync"}
                      className={`px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 ${
                        busy === "sync" ? "opacity-50" : ""
                      }`}
                    >
                      {busy === "sync" ? "Syncing…" : "Sync now"}
                    </button>
                    <button
                      onClick={doDiag}
                      disabled={busy === "diag"}
                      className={`px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 ${
                        busy === "diag" ? "opacity-50" : ""
                      }`}
                    >
                      {busy === "diag" ? "Running…" : "Run diagnostics"}
                    </button>
                    {selected.updateAvailable ? (
                      <button
                        onClick={doOTA}
                        disabled={busy === "ota"}
                        className={`px-3 py-2 rounded-xl bg-white text-black hover:opacity-90 ${
                          busy === "ota" ? "opacity-70" : ""
                        }`}
                      >
                        {busy === "ota" ? "Updating…" : `Update to ${selected.updateAvailable}`}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-2 rounded-xl border border-white/20 text-white/40"
                        title="Your firmware is up to date"
                      >
                        FW {selected.firmware} ✓
                      </button>
                    )}
                    <button
                      onClick={doUnpair}
                      disabled={busy === "unpair"}
                      className={`px-3 py-2 rounded-xl border border-red-400 text-red-200 hover:bg-red-500/10 ${
                        busy === "unpair" ? "opacity-50" : ""
                      }`}
                    >
                      {busy === "unpair" ? "Removing…" : "Unpair"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  {/* Battery */}
                  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                    <div className="text-white/70 text-sm">Battery</div>
                    <div className="mt-2 flex items-end gap-3">
                      <div className="text-2xl font-semibold">
                        {Math.round(selected.batteryPct)}%
                      </div>
                    </div>
                    <div className="mt-2">
                      <BatteryBar pct={selected.batteryPct} />
                    </div>
                    <div className="text-white/60 text-xs mt-2">
                      {selected.batteryPct > 50
                        ? "Estimated: all-day use"
                        : selected.batteryPct > 20
                        ? "Estimated: half-day"
                        : "Charge soon"}
                    </div>
                  </div>

                  {/* Actuator health */}
                  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                    <div className="text-white/70 text-sm">Actuator Tendons</div>
                    <div className="mt-2 text-2xl font-semibold">
                      {Math.round(selected.actuatorHealthPct)}%
                    </div>
                    <div className="mt-2">
                      <HealthBar pct={selected.actuatorHealthPct} />
                    </div>
                    <div className="text-white/60 text-xs mt-2">
                      Next recommended change:{" "}
                      {new Date(selected.nextTendonChangeISO).toLocaleDateString()}
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={doTendonChange}
                        disabled={busy === "tendon"}
                        className={`px-3 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 ${
                          busy === "tendon" ? "opacity-50" : ""
                        }`}
                      >
                        Mark tendon changed
                      </button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                    <div className="text-white/70 text-sm">Usage</div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-white/60">Hours used</div>
                        <div className="text-xl font-semibold">
                          {selected.hoursUsed.toFixed(1)}h
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">Grips today</div>
                        <div className="text-xl font-semibold">
                          {selected.gripsToday}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
                    <div className="text-white/70 text-sm">Device notes</div>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onBlur={saveNote}
                      rows={4}
                      className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-white/40"
                      placeholder="Add any fit/comfort/usage notes for your clinician…"
                    />
                    <div className="text-white/40 text-xs mt-1">Saved on blur.</div>
                  </div>
                </div>

                {/* Configurator selection */}
                <div className="mt-6 rounded-2xl border border-white/10 p-4 bg-white/5">
                  <div className="text-white/70 text-sm">Current configuration</div>
                  {selection ? (
                    <div className="mt-2">
                      <div className="text-white/60 text-xs">Internal Product Number</div>
                      <div className="text-lg font-semibold">{selection.productNumber || "—"}</div>
                      <div className="text-white/80 text-sm mt-1">
                        Finish: <span className="text-white">{selection.finish || "—"}</span>
                      </div>
                      <div className="mt-2">
                        <a
                          href="/your-arm"
                          className="text-sm underline underline-offset-4 text-white/80 hover:text-white"
                        >
                          Edit in configurator
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-white/60 text-sm">
                      No saved configuration.{" "}
                      <a href="/your-arm" className="underline hover:text-white">
                        Choose your arm
                      </a>.
                    </div>
                  )}
                </div>

                {/* Diagnostics history */}
                <div className="mt-6 rounded-2xl border border-white/10 p-4 bg-white/5">
                  <div className="text-white/70 text-sm">Diagnostics history</div>
                  {reports.length === 0 ? (
                    <div className="text-white/60 text-sm mt-2">No diagnostics run yet.</div>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {reports.map((r) => (
                        <li key={r.id} className="rounded-xl border border-white/10 p-3 bg-black/40">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{fmt(r.finishedAtISO)}</div>
                            <div className="text-white/60 text-sm">{r.summary}</div>
                          </div>
                          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {r.items.map((i, idx) => (
                              <li key={idx} className="text-sm">
                                <span
                                  className={`mr-2 ${i.ok ? "text-green-400" : "text-red-400"}`}
                                >
                                  {i.ok ? "✓" : "•"}
                                </span>
                                <span className="text-white/80">{i.name}</span>
                                {i.details && (
                                  <span className="text-white/50"> — {i.details}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
