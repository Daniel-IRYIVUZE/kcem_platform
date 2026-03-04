import { useState } from 'react';
import { create, generateId } from '../../../utils/dataStore';
import type { SupportTicket } from '../../../utils/dataStore';
import { CheckCircle, Phone, ChevronRight } from 'lucide-react';
import { driverProfile } from './_shared';

const faqs = [
  { q: 'What do I do if I miss a collection stop?', a: 'Immediately contact fleet dispatch via the app or call the emergency line. Log the reason for the miss in the job notes.' },
  { q: 'How are my earnings calculated?', a: 'Earnings are based on completed stops × base rate + distance bonus + on-time bonus. Payouts are processed daily.' },
  { q: 'What should I do if my vehicle breaks down?', a: 'Call the emergency maintenance line (0788-MAINT). Activate the hazard warning in the app and wait for roadside support.' },
  { q: 'How do I report a safety incident?', a: 'Use the "Report Incident" button in the app menu, or file a report through Support below. Include time, location, and a brief description.' },
];

export default function DriverSupport() {
  const [form, setForm] = useState({ subject: '', category: 'Route Issue', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: generateId(),
      userId: 'driver-001',
      userName: driverProfile.name,
      subject: `[${form.category}] ${form.subject}`,
      status: 'open',
      priority: 'medium',
      message: form.message,
      createdAt: now,
      updatedAt: now,
      responses: [],
    };
    create<SupportTicket>('supportTickets', ticket);
    setSubmitted(true);
    setForm({ subject: '', category: 'Route Issue', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Fleet Dispatch', value: '0788-FLEET-01', icon: <Phone size={20} className="text-cyan-600" /> },
          { label: 'Emergency Maintenance', value: '0788-MAINT', icon: <Phone size={20} className="text-red-500" /> },
          { label: 'Support Office Hours', value: 'Mon–Sat, 6am–9pm', icon: <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" /> },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">{item.icon}</div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</p><p className="font-semibold text-gray-900 dark:text-white">{item.value}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Submit a Ticket</h2>
        {submitted && <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 text-sm"><CheckCircle size={16} /> Ticket submitted! Our team will respond within 4 hours.</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
              <input required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 outline-none" placeholder="Brief description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 outline-none">
                {['Route Issue', 'Vehicle Problem', 'Payment Query', 'App Bug', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
            <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 outline-none resize-none" placeholder="Describe your issue in detail..." />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors">Submit Ticket</button>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
                <ChevronRight size={16} className={`text-gray-400 dark:text-gray-500 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
