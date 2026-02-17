import { Users, Package, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const AdminOverviewSection = () => {
  const [stats] = useState({
    totalRevenue: 1250000,
    activeUsers: 342,
    listingsToday: 28,
    pendingDisputes: 5,
    systemHealth: 98.7
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
          <DollarSign size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">Rwf {(stats.totalRevenue / 1000000).toFixed(1)}M</div>
        <p className="text-xs text-gray-500 mt-1">Platform total</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Active Users</span>
          <Users size={20} className="text-cyan-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeUsers}</div>
        <p className="text-xs text-gray-500 mt-1">Registered members</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Today's Listings</span>
          <Package size={20} className="text-amber-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.listingsToday}</div>
        <p className="text-xs text-gray-500 mt-1">New listings today</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">Pending Disputes</span>
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pendingDisputes}</div>
        <p className="text-xs text-gray-500 mt-1">Need attention</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 text-sm font-medium">System Health</span>
          <Activity size={20} className="text-green-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.systemHealth}%</div>
        <p className="text-xs text-gray-500 mt-1">All systems operational</p>
      </div>
    </section>
  );
};

export default AdminOverviewSection;
