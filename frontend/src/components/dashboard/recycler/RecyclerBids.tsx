import { useState, useEffect, useCallback } from 'react';
import { getAll, update as dsUpdate } from '../../../utils/dataStore';
import type { WasteListing, Bid } from '../../../utils/dataStore';
import { Eye, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function RecyclerBids() {
  const [allListings, setAllListings] = useState<WasteListing[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIncrease, setShowIncrease] = useState<{ listingId: string; bidId: string; minBid: number } | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => setAllListings(getAll<WasteListing>('listings')), []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const myBids: (Bid & { listing: WasteListing })[] = allListings.flatMap(l =>
    l.bids.filter(b => b.recyclerId === 'recycler-green-energy').map(b => ({ ...b, listing: l }))
  );
  const filtered = statusFilter === 'all' ? myBids : myBids.filter(b => b.status === statusFilter);

  const handleIncreaseBid = () => {
    if (!showIncrease || !newAmount) return;
    const amount = parseInt(newAmount);
    if (isNaN(amount) || amount < showIncrease.minBid) return;
    const listing = allListings.find(l => l.id === showIncrease.listingId);
    if (!listing) return;
    const updatedBids = listing.bids.map(b => b.id === showIncrease.bidId ? { ...b, amount, status: 'active' as const } : b);
    dsUpdate<WasteListing>('listings', listing.id, { bids: updatedBids });
    setFlash(`Bid increased to RWF ${amount.toLocaleString()}`);
    setTimeout(() => setFlash(null), 3000);
    setShowIncrease(null); setNewAmount('');
  };

  const displayData = filtered.map(b => ({
    id: b.id, hotel: b.listing.hotelName, type: b.listing.wasteType,
    quantity: `${b.listing.volume} ${b.listing.unit}`,
    myBid: `RWF ${b.amount.toLocaleString()}`,
    topBid: (() => { const sorted = [...b.listing.bids].sort((a, x) => x.amount - a.amount); return sorted[0] ? `RWF ${sorted[0].amount.toLocaleString()}` : '—'; })(),
    status: b.status, bidDate: new Date(b.createdAt).toLocaleDateString(), _bid: b,
  }));

  return (
    <div className="space-y-6">
      {flash && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 px-4 py-2 rounded-lg text-sm">{flash}</div>}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bids</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Bids" value={myBids.length} icon={<Eye size={22} />} color="cyan" />
        <StatCard title="Active" value={myBids.filter(b => b.status === 'active').length} icon={<TrendingUp size={22} />} color="blue" />
        <StatCard title="Won" value={myBids.filter(b => b.status === 'won').length} icon={<CheckCircle size={22} />} color="purple" />
        <StatCard title="Lost" value={myBids.filter(b => b.status === 'lost').length} icon={<AlertTriangle size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option><option value="active">Active</option><option value="won">Won</option><option value="lost">Lost</option>
          </select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Bid', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'hotel', label: 'Hotel' },
            { key: 'type', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'quantity', label: 'Quantity' },
            { key: 'myBid', label: 'My Bid', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'topBid', label: 'Top Bid', render: (v: string) => <span className="font-semibold text-cyan-600">{v}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'bidDate', label: 'Date' },
            { key: 'id', label: 'Action', render: (_v: string, r: typeof displayData[0]) => r._bid.status === 'active' ? (
              <button onClick={() => { setShowIncrease({ listingId: r._bid.listingId, bidId: r._bid.id, minBid: r._bid.amount + 1000 }); setNewAmount(''); }} className="px-3 py-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded hover:bg-cyan-100 font-medium">Increase</button>
            ) : null },
          ]}
          data={displayData}
          pageSize={6}
        />
        {myBids.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No bids placed yet.</p>}
      </div>
      {showIncrease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowIncrease(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Increase Bid</h2>
            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} min={showIncrease.minBid} placeholder={`Min: ${showIncrease.minBid.toLocaleString()}`} className="w-full px-3 py-2 border rounded-lg text-sm mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowIncrease(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleIncreaseBid} disabled={!newAmount} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
