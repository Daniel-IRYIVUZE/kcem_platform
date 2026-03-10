// components/dashboard/business/BusinessLocation.tsx
import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, X } from 'lucide-react';
import { hotelsAPI, type HotelProfile } from '../../../services/api';
import 'leaflet/dist/leaflet.css';

interface CustomLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  note?: string;
}

const STORAGE_KEY = 'ecotrade_custom_locations';

// Kigali hotel + nearby recycler coordinates
const HOTEL_COORD: [number, number] = [-1.9536, 30.0605];
const NEARBY_RECYCLERS = [
  { name: 'GreenPath Solutions', distance: '3.2 km', rating: 4.8, coord: [-1.9620, 30.0700] as [number, number] },
  { name: 'EcoRevive Rwanda',    distance: '4.5 km', rating: 4.3, coord: [-1.9480, 30.0490] as [number, number] },
  { name: 'CleanTech Kigali',    distance: '5.1 km', rating: 4.5, coord: [-1.9380, 30.0650] as [number, number] },
];

export default function BusinessLocation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const customMarkersRef = useRef<Record<string, any>>({});

  const [hotel, setHotel] = useState<HotelProfile | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [customLocs, setCustomLocs] = useState<CustomLocation[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', note: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    hotelsAPI.me().then(setHotel).catch(() => {});
  }, []);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const init = async () => {
      const L = await import('leaflet');
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false }).setView(HOTEL_COORD, 13);
      leafletMapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);

      const hotelIcon = L.divIcon({
        html: `<div style="background:#0891b2;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white;font-size:16px">🏨</div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16],
      });
      L.marker(HOTEL_COORD, { icon: hotelIcon }).addTo(map).bindPopup('<b>Hotel</b><br>Kigali').openPopup();

      NEARBY_RECYCLERS.forEach(r => {
        const rIcon = L.divIcon({
          html: `<div style="background:#16a34a;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid white;font-size:13px">♻</div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 14],
        });
        L.marker(r.coord, { icon: rIcon }).addTo(map).bindPopup(`<b>${r.name}</b><br>${r.distance} — ⭐ ${r.rating}`);
        L.polyline([HOTEL_COORD, r.coord], { color: '#06b6d4', weight: 2, dashArray: '5 5', opacity: 0.5 }).addTo(map);
      });
      setMapReady(true);
    };
    init().catch(console.error);
    return () => { if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; } };
  }, []);

  // Sync custom location markers with state
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;
    const sync = async () => {
      const L = await import('leaflet');
      const currentIds = new Set(customLocs.map(l => l.id));
      Object.keys(customMarkersRef.current).forEach(id => {
        if (!currentIds.has(id)) { customMarkersRef.current[id].remove(); delete customMarkersRef.current[id]; }
      });
      customLocs.forEach(loc => {
        if (customMarkersRef.current[loc.id]) return;
        const icon = L.divIcon({
          html: `<div style="background:#dc2626;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid white;font-size:13px">📍</div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 14],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(leafletMapRef.current)
          .bindPopup(`<b>${loc.name}</b>${loc.note ? '<br>' + loc.note : ''}`);
        customMarkersRef.current[loc.id] = marker;
      });
    };
    sync();
  }, [customLocs, mapReady]);

  const handleAdd = () => {
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!form.name.trim()) { setFormError('Location name is required.'); return; }
    if (isNaN(lat) || lat < -90 || lat > 90) { setFormError('Enter a valid latitude (-90 to 90).'); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setFormError('Enter a valid longitude (-180 to 180).'); return; }
    const newLoc: CustomLocation = { id: Date.now().toString(), name: form.name.trim(), lat, lng, note: form.note.trim() || undefined };
    const updated = [...customLocs, newLoc];
    setCustomLocs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setForm({ name: '', lat: '', lng: '', note: '' });
    setFormError('');
    setShowModal(false);
    if (leafletMapRef.current) leafletMapRef.current.setView([lat, lng], 14);
  };

  const handleDelete = (id: string) => {
    const updated = customLocs.filter(l => l.id !== id);
    setCustomLocs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const hotelName    = hotel?.hotel_name || 'Hotel';
  const hotelAddress = hotel?.address    || 'Kigali';
  const hotelCity    = hotel?.city       || 'Kigali';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Location</h1>
        <button
          onClick={() => { setFormError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-cyan-600" /> Location Details
            </h3>
            <div className="space-y-2 text-sm">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Hotel</p><p className="font-medium text-gray-900 dark:text-white">{hotelName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Address</p><p className="font-medium text-gray-900 dark:text-white">{hotelAddress}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">City</p><p className="font-medium text-gray-900 dark:text-white">{hotelCity}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p><p className="font-medium font-mono text-gray-900 dark:text-white">{HOTEL_COORD[0]}, {HOTEL_COORD[1]}</p></div>
            </div>
          </div>
          {/* Nearby recyclers */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Recyclers</h3>
            {NEARBY_RECYCLERS.map(r => (
              <div key={r.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">📍 {r.distance}</p>
                </div>
                <span className="text-sm font-semibold text-yellow-600">⭐ {r.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom saved locations */}
      {customLocs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-red-500" /> My Saved Locations
            <span className="ml-auto text-sm font-normal text-gray-400 dark:text-gray-500">{customLocs.length} location{customLocs.length !== 1 ? 's' : ''}</span>
          </h3>
          <div className="space-y-3">
            {customLocs.map(loc => (
              <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{loc.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{loc.lat}, {loc.lng}</p>
                  {loc.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{loc.note}</p>}
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  title="Delete location"
                  className="ml-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Location</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Satellite Office, Storage Unit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude *</label>
                  <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                    placeholder="-1.9536"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude *</label>
                  <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                    placeholder="30.0605"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Waste pickup point, secondary storage"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">💡 Right-click any point on Google Maps to copy its coordinates.</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition font-medium">Add Location</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
