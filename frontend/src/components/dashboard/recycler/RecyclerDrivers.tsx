// components/dashboard/recycler/RecyclerDrivers.tsx
import { useState, useEffect, useCallback } from 'react';
import { Star, Truck, MapPin, Phone, CheckCircle, Clock, AlertCircle, X, UserCheck, RefreshCw, Zap, UserPlus, Wand2, Trash2, Car } from 'lucide-react';
import StatCard from '../StatCard';
import { driversAPI, collectionsAPI, vehiclesAPI, bidsAPI } from '../../../services/api';
import type { DriverProfile, VehicleItem } from '../../../services/api';

/* ─── Types ─────────────────────────────────────────────────── */
interface EnrichedCollection {
  id: number;
  listing_id?: number;
  hotel_id?: number;
  hotel_name?: string;
  recycler_name?: string;
  driver_name?: string;
  driver_id?: number;
  waste_type?: string;
  volume?: number;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  completed_at?: string;
  actual_weight?: number;
  rating?: number;
  notes?: string;
  location?: string;
  earnings?: number;
  created_at?: string;
  // enriched
  wasteType?: string;
  unit?: string;
  scheduledDate?: string;
}

/* ─── Status helpers ─────────────────────────────────────────── */
const statusLabel: Record<string, string> = {
  available: 'Available',
  on_route: 'On Trip',
  off_duty: 'Off Duty',
};
const statusColor: Record<string, string> = {
  available: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  on_route: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  off_duty: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};
const statusDot: Record<string, string> = {
  available: 'bg-green-500',
  on_route: 'bg-blue-500',
  off_duty: 'bg-gray-400',
};

/* ─── Star Rating helper ─────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
      ))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ─── Add Driver Modal ──────────────────────────────────────────── */
