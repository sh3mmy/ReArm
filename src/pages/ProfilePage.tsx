import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PROSTHETIC from "../../assets/prosthetic-3d.png";
import {
  Sun,
  Moon,
  Lock,
  Unlock,
  Zap,
  Bell,
  Bluetooth,
  Signal,
  Plus,
  Pencil,
  Trash2,
  Glasses,
  CreditCard,
  KeyRound,
  Smartphone,
  Crosshair,
  Activity,
  BatteryCharging,
  Cpu,
  Camera,
  Monitor,
  Gauge,
  Move,
  ShieldCheck,
  Wrench,
  Download,
  ArrowUpCircle,
  type LucideIcon,
} from "lucide-react";

/* ----------------------------- Theme (darkness) ---------------------------- */

const LS_DARKNESS = "rearm_profile_darkness";
const LS_PLACEMENT = "rearm_profile_placement";

function buildPalette(darkness: number): Record<string, string> {
  const t = Math.max(0, Math.min(100, darkness)) / 100;
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const gray = (l: number) => `hsl(0 0% ${l}%)`;
  // Border / overlay color flips from black-on-light to white-on-dark.
  const lineL = t < 0.5 ? 0 : 100;
  return {
    "--p-bg": gray(lerp(95, 8)),
    "--p-panel": gray(lerp(100, 14)),
    "--p-menu": gray(lerp(93, 11)),
    "--p-card": gray(lerp(97, 18)),
    "--p-selected": gray(lerp(87, 24)),
    "--p-text": gray(lerp(13, 97)),
    "--p-text2": gray(lerp(42, 66)),
    "--p-text3": gray(lerp(55, 48)),
    "--p-border": `hsl(0 0% ${lineL}% / ${lerp(0.1, 0.1)})`,
    "--p-hover": `hsl(0 0% ${lineL}% / 0.06)`,
    "--p-accent": "#c9a87c",
  };
}

/* --------------------------------- Data ----------------------------------- */

type KeyType = "glasses" | "card" | "fob" | "app";

type PairedKey = {
  id: string;
  name: string;
  type: KeyType;
  editable?: boolean;
};

const KEY_ICON: Record<KeyType, LucideIcon> = {
  glasses: Glasses,
  card: CreditCard,
  fob: KeyRound,
  app: Smartphone,
};

const SEED_KEYS: PairedKey[] = [
  { id: "k1", name: "Meta Rayban", type: "glasses" },
  { id: "k2", name: "", type: "card" },
  { id: "k3", name: "ReArm Candor", type: "fob", editable: true },
];

type MenuItem = { id: string; label: string; icon: LucideIcon };

const MENU: MenuItem[] = [
  { id: "calibration", label: "Calibration", icon: Crosshair },
  { id: "diagnostics", label: "Diagnostics", icon: Activity },
  { id: "charging", label: "Charging", icon: BatteryCharging },
  { id: "autogrip", label: "Auto-Grip", icon: Cpu },
  { id: "devices", label: "Devices & Pairing", icon: Bluetooth },
  { id: "snapshot", label: "Snapshot", icon: Camera },
  { id: "display", label: "Display", icon: Monitor },
  { id: "speed", label: "Speed & Sensitivity", icon: Gauge },
  { id: "motion", label: "Motion", icon: Move },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "service", label: "Service & Repair", icon: Wrench },
  { id: "software", label: "Software", icon: Download },
  { id: "upgrades", label: "Upgrades", icon: ArrowUpCircle },
];

