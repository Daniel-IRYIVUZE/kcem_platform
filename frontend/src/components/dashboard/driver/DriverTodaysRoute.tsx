// components/dashboard/driver/DriverTodaysRoute.tsx
import { useState, useEffect, useCallback } from 'react';
import { getAll, update as dsUpdate } from '../../../utils/dataStore';
import type { Collection } from '../../../utils/dataStore';
import {
  Map, CheckCircle, DollarSign, Phone, Clock, Navigation,
  Package, MapPin
} from 'lucide-react';
import StatCard from '../StatCard';
import { StatusBadge, driverProfile, todaysStops } from './_shared';

export default function DriverTodaysRoute() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const all = getAll<Collection>('collections');
    const todayItems = all.filter(c => c.scheduledDate.startsWith(today) && c.driverName === driverProfile.name);
    setCollections(todayItems.length > 0 ? todayItems : all.filter(c => c.status === 'scheduled' || c.status === 'en-route').slice(0, 5));
  }, []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const stops = collections.length > 0 ? collections.map((c, idx) => ({
    id: c.id, hotel: c.hotelName, address: c.location || 'Kigali', type: c.wasteType,
    quantity: `${c.volume} ${c.wasteType === 'UCO' ? 'L' : 'kg'}`,
    time: c.scheduledTime || `0${9+idx}:00 AM`, status: c.status, contact: '', notes: c.notes || '',
    _dsId: c.id,
  })) : todaysStops;

  const completedStops = stops.filter(s => s.status === 'completed' || s.status === 'collected' || s.status === 'verified').length;
  const totalStops = stops.length;
  const progress = Math.round((completedStops / totalStops) * 100);

  const handleMarkCollected = (dsId: string | undefined, stopId: number | string) => {
    if (dsId) {
      dsUpdate<Collection>('collections', dsId, { status: 'collected', completedAt: new Date().toISOString() });
      setFlash('Stop marked as collected!');
      setTimeout(() => setFlash(null), 2500);
    } else {
      setFlash(`Stop ${stopId} marked as collected! (demo)`);
      setTimeout(() => setFlash(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {flash && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 px-4 py-2 rounded-lg text-sm">{flash}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Route</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Route KG-01 · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Navigation size={16} /> Navigate</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><Phone size={16} /> Dispatch</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Stops Done" value={`${completedStops}/${totalStops}`} icon={<CheckCircle size={22} />} color="cyan" progress={progress} />
        <StatCard title="Current Stop" value="4 of 5" icon={<MapPin size={22} />} color="blue" />
        <StatCard title="Total Weight" value="1,530 kg" icon={<Package size={22} />} color="purple" />
        <StatCard title="Est. Earnings" value="RWF 45K" icon={<DollarSign size={22} />} color="orange" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg h-52 flex items-center justify-center mb-6">
          <div className="text-center text-gray-500 dark:text-gray-400"><Map size={48} className="mx-auto mb-2 opacity-50" /><p className="text-sm font-medium">Live Route Map</p><p className="text-xs text-gray-400 dark:text-gray-500">Turn-by-turn navigation with stop markers</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b"><h3 className="text-lg font-semibold">Stop Schedule</h3></div>
        <div className="divide-y">
          {stops.map((stop, idx) => (
            <div key={stop.id} className={`px-6 py-4 ${stop.status === 'en-route' || stop.status === 'in_progress' ? 'bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${(stop.status === 'completed' || stop.status === 'collected') ? 'bg-green-500 text-white' : (stop.status === 'en-route' || stop.status === 'in_progress') ? 'bg-cyan-600 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{idx + 1}</div>
                  {idx < stops.length - 1 && <div className={`w-0.5 h-8 mt-1 ${(stop.status === 'completed' || stop.status === 'collected') ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stop.hotel}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stop.address}</p>
                    </div>
                    <StatusBadge status={stop.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {stop.time}</span>
                    <span className="flex items-center gap-1"><Package size={12} /> {stop.type} — {stop.quantity}</span>
                    {stop.contact && <span className="flex items-center gap-1"><Phone size={12} /> {stop.contact}</span>}
                  </div>
                  {stop.notes && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">📝 {stop.notes}</p>}
                  {(stop.status === 'en-route' || stop.status === 'in_progress') && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleMarkCollected((stop as any)._dsId, stop.id)} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">Mark Collected</button>
                      <button className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-300">Report Issue</button>
                      <button className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 font-medium flex items-center gap-1"><Navigation size={12} /> Navigate</button>
                    </div>
                  )}
                  {stop.status === 'scheduled' && (
                    <button onClick={() => handleMarkCollected((stop as any)._dsId, stop.id)} className="mt-3 px-3 py-1.5 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 font-medium flex items-center gap-1"><Navigation size={12} /> Start &amp; Mark Done</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
