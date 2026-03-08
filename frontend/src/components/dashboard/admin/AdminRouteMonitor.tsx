// components/dashboard/admin/AdminRouteMonitor.tsx
import { useState, useEffect, useRef } from 'react';
import { Map, Truck, Building2, Recycle, AlertTriangle, RefreshCw } from 'lucide-react';
import { collectionsAPI, usersAPI, type Collection, type APIUser } from '../../../services/api';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR: Record<string, string> = {
  'en_route':  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  scheduled:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  completed:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};


export default function AdminRouteMonitor() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [users, setUsers] = useState<APIUser[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<Collection | null>(null);
  const [layerFilter, setLayerFilter] = useState<'all' | 'hotels' | 'recyclers' | 'routes'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = () => {
    Promise.all([
      collectionsAPI.list({ limit: 200 }).catch(() => [] as Collection[]),
      usersAPI.list({ limit: 500 }).catch(() => [] as APIUser[]),
    ]).then(([cs, us]) => {
      setCollections(cs);
      setUsers(us);
      setLastRefresh(new Date());
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const hotels = users.filter(u => u.role === 'business');
  const recyclers = users.filter(u => u.role === 'recycler');
  const drivers = users.filter(u => u.role === 'driver');
  const activeRoutes = collections.filter(c => c.status === 'en_route');
  const scheduledRoutes = collections.filter(c => c.status === 'scheduled');

  // Hotel and recycler map pins (Kigali coordinates)
  const HOTEL_PINS: Array<{ name: string; coord: [number, number] }> = [
    { name: 'Hotel des Mille Collines', coord: [-1.9519, 30.0612] },
    { name: 'Kigali Marriott', coord: [-1.9480, 30.0601] },
    { name: 'Serena Hotel', coord: [-1.9543, 30.0621] },
    { name: 'Radisson Blu', coord: [-1.9561, 30.0648] },
  ];
  const RECYCLER_PINS: Array<{ name: string; coord: [number, number] }> = [
    { name: 'GreenPath Solutions', coord: [-1.9620, 30.0700] },
    { name: 'EcoRevive Rwanda',    coord: [-1.9480, 30.0490] },
    { name: 'CleanTech Kigali',    coord: [-1.9380, 30.0650] },
  ];
  const DRIVER_PINS: Array<{ name: string; coord: [number, number]; active: boolean }> = [
    { name: 'Jean Pierre', coord: [-1.9500, 30.0580], active: true },
    { name: 'Alice M.',    coord: [-1.9460, 30.0640], active: true },
  ];

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const init = async () => {
      try {
        const L = await import('leaflet');
        const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
          .setView([-1.9441, 30.0619], 13);
        leafletMapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 18,
        }).addTo(map);

        const makeIcon = (emoji: string, bg: string, pulse = false) => L.divIcon({
          html: `<div style="background:${bg};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;font-size:14px${pulse ? ';animation:none' : ''}">${emoji}</div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 14],
        });

        // Hotel markers
        if (layerFilter === 'all' || layerFilter === 'hotels') {
          HOTEL_PINS.forEach(h => L.marker(h.coord, { icon: makeIcon('🏨', '#16a34a') })
            .addTo(map).bindPopup(`<b>${h.name}</b><br>Hotel`));
        }
        // Recycler markers
        if (layerFilter === 'all' || layerFilter === 'recyclers') {
          RECYCLER_PINS.forEach(r => L.marker(r.coord, { icon: makeIcon('♻', '#2563eb') })
            .addTo(map).bindPopup(`<b>${r.name}</b><br>Recycler`));
        }
        // Driver markers
        if (layerFilter === 'all' || layerFilter === 'routes') {
          DRIVER_PINS.forEach(d => L.marker(d.coord, { icon: makeIcon('🚛', d.active ? '#f59e0b' : '#6b7280') })
            .addTo(map).bindPopup(`<b>${d.name}</b><br>${d.active ? 'En Route' : 'Off Duty'}`));
        }
        // Route lines
        if (layerFilter === 'all' || layerFilter === 'routes') {
          HOTEL_PINS.slice(0, 3).forEach((h, i) => {
            const r = RECYCLER_PINS[i % RECYCLER_PINS.length];
            L.polyline([h.coord, r.coord], { color: '#06b6d4', weight: 2, dashArray: '6 3', opacity: 0.6 }).addTo(map);
          });
        }
      } catch (err) { console.error('Leaflet init failed', err); }
    };
    init();
    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Map size={20} className="text-cyan-600" />
          Route Monitor — Live Map
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Routes', value: activeRoutes.length, icon: <Truck size={18} />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Scheduled', value: scheduledRoutes.length, icon: <Map size={18} />, color: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Hotels Online', value: hotels.filter(h => h.status === 'active').length, icon: <Building2 size={18} />, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Recyclers Active', value: recyclers.length, icon: <Recycle size={18} />, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 flex items-center gap-3`}>
            <div>{icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Layer Toggles */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Layers:</span>
            {([
              { key: 'all', label: 'All', color: 'bg-gray-600' },
              { key: 'hotels', label: '🏨 Hotels', color: 'bg-green-500' },
              { key: 'recyclers', label: '♻️ Recyclers', color: 'bg-blue-500' },
              { key: 'routes', label: '🚛 Drivers', color: 'bg-yellow-400' },
            ] as const).map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setLayerFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  layerFilter === key
                    ? `${color} text-white border-transparent`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Real Leaflet Map */}
          <div ref={mapRef} style={{ height: 380, width: '100%' }} />
        </div>

        {/* Alerts + Route Details Panel */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              Alerts
            </h3>
            {activeRoutes.length === 0 && scheduledRoutes.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No active alerts</p>
            ) : (
              <div className="space-y-2">
                {activeRoutes.length > 0 && (
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                    {activeRoutes.length} route{activeRoutes.length > 1 ? 's' : ''} currently en-route
                  </div>
                )}
                {scheduledRoutes.length > 0 && (
                  <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm">
                    {scheduledRoutes.length} pickup{scheduledRoutes.length > 1 ? 's' : ''} scheduled today
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Routes List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Truck size={16} className="text-cyan-600" />
              Active Collections
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collections.slice(0, 8).map(col => (
                <button
                  key={col.id}
                  onClick={() => setSelectedRoute(selectedRoute?.id === col.id ? null : col)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors border ${
                    selectedRoute?.id === col.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {col.hotel_name || 'Hotel'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${STATUS_COLOR[col.status] || STATUS_COLOR.scheduled}`}>
                      {col.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {col.waste_type} · {col.volume}kg · Driver: {col.driver_name}
                  </p>
                </button>
              ))}
              {collections.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No collections found</p>
              )}
            </div>
          </div>

          {/* Route Detail */}
          {selectedRoute && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-cyan-300 dark:border-cyan-700 p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Route Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Hotel</span><span className="font-medium">{selectedRoute.hotel_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Driver</span><span className="font-medium">{selectedRoute.driver_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Recycler</span><span className="font-medium">{selectedRoute.recycler_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Waste</span><span className="font-medium">{selectedRoute.waste_type} · {selectedRoute.volume}kg</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="font-medium">{selectedRoute.scheduled_date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[selectedRoute.status] || STATUS_COLOR.scheduled}`}>
                    {selectedRoute.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Truck size={16} className="text-cyan-600" />
          Driver Fleet Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Driver', 'Status', 'Sector', 'Phone', 'Joined'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {drivers.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400 dark:text-gray-500">No drivers registered</td></tr>
              ) : drivers.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{d.full_name}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">Kigali</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{d.phone || '—'}</td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
