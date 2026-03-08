// components/dashboard/business/BusinessLocation.tsx
import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { hotelProfile } from './_shared';
import 'leaflet/dist/leaflet.css';

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

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const init = async () => {
      try {
        const L = await import('leaflet');
        const markerIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = markerIcon;

        const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
          .setView(HOTEL_COORD, 13);
        leafletMapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 18,
        }).addTo(map);

        // Hotel marker (cyan)
        const hotelIcon = L.divIcon({
          html: `<div style="background:#0891b2;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid white;font-size:16px">🏨</div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 16],
        });
        L.marker(HOTEL_COORD, { icon: hotelIcon })
          .addTo(map)
          .bindPopup(`<b>${hotelProfile.name}</b><br>${hotelProfile.location}`)
          .openPopup();

        // Recycler markers (green)
        NEARBY_RECYCLERS.forEach(r => {
          const rIcon = L.divIcon({
            html: `<div style="background:#16a34a;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;font-size:13px">♻</div>`,
            className: '', iconSize: [28, 28], iconAnchor: [14, 14],
          });
          L.marker(r.coord, { icon: rIcon })
            .addTo(map)
            .bindPopup(`<b>${r.name}</b><br>${r.distance} away — ⭐ ${r.rating}`);
          // Line from hotel to recycler
          L.polyline([HOTEL_COORD, r.coord], { color: '#06b6d4', weight: 2, dashArray: '5 5', opacity: 0.5 }).addTo(map);
        });
      } catch (err) {
        console.error('Leaflet init failed:', err);
      }
    };
    init();
    return () => {
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Location</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Leaflet Map */}
        <div ref={mapRef} style={{ height: '320px', width: '100%' }} />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-cyan-600" /> Location Details
            </h3>
            <div className="space-y-2">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Address</p><p className="font-medium text-gray-900 dark:text-white">{hotelProfile.location}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">District</p><p className="font-medium text-gray-900 dark:text-white">Nyarugenge, Kigali</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p><p className="font-medium font-mono text-sm text-gray-900 dark:text-white">{HOTEL_COORD[0]}, {HOTEL_COORD[1]}</p></div>
            </div>
          </div>
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
    </div>
  );
}
