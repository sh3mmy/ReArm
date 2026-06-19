import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_IMAGE, PREVIEW_IMAGE } from "../lib/images";

type Series = "HL" | "RL" | "SL";

const SERIES_LABEL: Record<Series, string> = {
  HL: "TransHumeral (HL series)",
  RL: "TransRadial (RL series)",
  SL: "Shoulder Disarticulation (SL series)",
};

const MATERIALS = ["Carbon Fiber", "Titanium", "Hybrid", "Aluminum", "Stainless Steel", "Bio-Composite"] as const;
type Material = typeof MATERIALS[number];

const MATERIAL_DIGIT: Partial<Record<Material, number>> = {
  Hybrid: 1,
  Titanium: 2,
  "Carbon Fiber": 3,
};

const FINISHES = ["Skin Coloured", "Matte", "Gloss", "Hydro Dipped", "No Finish"] as const;

interface Product {
  id: string;
  series: Series;
  gen: 1 | 2 | 3;
  materials: Material[];
  specs: string[];
}

const PRODUCTS: Product[] = [
  { id: "HL-G1", series: "HL", gen: 1, materials: ["Carbon Fiber", "Titanium", "Hybrid", "Aluminum"], specs: ["Adaptive elbow module", "IP54 ingress", "Magnetic quick-mount"] },
  { id: "HL-G2", series: "HL", gen: 2, materials: ["Carbon Fiber", "Titanium", "Hybrid", "Aluminum", "Bio-Composite"], specs: ["Dual-axis torque", "Haptic micro-feedback", "Quick-swap covers"] },
  { id: "HL-G3", series: "HL", gen: 3, materials: ["Carbon Fiber", "Titanium", "Hybrid", "Stainless Steel"], specs: ["ML gesture prediction", "IP56 ingress", "Lightweight forearm"] },
  { id: "RL-G1", series: "RL", gen: 1, materials: ["Carbon Fiber", "Titanium", "Aluminum"], specs: ["Precision wrist", "Passive-damped flexion", "Textured grip"] },
  { id: "RL-G2", series: "RL", gen: 2, materials: ["Carbon Fiber", "Titanium", "Hybrid", "Bio-Composite"], specs: ["Electro-mech hand", "Force-sensing fingertips", "Tool adapter"] },
  { id: "SL-G2", series: "SL", gen: 2, materials: ["Carbon Fiber", "Hybrid", "Stainless Steel"], specs: ["Shoulder cap interface", "Rotational assist", "Battery-in-hub"] },
  { id: "SL-G3", series: "SL", gen: 3, materials: ["Carbon Fiber", "Titanium", "Hybrid", "Aluminum"], specs: ["Active rotation", "Stabilized harness", "Low-noise actuation"] },
];

function familyName(series: Series, gen: 1 | 2 | 3): string {
  return `ReArm ${series}${gen}00 Series`;
}

function buildProductNo(series: Series, gen: 1 | 2 | 3, material: Material): string {
  const g = String(gen);
  const m = String(MATERIAL_DIGIT[material] ?? 0);
  const hybridFlag = material === "Hybrid" ? "1" : "0";
  return `${series}${g}${m}${hybridFlag}`;
}

type PersistedSelection = {
  series: Series;
  gen: 1 | 2 | 3;
  material: Material;
  finishIndex: number;
  productNumber: string;
};
const STORAGE_KEY = "rearmSelection";

const saveSelection = (sel: PersistedSelection) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sel)); } catch {}
};
const loadSelection = (): PersistedSelection | null => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};

