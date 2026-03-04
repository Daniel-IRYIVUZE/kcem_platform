import { MapPin } from 'lucide-react';
import DataTable from '../DataTable';

const zones = [
  { id: 1, name: 'Kicukiro District', hotels: 12, activeListings: 8, distance: '0-5 km', priority: 'high' },
  { id: 2, name: 'Gasabo District', hotels: 18, activeListings: 11, distance: '5-10 km', priority: 'high' },
  { id: 3, name: 'Nyarugenge District', hotels: 15, activeListings: 9, distance: '3-8 km', priority: 'medium' },
  { id: 4, name: 'Musanze (Northern)', hotels: 5, activeListings: 2, distance: '80+ km', priority: 'low' },
  { id: 5, name: 'Rubavu (Western)', hotels: 4, activeListings: 1, distance: '150+ km', priority: 'low' },
];

export default function RecyclerZones() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collection Zones</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400"><MapPin size={48} className="mx-auto mb-2 opacity-50" /><p className="text-sm">Zone Map — Coverage areas and hotel locations</p></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Zone', render: (v: string) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
            { key: 'hotels', label: 'Hotels' },
            { key: 'activeListings', label: 'Active Listings' },
            { key: 'distance', label: 'Distance' },
            { key: 'priority', label: 'Priority', render: (v: string) => <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${v === 'high' ? 'bg-red-100 text-red-700' : v === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{v}</span> },
          ]}
          data={zones}
        />
      </div>
    </div>
  );
}