function AddDriverModal({
  vehicles,
  onClose,
  onCreated,
}: {
  vehicles: VehicleItem[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', license_number: '', vehicle_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Name and email are required.'); return;
    }
    setLoading(true); setError('');
    try {
      await driversAPI.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        license_number: form.license_number || undefined,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined,
      });
      setSuccess('Driver account created! A welcome email with temporary login credentials has been sent.');
      setTimeout(() => { onCreated(); onClose(); }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Driver</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">An email with temporary login credentials will be sent.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
        </div>

        {success ? (
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
            <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{success}</span>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handle} required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="Driver full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="driver@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handle}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="+250 7xx xxx xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License No.</label>
                <input name="license_number" value={form.license_number} onChange={handle}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="DL-12345" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Vehicle</label>
              <select name="vehicle_id" value={form.vehicle_id} onChange={handle}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                <option value="">— Select vehicle (optional) —</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.vehicle_type} · {v.plate_number}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} />{error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</> : <><UserPlus size={15} /> Create Driver</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Assign Driver Modal ─────────────────────────────────────── */
function AssignDriverModal({
  driver, collections, onConfirm, onClose,
}: {
  driver: DriverProfile;
  collections: EnrichedCollection[];
  onConfirm: (collectionId: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const pending = collections.filter(c => !c.driver_id && (c.status === 'scheduled' || c.status === 'pending'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Driver</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select a collection for {driver.name || `Driver #${driver.id}`}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Driver Card */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(driver.name || 'D')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{driver.name || `Driver #${driver.id}`}</p>
            <Stars rating={driver.rating} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{driver.vehicle_type || 'Pickup Truck'} · {driver.plate_number || 'N/A'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[driver.status]}`}>
            {statusLabel[driver.status]}
          </span>
        </div>

        {/* Collections */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select collection to assign:</p>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <Truck size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No pending collections need a driver.</p>
            <p className="text-xs mt-1">Collections are created when recyclers accept your bids.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {pending.map(col => (
              <label key={col.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected === col.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'}`}>
                <input type="radio" name="collection" value={col.id} checked={selected === col.id} onChange={() => setSelected(col.id)} className="mt-1" />
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {col.wasteType || col.waste_type || 'Waste'} Collection — {col.volume || '?'} {col.unit || 'kg'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Scheduled: {col.scheduledDate || col.scheduled_date || 'TBD'} · Status: {col.status}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck size={16} /> Assign Driver
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Assign Vehicle Modal ────────────────────────────────────── */
function AssignVehicleModal({
  driver, vehicles, onConfirm, onClose,
}: {
  driver: DriverProfile;
  vehicles: VehicleItem[];
  onConfirm: (vehicleId: number | null) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string>(driver.vehicle_id ? String(driver.vehicle_id) : '');
  const unassignedVehicles = vehicles.filter(v => v.id === driver.vehicle_id || true); // show all fleet vehicles
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Vehicle</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assigning vehicle to <span className="font-semibold text-gray-900 dark:text-white">{driver.name || `Driver #${driver.id}`}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Vehicle</label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">— No Vehicle (Unassign) —</option>
              {unassignedVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_type} — {v.plate_number} ({v.capacity_kg.toLocaleString()} kg)
                  {v.id === driver.vehicle_id ? ' (current)' : ''}
                </option>
              ))}
            </select>
          </div>
          {unassignedVehicles.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">No fleet vehicles registered yet. Add vehicles from the Fleet page.</p>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button
            onClick={() => onConfirm(selected ? Number(selected) : null)}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Car size={15} /> {selected ? 'Assign Vehicle' : 'Unassign Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Driver Card ─────────────────────────────────────────────── */
function DriverCard({ driver, onAssign, onDelete, onAssignVehicle }: {
  driver: DriverProfile;
  onAssign: () => void;
  onDelete: () => void;
  onAssignVehicle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(driver.name || 'D')[0].toUpperCase()}
            </div>
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${statusDot[driver.status]}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{driver.name || `Driver #${driver.id}`}</p>
            <Stars rating={driver.rating} />
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[driver.status]}`}>
          {statusLabel[driver.status]}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Truck size={14} className="text-cyan-600 flex-shrink-0" />
          <span>{driver.vehicle_type || 'Pickup Truck'} · {driver.plate_number || 'N/A'}</span>
        </div>
        {driver.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} className="text-cyan-600 flex-shrink-0" />
            <span>{driver.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CheckCircle size={14} className="text-cyan-600 flex-shrink-0" />
          <span>{driver.total_trips} trips completed</span>
        </div>
        {driver.current_lat && driver.current_lng && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin size={14} className="text-cyan-600 flex-shrink-0" />
            <span>Live location available</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {driver.status === 'available' && !driver.vehicle_id && (
          <div className="w-full py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-xs font-medium text-yellow-700 dark:text-yellow-400 flex items-center justify-center gap-1.5">
            <UserCheck size={13} /> No Vehicle — Assign Vehicle First
          </div>
        )}
        {driver.status === 'available' && driver.vehicle_id && (
          <div className="w-full py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-xs font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-1.5">
            <UserCheck size={13} /> Ready — Auto-assigned when needed
          </div>
        )}
        {driver.status === 'on_route' && (
          <div className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-medium text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1.5">
            <Zap size={13} /> On Trip — Already Assigned
          </div>
        )}
        {driver.status === 'off_duty' && (
          <div className="w-full py-2 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-xs font-medium text-gray-400 flex items-center justify-center gap-1.5">
            Off Duty
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onAssign}
            className="flex-1 py-2 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-xl text-xs font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCheck size={13} /> Assign Collection
          </button>
          <button
            onClick={onAssignVehicle}
            className="flex-1 py-2 border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400 rounded-xl text-xs font-medium hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <Car size={13} /> {driver.vehicle_id ? 'Change Vehicle' : 'Assign Vehicle'}
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-xl text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function BusinessDrivers() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [collections, setCollections] = useState<EnrichedCollection[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'on_route' | 'off_duty'>('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [assignVehicleDriver, setAssignVehicleDriver] = useState<DriverProfile | null>(null);

  const showFlash = (type: 'success' | 'error', msg: string) => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  const handleDeleteDriver = async (driver: DriverProfile) => {
    if (!confirm(`Remove ${driver.name || `Driver #${driver.id}`} from your organisation? This cannot be undone.`)) return;
    try {
      await driversAPI.delete(driver.id);
      showFlash('success', `Driver removed successfully.`);
      load();
    } catch (err: unknown) {
      showFlash('error', err instanceof Error ? err.message : 'Failed to remove driver.');
    }
  };

  const handleAssignVehicle = async (vehicleId: number | null) => {
    if (!assignVehicleDriver) return;
    try {
      await driversAPI.assignVehicle(assignVehicleDriver.id, vehicleId);
      showFlash('success', vehicleId ? `Vehicle assigned to ${assignVehicleDriver.name || 'driver'}.` : `Vehicle unassigned from ${assignVehicleDriver.name || 'driver'}.`);
      setAssignVehicleDriver(null);
      load();
    } catch (err: unknown) {
      showFlash('error', err instanceof Error ? err.message : 'Failed to assign vehicle.');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Backfill missing collections for accepted bids, then auto-assign nearby drivers
      await bidsAPI.backfillCollections().catch(() => null);
      await collectionsAPI.autoAssign(true, true).catch(() => null);
      const [driversData, collectionsData, vehiclesData] = await Promise.all([
        driversAPI.myRecycler().catch(() => driversAPI.list({ limit: 50 })),
        collectionsAPI.list({ limit: 50 }),
        vehiclesAPI.list().catch(() => []),
      ]);
      setDrivers(driversData);
      setCollections(collectionsData as EnrichedCollection[]);
      setVehicles(vehiclesData);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('ecotrade_data_change', load);
    return () => window.removeEventListener('ecotrade_data_change', load);
  }, [load]);

  const handleAssign = async (collectionId: number) => {
    if (!selectedDriver) return;
    setAssigning(true);
    try {
      await collectionsAPI.assignDriver(collectionId, {
        driver_id: selectedDriver.id,
        vehicle_id: selectedDriver.vehicle_id,
      });
      setSelectedDriver(null);
      showFlash('success', `${selectedDriver.name || `Driver #${selectedDriver.id}`} assigned successfully!`);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Assignment failed. Please try again.';
      showFlash('error', msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const result = await collectionsAPI.autoAssign(true, true);
      const count = Array.isArray(result) ? result.length : (result as { assigned?: number })?.assigned ?? 0;
      showFlash('success', `Auto-assigned ${count} collection(s) to nearby available drivers.`);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Auto-assign failed.';
      showFlash('error', msg);
    } finally {
      setAutoAssigning(false);
    }
  };

  const filtered = statusFilter === 'all' ? drivers : drivers.filter(d => d.status === statusFilter);
  const available = drivers.filter(d => d.status === 'available').length;
  const on_route = drivers.filter(d => d.status === 'on_route').length;
  const off_duty = drivers.filter(d => d.status === 'off_duty').length;
  const pendingCollections = collections.filter(c => !c.driver_id && (c.status === 'scheduled' || c.status === 'pending')).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Flash banners */}
      {flash && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${flash.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          {flash.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {flash.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers & Availability</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your drivers and assign them to waste collections</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {pendingCollections > 0 && (
            <button
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Wand2 size={15} className={autoAssigning ? 'animate-spin' : ''} />
              {autoAssigning ? 'Assigning…' : 'Auto-Assign All'}
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <UserPlus size={15} /> Add Driver
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Drivers" value={drivers.length} icon={<Truck size={22} />} color="cyan" />
        <StatCard title="Available" value={available} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="On Trip" value={on_route} icon={<Zap size={22} />} color="purple" />
        <StatCard title="Need Driver" value={pendingCollections} icon={<Clock size={22} />} color="orange" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'available', 'on_route', 'off_duty'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? 'bg-cyan-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            {s === 'all' ? 'All Drivers' : statusLabel[s]}
            {s !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({s === 'available' ? available : s === 'on_route' ? on_route : off_duty})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Collections needing driver — call-to-action strip */}
      {pendingCollections > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              {pendingCollections} collection{pendingCollections > 1 ? 's' : ''} awaiting driver assignment
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Click "Auto-Assign All" to auto-assign nearby drivers, or manually assign using driver cards below.
            </p>
          </div>
        </div>
      )}

      {/* Driver Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading drivers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Truck size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No drivers found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {drivers.length === 0 ? 'Add your first driver using the "Add Driver" button above.' : 'Try changing the filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(driver => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onAssign={() => setSelectedDriver(driver)}
              onDelete={() => handleDeleteDriver(driver)}
              onAssignVehicle={() => setAssignVehicleDriver(driver)}
            />
          ))}
        </div>
      )}

      {/* Assign Driver Modal */}
      {selectedDriver && !assigning && (
        <AssignDriverModal
          driver={selectedDriver}
          collections={collections}
          onConfirm={handleAssign}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {/* Assign Vehicle to Driver Modal */}
      {assignVehicleDriver && (
        <AssignVehicleModal
          driver={assignVehicleDriver}
          vehicles={vehicles}
          onConfirm={handleAssignVehicle}
          onClose={() => setAssignVehicleDriver(null)}
        />
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <AddDriverModal
          vehicles={vehicles}
          onClose={() => setShowAddModal(false)}
          onCreated={load}
        />
      )}

      {/* Assigning overlay */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto" />
            <p className="mt-4 font-medium text-gray-900 dark:text-white">Assigning driver…</p>
          </div>
        </div>
      )}
    </div>
  );
}
