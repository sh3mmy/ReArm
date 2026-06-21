import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getClinics,
  getAvailabilityMap,
  insertBooking,
  type ClinicRow,
  type AvailabilityRow,
} from '../lib/db';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';

// ----------------------
// Types
// ----------------------
type Clinic = ClinicRow;

const STORAGE_KEY = 'rearmSelection';

// UK bounding box for map projection (tuned to the actual map image)
const MAP_BOUNDS = {
  minLat: 49.8,
  maxLat: 58.8,
  minLng: -8.2,
  maxLng: 2.0,
};

function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

// ----------------------
// Calendar popover
// ----------------------
type CalendarPopoverProps = {
  open: boolean;
  clinicId: string | null;
  value: string;
  onChange: (iso: string) => void;
  onRequestClose: () => void;
};

const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;

const CalendarPopover: React.FC<CalendarPopoverProps> = ({ open, clinicId, value, onChange, onRequestClose }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const el = panelRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) onRequestClose();
    };
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, [open, onRequestClose]);

  if (!open) return null;

  const avail = clinicId ? availabilityMap[clinicId] : undefined;
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDayIdx = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ d: number | null; iso?: string; available?: boolean; past?: boolean; }> = [];
  for (let i = 0; i < firstDayIdx; i++) cells.push({ d: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toISO(year, month, d);
    const cellDate = new Date(year, month - 1, d);
    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isAvailable = !!avail && avail.has(iso);
    cells.push({ d, iso, available: isAvailable, past: isPast });
  }
  while (cells.length % 7 !== 0) cells.push({ d: null });

  const prev = () => setMonth(m => (m === 1 ? (setYear(y => y - 1), 12) : m - 1));
  const next = () => setMonth(m => (m === 12 ? (setYear(y => y + 1), 1) : m + 1));

  return (
    <>
      <div aria-hidden className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 1000 }} />
      <div
        ref={panelRef}
        className="fixed left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/[0.08] bg-neutral-950 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1001 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={prev} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300">
            <ChevronLeft size={16} />
          </button>
          <div className="text-white font-medium text-sm">
            {new Date(year, month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button type="button" onClick={next} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-neutral-500 text-xs mb-2">
          {WEEKDAYS.map(w => <div key={w} className="py-2">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (c.d === null) return <div key={i} className="h-10" />;
            const isSelected = c.iso === value;
            const color = c.available
              ? (isSelected ? 'bg-white text-neutral-950 border-white' : 'border-accent-400/40 text-accent-400 hover:bg-white/5')
              : 'border-white/[0.06] text-neutral-600';
            const cursor = (c.available && !c.past) ? 'cursor-pointer' : 'cursor-not-allowed';
            const opacity = c.past ? 'opacity-30' : '';
            return (
              <button
                type="button"
                key={c.iso}
                onClick={() => { if (c.available && !c.past) { onChange(c.iso!); onRequestClose(); } }}
                className={`h-10 rounded-xl border ${color} ${cursor} ${opacity} transition-all duration-200 text-sm font-medium`}
                aria-label={c.iso}
              >
                {c.d}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded border border-accent-400/40" /> Available
            <span className="inline-block w-3 h-3 rounded border border-white/[0.06] ml-3" /> Unavailable
          </div>
        </div>
      </div>
    </>
  );
};

// Global availability map built from fetched data
let availabilityMap: Record<string, Set<string>> = {};

// ----------------------
// Main Page
// ----------------------
export default function PrivateDemoPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // Fetch clinics and availability from local SQLite
  useEffect(() => {
    async function fetchData() {
      setLoadingClinics(true);
      try {
        const clinicData = await getClinics();
        setClinics(clinicData);
        const availMap = await getAvailabilityMap();
        availabilityMap = availMap;
        const availRows: AvailabilityRow[] = [];
        Object.entries(availMap).forEach(([cid, dates]) => {
          dates.forEach((d) => availRows.push({ id: 0, clinic_id: cid, available_date: d, created_at: '' }));
        });
        setAvailability(availRows);
      } catch (err) {
        console.error('Failed to load clinics:', err);
      }
      setLoadingClinics(false);
    }
    fetchData();
  }, []);

  // Build availability map (kept for CalendarPopover global access)
  useEffect(() => {
    const map: Record<string, Set<string>> = {};
    for (const row of availability) {
      if (!map[row.clinic_id]) map[row.clinic_id] = new Set();
      map[row.clinic_id].add(row.available_date);
    }
    availabilityMap = map;
  }, [availability]);

  const [productNumber, setProductNumber] = useState('—');
  const [finish, setFinish] = useState('—');

  useEffect(() => {
    const pn = sp.get('productNumber');
    const fn = sp.get('finish');
    if (pn || fn) {
      setProductNumber(pn || '—');
      setFinish(fn || '—');
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ productNumber: pn || '—', finish: fn || '—' })); } catch {}
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setProductNumber(saved.productNumber || '—');
          setFinish(saved.finish || '—');
        }
      } catch {}
    }
  }, [sp]);

  const hasConfig = productNumber !== '—' && finish !== '—';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    notes: '',
  });

  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const selectedClinic = useMemo(() => clinics.find(c => c.id === selectedClinicId) || null, [clinics, selectedClinicId]);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const valid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      /.+@.+\..+/.test(form.email) &&
      form.address.trim().length > 4 &&
      selectedClinic &&
      form.date !== '' &&
      form.time !== '' &&
      agreeTerms &&
      agreePrivacy
    );
  }, [form, selectedClinic, agreeTerms, agreePrivacy]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);

    const { error } = await insertBooking({
      clinic_id: selectedClinic!.id,
      product_number: productNumber === '—' ? null : productNumber,
      finish: finish === '—' ? null : finish,
      booking_date: form.date,
      booking_time: form.time,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      address: form.address,
      notes: form.notes || null,
      agree_terms: agreeTerms,
      agree_privacy: agreePrivacy,
      agree_marketing: agreeMarketing,
    });

    if (error) {
      console.error('Booking failed:', error);
    }

    setSubmitting(false);
    setDone(true);
  };

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="block">
      <span className="text-label text-neutral-500 mb-2 block">{props.label}</span>
      <input
        {...props}
        className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <div className="mb-12">
          <div className="section-label mb-4">Experience</div>
          <h1 className="heading-section text-display-md text-white mb-4">
            Book Your Private Demo
          </h1>
          <p className="body-premium text-neutral-400 text-lg max-w-xl">
            Choose a clinic, pick a time, and share your details. We will confirm by email.
          </p>
        </div>

        {/* Map + clinic list */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-6 mb-8">
          {/* Map — resized magnific__talk__20704.png with gold markers at correct geo positions */}
          <div
            className="relative h-96 md:h-[28rem] rounded-3xl border border-white/[0.06] overflow-hidden bg-neutral-900/50"
            style={{
              backgroundImage: 'url(/assets/magnific__talk__20704.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
            {/* Subtle radial glow */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(600px_300px_at_50%_50%,rgba(201,168,124,0.15),transparent)]" />

            {/* Compass / orientation hint */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-neutral-600 text-xs">
              <MapPin size={12} />
              <span>United Kingdom</span>
            </div>

            {loadingClinics && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-neutral-500 text-sm">Loading clinics…</div>
              </div>
            )}

            {clinics.map((c) => {
              const pos = latLngToPercent(c.latitude, c.longitude);
              const isSelected = selectedClinicId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                  className={`absolute z-10 group ${isSelected ? 'z-20' : ''}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  title={c.name}
                  aria-label={c.name}
                >
                  {/* Pulse ring for selected */}
                  {isSelected && (
                    <span className="absolute inset-0 rounded-full bg-accent-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                  )}
                  {/* Dull gold marker dot matching the accent color scheme */}
                  <span
                    className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'w-6 h-6 bg-accent-400 border-accent-300 shadow-[0_0_16px_rgba(201,168,124,0.6)] scale-125'
                        : 'w-4 h-4 bg-accent-500/80 border-accent-400/70 hover:bg-accent-400 hover:scale-110'
                    }`}
                  >
                    <span className={`rounded-full ${isSelected ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-neutral-950'}`} />
                  </span>
                  {/* Label tooltip */}
                  <span className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-white/10 text-white opacity-100'
                      : 'bg-white/5 text-neutral-400 opacity-0 group-hover:opacity-100'
                  }`}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          <aside className="rounded-3xl border border-white/[0.06] p-5 bg-white/[0.02] backdrop-blur-sm">
            <div className="text-label text-neutral-500 mb-4 flex items-center gap-2">
              <MapPin size={14} />
              Select a Clinic
            </div>
            {loadingClinics ? (
              <div className="text-neutral-500 text-sm py-4">Loading…</div>
            ) : (
              <ul className="space-y-3 max-h-[24rem] overflow-y-auto pr-1">
                {clinics.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                      className={`w-full text-left rounded-2xl px-4 py-3 border transition-all duration-300 ${
                        selectedClinicId === c.id
                          ? 'border-white bg-white/[0.06]'
                          : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{c.name}</div>
                      <div className="text-neutral-500 text-xs mt-1">{c.address}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>

        {/* Summary + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
          {/* Summary */}
          <aside className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 h-fit">
            <div className={`text-label text-neutral-500 mb-4 ${!hasConfig ? 'opacity-60' : ''}`}>Selected Configuration</div>
            <div className={`rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02] ${!hasConfig ? 'opacity-50' : ''}`}>
              <div className="text-neutral-500 text-xs mb-1">Internal Product Number</div>
              <div className="text-2xl font-light text-white tracking-tight">{productNumber}</div>
              <div className="mt-4 text-neutral-400 text-sm">
                Finish: <span className="text-white">{finish}</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/your-arm')}
                  className={`text-sm link-underline ${!hasConfig ? 'pointer-events-none text-neutral-700' : 'text-neutral-400 hover:text-white'}`}
                >
                  Edit Configuration
                </button>
              </div>
            </div>
            <div className={`mt-4 text-neutral-600 text-xs ${!hasConfig ? 'opacity-60' : ''}`}>
              This code helps our clinicians prepare compatible parts and materials before your visit.
            </div>

            {!hasConfig && (
              <div className="absolute inset-0 rounded-3xl bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/your-arm')}
                  className="btn-premium text-sm py-3 px-6"
                >
                  Select an Arm
                </button>
              </div>
            )}
          </aside>

          {/* Booking Form */}
          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 lg:p-8">
            {!done ? (
              <form onSubmit={onSubmit} className="grid gap-6">
                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date trigger */}
                  <label className="block md:col-span-1">
                    <span className="text-label text-neutral-500 mb-2 block flex items-center gap-2">
                      <CalendarIcon size={14} />
                      Preferred date
                    </span>
                    <div className={`mt-1 w-full rounded-2xl border px-4 py-3 transition-all duration-300 ${
                      selectedClinic ? 'bg-white/[0.02] border-white/[0.06] text-white' : 'bg-white/[0.01] border-white/[0.04] text-neutral-700 cursor-not-allowed'
                    }`}>
                      <button
                        type="button"
                        disabled={!selectedClinic}
                        onClick={() => selectedClinic && setCalendarOpen(true)}
                        className="w-full text-left outline-none text-sm"
                      >
                        {form.date ? new Date(form.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Select date'}
                      </button>
                    </div>

                    <CalendarPopover
                      open={calendarOpen}
                      clinicId={selectedClinic?.id || null}
                      value={form.date}
                      onChange={(iso) => setForm({ ...form, date: iso, time: '' })}
                      onRequestClose={() => setCalendarOpen(false)}
                    />
                  </label>

                  {/* Time */}
                  <label className="block md:col-span-2">
                    <span className="text-label text-neutral-500 mb-2 block flex items-center gap-2">
                      <Clock size={14} />
                      Available times
                    </span>
                    <select
                      disabled={!selectedClinic || !form.date}
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none text-sm transition-all duration-300 ${
                        selectedClinic && form.date ? 'bg-white/[0.02] border-white/[0.06] text-white focus:border-white/20' : 'bg-white/[0.01] border-white/[0.04] text-neutral-700'
                      }`}
                      required
                    >
                      <option value="" disabled>{selectedClinic ? (form.date ? 'Select a slot' : 'Select a date first') : 'Select a clinic first'}</option>
                      {selectedClinic?.times.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </label>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full name" placeholder="Jane Appleseed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input type="email" label="Email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone" placeholder="+44 7700 900123" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input label="Address" placeholder="Flat 2, 10 Example Street, London" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>

                {/* Notes */}
                <label className="block">
                  <span className="text-label text-neutral-500 mb-2 block">Notes</span>
                  <textarea
                    rows={4}
                    placeholder="Anything we should prepare or be aware of?"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  />
                </label>

                {/* Consents */}
                <div className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02] space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 accent-white" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200">I agree to the <a href="#" className="text-white hover:underline">Terms & Conditions</a>.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 accent-white" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} required />
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200">I agree to how ReArm will use my information as described in the <a href="#" className="text-white hover:underline">Privacy Notice</a>.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 accent-white" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200">I agree to receive occasional product updates and marketing emails (optional).</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!valid || submitting}
                    className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      valid && !submitting
                        ? 'bg-white text-neutral-950 hover:bg-neutral-100'
                        : 'bg-white/[0.05] text-neutral-600 border border-white/[0.06]'
                    }`}
                  >
                    {submitting ? 'Booking...' : 'Book Your Session'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                  <div className="w-2 h-2 rounded-full bg-accent-400" />
                </div>
                <div className="text-2xl font-light text-white tracking-tight mb-4">Request received</div>
                <div className="text-neutral-400 mb-2">
                  We have logged your interest in <span className="text-white">{productNumber}</span> ({finish}).
                </div>
                <div className="text-neutral-500 text-sm mb-1">
                  Clinic: <span className="text-white">{selectedClinic?.name || '—'}</span> — Slot: <span className="text-white">{form.time || '—'}</span>
                </div>
                <div className="text-neutral-600 text-sm mb-8">A coordinator will email you shortly to confirm the slot.</div>
                <button onClick={() => navigate('/your-arm')} className="btn-outline text-sm py-3 px-6">
                  Back to Configurator
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
