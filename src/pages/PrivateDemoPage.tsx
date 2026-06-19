import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BOOKING } from '../lib/images'; // change to '@/lib/images' if you use path aliases

// ----------------------
// Types & static data
// ----------------------
type Clinic = {
  id: string;
  name: string;
  address: string;
  x: number; // % position on the background map (left)
  y: number; // % position on the background map (top)
  times: string[];
};

const CLINICS: Clinic[] = [
  { id: 'lon', name: 'ReArm London Clinic', address: '221B Baker St, London NW1 6XE', x: 45, y: 52, times: ['09:00', '10:30', '13:00', '15:30'] },
  { id: 'man', name: 'ReArm Manchester Clinic', address: '1 St Peter’s Sq, Manchester M2 3AE', x: 40, y: 38, times: ['09:30', '11:00', '14:00', '16:00'] },
  { id: 'edi', name: 'ReArm Edinburgh Clinic', address: '10 Princes St, Edinburgh EH2 2AN', x: 55, y: 25, times: ['10:00', '12:00', '14:30', '17:00'] },
];

// Availability: clinicId -> Set of ISO dates (YYYY-MM-DD) that are AVAILABLE (green).
const AVAILABILITY: Record<string, Set<string>> = {
  lon: new Set(['2025-08-18','2025-08-21','2025-08-25','2025-09-02','2025-09-05','2025-09-12']),
  man: new Set(['2025-08-20','2025-08-27','2025-09-03','2025-09-10']),
  edi: new Set(['2025-08-19','2025-08-22','2025-08-29','2025-09-06','2025-09-13']),
};

const STORAGE_KEY = 'rearmSelection';

// ----------------------
// Calendar popover (no close button; auto-close on pick; outside click via capture)
// ----------------------
type CalendarPopoverProps = {
  open: boolean;
  clinicId: string | null;
  value: string;                 // ISO date (YYYY-MM-DD) or ""
  onChange: (iso: string) => void;
  onRequestClose: () => void;    // called after a valid pick or outside click
};

const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;

