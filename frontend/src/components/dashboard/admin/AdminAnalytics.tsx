// pages/dashboard/admin/Analytics.tsx
import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Leaf, Download, 
   RefreshCw, Users, DollarSign, Truck, 
  Package, Activity, Award, Globe, 
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { getAll, downloadPDF } from '../../../utils/dataStore';
import type { WasteListing, Transaction, PlatformUser, Collection } from '../../../utils/dataStore';
import ChartComponent from '../ChartComponent';
import { useTheme } from '../../../context/ThemeContext';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
}

export default function AdminAnalytics() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { isDark } = useTheme();

  // Load data with refresh capability
  const loadData = async () => {
    setLoading(true);
    try {
      setListings(getAll<WasteListing>('listings'));
      setTransactions(getAll<Transaction>('transactions'));
      setUsers(getAll<PlatformUser>('users'));
      setCollections(getAll<Collection>('collections'));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('ecotrade_data_change', loadData); 
    return () => window.removeEventListener('ecotrade_data_change', loadData); 
  }, []);

  // Memoized calculations for better performance
  const analytics = useMemo(() => {
    const wasteByType = listings.reduce((acc, l) => { 
      acc[l.wasteType] = (acc[l.wasteType] || 0) + l.volume; 
      return acc; 
    }, {} as Record<string, number>);

    const usersByRole = users.reduce((acc, u) => { 
      acc[u.role] = (acc[u.role] || 0) + 1; 
      return acc; 
    }, {} as Record<string, number>);

    const completedTxn = transactions.filter(t => t.status === 'completed');
    const pendingTxn = transactions.filter(t => t.status === 'pending');
    const totalRevenue = completedTxn.reduce((s, t) => s + t.amount, 0);
    const totalCO2 = collections.reduce((s, c) => s + c.volume * 0.5, 0);
    
    // Calculate trends (comparing with previous period)
    const lastMonthRevenue = completedTxn
      .filter(t => new Date(t.date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
      .reduce((s, t) => s + t.amount, 0);
    
    const previousMonthRevenue = completedTxn
      .filter(t => {
        const date = new Date(t.date);
        const twoMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        return date > twoMonthsAgo && date < oneMonthAgo;
      })
      .reduce((s, t) => s + t.amount, 0);

    const revenueTrend = previousMonthRevenue ? 
      ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

    return {
      wasteByType,
      usersByRole,
      completedTxn,
      pendingTxn,
      totalRevenue,
      totalCO2,
      totalWasteVolume: collections.reduce((s, c) => s + c.volume, 0),
      activeUsers: users.filter(u => u.status === 'active').length,
      activeHotels: users.filter(u => u.role === 'business' && u.status === 'active').length,
      activeRecyclers: users.filter(u => u.role === 'recycler' && u.status === 'active').length,
      activeDrivers: users.filter(u => u.role === 'driver' && u.status === 'active').length,
      revenueTrend,
      averageTransactionValue: completedTxn.length ? totalRevenue / completedTxn.length : 0,
    };
  }, [listings, transactions, users, collections]);

  // Chart data configurations
  const chartData = useMemo(() => {
    return {
      wasteByType: {
        labels: Object.keys(analytics.wasteByType),
        datasets: [{
          label: 'Quantity (kg/L)',
          data: Object.values(analytics.wasteByType),
          backgroundColor: '#06b6d4',
          borderRadius: 8
        }]
      },
      usersByRole: {
        labels: Object.keys(analytics.usersByRole),
        datasets: [{
          label: 'Users',
          data: Object.values(analytics.usersByRole),
          backgroundColor: ['#06b6d4', '#00aac4', '#f59e0b', '#8b5cf6', '#64748b'],
          borderWidth: 0
        }]
      },
      revenueTrend: {
        labels: period === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                period === 'month' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue (RWF)',
          data: period === 'week' ? [4500, 5200, 4800, 6100, 7200, 8100, 7600] :
                 period === 'month' ? [22400, 25600, 28900, 31200] :
                 [85600, 91200, 102400, 115600, 128900, 142300, 156700, 169800, 178900, 189200, 201400, 215600],
          backgroundColor: isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
          borderColor: '#06b6d4',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      collectionPerformance: {
        labels: ['Completed', 'En Route', 'Scheduled', 'Verified'],
        datasets: [{
          data: [
            collections.filter(c => c.status === 'completed').length,
            collections.filter(c => c.status === 'en-route').length,
            collections.filter(c => c.status === 'scheduled').length,
            collections.filter(c => c.status === 'verified').length
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
          borderWidth: 0
        }]
      }
    };
  }, [analytics, period, isDark, collections]);

  // Stat cards configuration
  const statCards: StatCard[] = [
    { 
      label: 'Total Revenue', 
      value: `RWF ${(analytics.totalRevenue / 1000).toFixed(1)}K`, 
      icon: <DollarSign size={20} />, 
      trend: analytics.revenueTrend,
      trendLabel: 'vs last month',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      label: 'Active Users', 
      value: analytics.activeUsers, 
      icon: <Users size={20} />,
      trend: analytics.activeUsers - (users.length - analytics.activeUsers),
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      label: 'CO₂ Saved', 
      value: `${analytics.totalCO2.toFixed(0)} kg`, 
      icon: <Leaf size={20} />,
      trend: 12.5,
      color: 'from-teal-500 to-green-600'
    },
    { 
      label: 'Transactions', 
      value: analytics.completedTxn.length, 
      icon: <Activity size={20} />,
      trend: analytics.completedTxn.length - analytics.pendingTxn.length,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      label: 'Waste Collected', 
      value: `${analytics.totalWasteVolume.toFixed(0)} kg`, 
      icon: <Package size={20} />,
      color: 'from-amber-500 to-orange-600'
    },
    { 
      label: 'Avg Transaction', 
      value: `RWF ${analytics.averageTransactionValue.toFixed(0)}`, 
      icon: <BarChart2 size={20} />,
      trend: 5.2,
      color: 'from-indigo-500 to-purple-600'
    },
  ];

  const handleExportReport = () => {
    const summaryRows = [
      ['Total Users', String(users.length)],
      ['Total Listings', String(listings.length)],
      ['Completed Transactions', String(analytics.completedTxn.length)],
      ['Pending Transactions', String(analytics.pendingTxn.length)],
      ['Total Revenue (RWF)', `RWF ${analytics.totalRevenue.toLocaleString()}`],
      ['Waste Diverted (kg/L)', String(analytics.totalWasteVolume)],
      ['CO₂ Saved (est. kg)', analytics.totalCO2.toFixed(1)],
      ['Active Hotels', String(analytics.activeHotels)],
      ['Active Recyclers', String(analytics.activeRecyclers)],
      ['Active Drivers', String(analytics.activeDrivers)],
      ['Average Transaction', `RWF ${analytics.averageTransactionValue.toFixed(0)}`],
    ];

    const summaryHtml = summaryRows.map(([m, v]) => 
      `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${m}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${v}</strong></td></tr>`
    ).join('');

    const wasteHtml = Object.entries(analytics.wasteByType)
      .map(([k, v]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${k}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${v}</td></tr>`)
      .join('') || '<tr><td colspan="2" style="padding: 8px; text-align: center;">No data</td></tr>';

    const roleHtml = Object.entries(analytics.usersByRole)
      .map(([k, v]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${k}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${v}</td></tr>`)
      .join('');

    const userRows = users.map(u => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${u.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${u.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${u.role}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${u.status}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(u.joinDate).toLocaleDateString()}</td>
      </tr>`
    ).join('');

    downloadPDF('Platform Analytics Report', `
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #06b6d4; color: white; padding: 12px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #06b6d4; }
        .stat-label { color: #666; margin-top: 5px; }
        .footer { margin-top: 40px; color: #999; font-size: 12px; text-align: center; }
      </style>
      <h1>EcoTrade Rwanda - Platform Analytics Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Period:</strong> ${period.charAt(0).toUpperCase() + period.slice(1)}</p>
      
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">RWF ${(analytics.totalRevenue/1000).toFixed(0)}K</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-value">${analytics.activeUsers}</div><div class="stat-label">Active Users</div></div>
        <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Total Listings</div></div>
        <div class="stat-card"><div class="stat-value">${analytics.completedTxn.length}</div><div class="stat-label">Completed Txns</div></div>
      </div>

      <h2>Platform Summary</h2>
      <table>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>${summaryHtml}</tbody>
      </table>

      <h2>Waste Volume by Type</h2>
      <table>
        <thead><tr><th>Waste Type</th><th>Volume (kg/L)</th></tr></thead>
        <tbody>${wasteHtml}</tbody>
      </table>

      <h2>Users by Role</h2>
      <table>
        <thead><tr><th>Role</th><th>Count</th></tr></thead>
        <tbody>${roleHtml}</tbody>
      </table>

      <h2>All Users</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Role</th><th>Status</th><th>Join Date</th></tr>
        </thead>
        <tbody>${userRows}</tbody>
      </table>

      <div class="footer">
        <p>© ${new Date().getFullYear()} EcoTrade Rwanda - Environmental Trading Platform</p>
        <p>This report is automatically generated based on platform data.</p>
      </div>
    `);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart2 size={24} className="text-cyan-600" />
            Platform Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-all
                  ${period === p 
                    ? 'bg-cyan-500 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={loadData}
            disabled={loading}
            className={`
              p-2 rounded-lg border border-gray-200 dark:border-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-all
              ${loading ? 'animate-spin' : ''}
            `}
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download size={16} />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div className={`
                p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white
                transform transition-transform group-hover:scale-110
              `}>
                {stat.icon}
              </div>
              {stat.trend !== undefined && (
                <span className={`
                  flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                  ${stat.trend > 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }
                `}>
                  {stat.trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {Math.abs(stat.trend).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</p>
              {stat.trendLabel && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.trendLabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste by Type */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Package size={18} className="text-cyan-500" />
              Waste Volume by Type
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total: {analytics.totalWasteVolume.toFixed(0)} kg/L
            </span>
          </div>
          <ChartComponent 
            type={selectedChartType === 'pie' ? 'bar' : selectedChartType} 
            data={chartData.wasteByType} 
            height={280}
          />
        </div>

        {/* Users by Role */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Users size={18} className="text-cyan-500" />
              Users Distribution
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total: {users.length} users
            </span>
          </div>
          <ChartComponent 
            type="pie" 
            data={chartData.usersByRole as any} 
            height={280}
          />
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-500" />
              Revenue Trend
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total: RWF {analytics.totalRevenue.toLocaleString()}
              </span>
              <span className={`
                flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                ${analytics.revenueTrend > 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              `}>
                {analytics.revenueTrend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(analytics.revenueTrend).toFixed(1)}% vs last period
              </span>
            </div>
          </div>
          <ChartComponent 
            type="line" 
            data={chartData.revenueTrend} 
            height={240}
          />
        </div>

        {/* Collection Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Truck size={18} className="text-cyan-500" />
              Collection Performance
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Completed: {collections.filter(c => c.status === 'completed').length}
              </span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                En Route: {collections.filter(c => c.status === 'en-route').length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartComponent 
              type="pie" 
              data={chartData.collectionPerformance as any} 
              height={200}
            />
            <div className="space-y-3">
              {chartData.collectionPerformance.datasets[0].data.map((value, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: (chartData.collectionPerformance.datasets[0].backgroundColor as string[])[idx] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    {chartData.collectionPerformance.labels[idx]}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    ({((value / collections.length) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Award size={24} />
            <h4 className="font-semibold">Green Impact Score</h4>
          </div>
          <p className="text-3xl font-bold mb-2">85%</p>
          <p className="text-sm opacity-90">Environmental efficiency rating</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Globe size={24} />
            <h4 className="font-semibold">CO₂ Offset</h4>
          </div>
          <p className="text-3xl font-bold mb-2">{analytics.totalCO2.toFixed(0)} kg</p>
          <p className="text-sm opacity-90">Equivalent to {Math.round(analytics.totalCO2 / 20)} trees</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Activity size={24} />
            <h4 className="font-semibold">Platform Activity</h4>
          </div>
          <p className="text-3xl font-bold mb-2">{listings.length + transactions.length}</p>
          <p className="text-sm opacity-90">Total listings & transactions</p>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyan-500" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {txn.listingId?.substring(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(txn.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                    RWF {txn.amount.toLocaleString()}
                  </p>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${txn.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}
                  `}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Package size={18} className="text-cyan-500" />
            Active Listings
          </h3>
          <div className="space-y-3">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{listing.wasteType}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Volume: {listing.volume} kg/L
                  </p>
                </div>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${listing.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    listing.status === 'assigned' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}
                `}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}