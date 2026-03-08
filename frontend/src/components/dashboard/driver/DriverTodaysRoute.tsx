// components/dashboard/driver/DriverTodaysRoute.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { collectionsAPI, type Collection } from '../../../services/api';
import {
  Map, CheckCircle, DollarSign, Phone, Clock, Navigation,
  Package, MapPin, Star, ChevronRight
} from 'lucide-react';
import StatCard from '../StatCard';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import { driverProfile, todaysStops } from './_shared';
import 'leaflet/dist/leaflet.css';

export default function DriverTodaysRoute() {
  const { user: authUser } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const load = useCallback(() => {
    collectionsAPI.list({ status: 'scheduled', limit: 50 }).then(all => {
      const today = new Date().toISOString().split('T')[0];
      const todayItems = all.filter(c => c.scheduled_date?.startsWith(today));
      setCollections(todayItems.length > 0 ? todayItems : all.slice(0, 5));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Kigali hotel area coordinates for markers
  const KIGALI_COORDS: [number, number][] = [
    [-1.9441, 30.0619], [-1.9523, 30.0588], [-1.9380, 30.0701],
    [-1.9600, 30.0550], [-1.9350, 30.0650],
  ];

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    let L: typeof import('leaflet');
    const init = async () => {
      try {
        L = await import('leaflet');
        // Fix default icon paths
        const DefaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
          .setView([-1.9441, 30.0619], 13);
        leafletMapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors', maxZoom: 18,
        }).addTo(map);

        // Add markers for each stop
        stops.slice(0, 5).forEach((stop, i) => {
          const coord = KIGALI_COORDS[i] || KIGALI_COORDS[0];
          const color = stop.status === 'completed' || stop.status === 'collected' ? '#06b6d4' :
                        stop.status === 'en_route' ? '#2563eb' : '#6b7280';
          const icon = L.divIcon({
            html: `<div style="background:${color};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`,
            className: '', iconSize: [28, 28], iconAnchor: [14, 14],
          });
          L.marker(coord, { icon })
            .addTo(map)
            .bindPopup(`<b>${stop.hotel || 'Stop ' + (i + 1)}</b><br>${stop.address}<br>Status: ${stop.status}`);
        });

        // Draw simple route polyline
        const coords = stops.slice(0, 5).map((_, i) => KIGALI_COORDS[i] || KIGALI_COORDS[0]);
        if (coords.length > 1) {
          L.polyline(coords, { color: '#06b6d4', weight: 3, dashArray: '6 4', opacity: 0.7 }).addTo(map);
        }
      } catch (err) {
        console.error('Leaflet failed to load:', err);
      }
    };
    init();
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stops = collections.length > 0 ? collections.map((c, idx) => ({
    id: c.id, hotel: c.hotel_name, address: c.location || 'Kigali', type: c.waste_type,
    quantity: `${c.volume} ${c.waste_type === 'UCO' ? 'L' : 'kg'}`,
    time: c.scheduled_time || `0${9 + idx}:00 AM`, status: c.status, contact: '',
    notes: c.notes || '', _dsId: c.id,
  })) : todaysStops;

  const completedStops = stops.filter(s => s.status === 'completed' || s.status === 'collected' || s.status === 'verified').length;
  const totalStops = stops.length;
  const progressPct = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  const handleMarkCollected = (dsId: number | undefined, _stopId: number | string) => {
    if (dsId) {
      collectionsAPI.updateStatus(dsId, { status: 'collected' }).then(load).catch(() => {});
    }
    setFlash(`Stop marked as collected!`);
    setTimeout(() => setFlash(null), 2500);
  };

  const handleNavigate = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Kigali, Rwanda')}`, '_blank');
  };

  const handleReportIssue = (stopId: number | string) => {
    setFlash(`Issue reported for stop #${stopId}. Dispatch has been notified.`);
    setTimeout(() => setFlash(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {authUser?.name || 'Driver'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your daily collection routes</p>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 px-4 py-2.5 rounded-xl text-sm animate-slide-down">
          <CheckCircle size={15}/> {flash}
        </div>
      )}

      <PageHeader
        title="Today's Route"
        subtitle={`Route KG-01 · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        icon={<Navigation size={20}/>}
        badge={`${completedStops}/${totalStops} stops`}
        badgeColor={progressPct === 100 ? 'cyan' : 'cyan'}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={() => {
              const activeStop = stops.find(s => s.status === 'en-route' || s.status === 'in_progress' || s.status === 'scheduled');
              if (activeStop) handleNavigate(activeStop.address);
            }}><Navigation size={14}/> Navigate</button>
            <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => { window.open('tel:+250788000000'); }}><Phone size={14}/> Dispatch</button>
          </div>
        }
      />

      {/* Driver Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {driverProfile.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 dark:text-white">{driverProfile.name}</p>
          <p className="text-sm text-gray-400">{driverProfile.vehicle} · {driverProfile.plate}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end text-yellow-500">
            <Star size={14} className="fill-yellow-500"/> <span className="text-sm font-bold">{driverProfile.rating}</span>
          </div>
          <p className="text-xs text-gray-400">{driverProfile.totalTrips} total trips</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Stops Done"      value={`${completedStops}/${totalStops}`} icon={<CheckCircle size={20}/>} color="cyan"   progress={progressPct} />
        <StatCard title="Current Stop"    value={`${Math.min(completedStops + 1, totalStops)} of ${totalStops}`}   icon={<MapPin size={20}/>}     color="blue" />
        <StatCard title="Total Weight"    value="1,530 kg"                            icon={<Package size={20}/>}    color="purple" />
        <StatCard title="Est. Earnings"   value="RWF 45K"                             icon={<DollarSign size={20}/>} color="orange" />
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Route Progress</p>
          <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{progressPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{completedStops} completed</span>
          <span>{totalStops - completedStops} remaining</span>
        </div>
      </div>

      {/* Route Map — Real Leaflet */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Map size={16} className="text-cyan-600"/>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Route Map</h3>
          <span className="ml-auto text-xs text-gray-400">Kigali, Rwanda</span>
        </div>
        <div ref={mapRef} style={{ height: '260px', width: '100%' }} />
      </div>

      {/* Stop Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <MapPin size={16} className="text-cyan-600"/>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stop Schedule</h3>
          <span className="ml-auto text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">{totalStops} stops</span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {stops.map((stop, idx) => {
            const isDone = stop.status === 'completed' || stop.status === 'collected' || stop.status === 'verified';
            const isActive = stop.status === 'en-route' || stop.status === 'in_progress';
            return (
              <div key={stop.id} className={`px-5 py-4 transition-colors ${isActive ? 'bg-cyan-50 dark:bg-cyan-900/15 border-l-4 border-cyan-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                <div className="flex items-start gap-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone ? 'bg-cyan-500 text-white' : isActive ? 'bg-cyan-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      {isDone ? <CheckCircle size={16}/> : idx + 1}
                    </div>
                    {idx < stops.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-cyan-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>

                  {/* Stop details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{stop.hotel}</p>
                        <p className="text-sm text-gray-400">{stop.address}</p>
                      </div>
                      <StatusBadge status={stop.status} size="sm" dot />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={11}/> {stop.time}</span>
                      <span className="flex items-center gap-1"><Package size={11}/> {stop.type} — {stop.quantity}</span>
                      {stop.contact && <span className="flex items-center gap-1"><Phone size={11}/> {stop.contact}</span>}
                    </div>
                    {stop.notes && <p className="mt-1 text-xs text-gray-400 italic">📝 {stop.notes}</p>}

                    {(isActive || stop.status === 'scheduled') && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleMarkCollected((stop as any)._dsId, stop.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium transition-colors"
                        >
                          <CheckCircle size={12}/> Mark Collected
                        </button>
                        <button
                          onClick={() => handleNavigate(stop.address)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-secondary rounded-lg font-medium">
                          <Navigation size={12}/> Navigate
                        </button>
                        <button
                          onClick={() => handleReportIssue(stop.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-secondary rounded-lg font-medium">
                          Report Issue
                        </button>
                      </div>
                    )}
                    {isDone && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                        <CheckCircle size={12}/> Collection verified
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
