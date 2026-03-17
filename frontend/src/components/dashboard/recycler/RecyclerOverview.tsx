import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  recyclersAPI, bidsAPI, listingsAPI, transactionsAPI, collectionsAPI, inventoryAPI, driversAPI,
} from '../../../services/api';
import type {
  Bid, RecyclerProfile, WasteListing, Transaction, Collection, InventoryItem, DriverProfile,
} from '../../../services/api';
import { Truck, Eye, DollarSign, Trophy, TrendingUp, BarChart3, ShoppingCart, Warehouse, Leaf, Activity, Zap } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import EcoImpactPanel from '../../ui/EcoImpactPanel';
import BidTicker, { type TickerItem } from '../../ui/BidTicker';
import ActivityFeed, { type ActivityItem } from '../../ui/ActivityFeed';
import { companyProfile, computeGreenScore } from './_shared';
import AutoAssignPanel from './AutoAssignPanel';
import { getDashboardDisplayName } from '../../../utils/userDisplayName';

export default function RecyclerOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [recyclerProfile, setRecyclerProfile] = useState<RecyclerProfile | null>(null);
  const [liveBids, setLiveBids] = useState<(Bid & { hotel: string; type: string; quantity: string; myBid: string })[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);

  const load = useCallback(() => {
    Promise.all([
      bidsAPI.mine({ limit: 50 }).catch(() => [] as Bid[]),
      listingsAPI.list({ status: 'open', limit: 200 }).catch(() => [] as WasteListing[]),
    ]).then(([allBids, listings]) => {
      const active = allBids.filter(b => b.status === 'active').slice(0, 6).map(b => {
        const l = listings.find(ls => ls.id === b.listing_id);
        return { ...b, hotel: l?.hotel_name || `Listing #${b.listing_id}`, type: l?.waste_type || '—', quantity: l ? `${l.volume} ${l.unit}` : '—', myBid: `RWF ${(b.amount ?? 0).toLocaleString()}` };
      });
      setLiveBids(active);
    });

    recyclersAPI.me().then(setRecyclerProfile).catch(() => {});
    transactionsAPI.mine({ limit: 200 }).then(setTransactions).catch(() => {});
    collectionsAPI.list({ limit: 200 }).then(setCollections).catch(() => {});
    inventoryAPI.mine().then(setInventoryItems).catch(() => {});
    driversAPI.list({ limit: 50 }).then(setDrivers).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const liveActiveBids = liveBids.filter(b => b.status === 'active').length;
  const liveFleetSize = drivers.length;
  const completedCollections = collections.filter(c => c.status === 'completed');
  const completedKg = completedCollections.reduce((s, c) => s + (c.actual_volume ?? c.volume ?? 0), 0);
  const liveGreenScore = computeGreenScore(recyclerProfile?.green_score, completedKg, completedCollections.length);

  // Monthly revenue: sum of net_amount for completed transactions in the current month
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(t => {
        if (t.status !== 'completed') return false;
        const d = new Date(t.created_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, t) => sum + (t.net_amount ?? 0), 0);
  }, [transactions]);

  // Total collected volume across all completed collections
  const totalCollected = useMemo(
    () => collections
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.actual_volume ?? c.volume ?? 0), 0),
    [collections],
  );

  // CO2 factors per waste type (kg CO2 per kg waste)
  const CO2_FACTORS: Record<string, number> = {
    UCO: 2.85, Glass: 0.26, 'Paper/Cardboard': 0.91, Plastic: 1.53,
    Metal: 1.80, Organic: 0.50, Electronic: 2.00, Textile: 3.60, Mixed: 0.80, Other: 0.50,
  };

  // CO2 saved from actual waste types collected
  const co2SavedKg = useMemo(() => {
    return collections
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => {
        const factor = CO2_FACTORS[c.waste_type ?? 'Other'] ?? 0.5;
        return sum + factor * (c.actual_volume ?? c.volume ?? 0);
      }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  // Use recycler profile's totals if non-zero (populated by backend after fix), else computed
  const effectiveTotalKg = (recyclerProfile?.total_collected && recyclerProfile.total_collected > 0)
    ? recyclerProfile.total_collected
    : totalCollected;
  const effectiveCo2Kg = co2SavedKg > 0 ? co2SavedKg : effectiveTotalKg * 0.5;

  // ── Revenue Trend (last 6 months) ─────────────────────────────────────────
  const revenueTrend = useMemo(() => {
    const months: string[] = [];
    const totals: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
      const total = transactions
        .filter(t => {
          if (t.status !== 'completed') return false;
          const td = new Date(t.created_at);
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        })
        .reduce((sum, t) => sum + (t.net_amount ?? 0), 0);
      totals.push(total);
    }
    return {
      labels: months,
      datasets: [{ label: 'Revenue (RWF)', data: totals, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)', fill: true }],
    };
  }, [transactions]);

  // ── Collections by Waste Type ─────────────────────────────────────────────
  const collectionsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    collections.forEach(c => {
      const t = c.waste_type || 'Other';
      counts[t] = (counts[t] ?? 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);
    return {
      labels,
      datasets: labels.length > 0 ? [{ label: 'Collections', data }] : [],
    };
  }, [collections]);

  // ── Ticker items from live bids ───────────────────────────────────────────
  const tickerItems: TickerItem[] = liveBids.map(b => ({
    id: String(b.id),
    recycler: b.hotel,
    wasteType: b.type,
    amount: b.amount,
    time: new Date(b.created_at || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }));

  // ── Activity feed: drivers + inventory ───────────────────────────────────
  const activityItems: ActivityItem[] = [
    ...drivers.slice(0, 5).map(d => ({
      id: String(d.id),
      icon: <Truck size={14}/>,
      iconBg: d.status === 'on_route' ? 'bg-cyan-100 dark:bg-cyan-900/30' : d.status === 'available' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700',
      title: d.name ?? `Driver #${d.id}`,
      subtitle: `${d.vehicle_type ?? 'Vehicle'} · ${d.plate_number ?? '—'} · ${d.total_trips} trips`,
      time: d.status.replace(/_/g, ' '),
      badge: d.status,
      badgeColor: d.status === 'on_route' ? 'cyan' : d.status === 'available' ? 'green' : 'gray',
    })),
    ...inventoryItems.map(inv => {
      const utilPct = inv.capacity > 0 ? Math.round((inv.current_stock / inv.capacity) * 100) : 0;
      return {
        id: String(inv.id),
        icon: <Warehouse size={14}/>,
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        title: `${inv.material_type} inventory`,
        subtitle: `${inv.current_stock} / ${inv.capacity} ${inv.unit} · ${utilPct}% utilization`,
        time: new Date(inv.last_updated).toLocaleDateString(),
        badge: utilPct < 30 ? 'low' : utilPct > 80 ? 'high' : 'normal',
        badgeColor: utilPct < 30 ? 'gray' : utilPct > 80 ? 'yellow' : 'cyan',
      };
    }),
  ];

  const sparkRevenue = useMemo(
    () => revenueTrend.datasets[0]?.data.length ? revenueTrend.datasets[0].data : [0, 0, 0, 0, 0, 0],
    [revenueTrend],
  );
  const displayName = getDashboardDisplayName(authUser, recyclerProfile?.company_name || companyProfile.name);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={`Welcome, ${displayName}!`}
        subtitle={`${recyclerProfile?.city ?? recyclerProfile?.address ?? companyProfile.location} · Fleet of ${liveFleetSize} vehicles`}
        icon={<Leaf size={20}/>}
        badge={liveBids.length > 0 ? `${liveBids.length} active bids` : undefined}
        badgeColor="cyan"
        actions={
          <button onClick={() => navigate('/marketplace')} className="btn-primary flex items-center gap-2 text-sm">
            <ShoppingCart size={15}/> Browse Marketplace
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Size"
          value={liveFleetSize}
          icon={<Truck size={22}/>}
          color="cyan"
          subtitle={`${drivers.filter(d => d.status === 'on_route' || d.status === 'available').length} active`}
          sparkline={[1, 2, 2, 2, 2, 2, 2]}
        />
        <StatCard
          title="Active Bids"
          value={liveActiveBids}
          icon={<Eye size={22}/>}
          color="blue"
          change="+3"
          trend="up"
          sparkline={[1, 2, 3, 2, 4, 3, liveActiveBids]}
        />
        <StatCard
          title="Monthly Revenue"
          value={monthlyRevenue > 0 ? `RWF ${(monthlyRevenue / 1000).toFixed(0)}K` : 'RWF 0'}
          icon={<DollarSign size={22}/>}
          color="cyan"
          change="+12%"
          trend="up"
          sparkline={sparkRevenue}
        />
        <StatCard
          title="Green Score"
          value={liveGreenScore}
          icon={<Trophy size={22}/>}
          color="orange"
          progress={liveGreenScore}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Revenue Trend" icon={<TrendingUp size={18} className="text-cyan-600"/>}>
          <ChartComponent type="area" data={revenueTrend} height={260} />
        </Widget>
        <Widget title="Collections by Type" icon={<BarChart3 size={18} className="text-purple-600 dark:text-purple-400"/>}>
          <ChartComponent type="donut" data={collectionsByType} height={260} />
        </Widget>
      </div>

      {/* Live Bids + Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget
          title="Live Bid Activity"
          icon={<Activity size={18} className="text-cyan-600"/>}
          badge={liveBids.length > 0 ? 'LIVE' : undefined}
          badgeColor="cyan"
          action={<button onClick={() => navigate('bids')} className="text-sm text-cyan-600 hover:underline">View All</button>}
        >
          {tickerItems.length > 0 ? (
            <BidTicker items={tickerItems} />
          ) : (
            <div className="space-y-2.5">
              {liveBids.length > 0 ? liveBids.map(bid => (
                <div key={bid.id} className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{bid.hotel} — {bid.type}</p>
                    <p className="text-xs text-gray-400">{bid.quantity} · My bid: {bid.myBid}</p>
                  </div>
                  <StatusBadge status={bid.status} size="sm" dot />
                </div>
              )) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No active bids. <button onClick={() => navigate('/marketplace')} className="text-cyan-600 hover:underline">Browse marketplace →</button></p>
              )}
            </div>
          )}
        </Widget>

        <Widget
          title="Fleet Status"
          icon={<Truck size={18} className="text-blue-600 dark:text-blue-400"/>}
          action={<button onClick={() => navigate('fleet')} className="text-sm text-cyan-600 hover:underline">Manage Fleet</button>}
        >
          <div className="space-y-2.5">
            {drivers.length > 0 ? drivers.slice(0, 5).map(driver => (
              <div key={driver.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck size={14} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{driver.name ?? `Driver #${driver.id}`} — {driver.plate_number ?? '—'}</p>
                  <p className="text-xs text-gray-400 truncate">{driver.vehicle_type ?? 'Vehicle'} · {driver.total_trips} trips · Rating {driver.rating.toFixed(1)}</p>
                </div>
                <StatusBadge status={driver.status.replace(/_/g, ' ')} size="sm" dot />
              </div>
            )) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No drivers assigned yet.</p>
            )}
          </div>
        </Widget>
      </div>

      {/* Auto-Assignment: nearest driver per waste location */}
      <AutoAssignPanel onApplied={load} />

      {/* Activity Feed + Eco Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Fleet & Inventory Status" icon={<Zap size={18} className="text-yellow-500"/>}>
          <ActivityFeed items={activityItems} />
        </Widget>
        <EcoImpactPanel
          co2Saved={effectiveCo2Kg / 1000}
          wasteDiverted={effectiveTotalKg}
          waterSaved={effectiveTotalKg * 3.5}
          energySaved={effectiveTotalKg * 0.8}
        />
      </div>
    </div>
  );
}

