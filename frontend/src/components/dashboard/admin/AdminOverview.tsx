// components/dashboard/admin/AdminOverview.tsx — EcoTrade Rwanda
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Users, Building2, Recycle, Truck, Package, TrendingUp,
  DollarSign, Clock, AlertTriangle, Activity, UserPlus,
  FileText, Bell, BarChart3, Leaf, Shield, RefreshCw,
  MapPin, CheckCircle, ArrowRight,
} from 'lucide-react';
import StatCard from '../StatCard';
import ChartComponent from '../ChartComponent';
import DashboardWidget from '../Widget';
import ActivityFeed, { type ActivityItem } from '../../ui/ActivityFeed';
import EcoImpactPanel from '../../ui/EcoImpactPanel';
import StatusBadge from '../../ui/StatusBadge';
import PageHeader from '../../ui/PageHeader';
import { downloadCSV } from '../../../utils/dataStore';
import {
  usersAPI, listingsAPI, transactionsAPI, collectionsAPI,
  type APIUser, type WasteListing, type Transaction, type Collection,
} from '../../../services/api';

const sparkUp   = [40, 55, 48, 70, 65, 80, 88];
const sparkFlat = [60, 62, 58, 63, 61, 65, 62];
const sparkDown = [90, 80, 85, 70, 65, 60, 55];