const CalendarPopover: React.FC<CalendarPopoverProps> = ({ open, clinicId, value, onChange, onRequestClose }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1..12
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Ultra-reliable outside click handler: capture-phase pointerdown on window
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

  const avail = clinicId ? AVAILABILITY[clinicId] : undefined;
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDayIdx = (firstOfMonth.getDay() + 6) % 7; // Monday=0 ... Sunday=6
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
      {/* Visual overlay (no handler; outside click handled globally) */}
      <div aria-hidden className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ zIndex: 1000 }} />
      <div
        ref={panelRef}
        className="fixed left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/85 p-4"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1001 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={prev} className="px-2 py-1 rounded border border-white/20 text-white/80 hover:bg-white/5">‹</button>
          <div className="text-white/90">
            {new Date(year, month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button type="button" onClick={next} className="px-2 py-1 rounded border border-white/20 text-white/80 hover:bg-white/5">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-white/60 text-xs mb-1">
          {WEEKDAYS.map(w => <div key={w} className="py-1">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (c.d === null) return <div key={i} className="h-9" />;
            const isSelected = c.iso === value;
            const color = c.available
              ? (isSelected ? 'bg-green-500 text-black border-green-400' : 'border-green-400 text-green-300')
              : 'border-red-400 text-red-300';
            const cursor = (c.available && !c.past) ? 'cursor-pointer' : 'cursor-not-allowed';
            const opacity = c.past ? 'opacity-40' : '';
            return (
              <button
                type="button"
                key={c.iso}
                onClick={() => { if (c.available && !c.past) { onChange(c.iso!); onRequestClose(); } }}
                className={`h-9 rounded-md border ${color} ${cursor} ${opacity} hover:bg-white/10`}
                aria-label={c.iso}
              >
                {c.d}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded border border-green-400" /> Available
            <span className="inline-block w-3 h-3 rounded border border-red-400 ml-4" /> Unavailable
          </div>
          <span className="text-white/40">Pick a green day</span>
        </div>
      </div>
    </>
  );
};

// ----------------------
// Main Page
// ----------------------
export default function PrivateDemoPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // Selection summary pulled from query or localStorage
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

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '', // ISO date
    time: '',
    notes: '',
  });

  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const selectedClinic = useMemo(() => CLINICS.find(c => c.id === selectedClinicId) || null, [selectedClinicId]);

  // Consents
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Calendar visibility
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
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);
  };

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="block">
      <span className="text-white/70 text-sm">{props.label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1100px_600px_at_50%_-140px,rgba(255,255,255,0.12),transparent)]" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Book Your Private Demo</h1>
          <p className="text-white/70 mt-1 text-sm">Choose a clinic, pick a time, and share your details. We’ll confirm by email.</p>
        </div>

        {/* Map + clinic list */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-4">
          <div
            className="relative h-56 rounded-2xl border border-white/15 overflow-hidden"
            style={{ background: `url(${BOOKING.clinicBg}) center/cover no-repeat` }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(600px_300px_at_60%_-20%,white,transparent)]" />
            {CLINICS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border ${selectedClinicId === c.id ? 'bg-white border-white' : 'bg-white/70 border-white/80'}`}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>

          <aside className="rounded-2xl border border-white/15 p-3 bg-white/5">
            <ul className="space-y-2">
              {CLINICS.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition ${selectedClinicId === c.id ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-white/70 text-xs">{c.address}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Summary + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6 mt-6">
          {/* Summary */}
          <aside className="relative rounded-3xl border border-white/10 bg-black/60 backdrop-blur p-5 h-fit">
            <div className={`text-white/70 text-sm ${!hasConfig ? 'opacity-60' : ''}`}>Selected Configuration</div>
            <div className={`mt-2 rounded-2xl border border-white/10 p-4 bg-white/5 ${!hasConfig ? 'opacity-50' : ''}`}>
              <div className="text-white/70 text-xs">Internal Product Number</div>
              <div className="text-xl font-semibold mt-1">{productNumber}</div>
              <div className="mt-3 text-white/80 text-sm">
                Finish: <span className="text-white">{finish}</span>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => navigate('/your-arm')}
                  className={`text-sm underline underline-offset-4 ${!hasConfig ? 'pointer-events-none text-white/40' : 'text-white/80 hover:text-white'}`}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className={`mt-4 text-white/60 text-xs ${!hasConfig ? 'opacity-60' : ''}`}>
              This code helps our clinicians prepare compatible parts and materials before your visit.
            </div>

            {/* Overlay when no config */}
            {!hasConfig && (
              <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/your-arm')}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90 transition"
                >
                  Select an Arm
                </button>
              </div>
            )}
          </aside>

          {/* Booking Form */}
          <section className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur p-5">
            {!done ? (
              <form onSubmit={onSubmit} className="grid gap-5">
                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Date trigger (read-only) */}
                  <label className="block md:col-span-1">
                    <span className="text-white/70 text-sm">Preferred date</span>
                    <div className={`mt-1 w-full rounded-xl border px-3 py-2 ${selectedClinic ? 'bg-black/40 border-white/15 text-white' : 'bg-black/20 border-white/10 text-white/40 cursor-not-allowed'}`}>
                      <button
                        type="button"
                        disabled={!selectedClinic}
                        onClick={() => selectedClinic && setCalendarOpen(true)}
                        className="w-full text-left outline-none"
                      >
                        {form.date ? new Date(form.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Select date'}
                      </button>
                    </div>

                    {/* Calendar popover */}
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
                    <span className="text-white/70 text-sm">Available times</span>
                    <select
                      disabled={!selectedClinic || !form.date}
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none ${selectedClinic && form.date ? 'bg-black/40 border-white/15 text-white focus:border-white/40' : 'bg-black/20 border-white/10 text-white/40'}`}
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
                  <span className="text-white/70 text-sm">Notes</span>
                  <textarea
                    rows={5}
                    placeholder="Anything we should prepare or be aware of?"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-white/40"
                  />
                </label>

                {/* Consents */}
                <div className="rounded-2xl border border-white/15 p-4 bg-white/5 space-y-2">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                    <span className="text-sm text-white/80">I agree to the <a href="#" className="underline hover:opacity-80">Terms & Conditions</a>.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} required />
                    <span className="text-sm text-white/80">I agree to how ReArm will use my information as described in the <a href="#" className="underline hover:opacity-80">Privacy Notice</a>.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
                    <span className="text-sm text-white/80">I agree to receive occasional product updates and marketing emails (optional).</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!valid || submitting}
                    className={`px-5 py-2 rounded-xl transition ${valid && !submitting ? 'bg-white text-black hover:opacity-90' : 'bg-white/10 text-white/40'}`}
                  >
                    {submitting ? 'Booking…' : 'Book Your Session'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-16">
                <div className="text-2xl font-semibold">Request received</div>
                <div className="text-white/70 mt-2">
                  We’ve logged your interest in <span className="text-white">{productNumber}</span> ({finish}).
                </div>
                <div className="text-white/70 mt-1 text-sm">
                  Clinic: <span className="text-white">{selectedClinic?.name || '—'}</span> — Slot: <span className="text-white">{form.time || '—'}</span>
                </div>
                <div className="text-white/60 mt-1 text-sm">A coordinator will email you shortly to confirm the slot.</div>
                <div className="mt-6">
                  <button onClick={() => navigate('/your-arm')} className="px-5 py-2 rounded-xl border border-white/20 text-white hover:border-white/60 hover:bg-white/5">
                    Back to Configurator
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
