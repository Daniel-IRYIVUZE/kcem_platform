import { useState } from 'react';
import { Truck, Search, Plus, Eye, Edit, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { fleetData, StatusBadge } from './_shared';

export default function RecyclerFleet() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = fleetData.filter(f => {
    const matchSearch = f.driver.toLowerCase().includes(search.toLowerCase()) || f.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Fleet</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><Plus size={16} /> Add Vehicle</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={fleetData.length} icon={<Truck size={22} />} color="cyan" />
        <StatCard title="Active" value={fleetData.filter(f => f.status === 'active').length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="On Route" value={fleetData.filter(f => f.currentRoute !== '—').length} icon={<Activity size={22} />} color="purple" />
        <StatCard title="Maintenance" value={fleetData.filter(f => f.status === 'maintenance').length} icon={<AlertTriangle size={22} />} color="yellow" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400"><Truck size={40} className="mx-auto mb-2 opacity-50" /><p className="text-sm">Fleet Map — Live vehicle locations</p></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers or vehicles..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option>
          </select>
        </div>
        <DataTable
          columns={[
            { key: 'driver', label: 'Driver', render: (v: string) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
            { key: 'vehicle', label: 'Vehicle', render: (v: string, r: typeof fleetData[0]) => <div><p className="text-sm">{v}</p><p className="text-xs text-gray-500 dark:text-gray-400">{r.plate}</p></div> },
            { key: 'capacity', label: 'Capacity' },
            { key: 'trips', label: 'Trips' },
            { key: 'rating', label: 'Rating', render: (v: number) => <span className="text-yellow-700 dark:text-yellow-700 font-semibold">⭐ {v}</span> },
            { key: 'currentRoute', label: 'Route', render: (v: string) => v !== '—' ? <span className="text-blue-600 dark:text-blue-400 font-medium">{v}</span> : <span className="text-gray-400 dark:text-gray-500">—</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'id', label: 'Actions', render: () => <div className="flex gap-1"><button className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900/20 rounded"><Eye size={15} /></button><button className="p-1.5 text-yellow-700 dark:text-yellow-700 hover:bg-yellow-50 dark:bg-yellow-900/20 rounded"><Edit size={15} /></button></div> },
          ]}
          data={filtered}
          pageSize={6}
        />
      </div>
    </div>
  );
}
