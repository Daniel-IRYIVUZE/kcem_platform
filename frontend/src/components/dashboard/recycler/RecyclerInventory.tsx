import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Warehouse, Package, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { inventoryAPI } from '../../../services/api';
import type { InventoryItem } from '../../../services/api';

export default function RecyclerInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await inventoryAPI.mine();
      setInventory(data);
    } catch { /* offline */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const avgUtilization = inventory.length === 0 ? 0 : Math.round(
    inventory.reduce((s, i) => s + (i.capacity > 0 ? (i.current_stock / i.capacity) * 100 : 0), 0) / inventory.length
  );

  const displayData = inventory.map(i => {
    const util = i.capacity > 0 ? Math.round((i.current_stock / i.capacity) * 100) : 0;
    return {
      id: i.id,
      type: i.material_type,
      currentStock: `${i.current_stock} ${i.unit}`,
      capacity: `${i.capacity} ${i.unit}`,
      utilization: util,
      lastUpdated: i.last_updated ? new Date(i.last_updated).toLocaleDateString() : '—',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
          <Download size={16} /> Export
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Items"
          value={inventory.reduce((s, i) => s + i.current_stock, 0)}
          icon={<DollarSign size={22} />} color="cyan"
        />
        <StatCard
          title="Avg Utilization"
          value={`${avgUtilization}%`}
          icon={<Warehouse size={22} />} color="blue" progress={avgUtilization}
        />
        <StatCard
          title="Types Stored"
          value={inventory.length}
          icon={<Package size={22} />} color="purple"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'type', label: 'Waste Type', render: (v: string) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
            { key: 'currentStock', label: 'Current Stock' },
            { key: 'capacity', label: 'Max Capacity' },
            { key: 'utilization', label: 'Utilization', render: (v: number) => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className={`h-full rounded-full ${v > 75 ? 'bg-red-500' : v > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${v}%` }} />
                </div>
                <span className="text-sm">{v}%</span>
              </div>
            )},
            { key: 'lastUpdated', label: 'Last Updated' },
          ]}
          data={displayData}
        />
        {inventory.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No inventory items found.</p>
        )}
      </div>
    </div>
  );
}