const FilterPill: React.FC<{ active: boolean; label: string; onClick: () => void; }> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full border transition-all text-sm ${active ? "border-white bg-white/10 text-white" : "border-white/20 text-white/80 hover:border-white/40 hover:bg-white/5"}`}
  >
    {label}
  </button>
);

export default function YourArmPage() {
  const navigate = useNavigate();

  const [seriesFilter, setSeriesFilter] = useState<Series | "ALL">("ALL");
  const [materialFilter, setMaterialFilter] = useState<Material | "ALL">("ALL");
  const [genFilter, setGenFilter] = useState<1 | 2 | 3 | "ALL">("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [material, setMaterial] = useState<Material>("Carbon Fiber");
  const [finishIndex, setFinishIndex] = useState(0);

  useEffect(() => {
    const last = loadSelection();
    if (last) {
      const match = PRODUCTS.find(p => p.series === last.series && p.gen === last.gen);
      if (match) {
        setSelected(match);
        setModalOpen(true);
        setMaterial(last.material);
        setFinishIndex(last.finishIndex);
      }
    }
  }, []);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const bySeries = seriesFilter === "ALL" || p.series === seriesFilter;
      const byGen = genFilter === "ALL" || p.gen === genFilter;
      const byMat = materialFilter === "ALL" || p.materials.includes(materialFilter as Material);
      return bySeries && byGen && byMat;
    });
  }, [seriesFilter, genFilter, materialFilter]);

  const productNo = selected ? buildProductNo(selected.series, selected.gen, material) : "";

  const openModal = (p: Product) => {
    setSelected(p);
    setMaterial(p.materials[0]);
    setFinishIndex(0);
    setModalOpen(true);
  };

  const goBook = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      productNumber: productNo,
      finish: FINISHES[finishIndex],
    });
    saveSelection({ series: selected.series, gen: selected.gen, material, finishIndex, productNumber: productNo });
    navigate(`/private-demo?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1100px_600px_at_50%_-140px,rgba(255,255,255,0.12),transparent)]" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
          {/* Filters */}
          <aside className="hidden md:block sticky top-24 h-fit rounded-3xl border border-white/10 bg-black/60 backdrop-blur p-4">
            <div className="text-xl font-medium tracking-tight">Find Your Arm</div>

            <div className="mt-5 space-y-6">
              <div>
                <div className="text-white/70 text-xs mb-2 uppercase tracking-wide">Amputation type</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={seriesFilter === "ALL"} onClick={() => setSeriesFilter("ALL")} />
                  {(["HL", "RL", "SL"] as Series[]).map((s) => (
                    <FilterPill key={s} label={SERIES_LABEL[s]} active={seriesFilter === s} onClick={() => setSeriesFilter(s)} />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-white/70 text-xs mb-2 uppercase tracking-wide">Materials</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={materialFilter === "ALL"} onClick={() => setMaterialFilter("ALL")} />
                  {MATERIALS.map((m) => (
                    <FilterPill key={m} label={m} active={materialFilter === m} onClick={() => setMaterialFilter(m)} />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-white/70 text-xs mb-2 uppercase tracking-wide">Generation</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={genFilter === "ALL"} onClick={() => setGenFilter("ALL")} />
                  {[1, 2, 3].map((g) => (
                    <FilterPill key={g} label={`Gen ${g}`} active={genFilter === g} onClick={() => setGenFilter(g as 1 | 2 | 3)} />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900/40 to-black hover:from-zinc-900/70 transition transform hover:-translate-y-0.5"
                >
                  <div className="aspect-[16/10] bg-zinc-900/40">
                    <img src={CARD_IMAGE[p.series]} alt={`${p.series} family`} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="text-lg font-semibold tracking-tight">{familyName(p.series, p.gen)}</div>
                    <ul className="mt-2 space-y-1">
                      {p.specs.map((s) => (
                        <li key={s} className="text-sm text-white/80 leading-relaxed">{s}</li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[11px] text-white/50">Materials: {p.materials.join(", ")}</div>
                      <button onClick={() => openModal(p)} className="px-3 py-1.5 rounded-xl border border-white/20 text-sm hover:border-white/50 hover:bg-white/5 transition">
                        Customize
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-white/60 text-center py-20">No matching arms. Try different filters.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl h-[85vh] rounded-[28px] overflow-hidden border border-white/10 bg-gradient-to-br from-black to-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
              <div className="text-white text-lg md:text-xl tracking-tight">Configure — {familyName(selected.series, selected.gen)}</div>
              <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] h-[calc(100%-56px)]">
              {/* Visual */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
                <div className="h-full w-full flex items-center justify-center p-12">
                  <div className="w-full aspect-video rounded-[26px] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    <img src={PREVIEW_IMAGE[`${selected.series}-${selected.gen}`] || CARD_IMAGE[selected.series]} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="h-full grid grid-rows-[auto,1fr,auto]">
                {/* Header ONLY (stepper removed) */}
                <div className="px-5 pt-4">
                  <h2 className="text-xl md:text-2xl text-white tracking-tight">Customize Your Arm</h2>
                </div>

                <div className="p-5 overflow-auto">
                  {/* Materials */}
                  <div className="flex flex-wrap gap-3">
                    {MATERIALS.filter((m) => selected.materials.includes(m)).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMaterial(m)}
                        className={`px-3 py-1 rounded-full border transition-all text-sm ${material == m ? "border-white bg-white/10 text-white" : "border-white/20 text-white/80 hover:border-white/40 hover:bg-white/5"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Finish */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {FINISHES.map((name, i) => (
                      <button
                        key={name}
                        onClick={() => setFinishIndex(i)}
                        className={`rounded-2xl p-4 border text-left transition ${finishIndex === i ? "border-white bg-white/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"}`}
                      >
                        <div className="text-white font-medium">{name}</div>
                        <div className="text-white/60 text-xs mt-1">Option {i + 1}</div>
                      </button>
                    ))}
                  </div>

                  {/* Review */}
                  <div className="rounded-2xl border border-white/10 p-5 bg-white/5 mt-6">
                    <div className="text-white/70 text-sm">Internal Product Number</div>
                    <div className="text-white text-2xl mt-1 font-semibold">{productNo}</div>
                    <div className="mt-4 text-white/80 text-sm">Finish: <span className="text-white">{FINISHES[finishIndex]}</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-6 pb-5">
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-white/30 text-white/80 hover:border-white/60 hover:bg-white/5 transition">Back</button>
                  <button onClick={goBook} className="px-5 py-2 rounded-xl bg-white text-black hover:opacity-90 transition">Book Your Session</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
