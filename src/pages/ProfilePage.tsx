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

const BatteryBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${
        pct > 40 ? "bg-emerald-400" : pct > 15 ? "bg-amber-400" : "bg-red-400"
      }`}
      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
    />
  </div>
);

const HealthBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${
        pct > 80 ? "bg-emerald-400" : pct > 60 ? "bg-amber-400" : "bg-red-400"
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

const LS_SELECTION = "rearmSelection";

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [reports, setReports] = useState<DiagReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pairCode, setPairCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const selection = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_SELECTION);
      return raw ? (JSON.parse(raw) as { productNumber?: string; finish?: string }) : null;
    } catch {
      return null;
    }
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
            <p className="text-neutral-400 max-w-md mx-auto">
              You are not signed in. Use the Account button to sign in or "Skip login (dev)".
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative">
      <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-24">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="section-label mb-2">Management</div>
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">Device Hub</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Pair your prosthetic, get OTA updates, run diagnostics, and track maintenance.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm"
          >
            Sign out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* LEFT: List + Pair */}
          <aside className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 h-fit">
            <div className="text-lg font-medium text-white tracking-tight">My Devices</div>
            <ul className="mt-4 space-y-2">
              {devices.map((d, i) => {
                const isActive = (selectedId ?? devices[0]?.id) === d.id || (!selectedId && i === 0);
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelectedId(d.id)}
                      className={`w-full text-left rounded-2xl px-4 py-3 border transition-all duration-300 ${
                        isActive
                          ? "border-white bg-white/[0.06]"
                          : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{d.model}</div>
                      <div className="text-neutral-500 text-xs mt-1">
                        FW {d.firmware} {d.updateAvailable ? `• Update → ${d.updateAvailable}` : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
              {devices.length === 0 && (
                <li className="text-neutral-500 text-sm py-4">No devices yet.</li>
              )}
            </ul>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="text-neutral-400 text-sm mb-3">Pair a device</div>
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
                  {busy === "pair" ? "Pairing…" : "Pair"}
                </button>
              </form>
              <div className="text-neutral-600 text-xs mt-2">
                Use the code shown in the ReArm app or on your clinic sheet.
              </div>
            </div>
          </aside>

          {/* RIGHT: Detail */}
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            {!selected ? (
              <div className="text-neutral-500 py-12 text-center">Select or pair a device to view details.</div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="text-xl font-medium text-white tracking-tight">{selected.model}</div>
                    <div className="text-neutral-500 text-sm">Last sync: {fmt(selected.lastSyncISO)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={doSync}
                      disabled={busy === "sync"}
                      className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                        busy === "sync"
                          ? "border-white/[0.06] text-neutral-600"
                          : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {busy === "sync" ? "Syncing…" : "Sync now"}
                    </button>
                    <button
                      onClick={doDiag}
                      disabled={busy === "diag"}
                      className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                        busy === "diag"
                          ? "border-white/[0.06] text-neutral-600"
                          : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {busy === "diag" ? "Running…" : "Run diagnostics"}
                    </button>
                    {selected.updateAvailable ? (
                      <button
                        onClick={doOTA}
                        disabled={busy === "ota"}
                        className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                          busy === "ota"
                            ? "bg-white/[0.05] text-neutral-600"
                            : "bg-white text-neutral-950 hover:bg-neutral-100"
                        }`}
                      >
                        {busy === "ota" ? "Updating…" : `Update to ${selected.updateAvailable}`}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 rounded-full border border-white/[0.06] text-neutral-600 text-sm"
                        title="Your firmware is up to date"
                      >
                        FW {selected.firmware} ✓
                      </button>
                    )}
                    <button
                      onClick={doUnpair}
                      disabled={busy === "unpair"}
                      className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                        busy === "unpair"
                          ? "border-red-500/20 text-red-400/50"
                          : "border-red-500/30 text-red-300 hover:bg-red-500/10"
                      }`}
                    >
                      {busy === "unpair" ? "Removing…" : "Unpair"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Battery */}
                  <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                    <div className="text-neutral-500 text-sm mb-3">Battery</div>
                    <div className="flex items-end gap-3 mb-3">
                      <div className="text-2xl font-light text-white tracking-tight">
                        {Math.round(selected.batteryPct)}%
                      </div>
                    </div>
                    <BatteryBar pct={selected.batteryPct} />
                    <div className="text-neutral-600 text-xs mt-2">
                      {selected.batteryPct > 50
                        ? "Estimated: all-day use"
                        : selected.batteryPct > 20
                        ? "Estimated: half-day"
                        : "Charge soon"}
                    </div>
                  </div>

                  {/* Actuator health */}
                  <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                    <div className="text-neutral-500 text-sm mb-3">Actuator Tendons</div>
                    <div className="text-2xl font-light text-white tracking-tight mb-3">
                      {Math.round(selected.actuatorHealthPct)}%
                    </div>
                    <HealthBar pct={selected.actuatorHealthPct} />
                    <div className="text-neutral-600 text-xs mt-2">
                      Next recommended change: {new Date(selected.nextTendonChangeISO).toLocaleDateString()}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={doTendonChange}
                        disabled={busy === "tendon"}
                        className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
                          busy === "tendon"
                            ? "border-white/[0.06] text-neutral-600"
                            : "border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        Mark tendon changed
                      </button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                    <div className="text-neutral-500 text-sm mb-3">Usage</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-neutral-600">Hours used</div>
                        <div className="text-xl font-light text-white tracking-tight">{selected.hoursUsed.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-600">Grips today</div>
                        <div className="text-xl font-light text-white tracking-tight">{selected.gripsToday}</div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                    <div className="text-neutral-500 text-sm mb-3">Device notes</div>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onBlur={saveNote}
                      rows={4}
                      className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white text-sm placeholder-neutral-600 outline-none focus:border-white/20 transition-all duration-300"
                      placeholder="Add any fit/comfort/usage notes for your clinician…"
                    />
                    <div className="text-neutral-600 text-xs mt-2">Saved on blur.</div>
                  </div>
                </div>

                {/* Configurator selection */}
                <div className="mt-6 rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                  <div className="text-neutral-500 text-sm mb-3">Current configuration</div>
                  {selection ? (
                    <div>
                      <div className="text-neutral-600 text-xs mb-1">Internal Product Number</div>
                      <div className="text-lg font-light text-white tracking-tight">{selection.productNumber || "—"}</div>
                      <div className="text-neutral-400 text-sm mt-2">
                        Finish: <span className="text-white">{selection.finish || "—"}</span>
                      </div>
                      <div className="mt-3">
                        <a href="/your-arm" className="text-sm link-underline text-neutral-400 hover:text-white inline-block">
                          Edit in configurator
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 text-sm">
                      No saved configuration.{" "}
                      <a href="/your-arm" className="text-white hover:underline">Choose your arm</a>.
                    </div>
                  )}
                </div>

                {/* Diagnostics history */}
                <div className="mt-6 rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                  <div className="text-neutral-500 text-sm mb-3">Diagnostics history</div>
                  {reports.length === 0 ? (
                    <div className="text-neutral-500 text-sm py-4">No diagnostics run yet.</div>
                  ) : (
                    <ul className="space-y-3">
                      {reports.map((r) => (
                        <li key={r.id} className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02]">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm text-white">{fmt(r.finishedAtISO)}</div>
                            <div className="text-neutral-500 text-sm">{r.summary}</div>
                          </div>
                          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {r.items.map((i, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${i.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                                <span className="text-neutral-400">{i.name}</span>
                                {i.details && (
                                  <span className="text-neutral-600">— {i.details}</span>
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