export default function AdminOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<APIUser[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    try {
      const [us, ls, ts, cs] = await Promise.all([
        usersAPI.list({ limit: 500 }).catch(() => [] as APIUser[]),
        listingsAPI.list({ limit: 500 }).catch(() => [] as WasteListing[]),
        transactionsAPI.list({ limit: 500 }).catch(() => [] as Transaction[]),
        collectionsAPI.list({ limit: 500 }).catch(() => [] as Collection[]),
      ]);
      setUsers(us);
      setListings(ls);
      setTransactions(ts);
      setCollections(cs);
      setLastRefresh(new Date());
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    load();
    const refreshInterval = setInterval(load, 60_000);
    return () => clearInterval(refreshInterval);
  }, []);

  const hotels       = users.filter(u => u.role === 'business');
  const recyclers    = users.filter(u => u.role === 'recycler');
  const drivers      = users.filter(u => u.role === 'driver');
  const pendingUsers = users.filter(u => u.status === 'pending');
  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.fee || 0), 0);
  const totalWaste   = collections.filter(c => c.status === 'completed').reduce((s, c) => s + (c.volume || 0), 0);
  const co2Saved     = (totalWaste * 1.3) / 1000;
  const openListings = listings.filter(l => l.status === 'open');
  const activeRoutes = collections.filter(c => c.status === 'en_route');

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-GB', { weekday: 'short' });
  });

  const wasteTrendChart = {
    labels: last7,
    datasets: [{ label: 'Volume (kg)', data: [120, 95, 200, 145, 180, 110, 160], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
  };

  const revenueAreaChart = {
    labels: last7,
    datasets: [{ label: 'Revenue (RWF)', data: [28000, 35000, 29000, 48000, 52000, 41000, 57000], borderColor: '#0891b2', backgroundColor: '#0891b2' }],
  };

  const collectionPieChart = {
    labels: ['Completed', 'En Route', 'Scheduled'],
    datasets: [{
      data: [
        collections.filter(c => c.status === 'completed').length || 12,
        collections.filter(c => c.status === 'en_route').length   || 4,
        collections.filter(c => c.status === 'scheduled').length || 7,
      ],
      backgroundColor: '#0891b2', borderColor: '#0891b2',
    }],
  };

  const activityItems: ActivityItem[] = [
    ...listings.slice(-4).reverse().map((l, i) => ({
      id: `listing-${l.id}-${i}`,
      icon: <Package size={11} />,
      iconBg: 'bg-cyan-600',
      title: `${l.hotel_name ?? 'Hotel'} listed ${l.volume}${l.unit} ${l.waste_type}`,
      subtitle: `Min bid: RWF ${l.min_bid?.toLocaleString()}`,
      time: new Date(l.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    })),
    ...transactions.slice(-3).reverse().map((t, i) => ({
      id: `txn-${t.id}-${i}`,
      icon: <DollarSign size={11} />,
      iconBg: 'bg-cyan-600',
      title: `Payment RWF ${(t.amount ?? 0).toLocaleString()} received`,
      subtitle: `${t.from_user ?? ''} → ${t.to_user ?? ''}`,
      time: new Date(t.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }),
      badge: 'Paid',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    })),
    ...activeRoutes.slice(0, 2).map((c, i) => ({
      id: `col-${c.id}-${i}`,
      icon: <Truck size={11} />,
      iconBg: 'bg-purple-600',
      title: `Driver en-route: ${c.waste_type} pickup`,
      subtitle: `${c.volume} ${c.waste_type === 'UCO' ? 'L' : 'kg'} · ${c.scheduled_date}`,
      time: c.scheduled_time || '',
      badge: 'En Route',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    })),
  ].slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {authUser?.name || 'Admin'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform overview and system management</p>
        </div>
      </div>
      <PageHeader
        title="Platform Overview"
        subtitle={`Last synced ${lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
        icon={<BarChart3 size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary flex items-center gap-1.5 text-xs py-2">
              <RefreshCw size={13} />Refresh
            </button>
            <button
              onClick={() => downloadCSV('platform_overview', ['Metric','Value'], [
                ['Total Users', String(users.length)],
                ['Hotels', String(hotels.length)],
                ['Recyclers', String(recyclers.length)],
                ['Revenue (RWF)', String(totalRevenue)],
                ['Waste (kg)', String(totalWaste)],
              ])}
              className="btn-primary flex items-center gap-1.5 text-xs py-2"
            >
              <FileText size={13} />Export
            </button>
          </div>
        }
      />

      {pendingUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl animate-fade-up">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {pendingUsers.length} account{pendingUsers.length > 1 ? 's' : ''} awaiting verification
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 truncate mt-0.5">
              {pendingUsers.map(u => u.full_name).join(' · ')}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/admin/verification')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
          >
            <Shield size={12} />Review Queue<ArrowRight size={11} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users"     value={users.length}                               icon={<Users size={20}/>}    change={pendingUsers.length > 0 ? `+${pendingUsers.length} pending` : undefined} color="cyan"    sparkline={sparkUp}   />
        <StatCard title="Active Hotels"   value={hotels.filter(h=>h.status==='active').length} icon={<Building2 size={20}/>} change={`${hotels.length} total`}                                            color="blue"    sparkline={sparkFlat} />
        <StatCard title="Recyclers"       value={recyclers.length}                           icon={<Recycle size={20}/>}  color="cyan"   sparkline={sparkUp}   />
        <StatCard title="Active Drivers"  value={drivers.filter(d=>d.status==='active').length} icon={<Truck size={20}/>}   color="purple"    sparkline={sparkDown} />
        <StatCard title="Waste Diverted"  value={`${(totalWaste/1000).toFixed(1)}t`}          icon={<Package size={20}/>}  color="cyan"      sparkline={sparkUp}   />
        <StatCard title="CO₂ Avoided"     value={`${co2Saved.toFixed(1)}t`}                  icon={<Leaf size={20}/>}    change={`≈${Math.round(co2Saved*45)} trees`} color="cyan" sparkline={sparkUp} />
        <StatCard title="Platform Revenue" value={`RWF ${(totalRevenue/1000).toFixed(0)}K`}   icon={<DollarSign size={20}/>} change="+12%"                    color="yellow"   sparkline={sparkUp}   />
        <StatCard title="Open Listings"   value={openListings.length}                        icon={<Clock size={20}/>}    color="blue"      sparkline={sparkFlat} />
      </div>

      {/* Revenue Area + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWidget
          title="Revenue Trend (7 Days)"
          icon={<TrendingUp size={16} />}
          className="lg:col-span-2"
          action={
            <button onClick={() => navigate('/dashboard/admin/analytics')} className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              Full analytics <ArrowRight size={11}/>
            </button>
          }
        >
          <ChartComponent type="area" data={revenueAreaChart} height={230} showAvgLine yLabel="RWF" />
        </DashboardWidget>

        <DashboardWidget title="Recent Activity" icon={<Activity size={16}/>} badge={activityItems.length} action={<span className="live-dot" />}>
          <ActivityFeed items={activityItems} maxItems={6} />
        </DashboardWidget>
      </div>

      {/* Waste Bar + Collection Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardWidget title="Waste Collection (7 Days)" icon={<BarChart3 size={16}/>} className="lg:col-span-2">
          <ChartComponent type="bar" data={wasteTrendChart} height={220} yLabel="kg" />
        </DashboardWidget>

        <DashboardWidget title="Collection Status" icon={<CheckCircle size={16}/>}>
          <ChartComponent type="donut" data={collectionPieChart} height={180} />
          <div className="mt-3 space-y-2">
            {[
              { label: 'Completed', count: collections.filter(c=>c.status==='completed').length||12, status: 'completed' as const },
              { label: 'En Route',  count: activeRoutes.length||4,                                    status: 'en_route' as const },
              { label: 'Scheduled', count: collections.filter(c=>c.status==='scheduled').length||7, status: 'scheduled' as const },
            ].map(item => (
              <div key={item.status} className="flex items-center justify-between">
                <StatusBadge status={item.status} size="sm" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.count}</span>
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>

      {/* Eco Impact + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EcoImpactPanel co2Saved={co2Saved} wasteDiverted={totalWaste} waterSaved={totalWaste*3.5} energySaved={totalWaste*0.8} />
        </div>

        <DashboardWidget title="Quick Actions" icon={<Bell size={16}/>}>
          <div className="space-y-2">
            {[
              { icon: <UserPlus size={15}/>,  label: 'Add New User',                        path: '/dashboard/admin/users',         color: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/40' },
              { icon: <FileText size={15}/>,  label: 'Generate Report',                     path: '/dashboard/admin/reports',       color: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/40' },
              { icon: <Shield size={15}/>,    label: `Verification (${pendingUsers.length})`, path: '/dashboard/admin/verification', color: 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40' },
              { icon: <MapPin size={15}/>,    label: 'Route Monitor',                       path: '/dashboard/admin/route-monitor', color: 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40' },
              { icon: <BarChart3 size={15}/>, label: 'Analytics Dashboard',                 path: '/dashboard/admin/analytics',     color: 'text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
                <div className="flex items-center gap-2">{a.icon}{a.label}</div>
                <ArrowRight size={13} className="opacity-50" />
              </button>
            ))}
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
