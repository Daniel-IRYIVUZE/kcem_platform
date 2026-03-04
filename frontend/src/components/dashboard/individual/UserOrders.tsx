import { useState } from 'react';
import { Package, CheckCircle, Clock, DollarSign } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { userOrders, userProfile, StatusBadge } from './_shared';

export default function UserOrders() {
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = userOrders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={userOrders.length} icon={<Package size={22} />} color="cyan" />
        <StatCard title="Delivered" value={userOrders.filter(o => o.status === 'delivered').length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="In Transit" value={userOrders.filter(o => o.status === 'in_transit').length} icon={<Clock size={22} />} color="purple" />
        <StatCard title="Total Spent" value={`RWF ${(userProfile.totalSpent / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option><option value="delivered">Delivered</option><option value="in_transit">In Transit</option><option value="processing">Processing</option>
          </select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Order', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'items', label: 'Items', render: (v: string) => <span className="font-medium">{v}</span> },
            { key: 'seller', label: 'Seller' },
            { key: 'amount', label: 'Amount', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'tracking', label: 'Tracking', render: (v: string) => v !== '—' ? <span className="font-mono text-xs text-cyan-600">{v}</span> : <span className="text-gray-400 dark:text-gray-500">—</span> },
          ]}
          data={filtered}
          pageSize={6}
        />
      </div>
    </div>
  );
}
