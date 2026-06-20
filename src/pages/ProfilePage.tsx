import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  Battery,
  Bluetooth,
  Cpu,
  Download,
  Gauge,
  Link2,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  Stethoscope,
  Trash2,
  Unlink,
  User,
  Wifi,
  Zap,
} from "lucide-react";

const BatteryBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
    <div className={`h-full rounded-full transition-all duration-500 ${pct > 40 ? "bg-emerald-400" : pct > 15 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
  </div>
);

const HealthBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
    <div className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-emerald-400" : pct > 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
  </div>
);

function fmt(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

const LS_SELECTION = "rearmSelection";

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [reports, setReports] = useState<DiagReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pairCode, setPairCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "diagnostics" | "settings">("overview");

  const selection = useMemo(() => {
    try { const raw = localStorage.getItem(LS_SELECTION); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    setDevices(getDevices(user.uid));
    setReports(getDiagReports(user.uid));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const selected = devices.find((d) => d.id === (selectedId || devices[0]?.id));
    setNoteDraft(selected?.notes || "");
  }, [devices, selectedId, user?.uid]);

  const selected = devices.find((d) => d.id === (selectedId || devices[0]?.id)) || null;

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

  const saveNote = () => {
    if (!user?.uid || !selected) return;
    const updated = devices.map((d) => (d.id === selected.id ? { ...d, notes: noteDraft } : d));
    localStorage.setItem(`rearm_devices_v1::${user.uid}`, JSON.stringify(updated));
    setDevices(updated);
  };

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
      <main className="min-h-screen bg-neutral-950 text-white relative">
        <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-24">
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
              <div className="w-2 h-2 rounded-full bg-accent-400" />
            </div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-4">Device Hub</h1>
            <p className="text-neutral-400 max-w-md mx-auto">You are not signed in. Use the Account button to sign in or "Skip login (dev)".</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative">
      <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />

      {/* Top bar: Logo + Account */}
      <div className="relative z-50 flex items-center justify-between px-6 lg:px-8 h-16 border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-xl">
        <Link to="/" className="text-white font-medium text-lg tracking-tight hover:opacity-70 transition-opacity duration-300">
          ReArm<span className="text-accent-400 text-xs align-top">®</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <User size={16} strokeWidth={1.5} />
            <span className="hidden sm:inline">{user.displayName}</span>
          </div>
          <button onClick={() => signOut()} className="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm">
            Sign out
          </button>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="section-label mb-2">Management</div>
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">Device Hub</h1>
          <p className="text-neutral-500 text-sm mt-1">Pair your prosthetic, get OTA updates, run diagnostics, and track maintenance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
          {/* LEFT: Device List + Pair */}
          <aside className="space-y-6">
            {/* Device List */}
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium text-white tracking-tight">My Devices</div>
                <div className="text-xs text-neutral-500">{devices.length} connected</div>
              </div>

              {devices.length === 0 ? (
                <div className="text-neutral-500 text-sm py-4 text-center">No devices yet.</div>
              ) : (
                <div className="space-y-2">
                  {devices.map((d) => {
                    const isActive = (selectedId ?? devices[0]?.id) === d.id || (!selectedId && d.id === devices[0]?.id);
                    const isConnected = d.status === "connected";
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedId(d.id)}
                        className={`w-full text-left rounded-2xl px-4 py-3 border transition-all duration-300 ${
                          isActive ? "border-white bg-white/[0.06]" : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-white">{d.model}</div>
                          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : d.status === "syncing" ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
                        </div>
                        <div className="text-neutral-500 text-xs mt-1 flex items-center gap-2">
                          <span>FW {d.firmware}</span>
                          {d.updateAvailable && <span className="text-accent-400">Update → {d.updateAvailable}</span>}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1"><BatteryBar pct={d.batteryPct} /></div>
                          <span className="text-xs text-neutral-500">{Math.round(d.batteryPct)}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pair New Device */}
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="text-neutral-400 text-sm mb-3 flex items-center gap-2">
                <Link2 size={14} /> Pair a device
              </div>
              <form onSubmit={onPair} className="flex gap-2">
                <input
                  value={pairCode}
                  onChange={(e) => setPairCode(e.target.value)}
                  placeholder="Enter pairing code"
                  className="flex-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 text-white text-sm placeholder-neutral-600 outline-none focus:border-white/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={!pairCode.trim() || !!busy}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    !pairCode.trim() || !!busy
                      ? "bg-white/[0.05] text-neutral-600 border border-white/[0.06]"
                      : "bg-white text-neutral-950 hover:bg-neutral-100"
                  }`}
                >
                  {busy === "pair" ? "Pairing..." : "Pair"}
                </button>
              </form>
              <div className="text-neutral-600 text-xs mt-2">Use the code shown in the ReArm app or on your clinic sheet.</div>
            </div>
          </aside>

          {/* RIGHT: Device Detail Dashboard */}
          <section>
            {!selected ? (
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                  <Smartphone size={32} className="text-neutral-600" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Device Selected</h3>
                <p className="text-neutral-500 text-sm max-w-md mx-auto">Select a device from the list or pair a new one to view details, run diagnostics, and manage settings.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Device Header */}
                <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selected.status === "connected" ? "bg-emerald-500/10 border border-emerald-500/20" :
                        selected.status === "syncing" ? "bg-amber-500/10 border border-amber-500/20" :
                        "bg-red-500/10 border border-red-500/20"
                      }`}>
                        {selected.status === "connected" ? <Wifi size={20} className="text-emerald-400" /> :
                         selected.status === "syncing" ? <RefreshCw size={20} className="text-amber-400 animate-spin" /> :
                         <Unlink size={20} className="text-red-400" />}
                      </div>
                      <div>
                        <div className="text-xl font-medium text-white tracking-tight">{selected.model}</div>
                        <div className="text-neutral-500 text-sm flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${selected.status === "connected" ? "bg-emerald-400" : selected.status === "syncing" ? "bg-amber-400" : "bg-red-400"}`} />
                          {selected.status === "connected" ? "Connected" : selected.status === "syncing" ? "Syncing..." : "Disconnected"}
                          <span className="text-neutral-600">·</span>
                          <span>Last sync: {fmt(selected.lastSyncISO)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={doSync} disabled={busy === "sync"} className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${busy === "sync" ? "border-white/[0.06] text-neutral-600" : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"}`}>
                        {busy === "sync" ? "Syncing..." : <><RefreshCw size={14} className="inline mr-1.5" />Sync</>}
                      </button>
                      <button onClick={doDiag} disabled={busy === "diag"} className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${busy === "diag" ? "border-white/[0.06] text-neutral-600" : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"}`}>
                        {busy === "diag" ? "Running..." : <><Stethoscope size={14} className="inline mr-1.5" />Diagnose</>}
                      </button>
                      {selected.updateAvailable ? (
                        <button onClick={doOTA} disabled={busy === "ota"} className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${busy === "ota" ? "bg-white/[0.05] text-neutral-600" : "bg-white text-neutral-950 hover:bg-neutral-100"}`}>
                          {busy === "ota" ? "Updating..." : <><Download size={14} className="inline mr-1.5" />Update to {selected.updateAvailable}</>}
                        </button>
                      ) : (
                        <button disabled className="px-4 py-2 rounded-full border border-white/[0.06] text-neutral-600 text-sm" title="Your firmware is up to date">
                          <Shield size={14} className="inline mr-1.5" /> FW {selected.firmware}
                        </button>
                      )}
                      <button onClick={doUnpair} disabled={busy === "unpair"} className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${busy === "unpair" ? "border-red-500/20 text-red-400/50" : "border-red-500/30 text-red-300 hover:bg-red-500/10"}`}>
                        {busy === "unpair" ? "Removing..." : <><Trash2 size={14} className="inline mr-1.5" />Unpair</>}
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-white/[0.02] rounded-full p-1 border border-white/[0.06] w-fit">
                    {(["overview", "diagnostics", "settings"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          activeTab === tab ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Battery */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Battery size={18} className="text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs">Battery</div>
                          <div className="text-2xl font-light text-white tracking-tight">{Math.round(selected.batteryPct)}%</div>
                        </div>
                      </div>
                      <BatteryBar pct={selected.batteryPct} />
                      <div className="text-neutral-600 text-xs mt-2">{selected.batteryPct > 50 ? "Estimated: all-day use" : selected.batteryPct > 20 ? "Estimated: half-day" : "Charge soon"}</div>
                    </div>

                    {/* Actuator Health */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Gauge size={18} className="text-accent-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs">Actuator Health</div>
                          <div className="text-2xl font-light text-white tracking-tight">{Math.round(selected.actuatorHealthPct)}%</div>
                        </div>
                      </div>
                      <HealthBar pct={selected.actuatorHealthPct} />
                      <div className="text-neutral-600 text-xs mt-2">Next change: {new Date(selected.nextTendonChangeISO).toLocaleDateString()}</div>
                    </div>

                    {/* Usage Stats */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Zap size={18} className="text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs">Usage</div>
                          <div className="text-2xl font-light text-white tracking-tight">{selected.hoursUsed.toFixed(0)}h</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                          <div className="text-neutral-600 text-xs">Grips today</div>
                          <div className="text-white font-medium">{selected.gripsToday}</div>
                        </div>
                        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                          <div className="text-neutral-600 text-xs">Total syncs</div>
                          <div className="text-white font-medium">{Math.floor(selected.hoursUsed / 24)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Type */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Bluetooth size={18} className="text-blue-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs">Connection</div>
                          <div className="text-white font-medium text-sm">{selected.connectionType === "both" ? "Arm + Control System" : selected.connectionType === "arm" ? "Arm Only" : "Control System Only"}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className={`flex-1 rounded-lg p-2 text-center text-xs border ${selected.connectionType === "arm" || selected.connectionType === "both" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-white/[0.04] text-neutral-600"}`}>
                          <Cpu size={14} className="mx-auto mb-1" /> Arm
                        </div>
                        <div className={`flex-1 rounded-lg p-2 text-center text-xs border ${selected.connectionType === "control" || selected.connectionType === "both" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-white/[0.04] text-neutral-600"}`}>
                          <Settings size={14} className="mx-auto mb-1" /> Control
                        </div>
                      </div>
                    </div>

                    {/* Firmware */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <Cpu size={18} className="text-purple-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-neutral-500 text-xs">Firmware</div>
                          <div className="text-white font-medium text-sm">v{selected.firmware}</div>
                        </div>
                      </div>
                      {selected.updateAvailable && (
                        <div className="mt-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2 flex items-center gap-2">
                          <Download size={12} className="text-amber-400" />
                          <span className="text-xs text-amber-400">v{selected.updateAvailable} available</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02] md:col-span-2 lg:col-span-1">
                      <div className="section-label text-neutral-500 mb-3">Device Notes</div>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onBlur={saveNote}
                        rows={4}
                        className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white text-sm placeholder-neutral-600 outline-none focus:border-white/20 transition-all duration-300"
                        placeholder="Add any fit/comfort/usage notes for your clinician..."
                      />
                      <div className="text-neutral-600 text-xs mt-2">Saved on blur.</div>
                    </div>
                  </div>
                )}

                {activeTab === "diagnostics" && (
                  <div className="space-y-4">
                    {reports.length === 0 ? (
                      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                        <Stethoscope size={32} className="text-neutral-600 mx-auto mb-4" strokeWidth={1} />
                        <h3 className="text-lg font-medium text-white mb-2">No Diagnostics Yet</h3>
                        <p className="text-neutral-500 text-sm">Run a diagnostic scan to check your device health.</p>
                      </div>
                    ) : (
                      reports.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-white font-medium text-sm">{fmt(r.finishedAtISO)}</div>
                              <div className="text-neutral-500 text-xs">{r.summary}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${r.items.every(i => i.ok) ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                              {r.items.every(i => i.ok) ? "Pass" : "Attention"}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {r.items.map((i, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${i.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                                <span className="text-neutral-400">{i.name}</span>
                                {i.details && <span className="text-neutral-600 text-xs">— {i.details}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="section-label text-neutral-500 mb-4">Maintenance</div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Actuator Tendons</div>
                            <div className="text-neutral-500 text-xs">Health: {Math.round(selected.actuatorHealthPct)}%</div>
                          </div>
                          <button onClick={doTendonChange} disabled={busy === "tendon"} className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${busy === "tendon" ? "border-white/[0.06] text-neutral-600" : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"}`}>
                            {busy === "tendon" ? "Updating..." : "Mark Changed"}
                          </button>
                        </div>
                        <div className="h-px bg-white/[0.06]" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Next Service</div>
                            <div className="text-neutral-500 text-xs">{new Date(selected.nextTendonChangeISO).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                      <div className="section-label text-neutral-500 mb-4">Configuration</div>
                      {selection ? (
                        <div>
                          <div className="text-neutral-500 text-xs mb-1">Internal Product Number</div>
                          <div className="text-lg font-light text-white tracking-tight">{selection.productNumber || "—"}</div>
                          <div className="text-neutral-400 text-sm mt-2">Finish: <span className="text-white">{selection.finish || "—"}</span></div>
                          <div className="mt-4">
                            <Link to="/your-arm" className="text-sm link-underline text-neutral-400 hover:text-white inline-block">Edit in configurator</Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-neutral-500 text-sm">No saved configuration. <Link to="/your-arm" className="text-white hover:underline">Choose your arm</Link>.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
