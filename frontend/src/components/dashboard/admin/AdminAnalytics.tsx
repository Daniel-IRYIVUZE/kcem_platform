// pages/dashboard/admin/Analytics.tsx — EcoTrade Rwanda
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart2, Leaf, Download,
  RefreshCw, Users, Truck,
  Package,
} from 'lucide-react';
import { listingsAPI, usersAPI, collectionsAPI, type WasteListing } from '../../../services/api';
import { downloadPDF } from '../../../utils/dataStore';
import ChartComponent from '../ChartComponent';
import DashboardWidget from '../Widget';
import StatusBadge from '../../ui/StatusBadge';
import PageHeader from '../../ui/PageHeader';

export default function AdminAnalytics() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsData, usersData, collectionsData] = await Promise.all([
        listingsAPI.list().catch(() => []),
        usersAPI.list({ limit: 100 }).catch(() => []),
        collectionsAPI.all({ limit: 100 }).catch(() => []),
      ]);
      setListings(listingsData);
      setUsers(usersData);
      setCollections(collectionsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const analytics = useMemo(() => {
    const wasteByType = listings.reduce((acc, l) => { acc[l.waste_type] = (acc[l.waste_type] || 0) + l.volume; return acc; }, {} as Record<string, number>);
    const usersByRole = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalCO2 = collections.reduce((s, c) => s + (c.actual_volume || 0) * 0.5, 0);
    const totalWasteVolume = collections.reduce((s, c) => s + (c.actual_volume || 0), 0);
    return {
      wasteByType,
      usersByRole,
      totalCO2,
      totalWasteVolume,
      activeUsers: users.filter(u => u.status === 'active').length,
    };
  }, [listings, users, collections]);

  const chartData = useMemo(() => ({
    wasteByType: {
      labels: Object.keys(analytics.wasteByType),
      datasets: [{ label: 'Volume (kg/L)', data: Object.values(analytics.wasteByType) as number[], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
    usersByRole: {
      labels: Object.keys(analytics.usersByRole),
      datasets: [{ label: 'Users', data: Object.values(analytics.usersByRole) as number[], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
    collectionPerformance: {
      labels: ['Completed', 'En Route', 'Scheduled'],
      datasets: [{ data: [collections.filter(c=>c.status==='completed').length, collections.filter(c=>c.status==='en_route').length, collections.filter(c=>c.status==='scheduled').length], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
  }), [analytics, collections]);

  const handleExportReport = () => {
    downloadPDF('Platform Analytics Report', `
      <style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#0891b2;border-bottom:2px solid #0891b2;padding-bottom:10px}h2{color:#333;margin-top:30px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#0891b2;color:white;padding:12px;text-align:left}td{padding:8px;border-bottom:1px solid #ddd}.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0}.stat-card{background:#f9f9f9;padding:20px;border-radius:8px;text-align:center}.stat-value{font-size:24px;font-weight:bold;color:#0891b2}.stat-label{color:#666;margin-top:5px}</style>
      <h1>EcoTrade Rwanda — Platform Analytics</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">${analytics.activeUsers}</div><div class="stat-label">Active Users</div></div>
        <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Listings</div></div>
        <div class="stat-card"><div class="stat-value">${analytics.totalCO2.toFixed(0)} kg</div><div class="stat-label">CO₂ Saved</div></div>
      </div>
      <h2>Waste by Type</h2>
      <table><thead><tr><th>Type</th><th>Volume</th></tr></thead><tbody>${Object.entries(analytics.wasteByType).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')||'<tr><td colspan="2">No data</td></tr>'}</tbody></table>
    `);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        subtitle={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
        icon={<BarChart2 size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={loadData} disabled={loading} className="btn-icon" title="Refresh">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleExportReport} className="btn-primary flex items-center gap-1.5 text-xs py-2">
              <Download size={13} />Export PDF
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Users',  value: analytics.activeUsers,                  icon: <Users size={18}/>,   color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
          { label: 'CO₂ Saved',    value: `${analytics.totalCO2.toFixed(0)} kg`,   icon: <Leaf size={18}/>,    color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' },
          { label: 'Waste Volume', value: `${analytics.totalWasteVolume.toFixed(0)} kg`, icon: <Package size={18}/>, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i*60}ms` }}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Waste by Type + Users Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget title="Waste Volume by Type" icon={<Package size={16}/>}
          action={<span className="text-xs text-gray-400">{analytics.totalWasteVolume.toFixed(0)} kg/L total</span>}>
          <ChartComponent type="bar" data={chartData.wasteByType} height={260} yLabel="kg/L" />
        </DashboardWidget>

        <DashboardWidget title="Users by Role" icon={<Users size={16}/>}
          action={<span className="text-xs text-gray-400">{users.length} total users</span>}>
          <ChartComponent type="donut" data={chartData.usersByRole} height={260} />
        </DashboardWidget>
      </div>

      {/* Collection Performance */}
      <DashboardWidget title="Collection Performance" icon={<Truck size={16}/>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ChartComponent type="donut" data={chartData.collectionPerformance} height={220} />
          <div className="flex flex-col justify-center gap-3">
            {[
              { label: 'Completed', status: 'completed', count: collections.filter(c=>c.status==='completed').length },
              { label: 'En Route',  status: 'en_route',  count: collections.filter(c=>c.status==='en_route').length },
              { label: 'Scheduled', status: 'scheduled', count: collections.filter(c=>c.status==='scheduled').length },
            ].map(item => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                <StatusBadge status={item.status} size="sm" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </DashboardWidget>
    </div>
  );
}
