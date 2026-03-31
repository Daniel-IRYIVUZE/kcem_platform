// components/dashboard/business/BusinessOverview.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  listingsAPI, collectionsAPI, transactionsAPI, messagesAPI, hotelsAPI,
  type WasteListing, type Collection, type Transaction, type Message
} from '../../../services/api';
import {
  Package, Trophy, Calendar,
  TrendingUp, BarChart3, Clock, PlusCircle, Leaf, Zap
} from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent, { type ChartData } from '../ChartComponent';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import EcoImpactPanel from '../../ui/EcoImpactPanel';
import ActivityFeed, { type ActivityItem } from '../../ui/ActivityFeed';
import { hotelProfile } from './_shared';
import { getDashboardDisplayName } from '../../../utils/userDisplayName';

export default function BusinessOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [listings, setListings]         = useState<WasteListing[]>([]);
  const [collections, setCollections]   = useState<Collection[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [greenScore, setGreenScore]     = useState<number>(0);

  useEffect(() => {
    Promise.all([
      listingsAPI.mine().catch(() => []),
      collectionsAPI.list({ limit: 200 } as Parameters<typeof collectionsAPI.list>[0]).catch(() => []),
      transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0]).catch(() => []),
      messagesAPI.list().catch(() => []),
      hotelsAPI.me().catch(() => null),
    ]).then(([l, c, t, m, h]) => {
      setListings(Array.isArray(l) ? l : []);
      setCollections(Array.isArray(c) ? c : []);
      setTransactions(Array.isArray(t) ? t : []);
      setMessages(Array.isArray(m) ? m : []);
      if (h) setGreenScore(h.green_score ?? 0);
    });
  }, []);

  const openListings  = listings.filter(l => l.status === 'open');
  const unreadMsgs    = messages.filter(m => !m.is_read).length;
  const activeCollect = collections.filter(c => c.status === 'scheduled' || c.status === 'en_route');
  const displayName = getDashboardDisplayName(authUser, hotelProfile.name);

  // Build Revenue Trend chart from real transaction data (last 6 months)
  const revenueTrend: ChartData = (() => {
    const monthMap: Record<string, number> = {};
    transactions.forEach(t => {
      const month = t.created_at?.slice(0, 7) ?? '';
      if (month) monthMap[month] = (monthMap[month] || 0) + (t.net_amount || 0);
    });
    const sorted = Object.keys(monthMap).sort().slice(-6);
    if (sorted.length === 0) {
      return { labels: ['Jan','Feb','Mar','Apr','May','Jun'], datasets: [{ label: 'Revenue (RWF)', data: [0,0,0,0,0,0], borderColor: '#0891b2', backgroundColor: 'rgba(8,145,178,0.15)', fill: true }] };
    }
    return {
      labels: sorted.map(m => { const d = new Date(m + '-01'); return d.toLocaleString('default', { month: 'short', year: '2-digit' }); }),
      datasets: [{ label: 'Revenue (RWF)', data: sorted.map(m => monthMap[m]), borderColor: '#0891b2', backgroundColor: 'rgba(8,145,178,0.15)', fill: true }],
    };
  })();

  // Build Waste Type Distribution from real listings
  const wasteBreakdown: ChartData = (() => {
    const typeMap: Record<string, number> = {};
    listings.forEach(l => { typeMap[l.waste_type] = (typeMap[l.waste_type] || 0) + (l.volume || 1); });
    const keys = Object.keys(typeMap);
    if (keys.length === 0) {
      return { labels: ['No data'], datasets: [{ label: 'Volume', data: [1], backgroundColor: '#e5e7eb' }] };
    }
    return {
      labels: keys,
      datasets: [{ label: 'Volume (kg)', data: keys.map(k => typeMap[k]) }],
    };
  })();

  // Build activity feed from recent listings + collections
  const activityItems: ActivityItem[] = [
    ...openListings.slice(0, 3).map(l => ({
      id: String(l.id),
      icon: <Package size={14}/>,
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      title: `${l.waste_type} listing — ${l.volume} ${l.unit}`,
      subtitle: `${l.bid_count || 0} bids · Min: RWF ${(l.min_bid||0).toLocaleString()}`,
      time: l.created_at ? new Date(l.created_at).toLocaleDateString() : '',
      badge: l.status,
      badgeColor: l.status === 'open' ? 'cyan' : 'gray',
    })),
    ...activeCollect.slice(0, 2).map(c => ({
      id: String(c.id),
      icon: <Calendar size={14}/>,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      title: `${c.waste_type} collection scheduled`,
      subtitle: `${c.scheduled_date} at ${c.scheduled_time || '—'}`,
      time: c.scheduled_date || '',
      badge: c.status,
      badgeColor: 'blue' as const,
    })),
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={`Welcome back, ${displayName}!`}
        subtitle="Here's your waste management overview"
        icon={<Leaf size={20}/>}
        badge={unreadMsgs > 0 ? `${unreadMsgs} new messages` : undefined}
        badgeColor="cyan"
        actions={
          <button onClick={() => navigate('new-listing')} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={15}/> New Listing
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Active Listings"
          value={openListings.length}
          icon={<Package size={22}/>}
          color="cyan"
          sparkline={[2, 4, 3, 5, 6, 4, 7, openListings.length]}
        />
        {/* <StatCard
          title="Total Revenue"
          value={`RWF ${(totalRevenue / 1000).toFixed(0)}K`}
          icon={<DollarSign size={22}/>}
          color="blue"
          sparkline={sparkRevenue}
        /> */}
        <StatCard
          title="Green Score"
          value={greenScore}
          icon={<Trophy size={22}/>}
          color="cyan"
          progress={greenScore}
          trend="up"
        />
        <StatCard
          title="Upcoming Collections"
          value={activeCollect.length}
          icon={<Clock size={22}/>}
          color="orange"
          sparkline={[1, 2, 1, 3, 2, 4, activeCollect.length]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Revenue Trend" icon={<TrendingUp size={18} className="text-cyan-600"/>}>
          <ChartComponent type="area" data={revenueTrend} height={260} />
        </Widget>
        <Widget title="Waste Type Distribution" icon={<BarChart3 size={18} className="text-purple-600 dark:text-purple-400"/>}>
          <ChartComponent type="donut" data={wasteBreakdown} height={260} />
        </Widget>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget
          title="Active Listings"
          icon={<Package size={18} className="text-cyan-600"/>}
          action={<button onClick={() => navigate('listings')} className="text-sm text-cyan-600 hover:underline">View All</button>}
        >
          <div className="space-y-2.5">
            {openListings.slice(0, 4).map(listing => {
              return (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer" onClick={() => navigate('listings')}>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.waste_type} — {listing.volume} {listing.unit}</p>
                    <p className="text-xs text-gray-400">{listing.bid_count || 0} bids · Top: {listing.highest_bid > 0 ? `RWF ${listing.highest_bid.toLocaleString()}` : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">RWF {(listing.min_bid||0).toLocaleString()}</p>
                    <StatusBadge status={listing.status} size="sm" dot={false} />
                  </div>
                </div>
              );
            })}
            {openListings.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No active listings yet. <button onClick={() => navigate('new-listing')} className="text-cyan-600 hover:underline">Create one →</button></p>
            )}
          </div>
        </Widget>

        <Widget
          title="Upcoming Collections"
          icon={<Calendar size={18} className="text-blue-600 dark:text-blue-400"/>}
          action={<button onClick={() => navigate('schedule')} className="text-sm text-cyan-600 hover:underline">View Schedule</button>}
        >
          <div className="space-y-2.5">
            {activeCollect.slice(0, 4).map(col => (
              <div key={col.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{col.waste_type} — {col.volume} {col.waste_type === 'UCO' ? 'L' : 'kg'}</p>
                  <p className="text-xs text-gray-400">{col.scheduled_date} at {col.scheduled_time || '—'}</p>
                </div>
                <StatusBadge status={col.status} size="sm" dot />
              </div>
            ))}
            {activeCollect.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No upcoming collections scheduled</p>
            )}
          </div>
        </Widget>
      </div>

      {/* Recent Messages */}
      {/* <Widget
        title="Recent Messages"
        icon={<MessageSquare size={18} className="text-cyan-600 dark:text-cyan-400"/>}
        badge={unreadMsgs > 0 ? `${unreadMsgs} new` : undefined}
        badgeColor="cyan"
        action={<button onClick={() => navigate('messages')} className="text-sm text-cyan-600 hover:underline">View All</button>}
      >
        <div className="space-y-2">
          {messages.slice(0, 3).map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!msg.is_read ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>
              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!msg.is_read ? 'bg-cyan-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{msg.from_name}</p>
                  <span className="text-xs text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-400 truncate">{msg.body}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No messages yet</p>}
        </div>
      </Widget> */}

      {/* Activity + Eco Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Recent Activity" icon={<Zap size={18} className="text-yellow-500"/>}>
          <ActivityFeed items={activityItems} emptyText="No recent activity" />
        </Widget>
        <EcoImpactPanel
          co2Saved={collections.reduce((s, c) => s + Number(c.volume ?? 0) * 0.5, 0) / 1000}
          wasteDiverted={collections.reduce((s, c) => s + Number(c.volume ?? 0), 0)}
          waterSaved={collections.reduce((s, c) => s + Number(c.volume ?? 0) * 3.5, 0)}
          energySaved={collections.reduce((s, c) => s + Number(c.volume ?? 0) * 0.8, 0)}
        />
      </div>
    </div>
  );
}
