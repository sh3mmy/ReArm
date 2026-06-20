import React, { useState } from 'react';
import { X, Send, ArrowRight } from 'lucide-react';

type QuoteModalProps = {
  open: boolean;
  onClose: () => void;
  productNumber: string;
  finish: string;
};

const QuoteModal: React.FC<QuoteModalProps> = ({ open, onClose, productNumber, finish }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email' as 'email' | 'phone',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setBusy(true);
    // Simulate sending email with quote details
    await new Promise(r => setTimeout(r, 1200));
    setBusy(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', phone: '', preferredContact: 'email', message: '' });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" style={{ zIndex: 1000 }} onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-[28px] border border-white/[0.08] bg-neutral-950 shadow-2xl p-8" style={{ zIndex: 1001 }} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label mb-1">Quote Request</div>
            <h2 className="text-xl font-medium text-white tracking-tight">{submitted ? 'Quote Sent' : 'Get a Quote'}</h2>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300">
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <>
            <div className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02] mb-6">
              <div className="text-neutral-500 text-xs mb-1">Selected Configuration</div>
              <div className="text-white font-medium">{productNumber}</div>
              <div className="text-neutral-400 text-sm mt-1">Finish: {finish}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="section-label mb-2 block">Full name</span>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  placeholder="Jane Appleseed"
                />
              </label>
              <label className="block">
                <span className="section-label mb-2 block">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  placeholder="jane@example.com"
                />
              </label>
              <label className="block">
                <span className="section-label mb-2 block">Phone</span>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  placeholder="+44 7700 900123"
                />
              </label>
              <div>
                <span className="section-label mb-2 block">Preferred contact method</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, preferredContact: 'email' })}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                      form.preferredContact === 'email'
                        ? 'border-white bg-white/[0.06] text-white'
                        : 'border-white/[0.06] text-neutral-400 hover:border-white/15'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, preferredContact: 'phone' })}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${
                      form.preferredContact === 'phone'
                        ? 'border-white bg-white/[0.06] text-white'
                        : 'border-white/[0.06] text-neutral-400 hover:border-white/15'
                    }`}
                  >
                    Phone Call
                  </button>
                </div>
              </div>
              <label className="block">
                <span className="section-label mb-2 block">Message (optional)</span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-2xl bg-white/[0.02] border border-white/[0.06] px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 text-sm"
                  placeholder="Any specific requirements or questions..."
                />
              </label>
              <button
                type="submit"
                disabled={busy || !form.name || !form.email || !form.phone}
                className={`w-full rounded-full px-6 py-3 font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  busy || !form.name || !form.email || !form.phone
                    ? 'bg-white/[0.05] text-neutral-600 border border-white/[0.06]'
                    : 'bg-white text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {busy ? 'Sending...' : (
                  <>
                    Request Quote <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
              <Send size={24} className="text-accent-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Quote Request Sent</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Your request for <span className="text-white">{productNumber}</span> ({finish}) has been submitted.
              A ReArm specialist will contact you via {form.preferredContact} within 24 hours.
            </p>
            <button onClick={handleClose} className="btn-outline text-sm py-3 px-6">
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QuoteModal;
