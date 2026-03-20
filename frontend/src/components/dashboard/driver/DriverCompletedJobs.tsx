import { useState, useEffect, useCallback } from 'react';
import { collectionsAPI, type Collection } from '../../../services/api';
import { downloadCSV } from '../../../utils/dataStore';
import { CheckCircle, Package, MapPin, Download, Recycle, Truck } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';

export default function DriverCompletedJobs() {
  const [completedCols, setCompletedCols] = useState<Collection[]>([]);
  const load = useCallback(() => {
    collectionsAPI.list({ status: 'completed', limit: 100 }).then(setCompletedCols).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  function calcDuration(c: Collection): string {
    // Try the most precise timestamps first, then fall back
    const end = c.completed_at ?? c.collected_at ?? c.updated_at;
    const start = c.started_at ?? c.arrived_at ?? c.created_at;
    if (!end || !start) return '—';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs <= 0) return '—';
    const h = Math.floor(diffMs / 3_600_000);
    const m = Math.floor((diffMs % 3_600_000) / 60_000);
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  const tableData = completedCols.map(c => ({
    id: c.id,
    business: c.hotel_name || '—',
    date: c.completed_at
      ? new Date(c.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : c.scheduled_date
        ? new Date(c.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : c.created_at
          ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—',
    location: c.location || '—',
    totalWeight: `${c.actual_volume ?? c.volume ?? 0} ${c.waste_type === 'UCO' ? 'L' : 'kg'}`,
    duration: calcDuration(c),
  }));

  // Total volume from DB: use actual_volume (driver-confirmed) with fallback to listing volume
  const totalVolumeKg = completedCols.reduce((s, c) => s + Number(c.actual_volume ?? c.volume ?? 0), 0);
  // Smart weight display: kg under 1000, tonnes above
  const weightDisplay = totalVolumeKg >= 1000
    ? `${(totalVolumeKg / 1000).toFixed(2)}t`
    : `${totalVolumeKg.toLocaleString()} kg`;
  // Unique businesses served
  const uniqueBusinesses = new Set(completedCols.map(c => c.hotel_name).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completed Jobs</h1>
        <button onClick={() => downloadCSV('completed_jobs', ['ID','Business','Date','Location','Weight','Duration'],
          tableData.map(r => [String(r.id), r.business, r.date, r.location, r.totalWeight, r.duration]))}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"><Download size={16} /> Export</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Jobs"        value={tableData.length}    icon={<CheckCircle size={22} />} color="cyan"   />
        <StatCard title="Total Weight"      value={weightDisplay}       icon={<Package size={22} />}     color="blue"   />
        <StatCard title="Waste Collected"   value={`${totalVolumeKg.toLocaleString()} kg`} icon={<Recycle size={22} />} color="purple" />
        <StatCard title="Businesses Served" value={uniqueBusinesses}    icon={<Truck size={22} />}       color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id',          label: 'Job',      render: (v: string) => <span className="font-mono text-sm font-semibold text-cyan-600">#{v}</span> },
            { key: 'business',    label: 'Business', render: (v: string) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
            { key: 'date',        label: 'Date' },
            { key: 'location',    label: 'Location', render: (v: string) => (
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin size={12} className="text-cyan-500 flex-shrink-0" />
                <span className="truncate max-w-[160px]">{v}</span>
              </span>
            )},
            { key: 'totalWeight', label: 'Weight' },
            { key: 'duration',    label: 'Duration' },
          ]}
          data={tableData}
          pageSize={6}
        />
        {tableData.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No completed jobs yet.</p>
        )}
      </div>
    </div>
  );
}
