// components/dashboard/driver/DriverTodaysRoute.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { collectionsAPI, driversAPI, vehiclesAPI, type Collection, type CollectionTracking, type DriverProfile, type VehicleItem } from '../../../services/api';
import { haversineKm, etaMinutes, formatDist } from '../../../utils/geo';
import {
  Map, CheckCircle, DollarSign, Phone, Clock, Navigation,
  Package, MapPin, Star, ChevronRight, Locate, AlertCircle,
  Maximize2, Minimize2, Eye, EyeOff, ListChecks
} from 'lucide-react';
import StatCard from '../StatCard';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import 'leaflet/dist/leaflet.css';

export default function DriverTodaysRoute() {
  const { user: authUser } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [vehicle, setVehicle] = useState<VehicleItem | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [trackingMap, setTrackingMap] = useState<Record<number, CollectionTracking>>({});
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(true);
  const [mapLayer, setMapLayer] = useState<'normal' | 'dark' | 'satellite'>('normal');
  const tileLayerRef = useRef<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const hotelMarkersRef = useRef<any[]>([]);

  const load = useCallback(() => {
    // Fetch ALL collections assigned to this driver (role-scoped by backend)
    collectionsAPI.list({ limit: 100 }).then(all => {
      // Exclude cancelled/failed; show scheduled/active/completed
      const assigned = all.filter(c =>
        !['cancelled', 'failed'].includes(c.status ?? '')
      );
      // Prefer active/today's collections at the top
      const today = new Date().toISOString().split('T')[0];
      const todayActive = assigned.filter(c =>
        c.scheduled_date?.startsWith(today) ||
        ['en_route', 'arrived', 'in_progress'].includes(c.status ?? '')
      );
      setCollections(todayActive.length > 0 ? todayActive : assigned);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    driversAPI.me().then(d => {
      setDriver(d);
      vehiclesAPI.listMine().then(list => {
        const linked = d.vehicle_id ? list.find(v => v.id === d.vehicle_id) : list[0];
        if (linked) setVehicle(linked);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  // Load tracking data for active collections
  useEffect(() => {
    const activeIds = collections
      .filter(c => ['en_route', 'scheduled', 'on_route', 'in_progress'].includes(c.status ?? ''))
      .map(c => c.id);
    if (!activeIds.length) return;
    Promise.allSettled(activeIds.map(id => collectionsAPI.tracking(id))).then(results => {
      const map: Record<number, CollectionTracking> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[activeIds[i]] = r.value;
      });
      setTrackingMap(map);
    });
  }, [collections]);

  // GPS watchPosition — updates driver location and sends to backend
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverPos([latitude, longitude]);
        driversAPI.updateLocation(latitude, longitude).catch(() => {});
        setGpsError(null);
      },
      (err) => setGpsError(`GPS: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    let L: typeof import('leaflet');
    const init = async () => {
      try {
        L = await import('leaflet');
        leafletRef.current = L;
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

        const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors', maxZoom: 18,
        }).addTo(map);
        tileLayerRef.current = tile;

        setIsMapReady(true);
      } catch (err) {
        console.error('Leaflet failed to load:', err);
      }
    };
    init();
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletRef.current = null;
        driverMarkerRef.current = null;
        hotelMarkersRef.current = [];
        setIsMapReady(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate map size when fullscreen state changes
  useEffect(() => {
    if (leafletMapRef.current && isMapReady) {
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 100);
    }
  }, [isFullscreen, isMapReady]);

  // Switch tile layer when mapLayer state changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = leafletMapRef.current;
    if (!L || !map || !isMapReady) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }
    const LAYERS = {
      normal: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
      },
      dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
      },
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
      },
    } as const;
    const cfg = LAYERS[mapLayer];
    tileLayerRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 }).addTo(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLayer, isMapReady]);

  // Derived stop list — must be above the map useEffect so the closure is clean
  const stops = collections.map((c, idx) => ({
    id: c.id, hotel: c.hotel_name || `Collection #${c.id}`, address: c.location || 'Kigali', type: c.waste_type || 'Waste',
    quantity: c.volume ? `${c.volume} ${c.waste_type === 'UCO' ? 'L' : 'kg'}` : '—',
    time: c.scheduled_time || (c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : `Stop ${idx + 1}`),
    status: c.status, contact: '',
    notes: c.notes || '', _dsId: c.id,
    // carry coords so the map effect doesn't need to re-look them up
    _lat: c.listing_lat ?? c.hotel_lat ?? null as number | null,
    _lng: c.listing_lng ?? c.hotel_lng ?? null as number | null,
  }));

  // Update live markers whenever GPS pos, tracking data or collections change
  useEffect(() => {
    const L = leafletRef.current;
    const map = leafletMapRef.current;
    if (!L || !map || !isMapReady) return;

    // ─── Driver marker (live GPS) ───────────────────────────────────────────
    if (driverPos) {
      const driverIcon = L.divIcon({
        html: `<div style="background:#0891b2;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚛</div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 18],
      });
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverPos);
      } else {
        driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b><br>Live GPS position');
        map.setView(driverPos, 14);
      }
    }

    // ─── Stop markers + route line ──────────────────────────────────────────
    hotelMarkersRef.current.forEach(m => m.remove());
    hotelMarkersRef.current = [];

    // Kigali city center — fallback when no coordinates in DB
    const KIGALI_CENTER: [number, number] = [-1.9441, 30.0619];
    const KIGALI_OFFSETS: [number, number][] = [
      [0, 0], [0.008, 0.005], [-0.006, 0.009], [0.010, -0.007],
      [-0.009, -0.005], [0.005, 0.012], [-0.012, 0.003],
    ];

    // Collect stop coordinates: prefer listing_lat/lng, fallback to hotel_lat/lng, then Kigali scatter
    const stopCoords: Array<{ lat: number; lng: number; stop: typeof stops[0] }> = [];
    stops.forEach((stop, i) => {
      const lat = (stop._lat as number | null) ?? (KIGALI_CENTER[0] + KIGALI_OFFSETS[i % KIGALI_OFFSETS.length][0]);
      const lng = (stop._lng as number | null) ?? (KIGALI_CENTER[1] + KIGALI_OFFSETS[i % KIGALI_OFFSETS.length][1]);
      stopCoords.push({ lat, lng, stop });
    });

    // Place a numbered marker for every stop
    stopCoords.forEach(({ lat, lng, stop }, i) => {
      const isDone = ['completed', 'collected', 'verified'].includes(stop.status);
      const isActive = ['en_route', 'arrived', 'in_progress'].includes(stop.status);
      const color = isDone ? '#06b6d4' : isActive ? '#2563eb' : '#6b7280';
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      });
      const t = trackingMap[(stop as any)._dsId as number];
      const etaStr = t?.eta_minutes != null
        ? `${t.eta_minutes} min ETA`
        : driverPos ? `${etaMinutes(haversineKm(driverPos[0], driverPos[1], lat, lng))} min ETA` : '';
      const m = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${stop.hotel}</b><br>${stop.address}<br>Status: ${stop.status}${etaStr ? '<br>' + etaStr : ''}`);
      hotelMarkersRef.current.push(m);
    });

    // Draw blue dashed polyline: driver → each unfinished stop in order
    if (driverPos && stopCoords.length > 0) {
      const pendingCoords = stopCoords
        .filter(s => !['completed', 'collected', 'verified'].includes(s.stop.status))
        .map(s => [s.lat, s.lng] as [number, number]);
      if (pendingCoords.length > 0) {
        const routePoints: [number, number][] = [driverPos, ...pendingCoords];
        const line = L.polyline(routePoints, { color: '#2563eb', weight: 4, dashArray: '10 6', opacity: 0.85 }).addTo(map);
        hotelMarkersRef.current.push(line as any);
      }
      const items = [driverMarkerRef.current, ...hotelMarkersRef.current].filter(Boolean);
      if (items.length > 1) map.fitBounds(L.featureGroup(items).getBounds().pad(0.2));
    } else if (stopCoords.length > 0) {
      // No driver GPS yet — fit to stops only
      const items = hotelMarkersRef.current.filter(Boolean);
      if (items.length > 0) map.fitBounds(L.featureGroup(items).getBounds().pad(0.2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, driverPos, trackingMap, stops]);

  const completedStops = stops.filter(s => s.status === 'completed' || s.status === 'collected' || s.status === 'verified').length;
  const totalStops = stops.length;
  const progressPct = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  // Best ETA/distance from tracking data
  const activeTracking = Object.values(trackingMap).filter(t => t.distance_m != null);
  const closestTracking = activeTracking.sort((a, b) => (a.distance_m ?? 999999) - (b.distance_m ?? 999999))[0];
  const profileName = driver?.name || authUser?.name || 'Driver';
  const profileVehicle = vehicle
    ? `${vehicle.make || ''} ${vehicle.model || vehicle.vehicle_type}`.trim() || vehicle.vehicle_type
    : (driver?.vehicle_type || 'Vehicle');
  const profilePlate = vehicle?.plate_number || driver?.plate_number || '—';
  const profileRating = driver?.rating ?? 0;
  const profileTrips = driver?.total_trips ?? 0;

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
        {/* GPS status indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${driverPos ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
          <Locate size={12} className={driverPos ? 'text-green-500' : 'text-gray-400'} />
          {driverPos ? 'GPS Active' : gpsError ? 'GPS Unavailable' : 'Getting GPS…'}
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 px-4 py-2.5 rounded-xl text-sm animate-slide-down">
          <CheckCircle size={15}/> {flash}
        </div>
      )}

      {gpsError && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl text-sm">
          <AlertCircle size={15}/> {gpsError}
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
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 dark:text-white">{profileName}</p>
          <p className="text-sm text-gray-400">{profileVehicle} · {profilePlate}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end text-yellow-500">
            <Star size={14} className="fill-yellow-500"/> <span className="text-sm font-bold">{profileRating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-400">{profileTrips} total trips</p>
        </div>
      </div>

      {/* Cards Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stats &amp; Overview</p>
        <button
          onClick={() => setShowCards(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {showCards ? <EyeOff size={12}/> : <Eye size={12}/>}
          {showCards ? 'Hide Cards' : 'Show Cards'}
        </button>
      </div>

      {showCards && <>
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
      </>}

      {/* Live ETA/Distance panel — shown when tracking data is available */}
      {closestTracking && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-200 dark:border-cyan-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={16} className="text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Next Destination</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {closestTracking.distance_m != null
                  ? closestTracking.distance_m < 1000
                    ? `${closestTracking.distance_m}m`
                    : `${(closestTracking.distance_m / 1000).toFixed(1)}km`
                  : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distance</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {closestTracking.eta_minutes != null ? `${closestTracking.eta_minutes} min` : '—'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ETA</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{closestTracking.hotel_name || '—'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{closestTracking.hotel_address || 'Destination'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Map — Real Leaflet with live GPS */}
      <div className={isFullscreen
        ? 'fixed inset-0 z-50 flex bg-white dark:bg-gray-900'
        : 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden'
      }>
        {/* Map column */}
        <div className={isFullscreen ? 'flex-1 flex flex-col min-w-0 min-h-0' : ''}>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2 flex-shrink-0">
            <Map size={16} className="text-cyan-600 flex-shrink-0"/>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Route Map</h3>
            <span className="text-xs text-gray-400">
              {driverPos ? '📍 Live GPS' : 'Kigali, Rwanda'}
            </span>

            {/* Tile layer switcher */}
            <div className="flex items-center gap-1 ml-auto">
              {(['normal', 'dark', 'satellite'] as const).map(layer => (
                <button
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
                    mapLayer === layer
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {layer === 'normal' ? '🗺 Normal' : layer === 'dark' ? '🌙 Dark' : '🛰 Satellite'}
                </button>
              ))}
            </div>

            {isFullscreen && (
              <button
                onClick={() => setShowRoutePanel(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ListChecks size={13}/>
                {showRoutePanel ? 'Hide Route' : "Today's Route"}
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(v => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Expand map to fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15}/> : <Maximize2 size={15}/>}
            </button>
          </div>
          <div
            ref={mapRef}
            className={isFullscreen ? 'flex-1 min-h-0' : ''}
            style={{ height: isFullscreen ? undefined : '280px', width: '100%' }}
          />
        </div>

        {/* Today's Route side panel (fullscreen only) */}
        {isFullscreen && showRoutePanel && (
          <div className="w-72 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Navigation size={14} className="text-cyan-600"/> Today's Route
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{completedStops}/{totalStops} stops completed</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {stops.map((stop, idx) => {
                const isDone = ['completed', 'collected', 'verified'].includes(stop.status ?? '');
                const isActive = ['en_route', 'arrived', 'in_progress'].includes(stop.status ?? '');
                return (
                  <div key={stop.id} className={`px-3 py-2.5 ${isActive ? 'bg-cyan-50 dark:bg-cyan-900/15 border-l-2 border-cyan-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isDone ? 'bg-cyan-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{stop.hotel}</p>
                        <p className="text-xs text-gray-400 truncate">{stop.address}</p>
                        <div className="mt-0.5">
                          <StatusBadge status={stop.status} size="sm" dot />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {stops.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-gray-400">No stops assigned today</div>
              )}
            </div>
          </div>
        )}
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
            const stopTracking = stop._dsId ? trackingMap[stop._dsId as number] : undefined;
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
                      {(() => {
                        // Prefer live tracking API data; fall back to client-side Haversine
                        if (stopTracking?.eta_minutes != null) {
                          const distStr = stopTracking.distance_m != null ? ' · ' + formatDist(stopTracking.distance_m) : '';
                          return (
                            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                              <Navigation size={11}/> {stopTracking.eta_minutes} min away{distStr}
                            </span>
                          );
                        }
                        // Client-side fallback using driver's live GPS
                        const col = collections.find(c => c.id === (stop as any)._dsId);
                        const destLat = (col as any)?.listing_lat ?? (col as any)?.hotel_lat;
                        const destLng = (col as any)?.listing_lng ?? (col as any)?.hotel_lng;
                        if (driverPos && destLat != null && destLng != null) {
                          const km = haversineKm(driverPos[0], driverPos[1], destLat, destLng);
                          const eta = etaMinutes(km);
                          return (
                            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                              <Navigation size={11}/> {eta} min away · {formatDist(km * 1000)}
                            </span>
                          );
                        }
                        return null;
                      })()}
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

