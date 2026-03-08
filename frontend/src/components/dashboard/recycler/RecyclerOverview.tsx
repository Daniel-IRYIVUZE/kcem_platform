import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { recyclersAPI, bidsAPI, listingsAPI } from '../../../services/api';
import type { Bid, RecyclerProfile, WasteListing } from '../../../services/api';
import { Truck, Eye, DollarSign, Trophy, TrendingUp, BarChart3, ShoppingCart, Warehouse, Leaf, Activity, Zap } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import EcoImpactPanel from '../../ui/EcoImpactPanel';
import BidTicker, { type TickerItem } from '../../ui/BidTicker';
import ActivityFeed, { type ActivityItem } from '../../ui/ActivityFeed';
import { companyProfile, fleetData, inventoryData, revenueTrend, collectionsByType } from './_shared';

export default function RecyclerOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [recyclerProfile, setRecyclerProfile] = useState<RecyclerProfile | null>(null);
  const [liveBids, setLiveBids] = useState<(Bid & { hotel: string; type: string; quantity: string; myBid: string })[]>([]);

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
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    recyclersAPI.me().then(setRecyclerProfile).catch(() => {});
  }, []);

  const liveActiveBids = liveBids.filter(b => b.status === 'active').length;
  const liveFleetSize = recyclerProfile?.fleet_size ?? companyProfile.fleetSize;
  const liveGreenScore = recyclerProfile?.green_score ?? companyProfile.greenScore;

  // Build ticker items from live bids
  const tickerItems: TickerItem[] = liveBids.map(b => ({
    id: String(b.id),
    recycler: b.hotel,
    wasteType: b.type,
    amount: b.amount,
    time: new Date(b.created_at || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }));

  // Activity feed items from fleet
  const activityItems: ActivityItem[] = [
    ...fleetData.map(v => ({
      id: String(v.id),
      icon: <Truck size={14}/>,
      iconBg: v.status === 'active' ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'bg-gray-100 dark:bg-gray-700',
      title: `${v.vehicle} — ${v.plate}`,
      subtitle: `Driver: ${v.driver} · Route: ${v.currentRoute}`,
      time: 'Active',
      badge: v.status,
      badgeColor: v.status === 'active' ? 'cyan' : 'gray',
    })),
    ...inventoryData.map(inv => ({
      id: String(inv.id),
      icon: <Warehouse size={14}/>,
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      title: `${inv.type} inventory`,
      subtitle: `${inv.currentStock} / ${inv.capacity} · ${inv.utilization}% utilization`,
      time: inv.lastUpdated,
      badge: inv.utilization < 30 ? 'low' : inv.utilization > 80 ? 'high' : 'normal',
      badgeColor: inv.utilization < 30 ? 'gray' : inv.utilization > 80 ? 'yellow' : 'cyan',
    })),
  ];

  const sparkRevenue = [5, 8, 10, 12, 15, 17, 18, 20, 22, 19, 24, 28];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={`Welcome, ${authUser?.name || companyProfile.name}!`}
        subtitle={`${companyProfile.location} · Fleet of ${companyProfile.fleetSize} vehicles`}
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
          subtitle={`${fleetData.filter(f => f.status === 'active').length} active`}
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
          value={`RWF ${(companyProfile.monthlyRevenue / 1000).toFixed(0)}K`}
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
            {fleetData.map(vehicle => (
              <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck size={14} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{vehicle.vehicle} — {vehicle.plate}</p>
                  <p className="text-xs text-gray-400 truncate">{vehicle.driver} · Route: {vehicle.currentRoute}</p>
                </div>
                <StatusBadge status={vehicle.status} size="sm" dot />
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* Activity Feed + Eco Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Fleet & Inventory Status" icon={<Zap size={18} className="text-yellow-500"/>}>
          <ActivityFeed items={activityItems} />
        </Widget>
        <EcoImpactPanel
          co2Saved={companyProfile.totalCollected * 0.5 / 1000}
          wasteDiverted={companyProfile.totalCollected}
          waterSaved={companyProfile.totalCollected * 3.5}
          energySaved={companyProfile.totalCollected * 0.8}
        />
      </div>
    </div>
  );
}

