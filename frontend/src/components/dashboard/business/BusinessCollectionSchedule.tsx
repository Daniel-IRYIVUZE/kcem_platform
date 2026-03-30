// components/dashboard/business/BusinessCollectionSchedule.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { collectionsAPI, type Collection, type CollectionTracking } from '../../../services/api';
import { formatDist } from '../../../utils/geo';
import { Calendar, Clock, CheckCircle, Download, MapPin, X, Navigation, Locate, Building2, Truck } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';
import 'leaflet/dist/leaflet.css';

function downloadCSV(name: string, cols: string[], rows: (string | number)[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name}.csv`; a.click();
}

/* ─── Live Tracking Map Modal ──────────────────────────────────────────────── */
function TrackingModal({ collectionId, onClose }: { collectionId: number; onClose: () => void }) {
  const [tracking, setTracking] = useState<CollectionTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const hotelMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const isMapReady = useRef(false);

  const fetchTracking = useCallback(async () => {
    try {
      const data = await collectionsAPI.tracking(collectionId);
      setTracking(data);
      setError(null);
      return data;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tracking data.');
      return null;
    }
  }, [collectionId]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const init = async () => {
      const L = await import('leaflet').catch(() => null);
      if (!L || !mapRef.current) return;
      leafletRef.current = L;
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
        .setView([-1.9441, 30.0619], 14);
      leafletMapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      isMapReady.current = true;
    };
    init();
    return () => {
      routeLineRef.current = null;
      driverMarkerRef.current = null;
      hotelMarkerRef.current = null;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      leafletRef.current = null;
      isMapReady.current = false;
    };
  }, []);

  // Update markers when tracking data or map readiness changes
  const updateMarkers = useCallback(async (data: CollectionTracking) => {
    const L = leafletRef.current;
    const map = leafletMapRef.current;
    if (!L || !map || !isMapReady.current) return;

    const points: [number, number][] = [];

    // Hotel marker
    if (data.hotel_lat != null && data.hotel_lng != null) {
      const pos: [number, number] = [data.hotel_lat, data.hotel_lng];
      points.push(pos);
      const icon = L.divIcon({
        html: `<div style="background:#d97706;color:#fff;width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:13px;font-weight:bold">H</div>`,
        className: '', iconSize: [38, 38], iconAnchor: [19, 38],
      });
      if (hotelMarkerRef.current) {
        hotelMarkerRef.current.setLatLng(pos);
      } else {
        hotelMarkerRef.current = L.marker(pos, { icon })
          .addTo(map)
          .bindPopup(`<b>${data.hotel_name || 'Pickup Location'}</b><br>${data.hotel_address || ''}`);
      }
    }

    // Driver marker
    if (data.driver_lat != null && data.driver_lng != null) {
      const pos: [number, number] = [data.driver_lat, data.driver_lng];
      points.push(pos);
      const icon = L.divIcon({
        html: `<div style="background:#0891b2;color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3'/><polygon points='16 3 21 8 21 17 16 17 16 3'/><circle cx='6.5' cy='17.5' r='2.5'/><circle cx='18.5' cy='17.5' r='2.5'/></svg></div>`,
        className: '', iconSize: [38, 38], iconAnchor: [19, 19],
      });
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(pos);
      } else {
        driverMarkerRef.current = L.marker(pos, { icon })
          .addTo(map)
          .bindPopup(`<b>${data.driver_name || 'Driver'}</b><br>Live location`);
      }
    }

    if (points.length === 2) {
      // Remove previous route line before drawing a new one
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }

      // Fetch road-following route from OSRM, fall back to straight dashed line
      const [p1, p2] = points;
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`
        );
        const json = await res.json();
        if (json.code === 'Ok' && json.routes?.[0]?.geometry?.coordinates?.length) {
          // OSRM returns [lng, lat] — convert to Leaflet [lat, lng]
          const roadCoords: [number, number][] = json.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          routeLineRef.current = L.polyline(roadCoords, { color: '#06b6d4', weight: 4, opacity: 0.85 }).addTo(map);
        } else {
          throw new Error('No route');
        }
      } catch {
        // OSRM unavailable — fall back to straight dashed line
        routeLineRef.current = L.polyline(points, { color: '#06b6d4', weight: 3, dashArray: '6 4', opacity: 0.8 }).addTo(map);
      }

      map.fitBounds(L.latLngBounds(points).pad(0.3));
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Poll every 15 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchTracking, 15_000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  // Update map markers when tracking data arrives
  useEffect(() => {
    if (!tracking) return;
    // Wait a tick for map to be ready
    const t = setTimeout(() => updateMarkers(tracking), 200);
    return () => clearTimeout(t);
  }, [tracking, updateMarkers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Live Driver Tracking</h3>
            <span className="text-xs text-gray-400">· Collection #{collectionId}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ETA / Distance */}
        {tracking && (
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="p-4 text-center border-r border-gray-200 dark:border-gray-700">
              <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                {tracking.distance_m != null
                  ? tracking.distance_m < 1000
                    ? `${tracking.distance_m}m`
                    : `${(tracking.distance_m / 1000).toFixed(1)}km`
                  : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distance</p>
            </div>
            <div className="p-4 text-center border-r border-gray-200 dark:border-gray-700">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {tracking.eta_minutes != null ? `${tracking.eta_minutes} min` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ETA</p>
            </div>
            <div className="p-4 text-center">
              <div className={`flex items-center justify-center gap-1 text-sm font-medium ${tracking.driver_lat != null ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                <Locate size={13} /> {tracking.driver_lat != null ? 'Live GPS' : 'No GPS'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tracking.driver_name || 'Driver'}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
            {error}
          </div>
        )}

        {/* Map */}
        <div ref={mapRef} style={{ height: 'min(300px, 50vw)', minHeight: '200px', width: '100%' }} />

        {/* Info footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><span className="inline-flex w-4 h-4 bg-amber-500 rounded items-center justify-center"><Building2 size={10} className="text-white"/></span> Pickup location</span>
            <span className="flex items-center gap-1"><span className="inline-flex w-4 h-4 bg-cyan-600 rounded-full items-center justify-center"><Truck size={10} className="text-white"/></span> Driver (live)</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Navigation size={11} /> Updates every 15s
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function BusinessCollectionSchedule() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [trackingCollectionId, setTrackingCollectionId] = useState<number | null>(null);
  const [trackingMap, setTrackingMap] = useState<Record<number, CollectionTracking>>({});

  useEffect(() => {
    collectionsAPI.list({ limit: 200 } as Parameters<typeof collectionsAPI.list>[0])
      .then(data => {
        setCollections(data || []);
        // Fetch tracking for all collections that have a driver assigned
        const withDriver = (data || []).filter(c => c.driver_id);
        if (withDriver.length === 0) return;
        Promise.allSettled(withDriver.map(c => collectionsAPI.tracking(c.id))).then(results => {
          const map: Record<number, CollectionTracking> = {};
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') map[withDriver[i].id] = r.value;
          });
          setTrackingMap(map);
        });
      })
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'all' ? collections : collections.filter(c => c.status === statusFilter);

  const displayData = filtered.map(c => ({
    id: c.id,
    scheduledDate: c.scheduled_date
      ? new Date(c.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : c.created_at
        ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    scheduledTime: c.scheduled_time || '—',
    wasteType: c.waste_type,
    volume: `${c.actual_volume ?? c.volume ?? 0} ${c.waste_type === 'UCO' ? 'L' : 'kg'}`,
    recyclerName: c.recycler_name || 'Pending',
    driverName: c.driver_name || 'Pending',
    status: c.status,
    earnings: c.earnings,
    _canTrack: (c.status === 'en_route' || c.status === 'on_route' || c.status === 'scheduled') && !!c.driver_id,
    _tracking: trackingMap[c.id] ?? null,
  }));

  const handleExport = () => downloadCSV('collection_schedule',
    ['ID', 'Date', 'Time', 'Type', 'Volume', 'Recycler', 'Driver', 'Status'],
    displayData.map(r => [r.id, r.scheduledDate, r.scheduledTime, r.wasteType ?? '', r.volume, r.recyclerName, r.driverName, r.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collection Schedule</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700">
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="en_route">En Route</option>
            <option value="collected">Collected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <Download size={16}/> Export
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={collections.length} icon={<Calendar size={22} />} color="cyan" />
        <StatCard title="Scheduled" value={collections.filter(c => c.status === 'scheduled').length} icon={<Clock size={22} />} color="blue" />
        <StatCard title="En Route" value={collections.filter(c => c.status === 'en_route').length} icon={<CheckCircle size={22} />} color="purple" />
        <StatCard title="Completed" value={collections.filter(c => c.status === 'completed').length} icon={<CheckCircle size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading collections…</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-xs">#{v}</span> },
              { key: 'scheduledDate', label: 'Date', render: (v: string, r: typeof displayData[0]) => <div><p className="font-medium">{v}</p><p className="text-xs text-gray-500 dark:text-gray-400">{r.scheduledTime}</p></div> },
              { key: 'wasteType', label: 'Waste Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
              { key: 'volume', label: 'Volume' },
              { key: 'recyclerName', label: 'Recycler' },
              { key: 'driverName', label: 'Driver' },
              {
                key: '_tracking', label: 'Driver Distance',
                render: (_v: unknown, r: typeof displayData[0]) => {
                  const t = r._tracking as CollectionTracking | null;
                  if (!t || t.distance_m == null) return <span className="text-xs text-gray-400">—</span>;
                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <MapPin size={10} /> {formatDist(t.distance_m)}
                      </span>
                      {t.eta_minutes != null && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {t.eta_minutes} min ETA
                        </span>
                      )}
                    </div>
                  );
                },
              },
              { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'earnings', label: 'Earnings', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {(v || 0).toLocaleString()}</span> },
              {
                key: '_canTrack', label: 'Track',
                render: (_v: unknown, r: typeof displayData[0]) =>
                  r._canTrack ? (
                    <button
                      onClick={() => setTrackingCollectionId(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <MapPin size={11} /> Track
                    </button>
                  ) : null,
              },
            ]}
            data={displayData}
            pageSize={10}
          />
        )}
        {!loading && displayData.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No collections found. Collections are created when a bid is accepted.</p>
        )}
      </div>

      {trackingCollectionId != null && (
        <TrackingModal
          collectionId={trackingCollectionId}
          onClose={() => setTrackingCollectionId(null)}
        />
      )}
    </div>
  );
}


