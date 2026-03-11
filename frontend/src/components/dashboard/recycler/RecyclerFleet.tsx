import { useState, useEffect } from 'react';
import { driversAPI, collectionsAPI, vehiclesAPI, recyclersAPI } from '../../../services/api';
import type { Collection, DriverProfile, VehicleItem, RecyclerProfile } from '../../../services/api';
import { Truck, Search, Plus, Eye, Trash2, CheckCircle, AlertTriangle, Activity, X, Save, Mail } from 'lucide-react';
import StatCard from '../StatCard';
import { StatusBadge } from './_shared';
import { haversineKm, formatDist } from '../../../utils/geo';
const VEHICLE_TYPES = ['Truck', 'Van', 'Pickup Truck', 'Lorry', 'Compact Van', 'Motorcycle'];

interface VehicleForm {
  plate_number: string;
  vehicle_type: string;
  capacity_kg: string;
  make: string;
  model: string;
  year: string;
  assign_driver_id: string;
}
const EMPTY_VF: VehicleForm = { plate_number: '', vehicle_type: 'Truck', capacity_kg: '1000', make: '', model: '', year: '', assign_driver_id: '' };

interface ViewDriver { driver: DriverProfile; vehicle?: VehicleItem }
interface ActiveAssignmentInfo {
  collectionId: number;
  stopNumber: number;
  label: string;
  status: string;
  destinationLat: number | null;
  destinationLng: number | null;
  distanceM: number | null;
  driverLat: number | null;
  driverLng: number | null;
  hotelName: string;
  hotelAddress: string;
  wasteType: string;
  volumeText: string;
  legDistanceFromPreviousM: number | null;
}
interface FleetRow {
  id: string;
  driver: DriverProfile | null;
  vehicle: VehicleItem | null;
  driverName: string;
  plate: string;
  capacity: string;
  trips: number;
  rating: number;
  routeLabel: string;
  onRoute: boolean;
  status: 'active' | 'maintenance' | 'inactive';
  activeAssignments: number;
  nearestDistanceM: number | null;
  nearestDestination: ActiveAssignmentInfo | null;
}

