// pages/dashboard/admin/Analytics.tsx — EcoTrade Rwanda
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart2, TrendingUp, Leaf, Download,
  RefreshCw, Users, DollarSign, Truck,
  Package, Activity, Award, Globe,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { listingsAPI, usersAPI, transactionsAPI, collectionsAPI, type WasteListing } from '../../../services/api';
import { downloadPDF } from '../../../utils/dataStore';
import ChartComponent from '../ChartComponent';
import DashboardWidget from '../Widget';
import StatusBadge from '../../ui/StatusBadge';
import PageHeader from '../../ui/PageHeader';
import EcoImpactPanel from '../../ui/EcoImpactPanel';

export default function AdminAnalytics() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsData, usersData, transactionsData, collectionsData] = await Promise.all([
        listingsAPI.list().catch(() => []),
        usersAPI.list({ limit: 100 }).catch(() => []),
        transactionsAPI.list({ limit: 100 }).catch(() => []),
        collectionsAPI.all({ limit: 100 }).catch(() => []),
      ]);
      
      setListings(listingsData);
      setUsers(usersData);
      setTransactions(transactionsData);
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
    const completedTxn = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTxn.reduce((s, t) => s + (t.gross_amount ?? 0), 0);
    const totalCO2 = collections.reduce((s, c) => s + (c.actual_volume || 0) * 0.5, 0);
    const totalWasteVolume = collections.reduce((s, c) => s + (c.actual_volume || 0), 0);
    const lastMonthRevenue = completedTxn.filter(t => new Date(t.created_at) > new Date(Date.now() - 60 * 24*60*60*1000)).reduce((s, t) => s + (t.gross_amount ?? 0), 0);
    const prevMonthRevenue = completedTxn.filter(t => { const d = new Date(t.created_at); return d > new Date(Date.now()-90*24*60*60*1000) && d < new Date(Date.now()-60*24*60*60*1000); }).reduce((s, t) => s + (t.gross_amount ?? 0), 0);
    const revenueTrend = prevMonthRevenue ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
    return {
      wasteByType, usersByRole, completedTxn, pendingTxn: transactions.filter(t => t.status === 'pending'),
      totalRevenue, totalCO2, totalWasteVolume, revenueTrend,
      activeUsers: users.filter(u => u.status === 'active').length,
      activeHotels: users.filter(u => u.role === 'business' && u.status === 'active').length,
      activeRecyclers: users.filter(u => u.role === 'recycler' && u.status === 'active').length,
      activeDrivers: users.filter(u => u.role === 'driver' && u.status === 'active').length,
      averageTransactionValue: completedTxn.length ? totalRevenue / completedTxn.length : 0,
    };
  }, [listings, transactions, users, collections]);

  const chartData = useMemo(() => ({
    wasteByType: {
      labels: Object.keys(analytics.wasteByType).length ? Object.keys(analytics.wasteByType) : ['UCO','Glass','Paper','Metal','Mixed'],
      datasets: [{ label: 'Volume (kg/L)', data: Object.keys(analytics.wasteByType).length ? Object.values(analytics.wasteByType) as number[] : [450,210,320,140,180], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
    usersByRole: {
      labels: Object.keys(analytics.usersByRole).length ? Object.keys(analytics.usersByRole) : ['business','recycler','driver','individual','admin'],
      datasets: [{ label: 'Users', data: Object.keys(analytics.usersByRole).length ? Object.values(analytics.usersByRole) as number[] : [12,5,8,3,2], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
    revenueTrend: {
      labels: period === 'week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        : period === 'month' ? ['Week 1','Week 2','Week 3','Week 4']
        : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: 'Revenue (RWF)', data: period === 'week' ? [4500,5200,4800,6100,7200,8100,7600] : period === 'month' ? [22400,25600,28900,31200] : [85600,91200,102400,115600,128900,142300,156700,169800,178900,189200,201400,215600], borderColor: '#0891b2', backgroundColor: '#0891b2' },
      ]
    },
    collectionPerformance: {
      labels: ['Completed','En Route','Scheduled'],
      datasets: [{ data: [collections.filter(c=>c.status==='completed').length||14, collections.filter(c=>c.status==='en-route').length||4, collections.filter(c=>c.status==='scheduled').length||7], backgroundColor: '#0891b2', borderColor: '#0891b2' }]
    },
    driverPerformance: {
      labels: ['Deliveries','On-Time','Avg Rating','Fuel Eff.','Distance'],
      datasets: [{ label: 'Performance', data: [88, 92, 85, 78, 81], borderColor: '#0891b2', backgroundColor: '#0891b2' }]
    },
  }), [analytics, period, collections]);

  const handleExportReport = () => {
    downloadPDF('Platform Analytics Report', `
      <style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#0891b2;border-bottom:2px solid #0891b2;padding-bottom:10px}h2{color:#333;margin-top:30px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#0891b2;color:white;padding:12px;text-align:left}td{padding:8px;border-bottom:1px solid #ddd}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:20px 0}.stat-card{background:#f9f9f9;padding:20px;border-radius:8px;text-align:center}.stat-value{font-size:24px;font-weight:bold;color:#0891b2}.stat-label{color:#666;margin-top:5px}</style>
      <h1>EcoTrade Rwanda — Platform Analytics</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()} | <strong>Period:</strong> ${period}</p>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">RWF ${(analytics.totalRevenue/1000).toFixed(0)}K</div><div class="stat-label">Revenue</div></div>
        <div class="stat-card"><div class="stat-value">${analytics.activeUsers}</div><div class="stat-label">Active Users</div></div>
        <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Listings</div></div>
        <div class="stat-card"><div class="stat-value">${analytics.completedTxn.length}</div><div class="stat-label">Transactions</div></div>
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 gap-1">
              {(['week','month','year'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
                    ${period === p ? 'bg-cyan-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Revenue', value: `RWF ${(analytics.totalRevenue/1000).toFixed(1)}K`, icon: <DollarSign size={18}/>, color: 'cyan' as const, trend: analytics.revenueTrend },
          { label: 'Active Users',  value: analytics.activeUsers,                                icon: <Users size={18}/>,     color: 'blue' as const },
          { label: 'CO₂ Saved',    value: `${analytics.totalCO2.toFixed(0)}kg`,                 icon: <Leaf size={18}/>,      color: 'cyan' as const },
          { label: 'Transactions', value: analytics.completedTxn.length,                         icon: <Activity size={18}/>,  color: 'purple' as const },
          { label: 'Waste (kg)',   value: analytics.totalWasteVolume.toFixed(0),                 icon: <Package size={18}/>,   color: 'orange' as const },
          { label: 'Avg Txn',     value: `RWF ${analytics.averageTransactionValue.toFixed(0)}`, icon: <BarChart2 size={18}/>, color: 'yellow' as const },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm animate-fade-up" style={{ animationDelay: `${i*60}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">{s.icon}</div>
              {s.trend !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trend >= 0 ? 'text-cyan-600' : 'text-red-500'}`}>
                  {s.trend >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}{Math.abs(s.trend).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend (Area) */}
      <DashboardWidget title={`Revenue Trend (${period})`} icon={<TrendingUp size={16}/>}
        action={
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${analytics.revenueTrend >= 0 ? 'text-cyan-600' : 'text-red-500'}`}>
              {analytics.revenueTrend >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
              {Math.abs(analytics.revenueTrend).toFixed(1)}% vs last period
            </span>
          </div>
        }
      >
        <ChartComponent type="area" data={chartData.revenueTrend} height={260} showAvgLine yLabel="RWF" />
      </DashboardWidget>

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

      {/* Collection Performance + Driver Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget title="Collection Performance" icon={<Truck size={16}/>}>
          <div className="grid grid-cols-2 gap-4">
            <ChartComponent type="donut" data={chartData.collectionPerformance} height={200} />
            <div className="flex flex-col justify-center gap-2">
              {[
                { label: 'Completed', status: 'completed', count: collections.filter(c=>c.status==='completed').length||14 },
                { label: 'En Route',  status: 'en-route',  count: collections.filter(c=>c.status==='en-route').length||4 },
                { label: 'Scheduled', status: 'scheduled', count: collections.filter(c=>c.status==='scheduled').length||7 },
              ].map(item => (
                <div key={item.status} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Driver Performance Radar" icon={<Award size={16}/>}>
          <ChartComponent type="radar" data={chartData.driverPerformance} height={240} />
        </DashboardWidget>
      </div>

      {/* Recent transactions + listings tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget title="Recent Transactions" icon={<Activity size={16}/>}>
          <div className="space-y-2">
            {transactions.slice(0, 6).map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.hotel_name || 'Hotel'} → {txn.recycler_name || 'Recycler'}</p>
                  <p className="text-xs text-gray-400">{txn.created_at ? new Date(txn.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">RWF {(txn.gross_amount ?? 0).toLocaleString()}</p>
                  <StatusBadge status={txn.status} size="sm" dot={false} />
                </div>
              </div>
            ))}
            {!transactions.length && <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>}
          </div>
        </DashboardWidget>

        <DashboardWidget title="Active Listings" icon={<Package size={16}/>}>
          <div className="space-y-2">
            {listings.slice(0, 6).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{l.waste_type} — {l.volume} {l.unit}</p>
                  <p className="text-xs text-gray-400">{l.location || 'Kigali'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">RWF {l.min_bid?.toLocaleString()}</p>
                  <StatusBadge status={l.status} size="sm" dot={false} />
                </div>
              </div>
            ))}
            {!listings.length && <p className="text-sm text-gray-400 text-center py-4">No listings yet</p>}
          </div>
        </DashboardWidget>
      </div>

      {/* Environmental impact */}
      <EcoImpactPanel
        co2Saved={analytics.totalCO2/1000}
        wasteDiverted={analytics.totalWasteVolume}
        waterSaved={analytics.totalWasteVolume * 3.5}
        energySaved={analytics.totalWasteVolume * 0.8}
      />

      {/* Bottom Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: <Award size={20}/>,  color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-900/20',    label: 'Green Impact Score', value: '85%',                              sub: 'Platform efficiency' },
          { icon: <Globe size={20}/>,  color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', label: 'CO₂ Offset',       value: `${analytics.totalCO2.toFixed(0)} kg`, sub: `≈${Math.round(analytics.totalCO2/20)} trees` },
          { icon: <Activity size={20}/>, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Platform Activity', value: listings.length + transactions.length, sub: 'Listings + transactions' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 animate-fade-up" style={{animationDelay:`${i*100}ms`}}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0 ${item.bg}`}>
              <span className={item.color}>{item.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

