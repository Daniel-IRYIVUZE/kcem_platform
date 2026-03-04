import { DollarSign, Warehouse, Package, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { inventoryData } from './_shared';

export default function RecyclerInventory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16} /> Export</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Stock Value" value="RWF 2.48M" icon={<DollarSign size={22} />} color="cyan" />
        <StatCard title="Avg Utilization" value="40%" icon={<Warehouse size={22} />} color="blue" progress={40} />
        <StatCard title="Types Stored" value={inventoryData.length} icon={<Package size={22} />} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'type', label: 'Waste Type', render: (v: string) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
            { key: 'currentStock', label: 'Current Stock' },
            { key: 'capacity', label: 'Max Capacity' },
            { key: 'utilization', label: 'Utilization', render: (v: number) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full"><div className={`h-full rounded-full ${v > 75 ? 'bg-red-500' : v > 50 ? 'bg-yellow-700' : 'bg-green-500'}`} style={{ width: `${v}%` }} /></div>
                <span className="text-sm">{v}%</span>
              </div>
            )},
            { key: 'value', label: 'Value', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'lastUpdated', label: 'Last Updated' },
            { key: 'id', label: 'Actions', render: () => <button className="px-3 py-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded hover:bg-cyan-100 font-medium">Update</button> },
          ]}
          data={inventoryData}
        />
      </div>
    </div>
  );
}
