import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';

const CLINICS = [
  { id: 'lon', name: 'ReArm London Clinic', address: '221B Baker St, London NW1 6XE', x: 52.2, y: 64.5, times: ['09:00', '10:30', '13:00', '15:30'] },
  { id: 'man', name: 'ReArm Manchester Clinic', address: "1 St Peter's Sq, Manchester M2 3AE", x: 45.5, y: 35.0, times: ['09:30', '11:00', '14:00', '16:00'] },
  { id: 'edi', name: 'ReArm Edinburgh Clinic', address: '10 Princes St, Edinburgh EH2 2AN', x: 46.5, y: 16.0, times: ['10:00', '12:00', '14:30', '17:00'] },
];

const AVAILABILITY: Record<string, Set<string>> = {
  lon: new Set(['2025-08-18','2025-08-21','2025-08-25','2025-09-02','2025-09-05','2025-09-12']),
  man: new Set(['2025-08-20','2025-08-27','2025-09-03','2025-09-10']),
  edi: new Set(['2025-08-19','2025-08-22','2025-08-29','2025-09-06','2025-09-13']),
};

const STORAGE_KEY = 'rearmSelection';
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;

type CalendarPopoverProps = {
  open: boolean;
  clinicId: string | null;
  value: string;
  onChange: (iso: string) => void;
  onRequestClose: () => void;
};

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

  const avail = clinicId ? AVAILABILITY[clinicId] : undefined;
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
      <div ref={panelRef} className="fixed left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/[0.08] bg-neutral-950 p-6 shadow-2xl" role="dialog" aria-modal="true" style={{ zIndex: 1001 }} onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={prev} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300"><ChevronLeft size={16} /></button>
          <div className="text-white font-medium text-sm">{new Date(year, month - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
          <button type="button" onClick={next} className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300"><ChevronRight size={16} /></button>
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
              <button type="button" key={c.iso} onClick={() => { if (c.available && !c.past) { onChange(c.iso!); onRequestClose(); } }}
                className={`h-10 rounded-xl border ${color} ${cursor} ${opacity} transition-all duration-200 text-sm font-medium`} aria-label={c.iso}>
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

export default function PrivateDemoPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

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

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', date: '', time: '', notes: '' });
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const selectedClinic = useMemo(() => CLINICS.find(c => c.id === selectedClinicId) || null, [selectedClinicId]);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const valid = useMemo(() => {
    return form.name.trim().length > 1 && /.+@.+\..+/.test(form.email) && form.address.trim().length > 4 && selectedClinic && form.date !== '' && form.time !== '' && agreeTerms && agreePrivacy;
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
      <span className="section-label mb-2 block">{props.label}</span>
      <input {...props} className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm" />
    </label>
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative">
      <div className="pointer-events-none fixed inset-0 bg-premium-sheen" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="mb-12">
          <div className="section-label mb-4">Experience</div>
          <h1 className="font-normal text-white mb-4 tracking-[-0.02em] leading-[1.05]" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
            Book Your Private Demo
          </h1>
          <p className="font-light text-neutral-400 text-lg max-w-xl">
            Choose a clinic, pick a time, and share your details. We will confirm by email.
          </p>
        </div>

        {/* UK Map with clinic markers */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-6 mb-8">
          <div className="relative h-80 rounded-3xl border border-white/[0.06] overflow-hidden bg-neutral-900/30">
            {/* UK Map SVG */}
            <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* England */}
              <path d="M45,55 L48,52 L52,53 L55,58 L58,62 L60,68 L58,72 L55,75 L52,78 L48,80 L45,78 L42,75 L40,70 L42,65 L44,60 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              {/* Wales */}
              <path d="M38,62 L42,60 L44,65 L42,70 L40,72 L38,68 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              {/* Scotland */}
              <path d="M38,15 L42,12 L48,10 L55,12 L60,15 L62,20 L60,25 L58,30 L55,35 L52,40 L48,42 L44,40 L42,35 L40,30 L38,25 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              {/* Northern Ireland */}
              <path d="M30,32 L34,30 L36,35 L34,38 L30,36 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              {/* Grid lines */}
              {[10,20,30,40,50,60,70,80,90].map(n => (
                <React.Fragment key={n}>
                  <line x1={n} y1="0" x2={n} y2="120" stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />
                  <line x1="0" y1={n} x2="100" y2={n} stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />
                </React.Fragment>
              ))}
            </svg>

            {/* Clinic markers */}
            {CLINICS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  selectedClinicId === c.id ? 'z-20' : 'z-10'
                }`}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                title={c.name}
                aria-label={c.name}
              >
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  selectedClinicId === c.id
                    ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-125'
                    : 'bg-white/50 border-white/80 hover:bg-white'
                }`} />
                {selectedClinicId === c.id && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-neutral-950/90 backdrop-blur-sm border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white shadow-lg">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-neutral-400 text-[10px]">{c.address}</div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <aside className="rounded-3xl border border-white/[0.06] p-5 bg-white/[0.02] backdrop-blur-sm">
            <div className="section-label text-neutral-500 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Select a Clinic
            </div>
            <ul className="space-y-3">
              {CLINICS.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedClinicId(c.id); setForm({ ...form, date: '', time: '' }); }}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-all duration-300 ${
                      selectedClinicId === c.id ? 'border-white bg-white/[0.06]' : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="font-medium text-sm text-white">{c.name}</div>
                    <div className="text-neutral-500 text-xs mt-1">{c.address}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Summary + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
          <aside className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 h-fit">
            <div className={`section-label mb-4 ${!hasConfig ? 'opacity-60' : ''}`}>Selected Configuration</div>
            <div className={`rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02] ${!hasConfig ? 'opacity-50' : ''}`}>
              <div className="text-neutral-500 text-xs mb-1">Internal Product Number</div>
              <div className="text-2xl font-light text-white tracking-tight">{productNumber}</div>
              <div className="mt-4 text-neutral-400 text-sm">Finish: <span className="text-white">{finish}</span></div>
              <div className="mt-4">
                <button onClick={() => navigate('/your-arm')} className={`text-sm link-underline ${!hasConfig ? 'pointer-events-none text-neutral-700' : 'text-neutral-400 hover:text-white'}`}>Edit Configuration</button>
              </div>
            </div>
            <div className={`mt-4 text-neutral-600 text-xs ${!hasConfig ? 'opacity-60' : ''}`}>This code helps our clinicians prepare compatible parts and materials before your visit.</div>
            {!hasConfig && (
              <div className="absolute inset-0 rounded-3xl bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center">
                <button type="button" onClick={() => navigate('/your-arm')} className="btn-premium text-sm py-3 px-6">Select an Arm</button>
              </div>
            )}
          </aside>

          <section className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 lg:p-8">
            {!done ? (
              <form onSubmit={onSubmit} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block md:col-span-1">
                    <span className="section-label mb-2 block flex items-center gap-2"><CalendarIcon size={14} /> Preferred date</span>
                    <div className={`mt-1 w-full rounded-2xl border px-4 py-3 transition-all duration-300 ${selectedClinic ? 'bg-white/[0.02] border-white/[0.06] text-white' : 'bg-white/[0.01] border-white/[0.04] text-neutral-700 cursor-not-allowed'}`}>
                      <button type="button" disabled={!selectedClinic} onClick={() => selectedClinic && setCalendarOpen(true)} className="w-full text-left outline-none text-sm">
                        {form.date ? new Date(form.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Select date'}
                      </button>
                    </div>
                    <CalendarPopover open={calendarOpen} clinicId={selectedClinic?.id || null} value={form.date} onChange={(iso) => setForm({ ...form, date: iso, time: '' })} onRequestClose={() => setCalendarOpen(false)} />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="section-label mb-2 block flex items-center gap-2"><Clock size={14} /> Available times</span>
                    <select disabled={!selectedClinic || !form.date} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={`w-full rounded-2xl border px-4 py-3 outline-none text-sm transition-all duration-300 ${selectedClinic && form.date ? 'bg-white/[0.02] border-white/[0.06] text-white focus:border-white/20' : 'bg-white/[0.01] border-white/[0.04] text-neutral-700'}`} required>
                      <option value="" disabled>{selectedClinic ? (form.date ? 'Select a slot' : 'Select a date first') : 'Select a clinic first'}</option>
                      {selectedClinic?.times.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full name" placeholder="Jane Appleseed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input type="email" label="Email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone" placeholder="+44 7700 900123" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input label="Address" placeholder="Flat 2, 10 Example Street, London" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
                <label className="block">
                  <span className="section-label mb-2 block">Notes</span>
                  <textarea rows={4} placeholder="Anything we should prepare or be aware of?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm" />
                </label>
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
                <div className="flex items-center justify-end pt-2">
                  <button type="submit" disabled={!valid || submitting} className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${valid && !submitting ? 'bg-white text-neutral-950 hover:bg-neutral-100' : 'bg-white/[0.05] text-neutral-600 border border-white/[0.06]'}`}>
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
                <div className="text-neutral-400 mb-2">We have logged your interest in <span className="text-white">{productNumber}</span> ({finish}).</div>
                <div className="text-neutral-500 text-sm mb-1">Clinic: <span className="text-white">{selectedClinic?.name || '—'}</span> — Slot: <span className="text-white">{form.time || '—'}</span></div>
                <div className="text-neutral-600 text-sm mb-8">A coordinator will email you shortly to confirm the slot.</div>
                <button onClick={() => navigate('/your-arm')} className="btn-outline text-sm py-3 px-6">Back to Configurator</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