/* ------------------------------- Component -------------------------------- */

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [darkness, setDarkness] = useState<number>(() => {
    const raw = Number(localStorage.getItem(LS_DARKNESS));
    return Number.isFinite(raw) && raw > 0 ? raw : 12;
  });
  const [active, setActive] = useState<string>("devices");
  const [keys, setKeys] = useState<PairedKey[]>(SEED_KEYS);
  const [placement, setPlacement] = useState<"both" | "left" | "right">(
    () => (localStorage.getItem(LS_PLACEMENT) as "both" | "left" | "right") || "both"
  );

  const palette = useMemo(() => buildPalette(darkness), [darkness]);
  const isDark = darkness >= 50;

  const onDarkness = (v: number) => {
    setDarkness(v);
    try {
      localStorage.setItem(LS_DARKNESS, String(v));
    } catch {}
  };

  const choosePlacement = (p: "both" | "left" | "right") => {
    setPlacement(p);
    try {
      localStorage.setItem(LS_PLACEMENT, p);
    } catch {}
  };

  const addKey = () => {
    const id = `k_${Math.random().toString(36).slice(2, 7)}`;
    setKeys((prev) => [...prev, { id, name: "New Key", type: "card", editable: true }]);
  };

  const renameKey = (id: string) => {
    const next = window.prompt("Rename key");
    if (next === null) return;
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, name: next } : k)));
  };

  const removeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const activeItem = MENU.find((m) => m.id === active) ?? MENU[4];

  return (
    <main
      style={palette as React.CSSProperties}
      className="min-h-screen pt-16 lg:pt-20 transition-colors duration-500"
    >
      <div
        className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)] transition-colors duration-500"
        style={{ backgroundColor: "var(--p-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Darkness control */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div
                className="text-[0.7rem] uppercase tracking-[0.18em]"
                style={{ color: "var(--p-text3)" }}
              >
                {user?.name ? `${user.name}'s ReArm` : "Your ReArm"}
              </div>
              <h1
                className="text-xl md:text-2xl font-light tracking-tight mt-1"
                style={{ color: "var(--p-text)" }}
              >
                Controls
              </h1>
            </div>

            <label
              className="flex items-center gap-3 rounded-full border px-4 py-2"
              style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
            >
              <Sun size={16} style={{ color: isDark ? "var(--p-text3)" : "var(--p-accent)" }} />
              <input
                type="range"
                min={0}
                max={100}
                value={darkness}
                onChange={(e) => onDarkness(Number(e.target.value))}
                aria-label="Adjust profile darkness"
                className="profile-darkness w-28 md:w-40"
              />
              <Moon size={16} style={{ color: isDark ? "var(--p-accent)" : "var(--p-text3)" }} />
            </label>
          </div>

          {/* Main grid: render | menu | content */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_210px_minmax(0,1.15fr)] gap-4 md:gap-6">
            {/* LEFT: prosthetic render with status overlays */}
            <section
              className="relative rounded-3xl border overflow-hidden min-h-[320px] lg:min-h-[520px] flex items-center justify-center transition-colors duration-500"
              style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
            >
              <img
                src={PROSTHETIC || "/placeholder.svg"}
                alt="3D render of the ReArm prosthetic"
                className="w-[88%] max-w-[460px] object-contain drop-shadow-2xl select-none pointer-events-none"
                draggable={false}
              />

              {/* Status: grip open (top) */}
              <Overlay className="top-6 left-1/2 -translate-x-1/2 text-center">
                <Unlock size={15} className="mx-auto mb-1" style={{ color: "var(--p-text2)" }} />
                <div style={{ color: "var(--p-text2)" }}>Grip Open</div>
              </Overlay>

              {/* Status: wrist open (left) */}
              <Overlay className="top-1/2 left-5 -translate-y-1/2 text-left">
                <div style={{ color: "var(--p-text2)" }}>Wrist</div>
                <div style={{ color: "var(--p-text2)" }}>Unlocked</div>
              </Overlay>

              {/* Status: charging (right) */}
              <Overlay className="top-1/2 right-5 -translate-y-1/2 text-right">
                <Zap size={16} className="ml-auto mb-1" style={{ color: "var(--p-accent)" }} />
                <div style={{ color: "var(--p-text2)" }}>Charging</div>
              </Overlay>

              {/* Battery (bottom) */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <BatteryCharging size={16} style={{ color: "var(--p-accent)" }} />
                <span className="text-sm font-light" style={{ color: "var(--p-text)" }}>
                  82%
                </span>
                <span className="text-xs" style={{ color: "var(--p-text3)" }}>
                  · 14h left
                </span>
              </div>
            </section>

            {/* MIDDLE: settings menu */}
            <nav
              className="rounded-3xl border p-2 h-fit lg:max-h-[520px] lg:overflow-y-auto transition-colors duration-500"
              style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-menu)" }}
            >
              <ul className="space-y-0.5">
                {MENU.map((item) => {
                  const Icon = item.icon;
                  const selected = item.id === active;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActive(item.id)}
                        className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200"
                        style={{
                          backgroundColor: selected ? "var(--p-selected)" : "transparent",
                          color: selected ? "var(--p-text)" : "var(--p-text2)",
                          fontWeight: selected ? 500 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) e.currentTarget.style.backgroundColor = "var(--p-hover)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon size={17} strokeWidth={1.6} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* RIGHT: content panel */}
            <section
              className="rounded-3xl border p-5 md:p-6 lg:max-h-[520px] lg:overflow-y-auto transition-colors duration-500"
              style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
            >
              {/* status icons */}
              <div className="flex items-center justify-end gap-3 mb-6" style={{ color: "var(--p-text3)" }}>
                <Bell size={15} />
                <Bluetooth size={15} style={{ color: "var(--p-accent)" }} />
                <span className="text-[0.7rem] font-medium tracking-wide">LTE</span>
                <Signal size={15} />
              </div>

              {active === "devices" ? (
                <DevicesPanel
                  keys={keys}
                  onAdd={addKey}
                  onRename={renameKey}
                  onRemove={removeKey}
                  placement={placement}
                  onPlacement={choosePlacement}
                />
              ) : (
                <PlaceholderPanel item={activeItem} />
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ------------------------------ Sub-panels -------------------------------- */

const Overlay: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={`absolute text-xs leading-tight ${className ?? ""}`}>{children}</div>
);

const DevicesPanel: React.FC<{
  keys: PairedKey[];
  onAdd: () => void;
  onRename: (id: string) => void;
  onRemove: (id: string) => void;
  placement: "both" | "left" | "right";
  onPlacement: (p: "both" | "left" | "right") => void;
}> = ({ keys, onAdd, onRename, onRemove, placement, onPlacement }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium tracking-tight" style={{ color: "var(--p-text)" }}>
          Keys
        </h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors duration-200"
          style={{ backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
        >
          <Plus size={15} />
          Add Key
        </button>
      </div>

      <ul
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
      >
        {keys.map((k, i) => {
          const Icon = KEY_ICON[k.type];
          return (
            <li
              key={k.id}
              className="flex items-center gap-4 px-4 py-4"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--p-border)" }}
            >
              <span
                className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
                style={{ backgroundColor: "var(--p-hover)", color: "var(--p-text2)" }}
              >
                <Icon size={17} strokeWidth={1.6} />
              </span>
              <span
                className="flex-1 text-sm"
                style={{ color: k.name ? "var(--p-text)" : "var(--p-text3)" }}
              >
                {k.name || "Unnamed key"}
              </span>
              {k.editable && (
                <button
                  onClick={() => onRename(k.id)}
                  aria-label={`Rename ${k.name || "key"}`}
                  className="p-1.5 rounded-lg transition-colors duration-200"
                  style={{ color: "var(--p-text3)" }}
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                onClick={() => onRemove(k.id)}
                aria-label={`Remove ${k.name || "key"}`}
                className="p-1.5 rounded-lg transition-colors duration-200"
                style={{ color: "var(--p-text3)" }}
              >
                <Trash2 size={15} />
              </button>
            </li>
          );
        })}
        {keys.length === 0 && (
          <li className="px-4 py-6 text-sm text-center" style={{ color: "var(--p-text3)" }}>
            No keys paired yet.
          </li>
        )}
      </ul>

      {/* Prosthetic placement */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={15} style={{ color: "var(--p-text2)" }} />
          <h3 className="text-sm font-medium" style={{ color: "var(--p-text)" }}>
            Prosthetic Placement
          </h3>
        </div>
        <div
          className="inline-flex rounded-2xl border p-1"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
        >
          {(["both", "left", "right"] as const).map((opt) => {
            const selected = placement === opt;
            return (
              <button
                key={opt}
                onClick={() => onPlacement(opt)}
                className="px-6 py-2 rounded-xl text-sm capitalize transition-colors duration-200"
                style={{
                  backgroundColor: selected ? "var(--p-panel)" : "transparent",
                  color: selected ? "var(--p-text)" : "var(--p-text3)",
                  fontWeight: selected ? 500 : 400,
                  boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

const PlaceholderPanel: React.FC<{ item: MenuItem }> = ({ item }) => {
  const Icon = item.icon;
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <span
        className="grid place-items-center w-14 h-14 rounded-2xl mb-5"
        style={{ backgroundColor: "var(--p-card)", color: "var(--p-accent)" }}
      >
        <Icon size={24} strokeWidth={1.5} />
      </span>
      <h2 className="text-lg font-medium tracking-tight" style={{ color: "var(--p-text)" }}>
        {item.label}
      </h2>
      <p className="text-sm mt-2 max-w-xs" style={{ color: "var(--p-text3)" }}>
        {item.label} settings for your ReArm prosthetic will appear here.
      </p>
    </div>
  );
};

export default ProfilePage;
