import { useState, useEffect, useCallback, useRef } from 'react';
import type { Bid } from '../../../services/api';
import { Eye, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { bidsAPI } from '../../../services/api';

export default function RecyclerBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);
  const [reviseBidId, setReviseBidId] = useState<number | null>(null);
  const [reviseAmount, setReviseAmount] = useState('');
  const [revising, setRevising] = useState(false);
  const reviseInputRef = useRef<HTMLInputElement>(null);

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

  const setMsg = (msg: string, ok = true) => {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 3000);
  };

  const handleWithdrawBid = async (bidId: number) => {
    try {
      await bidsAPI.withdraw(bidId);
      setBids(prev => prev.filter(b => b.id !== bidId));
      setMsg('Bid withdrawn successfully.');
    } catch { setMsg('Failed to withdraw bid.', false); }
  };

  const openRevise = (bid: Bid) => {
    setReviseBidId(bid.id);
    setReviseAmount(String(bid.amount ?? ''));
    setTimeout(() => reviseInputRef.current?.focus(), 100);
  };

  const handleReviseBid = async () => {
    const newAmount = parseFloat(reviseAmount.replace(/,/g, ''));
    if (!reviseBidId || isNaN(newAmount) || newAmount <= 0) return;
    setRevising(true);
    try {
      const updated = await bidsAPI.increase(reviseBidId, newAmount);
      setBids(prev => prev.map(b => b.id === reviseBidId ? { ...b, amount: updated.amount } : b));
      setReviseBidId(null);
      setMsg('Bid revised successfully.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to revise bid.';
      setMsg(msg, false);
    } finally { setRevising(false); }
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
        <div className={`px-4 py-2 rounded-lg text-sm border ${flash.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>{flash.msg}</div>
      )}

      {/* Revise Bid Modal */}
      {reviseBidId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Revise Bid</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter your new bid amount</p>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">RWF</span>
              <input
                ref={reviseInputRef}
                type="number"
                value={reviseAmount}
                onChange={e => setReviseAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReviseBid()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviseBidId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleReviseBid} disabled={revising}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-60">
                {revising ? 'Saving…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
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
                  <div className="flex gap-1.5">
                    <button onClick={() => { const b = bids.find(x => x.id === r._bidId); if (b) openRevise(b); }}
                      className="px-2.5 py-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded hover:bg-cyan-100 font-medium">
                      Revise
                    </button>
                    <button onClick={() => handleWithdrawBid(r._bidId)}
                      className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 font-medium">
                      Withdraw
                    </button>
                  </div>
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
