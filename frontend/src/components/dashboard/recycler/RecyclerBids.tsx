import { useState, useEffect, useCallback } from 'react';
import type { Bid } from '../../../services/api';
import { Eye, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { bidsAPI } from '../../../services/api';

export default function RecyclerBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bidsAPI.mine({ limit: 100 });
      setBids(data);
    } catch { /* offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = statusFilter === 'all' ? bids : bids.filter(b => b.status === statusFilter);

  const handleWithdrawBid = async (bidId: number) => {
    try {
      await bidsAPI.withdraw(bidId);
      setBids(prev => prev.filter(b => b.id !== bidId));
      setFlash('Bid withdrawn successfully.');
    } catch { setFlash('Failed to withdraw bid.'); }
    setTimeout(() => setFlash(null), 3000);
  };

  const total = bids.length;
  const active = bids.filter(b => b.status === 'active').length;
  const won = bids.filter(b => b.status === 'won' || b.status === 'accepted').length;
  const lost = bids.filter(b => b.status === 'lost' || b.status === 'rejected').length;

  const displayData = filtered.map(b => ({
    id: b.id,
    hotel: b.hotel_name || `Listing #${b.listing_id}`,
    type: b.waste_type || '—',
    quantity: b.volume && b.unit ? `${b.volume} ${b.unit}` : '—',
    myBid: `RWF ${(b.amount ?? 0).toLocaleString()}`,
    status: b.status,
    bidDate: new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    _bidId: b.id,
    _status: b.status,
  }));

  const statusColors: Record<string, string> = {
    active:    'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
    accepted:  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    won:       'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    rejected:  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    lost:      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    withdrawn: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="space-y-6">
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm">{flash}</div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bids</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Bids"  value={total}  icon={<Eye size={22} />}            color="cyan"   />
        <StatCard title="Active"      value={active} icon={<TrendingUp size={22} />}     color="blue"   />
        <StatCard title="Won"         value={won}    icon={<CheckCircle size={22} />}    color="purple" />
        <StatCard title="Lost"        value={lost}   icon={<AlertTriangle size={22} />}  color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="accepted">Won/Accepted</option>
            <option value="rejected">Lost/Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading bids…</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'id',       label: 'Bid #',    render: (v: number) => <span className="font-mono text-sm text-gray-600 dark:text-gray-400">#{v}</span> },
              { key: 'hotel',    label: 'Hotel',    render: (v: string) => <span className="font-medium">{v}</span> },
              { key: 'type',     label: 'Type',     render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
              { key: 'quantity', label: 'Quantity' },
              { key: 'myBid',    label: 'My Bid',   render: (v: string) => <span className="font-semibold">{v}</span> },
              { key: 'status',   label: 'Status',   render: (v: string) => (
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[v] || 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>{v}</span>
              )},
              { key: 'bidDate',  label: 'Date' },
              { key: '_bidId',   label: 'Action',   render: (_v: number, r: typeof displayData[0]) =>
                r._status === 'active' ? (
                  <button onClick={() => handleWithdrawBid(r._bidId)}
                    className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 font-medium">
                    Withdraw
                  </button>
                ) : null
              },
            ]}
            data={displayData}
            pageSize={8}
          />
        )}
        {!loading && bids.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No bids yet. Browse the marketplace to start bidding.</p>
        )}
      </div>
    </div>
  );
}
