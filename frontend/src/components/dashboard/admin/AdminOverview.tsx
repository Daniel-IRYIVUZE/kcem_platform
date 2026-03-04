// pages/dashboard/admin/Overview.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, Recycle, Truck, Package, TrendingUp, 
  DollarSign, Clock, AlertTriangle, Activity, UserPlus, 
  FileText, Bell, BarChart3, Leaf 
} from 'lucide-react';
import StatCard from '../StatCard';
import ChartComponent from '../ChartComponent';
import { getAll, downloadCSV } from '../../../utils/dataStore';
import type { PlatformUser, WasteListing, Transaction, Collection } from '../../../utils/dataStore';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const load = () => {
    setUsers(getAll<PlatformUser>('users'));
    setListings(getAll<WasteListing>('listings'));
    setTransactions(getAll<Transaction>('transactions'));
    setCollections(getAll<Collection>('collections'));
  };

  useEffect(() => {
    load();
    window.addEventListener('ecotrade_data_change', load);
    return () => window.removeEventListener('ecotrade_data_change', load);
  }, []);

  const hotels = users.filter(u => u.role === 'business');
  const recyclers = users.filter(u => u.role === 'recycler');
  const drivers = users.filter(u => u.role === 'driver');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.fee, 0);
  const totalWaste = collections.filter(c => c.status === 'completed').reduce((s, c) => s + c.volume, 0);
  const co2Saved = (totalWaste * 0.716).toFixed(1);
  const openListings = listings.filter(l => l.status === 'open');

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  });

  // Generate mock trend data
  const trendData = [120, 85, 200, 145, 180, 95, 160];

  const activityFeed = [
    ...listings.slice(-5).reverse().map(l => ({ 
      icon: '📦', 
      text: `${l.hotelName} listed ${l.volume}${l.unit} ${l.wasteType}`,
      time: new Date(l.createdAt).toLocaleTimeString() 
    })),
    ...transactions.slice(-3).reverse().map(t => ({ 
      icon: '💰', 
      text: `Payment RWF ${t.amount.toLocaleString()} — ${t.from} → ${t.to}`,
      time: new Date(t.date).toLocaleString() 
    })),
  ].slice(0, 8);

  const revenueByType = {
    labels: ['UCO', 'Glass', 'Paper/Cardboard', 'Mixed'],
    datasets: [{ 
      data: [4500, 2100, 3200, 1400], 
      backgroundColor: '#0891b2'
    }]
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={users.length} 
          icon={<Users size={20}/>} 
          change={`+${pendingUsers.length} pending`} 
          color="cyan" 
        />
        <StatCard 
          title="Active Hotels" 
          value={hotels.filter(h => h.status === 'active').length} 
          icon={<Building2 size={20}/>} 
          color="blue" 
        />
        <StatCard 
          title="Recyclers" 
          value={recyclers.length} 
          icon={<Recycle size={20}/>} 
          color="cyan" 
        />
        <StatCard 
          title="Drivers" 
          value={drivers.length} 
          icon={<Truck size={20}/>} 
          color="orange" 
        />
        <StatCard 
          title="Waste Diverted" 
          value={`${(totalWaste / 1000).toFixed(1)}t`} 
          icon={<Package size={20}/>} 
          color="purple" 
        />
        <StatCard 
          title="CO₂ Saved" 
          value={`${co2Saved}t`} 
          icon={<Leaf size={20}/>} 
          change={`≈${Math.round(Number(co2Saved) * 20)} trees`} 
          color="cyan" 
        />
        <StatCard 
          title="Platform Revenue" 
          value={`RWF ${(totalRevenue / 1000).toFixed(0)}K`} 
          icon={<DollarSign size={20}/>} 
          color="yellow" 
        />
        <StatCard 
          title="Open Listings" 
          value={openListings.length} 
          icon={<Clock size={20}/>} 
          color="blue" 
        />
      </div>

      {/* Alerts */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} pending verification
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {pendingUsers.map(u => u.name).join(', ')}
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/admin/users')} 
            className="text-sm bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Review
          </button>
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-600" />
              Waste Collection Trend (7 days)
            </h3>
            <button 
              onClick={() => downloadCSV('waste_trend', ['Day', 'Volume (kg)'], 
                last7.map((d, i) => [d, String(trendData[i])])
              )} 
              className="text-xs text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Export CSV
            </button>
          </div>
          <ChartComponent 
            type="bar" 
            data={{
              labels: last7,
              datasets: [{ 
                data: trendData, 
                backgroundColor: '#0891b2', 
                label: 'Volume (kg)' 
              }]
            }} 
            height={220} 
          />
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-600" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activityFeed.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                No recent activity
              </p>
            ) : (
              activityFeed.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-tight">{item.text}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions + Revenue Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
            <Bell size={18} className="text-cyan-600" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard/admin/users')} 
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Add New User
            </button>
            <button 
              onClick={() => navigate('/dashboard/admin/reports')} 
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              Generate Report
            </button>
            <button 
              onClick={() => navigate('/dashboard/admin/verification')} 
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-medium transition-colors"
            >
              <AlertTriangle size={16} />
              Verification Queue ({pendingUsers.length})
            </button>
            <button 
              onClick={() => navigate('/dashboard/admin/analytics')} 
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-medium transition-colors"
            >
              <BarChart3 size={16} />
              View Analytics
            </button>
          </div>
        </div>

        {/* Revenue by Waste Type */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-cyan-600" />
            Revenue by Waste Type
          </h3>
          <ChartComponent 
            type="pie" 
            data={revenueByType} 
            height={220}
          />
        </div>
      </div>
    </div>
  );
}