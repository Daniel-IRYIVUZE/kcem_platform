import { useState, useEffect } from 'react';
import { driversAPI, vehiclesAPI, type DriverProfile, type VehicleItem } from '../../../services/api';
import { Truck, Battery, Fuel, Activity, AlertTriangle } from 'lucide-react';

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
    <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
  </div>
);

export default function DriverVehicle() {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [vehicle, setVehicle] = useState<VehicleItem | null>(null);

  useEffect(() => {
    driversAPI.me().then(d => {
      setDriver(d);
      vehiclesAPI.listMine().then(list => {
        const linked = d.vehicle_id ? list.find(v => v.id === d.vehicle_id) : list[0];
        if (linked) setVehicle(linked);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const vehicleName = vehicle
    ? `${vehicle.make || ''} ${vehicle.model || vehicle.vehicle_type}`.trim()
    : (driver?.vehicle_type || 'Vehicle');
  const plate = vehicle?.plate_number || driver?.plate_number || '—';
  const capacity = vehicle?.capacity_kg ? `${vehicle.capacity_kg} kg` : (driver?.capacity_kg ? `${driver.capacity_kg} kg` : '—');
  const vehicleStatus = vehicle?.status || 'active';
  const year = vehicle?.year ? String(vehicle.year) : '—';

  const maintenance = [
    { item: 'Oil Change', due: '2026-05-15', status: 'OK', daysLeft: 66 },
    { item: 'Tire Rotation', due: '2026-04-30', status: 'Due Soon', daysLeft: 51 },
    { item: 'Brake Inspection', due: '2026-06-01', status: 'OK', daysLeft: 83 },
    { item: 'Air Filter', due: '2026-04-25', status: 'Action Required', daysLeft: 46 },
  ];
  const statusColor: Record<string, string> = {
    'OK': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20', 'Due Soon': 'text-yellow-700 dark:text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20', 'Action Required': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Vehicle</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl"><Truck size={24} className="text-cyan-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{vehicleName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">License Plate: {plate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Make', vehicle?.make || '—'],
              ['Model', vehicle?.model || '—'],
              ['Year', year],
              ['Capacity', capacity],
              ['Type', vehicle?.vehicle_type || driver?.vehicle_type || '—'],
              ['Driver Rating', driver ? `${driver.rating.toFixed(1)} ★` : '—'],
              ['Total Trips', driver ? String(driver.total_trips) : '—'],
              ['Status', vehicleStatus],
            ].map(([k, val]) => (
              <div key={k} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{k}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Fuel Level', value: 72, icon: <Fuel size={18} />, color: 'bg-amber-400' },
            { label: 'Battery', value: 88, icon: <Battery size={18} />, color: 'bg-green-500' },
            { label: 'Tire Condition', value: 65, icon: <Activity size={18} />, color: 'bg-blue-500' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">{item.icon}<span className="text-sm font-medium">{item.label}</span></div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
              <ProgressBar value={item.value} color={item.color} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4"><AlertTriangle size={20} className="text-amber-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Schedule</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">{['Item','Due Date','Status','Days Left'].map(h => <th key={h} className="pb-3 pr-4">{h}</th>)}</tr></thead>
            <tbody>{maintenance.map(m => (
              <tr key={m.item} className="border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                <td className="py-3 pr-4 font-medium">{m.item}</td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{m.due}</td>
                <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[m.status]}`}>{m.status}</span></td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{m.daysLeft}d</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
