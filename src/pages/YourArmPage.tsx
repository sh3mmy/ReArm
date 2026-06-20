import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_IMAGE, PREVIEW_IMAGE } from "../lib/images";
import { ChevronRight, X, ArrowRight, ShoppingCart, FileText } from "lucide-react";
import QuoteModal from "../components/QuoteModal";

type Series = "HL" | "RL" | "SL";

const SERIES_LABEL: Record<Series, string> = {
  HL: "TransHumeral",
  RL: "TransRadial",
  SL: "Shoulder Disarticulation",
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
  return `ReArm ${series}${gen}00`;
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
    className={`px-4 py-2 rounded-full border text-sm font-medium tracking-wide transition-all duration-300 ${
      active ? "border-white bg-white/10 text-white" : "border-white/[0.08] text-neutral-400 hover:border-white/20 hover:text-white hover:bg-white/[0.02]"
    }`}
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
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [material, setMaterial] = useState<Material>("Carbon Fiber");
  const [finishIndex, setFinishIndex] = useState(0);

  useEffect(() => {
    const last = loadSelection();
    if (last) {
      const match = PRODUCTS.find(p => p.series === last.series && p.gen === last.gen);
      if (match) {
        setSelected(match);
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

  const goQuote = () => {
    if (!selected) return;
    saveSelection({ series: selected.series, gen: selected.gen, material, finishIndex, productNumber: productNo });
    setQuoteModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative">
      <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="mb-16">
          <div className="section-label mb-4">Configurator</div>
          <h1 className="font-normal text-white mb-4 tracking-[-0.02em] leading-[1.05]" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
            Find Your Arm.
          </h1>
          <p className="font-light text-neutral-400 max-w-xl">
            Explore our range of precision-engineered prosthetics. Filter by series, material, and generation to find your perfect match.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          <aside className="hidden lg:block sticky top-28 h-fit rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
            <div className="text-lg font-medium tracking-tight text-white">Filters</div>
            <div className="mt-8 space-y-8">
              <div>
                <div className="section-label mb-3">Amputation type</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={seriesFilter === "ALL"} onClick={() => setSeriesFilter("ALL")} />
                  {(["HL", "RL", "SL"] as Series[]).map((s) => (
                    <FilterPill key={s} label={SERIES_LABEL[s]} active={seriesFilter === s} onClick={() => setSeriesFilter(s)} />
                  ))}
                </div>
              </div>
              <div>
                <div className="section-label mb-3">Materials</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={materialFilter === "ALL"} onClick={() => setMaterialFilter("ALL")} />
                  {MATERIALS.map((m) => (
                    <FilterPill key={m} label={m} active={materialFilter === m} onClick={() => setMaterialFilter(m)} />
                  ))}
                </div>
              </div>
              <div>
                <div className="section-label mb-3">Generation</div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" active={genFilter === "ALL"} onClick={() => setGenFilter("ALL")} />
                  {[1, 2, 3].map((g) => (
                    <FilterPill key={g} label={`Gen ${g}`} active={genFilter === g} onClick={() => setGenFilter(g as 1 | 2 | 3)} />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <article key={p.id} className="group card-premium overflow-hidden">
                  <div className="aspect-[16/10] bg-neutral-900/40 relative overflow-hidden">
                    <img src={CARD_IMAGE[p.series]} alt={`${p.series} family`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="section-label text-accent-400/80 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/[0.06]">{SERIES_LABEL[p.series]}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-medium tracking-tight text-white">{familyName(p.series, p.gen)}</div>
                      <span className="section-label text-neutral-600">Gen {p.gen}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {p.specs.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-sm text-neutral-400">
                          <ChevronRight size={14} className="text-accent-400/50" />{s}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div className="text-xs text-neutral-500">{p.materials.length} materials</div>
                      <button onClick={() => openModal(p)} className="text-sm text-white font-medium flex items-center gap-1 hover:text-accent-400 transition-colors duration-300 group/btn">
                        Customize <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && <div className="col-span-full text-neutral-500 text-center py-20">No matching arms. Try different filters.</div>}
            </div>
          </section>
        </div>
      </div>

      {/* Configuration Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl max-h-[90vh] rounded-[28px] overflow-hidden border border-white/[0.06] bg-neutral-950 shadow-2xl relative my-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-all duration-300">
              <X size={18} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] h-full">
              <div className="relative hidden lg:block bg-neutral-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/[0.03] to-transparent" />
                <div className="h-full w-full flex items-center justify-center p-12">
                  <div className="w-full aspect-video rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                    <img src={PREVIEW_IMAGE[`${selected.series}-${selected.gen}`] || CARD_IMAGE[selected.series]} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              </div>
              <div className="h-full grid grid-rows-[auto,1fr,auto] bg-neutral-950">
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <div className="section-label text-accent-400/70 mb-2">Configure</div>
                  <h2 className="text-xl md:text-2xl text-white tracking-tight font-medium">{familyName(selected.series, selected.gen)}</h2>
                </div>
                <div className="p-6 overflow-auto">
                  <div className="mb-8">
                    <div className="section-label text-neutral-500 mb-3">Material</div>
                    <div className="flex flex-wrap gap-2">
                      {MATERIALS.filter((m) => selected.materials.includes(m)).map((m) => (
                        <button key={m} onClick={() => setMaterial(m)} className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${material === m ? "border-white bg-white/10 text-white" : "border-white/[0.08] text-neutral-400 hover:border-white/20 hover:text-white hover:bg-white/[0.02]"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="section-label text-neutral-500 mb-3">Finish</div>
                    <div className="grid grid-cols-2 gap-3">
                      {FINISHES.map((name, i) => (
                        <button key={name} onClick={() => setFinishIndex(i)} className={`rounded-xl p-4 border text-left transition-all duration-300 ${finishIndex === i ? "border-white bg-white/[0.06]" : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]"}`}>
                          <div className="text-white text-sm font-medium">{name}</div>
                          <div className="text-neutral-600 text-xs mt-1">Option {i + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02]">
                    <div className="section-label text-neutral-500 mb-2">Product Number</div>
                    <div className="text-white text-2xl font-light tracking-tight">{productNo}</div>
                    <div className="mt-4 text-neutral-400 text-sm">Finish: <span className="text-white">{FINISHES[finishIndex]}</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-4 border-t border-white/[0.06]">
                  <button onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-full border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300 text-sm font-medium">Back</button>
                  <div className="flex gap-3">
                    <button onClick={goQuote} className="btn-outline text-sm py-3 px-5 flex items-center gap-2">
                      <FileText size={14} /> Get Quote
                    </button>
                    <button onClick={goBook} className="btn-premium text-sm py-3 px-5 flex items-center gap-2">
                      <ShoppingCart size={14} /> Checkout / Book Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <QuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        productNumber={productNo}
        finish={FINISHES[finishIndex]}
      />
    </main>
  );
}
