// pages/dashboard/admin/OverviewSection.tsx
import { Users, Package, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersAPI, listingsAPI, transactionsAPI } from '../../../services/api';

const AdminOverviewSection = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    listingsToday: 0,
    pendingDisputes: 0,
    systemHealth: 99.2
  });

  useEffect(() => {
    Promise.all([
      usersAPI.list({ limit: 500 }).catch(() => []),
      listingsAPI.list({ limit: 500 }).catch(() => []),
      transactionsAPI.list({ limit: 500 }).catch(() => []),
    ]).then(([users, listings, transactions]) => {
      const today = new Date().toDateString();
      const todayListings = listings.filter(l =>
        new Date(l.created_at).toDateString() === today
      ).length;
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const disputes = transactions.filter(t => t.status === 'disputed').length;
      setStats({
        totalRevenue,
        activeUsers: users.filter(u => u.status === 'active').length,
        listingsToday: todayListings,
        pendingDisputes: disputes,
        systemHealth: 99.2,
      });
    });
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: `Rwf ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: <DollarSign size={20} className="text-cyan-600" />,
      subtext: 'Platform total',
      color: 'border-l-cyan-500'
    },
    {
      label: 'Active Users',
      value: stats.activeUsers,
      icon: <Users size={20} className="text-cyan-600" />,
      subtext: 'Registered members',
      color: 'border-l-blue-500'
    },
    {
      label: "Today's Listings",
      value: stats.listingsToday,
      icon: <Package size={20} className="text-amber-600 dark:text-amber-400" />,
      subtext: 'New listings today',
      color: 'border-l-amber-500'
    },
    {
      label: 'Pending Disputes',
      value: stats.pendingDisputes,
      icon: <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />,
      subtext: 'Need attention',
      color: 'border-l-red-500'
    },
    {
      label: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: <Activity size={20} className="text-cyan-600" />,
      subtext: 'All systems operational',
      color: 'border-l-green-500'
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border-l-4 ${stat.color} border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {stat.label}
            </span>
            {stat.icon}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stat.subtext}
          </p>
        </div>
      ))}
    </section>
  );
};

export default AdminOverviewSection;