export default function RecyclerFleet() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [trackingByCollectionId, setTrackingByCollectionId] = useState<Record<number, { hotel_lat: number | null; hotel_lng: number | null; driver_lat: number | null; driver_lng: number | null }>>({});
  const [recycler, setRecycler] = useState<RecyclerProfile | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(EMPTY_VF);
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [loadMessage, setLoadMessage] = useState('');
  const [viewDriver, setViewDriver] = useState<ViewDriver | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<number | null>(null);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [reminderMsg, setReminderMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [clearingAssignments, setClearingAssignments] = useState(false);

  const ACTIVE_COLLECTION_STATUSES = new Set(['scheduled', 'assigned', 'accepted', 'en_route', 'on_route', 'in_progress']);

  const getDestinationCoords = (collection: Collection): { lat: number; lng: number } | null => {
    const hasListingCoords = typeof collection.listing_lat === 'number' && typeof collection.listing_lng === 'number';
    if (hasListingCoords) return { lat: collection.listing_lat as number, lng: collection.listing_lng as number };
    const hasHotelCoords = typeof collection.hotel_lat === 'number' && typeof collection.hotel_lng === 'number';
    if (hasHotelCoords) return { lat: collection.hotel_lat as number, lng: collection.hotel_lng as number };
    const tracking = trackingByCollectionId[collection.id];
    if (tracking && typeof tracking.hotel_lat === 'number' && typeof tracking.hotel_lng === 'number') {
      return { lat: tracking.hotel_lat, lng: tracking.hotel_lng };
    }
    return null;
  };

  const getDriverActiveAssignments = (driver: DriverProfile): ActiveAssignmentInfo[] => {
    const relevant = collections.filter(c => c.driver_id === driver.id && ACTIVE_COLLECTION_STATUSES.has((c.status || '').toLowerCase()));
    const sorted = [...relevant].sort((a, b) => {
      const aTime = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
    return sorted.map((c, idx) => {
      const dest = getDestinationCoords(c);
      const tracking = trackingByCollectionId[c.id];
      const driverLat = typeof c.driver_lat === 'number'
        ? c.driver_lat
        : (tracking && typeof tracking.driver_lat === 'number'
          ? tracking.driver_lat
          : (typeof driver.current_lat === 'number' ? driver.current_lat : null));
      const driverLng = typeof c.driver_lng === 'number'
        ? c.driver_lng
        : (tracking && typeof tracking.driver_lng === 'number'
          ? tracking.driver_lng
          : (typeof driver.current_lng === 'number' ? driver.current_lng : null));
      const hasDriverGps = typeof driverLat === 'number' && typeof driverLng === 'number';
      const distanceM = (hasDriverGps && dest)
        ? haversineKm(driverLat as number, driverLng as number, dest.lat, dest.lng) * 1000
        : null;
      const previous = idx > 0 ? sorted[idx - 1] : null;
      const previousDest = previous ? getDestinationCoords(previous) : null;
      const legDistanceFromPreviousM = idx === 0
        ? distanceM
        : (previousDest && dest ? haversineKm(previousDest.lat, previousDest.lng, dest.lat, dest.lng) * 1000 : null);
      return {
        collectionId: c.id,
        stopNumber: idx + 1,
        label: c.location || c.hotel_name || `Collection #${c.id}`,
        status: c.status,
        destinationLat: dest?.lat ?? null,
        destinationLng: dest?.lng ?? null,
        distanceM,
        driverLat,
        driverLng,
        hotelName: c.hotel_name || 'Hotel',
        hotelAddress: c.location || c.hotel_name || 'Address unavailable',
        wasteType: c.waste_type || 'Unknown',
        volumeText: typeof c.volume === 'number' ? `${c.volume} ${c.unit || 'kg'}` : 'Unknown',
        legDistanceFromPreviousM,
      };
    });
  };

  const formatLastSeen = (driver: DriverProfile | null): string => {
    if (!driver) return '—';
    if (driver.has_logged_in === false) return 'Never logged in';
    if (typeof driver.current_lat !== 'number' || typeof driver.current_lng !== 'number') return 'No GPS yet';
    if (!driver.updated_at) return 'Location active';

    const ts = new Date(driver.updated_at).getTime();
    if (Number.isNaN(ts)) return 'Location active';
    const diffMs = Date.now() - ts;
    const diffMin = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const hours = Math.floor(diffMin / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleSendReminder = async (driverId: number) => {
    setSendingReminder(driverId);
    try {
      await driversAPI.sendReminder(driverId);
      setReminderMsg({ text: 'Reminder email sent successfully.', ok: true });
    } catch (e) {
      setReminderMsg({ text: e instanceof Error ? e.message : 'Failed to send reminder.', ok: false });
    } finally {
      setSendingReminder(null);
      setTimeout(() => setReminderMsg(null), 5000);
    }
  };

  const handleClearAllAssignments = async () => {
    if (!viewDriver) return;
    if (!confirm('Remove all active assignments for this driver?')) return;
    setClearingAssignments(true);
    try {
      const res = await driversAPI.clearAssignments(viewDriver.driver.id);
      setReminderMsg({ text: `Cleared ${res.cleared_count} assignment(s).`, ok: true });
      load();
      setTimeout(() => setReminderMsg(null), 5000);
    } catch (e) {
      setReminderMsg({ text: e instanceof Error ? e.message : 'Failed to clear assignments.', ok: false });
      setTimeout(() => setReminderMsg(null), 5000);
    } finally {
      setClearingAssignments(false);
    }
  };

  const load = () => {
    setLoadMessage('');
    Promise.all([
      driversAPI.list({ limit: 100 }).catch(() => [] as DriverProfile[]),
      vehiclesAPI.list().catch((e: unknown) => {
        setLoadMessage(e instanceof Error ? e.message : 'Failed to load fleet vehicles.');
        return [] as VehicleItem[];
      }),
      collectionsAPI.list({ limit: 200 }).catch(() => [] as Collection[]),
      recyclersAPI.me().catch(() => null as RecyclerProfile | null),
    ]).then(([ds, vs, cs, rec]) => {
      setDrivers(ds);
      setVehicles(vs);
      setCollections(cs);
      setRecycler(rec);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!viewDriver) return;
    const activeForDriver = collections.filter(c => c.driver_id === viewDriver.driver.id && ACTIVE_COLLECTION_STATUSES.has((c.status || '').toLowerCase()));
    const needTrackingIds = activeForDriver
      .filter(c => {
        const hasDest = (typeof c.listing_lat === 'number' && typeof c.listing_lng === 'number') || (typeof c.hotel_lat === 'number' && typeof c.hotel_lng === 'number');
        const hasDriver = typeof c.driver_lat === 'number' && typeof c.driver_lng === 'number';
        return !hasDest || !hasDriver;
      })
      .map(c => c.id);
    if (needTrackingIds.length === 0) return;

    Promise.allSettled(needTrackingIds.map(id => collectionsAPI.tracking(id))).then(results => {
      const next: Record<number, { hotel_lat: number | null; hotel_lng: number | null; driver_lat: number | null; driver_lng: number | null }> = {};
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          const id = needTrackingIds[idx];
          next[id] = {
            hotel_lat: typeof res.value.hotel_lat === 'number' ? res.value.hotel_lat : null,
            hotel_lng: typeof res.value.hotel_lng === 'number' ? res.value.hotel_lng : null,
            driver_lat: typeof res.value.driver_lat === 'number' ? res.value.driver_lat : null,
            driver_lng: typeof res.value.driver_lng === 'number' ? res.value.driver_lng : null,
          };
        }
      });
      if (Object.keys(next).length > 0) {
        setTrackingByCollectionId(prev => ({ ...prev, ...next }));
      }
    });
  }, [viewDriver, collections]);

  // Only show drivers belonging to this recycler
  const myDrivers = recycler ? drivers.filter(d => d.recycler_id === recycler.id) : drivers;

  const vehicleDriverMap = new Map<number, DriverProfile>();
  myDrivers.forEach(d => {
    if (d.vehicle_id) vehicleDriverMap.set(d.vehicle_id, d);
  });

  const fleetRows: FleetRow[] = vehicles.map(vehicle => {
    const driver = vehicleDriverMap.get(vehicle.id) ?? null;
    const driverCollections = driver
      ? collections.filter(c => (c as unknown as { driver_id?: number }).driver_id === driver.id)
      : [];
    const completedTrips = driverCollections.filter(c => c.status === 'completed').length;
    const activeRoute = driverCollections.find(c => c.status === 'en_route' || c.status === 'on_route' || c.status === 'in_progress');
    const onRoute = driver?.status === 'on_route' || !!activeRoute;
    const status: FleetRow['status'] = !driver
      ? 'inactive'
      : (driver.status === 'off_duty' ? 'maintenance' : 'active');
    const routeLabel = onRoute
      ? (activeRoute?.location || activeRoute?.hotel_name || `Collection #${activeRoute?.id ?? ''}`)
      : 'Idle';
    const activeAssignmentsInfo = driver ? getDriverActiveAssignments(driver) : [];
    const nearestDestination = activeAssignmentsInfo
      .filter(a => typeof a.distanceM === 'number')
      .sort((a, b) => (a.distanceM as number) - (b.distanceM as number))[0] ?? null;

    return {
      id: `vehicle-${vehicle.id}`,
      driver,
      vehicle,
      driverName: driver?.name || '— Unassigned —',
      plate: vehicle.plate_number,
      capacity: `${vehicle.capacity_kg.toLocaleString()} kg`,
      trips: driver ? (completedTrips || driver.total_trips || 0) : 0,
      rating: driver?.rating ?? 0,
      routeLabel,
      onRoute,
      status,
      activeAssignments: activeAssignmentsInfo.length,
      nearestDistanceM: nearestDestination?.distanceM ?? null,
      nearestDestination,
    };
  });

  const driversWithoutValidVehicle = myDrivers.filter(d => !d.vehicle_id || !vehicles.some(v => v.id === d.vehicle_id));
  const unassignedDriverRows: FleetRow[] = driversWithoutValidVehicle.map(driver => {
    const driverCollections = collections.filter(c => (c as unknown as { driver_id?: number }).driver_id === driver.id);
    const completedTrips = driverCollections.filter(c => c.status === 'completed').length;
    const activeRoute = driverCollections.find(c => c.status === 'en_route' || c.status === 'on_route' || c.status === 'in_progress');
    const onRoute = driver.status === 'on_route' || !!activeRoute;
    const routeLabel = onRoute
      ? (activeRoute?.location || activeRoute?.hotel_name || `Collection #${activeRoute?.id ?? ''}`)
      : 'Idle';
    const activeAssignmentsInfo = getDriverActiveAssignments(driver);
    const nearestDestination = activeAssignmentsInfo
      .filter(a => typeof a.distanceM === 'number')
      .sort((a, b) => (a.distanceM as number) - (b.distanceM as number))[0] ?? null;

    return {
      id: `driver-${driver.id}`,
      driver,
      vehicle: null,
      driverName: driver.name || `Driver #${driver.id}`,
      plate: driver.plate_number || '—',
      capacity: driver.capacity_kg ? `${driver.capacity_kg.toLocaleString()} kg` : '—',
      trips: completedTrips || driver.total_trips || 0,
      rating: driver.rating ?? 0,
      routeLabel,
      onRoute,
      status: driver.status === 'off_duty' ? 'maintenance' : 'inactive',
      activeAssignments: activeAssignmentsInfo.length,
      nearestDistanceM: nearestDestination?.distanceM ?? null,
      nearestDestination,
    };
  });

  const fleetData = [...fleetRows, ...unassignedDriverRows];

  const filtered = fleetData.filter(f => {
    const matchSearch = f.driverName.toLowerCase().includes(search.toLowerCase()) || f.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const viewDriverAssignments = viewDriver ? getDriverActiveAssignments(viewDriver.driver) : [];

  const handleAddVehicle = async () => {
    if (!vehicleForm.plate_number.trim()) { setVehicleError('Plate number is required.'); return; }
    const cap = parseFloat(vehicleForm.capacity_kg);
    if (isNaN(cap) || cap <= 0) { setVehicleError('Capacity must be a positive number.'); return; }
    setVehicleSaving(true); setVehicleError('');
    try {
      const newVehicle = await vehiclesAPI.create({
        plate_number: vehicleForm.plate_number.trim().toUpperCase(),
        vehicle_type: vehicleForm.vehicle_type,
        capacity_kg: cap,
        make: vehicleForm.make || undefined,
        model: vehicleForm.model || undefined,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : undefined,
      });
      // Optionally assign a driver to the new vehicle
      if (vehicleForm.assign_driver_id && newVehicle?.id) {
        await driversAPI.assignVehicle(Number(vehicleForm.assign_driver_id), newVehicle.id);
      }
      setShowAddVehicle(false);
      setVehicleForm(EMPTY_VF);
      load();
    } catch (e: unknown) {
      setVehicleError(e instanceof Error ? e.message : 'Failed to add vehicle.');
    } finally {
      setVehicleSaving(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Remove this vehicle from your fleet? This cannot be undone.')) return;
    setDeletingVehicle(vehicleId);
    try {
      await vehiclesAPI.delete(vehicleId);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete vehicle.');
    }
    finally { setDeletingVehicle(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Fleet</h1>
        <button onClick={() => { setShowAddVehicle(true); setVehicleForm(EMPTY_VF); setVehicleError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>
      {loadMessage && (
        <div className="px-4 py-2 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
          {loadMessage}
        </div>
      )}
      {reminderMsg && (
        <div className={`px-4 py-2 rounded-lg border text-sm ${reminderMsg.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
          {reminderMsg.text}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Fleet Vehicles" value={vehicles.length} icon={<Truck size={22} />} color="cyan" />
        <StatCard title="Assigned Vehicles" value={fleetRows.filter(f => !!f.driver).length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="On Route" value={myDrivers.filter(d => d.status === 'on_route').length} icon={<Activity size={22} />} color="purple" />
        <StatCard title="Maintenance" value={myDrivers.filter(d => d.status === 'off_duty').length} icon={<AlertTriangle size={22} />} color="yellow" />
      </div>

      {/* Fleet Vehicles table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Truck size={15} className="text-cyan-600" /> Registered Vehicles
        </h2>
        {vehicles.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No vehicles registered yet. Click <strong>Add Vehicle</strong> to start building your fleet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Plate', 'Type', 'Make / Model', 'Capacity', 'Status', 'Driver', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  {(() => {
                    const assignedDriver = myDrivers.find(d => d.vehicle_id === v.id);
                    const canDelete = !assignedDriver;
                    return (
                      <>
                  <td className="px-3 py-2 font-mono font-medium text-gray-900 dark:text-white">{v.plate_number}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{v.vehicle_type}</td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{[v.make, v.model, v.year].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{v.capacity_kg.toLocaleString()} kg</td>
                  <td className="px-3 py-2">
                    <span className={`capitalize text-xs px-2 py-0.5 rounded font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : v.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{v.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    {assignedDriver ? (
                      <span className="text-xs text-cyan-700 dark:text-cyan-400 font-medium">{assignedDriver.name || `Driver #${assignedDriver.id}`}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDeleteVehicle(v.id)} disabled={deletingVehicle === v.id || !canDelete}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed" title={canDelete ? 'Remove' : 'Unassign driver first'}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drivers table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Driver Assignments</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers or plates…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No drivers found{myDrivers.length === 0 ? '. Add drivers from the Drivers page.' : '.'}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Driver', 'Vehicle', 'Capacity', 'Active Bids/Jobs', 'Distance', 'Last Seen', 'Trips', 'Rating', 'Route', 'Availability', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(f => {
                const neverLoggedIn = f.driver !== null && f.driver.has_logged_in === false;
                return (
                <tr key={f.id} className={neverLoggedIn ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${neverLoggedIn ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{f.driverName}</span>
                      {neverLoggedIn && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium whitespace-nowrap">Never signed in</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{f.vehicle?.vehicle_type || f.driver?.vehicle_type || '—'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{f.plate}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{f.capacity}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium">{f.activeAssignments}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{typeof f.nearestDistanceM === 'number' ? formatDist(f.nearestDistanceM) : '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300 text-xs">{formatLastSeen(f.driver)}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{f.trips}</td>
                  <td className="px-3 py-2 text-yellow-600 font-semibold">{f.driver ? `⭐ ${f.rating.toFixed(1)}` : '—'}</td>
                  <td className="px-3 py-2">
                    {f.driver ? (
                      f.onRoute
                        ? <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">{f.routeLabel}</span>
                        : <span className="text-gray-400 text-xs">Idle</span>
                    ) : <span className="text-gray-400 text-xs">N/A</span>}
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={f.driver ? f.status : 'inactive'} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => {
                        if (f.driver) {
                          setViewDriver({ driver: f.driver, vehicle: f.vehicle ?? undefined });
                        }
                      }}
                        disabled={!f.driver}
                        className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded disabled:opacity-40 disabled:cursor-not-allowed" title="View details">
                        <Eye size={15} />
                      </button>
                      {neverLoggedIn && f.driver && (
                        <button
                          onClick={() => handleSendReminder(f.driver!.id)}
                          disabled={sendingReminder === f.driver.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send sign-in reminder email">
                          {sendingReminder === f.driver.id
                            ? <span className="block w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Mail size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setShowAddVehicle(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Vehicle to Fleet</h2>
              <button onClick={() => setShowAddVehicle(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {vehicleError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{vehicleError}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plate Number <span className="text-red-500">*</span></label>
                <input value={vehicleForm.plate_number} onChange={e => setVehicleForm(f => ({ ...f, plate_number: e.target.value }))} placeholder="e.g. RAB 123A"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                  <select value={vehicleForm.vehicle_type} onChange={e => setVehicleForm(f => ({ ...f, vehicle_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                    {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (kg) <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={vehicleForm.capacity_kg} onChange={e => setVehicleForm(f => ({ ...f, capacity_kg: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make</label>
                  <input value={vehicleForm.make} onChange={e => setVehicleForm(f => ({ ...f, make: e.target.value }))} placeholder="Toyota"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input value={vehicleForm.model} onChange={e => setVehicleForm(f => ({ ...f, model: e.target.value }))} placeholder="Hilux"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input type="number" value={vehicleForm.year} onChange={e => setVehicleForm(f => ({ ...f, year: e.target.value }))} placeholder="2022"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
              </div>
              {/* Assign to driver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Driver <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={vehicleForm.assign_driver_id} onChange={e => setVehicleForm(f => ({ ...f, assign_driver_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                  <option value="">— None —</option>
                  {myDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name || `Driver #${d.id}`}{d.vehicle_id ? ' (has vehicle)' : ' — no vehicle'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3 justify-end">
              <button onClick={() => setShowAddVehicle(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">Cancel</button>
              <button onClick={handleAddVehicle} disabled={vehicleSaving} className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                {vehicleSaving ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <Save size={15} />}
                {vehicleSaving ? 'Saving…' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {viewDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setViewDriver(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Driver Details</h2>
              <button onClick={() => setViewDriver(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-14 h-14 bg-linear-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(viewDriver.driver.name || 'D')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">{viewDriver.driver.name || `Driver #${viewDriver.driver.id}`}</p>
                  <p className="text-xs text-gray-400">⭐ {viewDriver.driver.rating.toFixed(1)} · {viewDriver.driver.total_trips} trips</p>
                </div>
              </div>
              {[
                ['Status', viewDriver.driver.status],
                ['Phone', viewDriver.driver.phone || '—'],
                ['Email', viewDriver.driver.email || '—'],
                ['License', viewDriver.driver.license_number || '—'],
                ['Vehicle Type', viewDriver.vehicle?.vehicle_type || viewDriver.driver.vehicle_type || '—'],
                ['Plate', viewDriver.vehicle?.plate_number || viewDriver.driver.plate_number || '—'],
                ['Capacity', viewDriver.vehicle ? `${viewDriver.vehicle.capacity_kg.toLocaleString()} kg` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{val}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned Waste Status</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearAllAssignments}
                      disabled={clearingAssignments || viewDriverAssignments.length === 0}
                      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white">
                      {clearingAssignments
                        ? <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={12} />}
                      {clearingAssignments ? 'Removing…' : 'Remove all'}
                    </button>
                  </div>
                </div>
                {viewDriverAssignments.length === 0 ? (
                  <p className="text-xs text-gray-400">No active assignment.</p>
                ) : (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
                      {viewDriverAssignments.map((assignment) => (
                        <div key={assignment.collectionId} className="px-3 py-2 text-xs border-b last:border-b-0 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{assignment.hotelName}</p>
                            <p className="text-[11px] text-gray-500 truncate">Waste: {assignment.wasteType} · Volume: {assignment.volumeText}</p>
                          </div>
                          <StatusBadge status={assignment.status} size="sm" dot />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setViewDriver(null)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
