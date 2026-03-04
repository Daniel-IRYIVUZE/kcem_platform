// components/dashboard/business/BusinessOverview.tsx
import { useNavigate } from 'react-router-dom';
import { getAll } from '../../../utils/dataStore';
import type { WasteListing, Collection, Transaction, Message } from '../../../utils/dataStore';
import {
  Package, DollarSign, Trophy, Calendar,
  MessageSquare, TrendingUp, BarChart3, Clock, PlusCircle
} from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { StatusBadge, hotelProfile, revenueTrend, wasteBreakdown } from './_shared';

export default function BusinessOverview() {
  const navigate = useNavigate();
  const liveListings = getAll<WasteListing>('listings');
  const collections = getAll<Collection>('collections');
  const transactions = getAll<Transaction>('transactions');
  const msgs = getAll<Message>('messages').filter(m => !m.read).length;
  return (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Mille Collines!</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here's your waste management overview</p></div>
      <button onClick={() => navigate('new-listing')} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><PlusCircle size={16} /> New Listing</button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Active Listings" value={liveListings.filter(l=>l.status==='open').length} icon={<Package size={24} />} color="cyan" change="+3" />
      <StatCard title="Total Revenue" value={`RWF ${(transactions.reduce((s,t)=>s+t.amount,0)/1000).toFixed(0)}K`} icon={<DollarSign size={24} />} color="blue" change="+12%" />
      <StatCard title="Green Score" value={hotelProfile.greenScore} icon={<Trophy size={24} />} color="purple" progress={hotelProfile.greenScore} change="+5" />
      <StatCard title="Collections" value={collections.filter(c=>c.status==='scheduled'||c.status==='en-route').length} icon={<Clock size={24} />} color="orange" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Widget title="Revenue Trend" icon={<TrendingUp size={20} className="text-cyan-600" />}>
        <ChartComponent type="line" data={revenueTrend} height={260} />
      </Widget>
      <Widget title="Waste Type Distribution" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}>
        <ChartComponent type="pie" data={wasteBreakdown} height={260} />
      </Widget>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Widget title="Active Listings" icon={<Package size={20} className="text-cyan-600" />} action={<button onClick={()=>navigate('listings')} className="text-sm text-cyan-600 hover:underline">View All</button>}>
        <div className="space-y-3">
          {liveListings.filter(l => l.status === 'open').slice(0, 4).map(listing => (
            <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium">{listing.wasteType} — {listing.volume} {listing.unit}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{listing.bids.length} bids · Top: {listing.bids.sort((a,b)=>b.amount-a.amount)[0]?.amount.toLocaleString() || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-cyan-600">RWF {listing.minBid.toLocaleString()}</p>
                <StatusBadge status={listing.status} />
              </div>
            </div>
          ))}
          {liveListings.filter(l => l.status === 'open').length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No active listings yet</p>}
        </div>
      </Widget>
      <Widget title="Upcoming Collections" icon={<Calendar size={20} className="text-blue-600 dark:text-blue-400" />} action={<button onClick={()=>navigate('schedule')} className="text-sm text-cyan-600 hover:underline">View Schedule</button>}>
        <div className="space-y-3">
          {collections.filter(c => c.status !== 'completed').slice(0, 4).map(col => (
            <div key={col.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium">{col.wasteType} — {col.volume} {col.wasteType==='UCO'?'L':'kg'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{col.scheduledDate} at {col.scheduledTime}</p>
              </div>
              <StatusBadge status={col.status} />
            </div>
          ))}
          {collections.filter(c => c.status !== 'completed').length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No upcoming collections</p>
          )}
        </div>
      </Widget>
    </div>

    <Widget title="Recent Messages" icon={<MessageSquare size={20} className="text-green-600 dark:text-green-400" />} action={<button onClick={()=>navigate('messages')} className="text-sm text-cyan-600 hover:underline">{msgs > 0 ? `${msgs} new` : 'View All'}</button>}>
      <div className="space-y-2">
        {getAll<Message>('messages').slice(0, 3).map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-lg ${!msg.read ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900'}`}>
            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!msg.read ? 'bg-cyan-500' : 'bg-transparent'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between"><p className="text-sm font-medium">{msg.fromName}</p><span className="text-xs text-gray-400 dark:text-gray-500">{new Date(msg.date).toLocaleDateString()}</span></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{msg.subject}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.body}</p>
            </div>
          </div>
        ))}
        {getAll<Message>('messages').length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No messages yet</p>}
      </div>
    </Widget>
  </div>
  );
}
