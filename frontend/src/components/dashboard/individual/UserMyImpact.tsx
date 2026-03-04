import { useState, useEffect, useCallback } from 'react';
import { getAll, create, update as dsUpdate, remove as removeEvent, generateId } from '../../../utils/dataStore';
import type { PlatformUser, RecyclingEvent } from '../../../utils/dataStore';
import { Recycle, Leaf, Trophy, BarChart3, Star, Plus, X, Trash2 } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import DataTable from '../DataTable';
import ChartComponent from '../ChartComponent';
import { userProfile, wasteByType } from './_shared';

const POINTS_MAP: Record<string, number> = {
  Plastic: 10, 'Paper/Cardboard': 5, Glass: 15, 'Organic Waste': 3, Metal: 30, 'E-Waste': 25, Mixed: 8,
};
const WASTE_TYPES = ['Plastic', 'Paper/Cardboard', 'Glass', 'Organic Waste', 'Metal', 'E-Waste', 'Mixed'] as const;
const DROP_LOCS = ['Kicukiro Collection Point', 'Gasabo Eco-Center', 'Nyarugenge Drop-off', 'Kimihurura Hub', 'Other'];

export default function UserMyImpact() {
  const [events, setEvents] = useState<RecyclingEvent[]>([]);
  const [liveUser, setLiveUser] = useState<PlatformUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{ wasteType: RecyclingEvent['wasteType']; weight: number; location: string; notes: string }>({
    wasteType: 'Plastic', weight: 0, location: DROP_LOCS[0], notes: '',
  });

  const load = useCallback(() => {
    setEvents(getAll<RecyclingEvent>('recyclingEvents').filter(e => e.userId === 'U011').sort((a, b) => b.date.localeCompare(a.date)));
    const u = getAll<PlatformUser>('users').find(u => u.role === 'individual');
    if (u) setLiveUser(u);
  }, []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const handleAddEvent = () => {
    if (!form.weight || form.weight <= 0) return;
    const pts = Math.round(form.weight * (POINTS_MAP[form.wasteType] ?? 5));
    create<RecyclingEvent>('recyclingEvents', {
      id: generateId('RE'), userId: 'U011', userName: liveUser?.name ?? 'User',
      date: new Date().toISOString().split('T')[0], wasteType: form.wasteType,
      weight: form.weight, location: form.location, points: pts, notes: form.notes, verified: false,
    });
    if (liveUser) {
      const newScore = Math.min(100, (liveUser.greenScore ?? 0) + Math.round(pts / 10));
      dsUpdate<PlatformUser>('users', liveUser.id, { greenScore: newScore, monthlyWaste: (liveUser.monthlyWaste ?? 0) + form.weight });
    }
    setShowModal(false);
    setForm({ wasteType: 'Plastic', weight: 0, location: DROP_LOCS[0], notes: '' });
  };

  const handleDelete = (id: string) => removeEvent('recyclingEvents', id);

  const totalKg = events.reduce((s, e) => s + e.weight, 0);
  const totalPts = events.reduce((s, e) => s + e.points, 0);
  const co2Saved = (totalKg * 1.3).toFixed(1);
  const greenScore = liveUser?.greenScore ?? userProfile.greenScore;

  const wasteChartLive = events.length > 0 ? {
    labels: [...new Set(events.map(e => e.wasteType))],
    datasets: [{ data: [...new Set(events.map(e => e.wasteType))].map(t => events.filter(e => e.wasteType === t).reduce((s, e) => s + e.weight, 0)) }],
  } : wasteByType;

  const unlocked = (kg: number) => events.length > 0 ? totalKg >= kg : userProfile.totalRecycled >= kg;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Environmental Impact</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Plus size={16} /> Log Recycling Event</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Recycled" value={`${events.length > 0 ? totalKg.toFixed(1) : userProfile.totalRecycled} kg`} icon={<Recycle size={22} />} color="cyan" />
        <StatCard title="CO₂ Saved" value={`${events.length > 0 ? co2Saved : userProfile.co2Saved} kg`} icon={<Leaf size={22} />} color="blue" />
        <StatCard title="Eco Points" value={events.length > 0 ? totalPts : 301} icon={<Star size={22} />} color="purple" />
        <StatCard title="Green Score" value={greenScore} icon={<Trophy size={22} />} color="orange" progress={greenScore} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray={`${greenScore}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold text-green-600 dark:text-green-400">{greenScore}</span></div>
          </div>
          <p className="text-lg font-semibold">{greenScore >= 80 ? 'Excellent' : greenScore >= 60 ? 'Good' : 'Keep going!'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Updates as you recycle</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <Widget title="Waste by Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="pie" data={wasteChartLive} height={220} /></Widget>
        </div>
      </div>
      <Widget title="Recycling History" icon={<Recycle size={20} className="text-cyan-600" />} action={<button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:underline"><Plus size={14} /> Log Event</button>}>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Recycle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">No recycling events yet.</p>
            <button onClick={() => setShowModal(true)} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Log First Event</button>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'wasteType', label: 'Waste Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
              { key: 'weight', label: 'Weight', render: (v: number) => <span>{v} kg</span> },
              { key: 'points', label: 'Points', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">+{v}</span> },
              { key: 'location', label: 'Location' },
              { key: 'verified', label: 'Status', render: (v: boolean) => v ? <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Verified</span> : <span className="text-xs text-yellow-700 dark:text-yellow-700">Pending</span> },
              { key: 'id', label: '', render: (v: string) => <button onClick={() => handleDelete(v)} className="p-1 text-red-400 hover:text-red-600 dark:text-red-400"><Trash2 size={13} /></button> },
            ]}
            data={events}
            pageSize={8}
          />
        )}
      </Widget>
      <Widget title="Achievements" icon={<Trophy size={20} className="text-yellow-700 dark:text-yellow-700" />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'First Recycler', desc: 'Completed first recycling drop-off', earned: events.length > 0 || unlocked(1), icon: '🎯' },
            { name: 'Green Starter', desc: 'Recycled 10 kg of waste', earned: unlocked(10), icon: '' },
            { name: 'Eco Warrior', desc: 'Recycled 50 kg of waste', earned: unlocked(50), icon: '🛡️' },
            { name: 'Planet Protector', desc: 'Recycled 100 kg of waste', earned: unlocked(100), icon: '🌍' },
            { name: 'Carbon Hero', desc: 'Saved 100 kg of CO₂', earned: parseFloat(co2Saved) >= 100 || userProfile.co2Saved >= 100, icon: '💨' },
            { name: 'Perfect Sorter', desc: 'Sorted all 5 waste types', earned: new Set(events.map(e => e.wasteType)).size >= 5, icon: '✅' },
            { name: 'Community Leader', desc: 'Referred 5 friends', earned: false, icon: '👥' },
            { name: 'Monthly Streak', desc: '6 consecutive months', earned: events.length >= 6, icon: '🔥' },
          ].map(a => (
            <div key={a.name} className={`p-4 rounded-lg text-center border ${a.earned ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50'}`}>
              <span className="text-3xl">{a.icon}</span>
              <p className="text-sm font-semibold mt-2">{a.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.desc}</p>
              {a.earned && <span className="inline-block mt-2 text-xs text-green-600 dark:text-green-400 font-medium">✓ Earned</span>}
            </div>
          ))}
        </div>
      </Widget>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold">Log Recycling Event</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waste Type</label>
                <select value={form.wasteType} onChange={e => setForm({ ...form, wasteType: e.target.value as RecyclingEvent['wasteType'] })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                  {WASTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                <input type="number" min="0.1" step="0.1" value={form.weight || ''} onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Enter weight" />
                {form.weight > 0 && <p className="text-xs text-green-600 dark:text-green-400 mt-1">≈ {Math.round(form.weight * (POINTS_MAP[form.wasteType] ?? 5))} eco pts · CO₂ saved: {(form.weight * 1.3).toFixed(1)} kg</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drop-off Location</label>
                <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                  {DROP_LOCS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">Cancel</button>
              <button onClick={handleAddEvent} disabled={!form.weight || form.weight <= 0} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 disabled:opacity-50">Log Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
