import { useState, useEffect, useCallback } from 'react';
import { bidsAPI, listingsAPI, type WasteListing } from '../../../services/api';
import { Search, X } from 'lucide-react';
import DataTable from '../DataTable';

export default function RecyclerAvailableWaste() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidFormMessage, setBidFormMessage] = useState<string | null>(null);
  const [bidFormMessageType, setBidFormMessageType] = useState<'success' | 'error'>('error');
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [activeBidListingIds, setActiveBidListingIds] = useState<Set<number>>(new Set());
  const [activeBidByListingId, setActiveBidByListingId] = useState<Map<number, number>>(new Map());
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [withdrawingListingId, setWithdrawingListingId] = useState<number | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageMessageType, setPageMessageType] = useState<'success' | 'error'>('success');

  const load = useCallback(async () => {
    try {
      const [openListings, myBids] = await Promise.all([
        listingsAPI.list({ status: 'open', limit: 100 }),
        bidsAPI.mine({ limit: 200 }),
      ]);
      setListings(openListings);
      const activeBids = myBids.filter((b) => b.status === 'active');
      setActiveBidListingIds(new Set(activeBids.map((b) => b.listing_id)));
      setActiveBidByListingId(new Map(activeBids.map((b) => [b.listing_id, b.id])));
    } catch {
      // Fallback: still show listings even if bid history fails to load.
      try {
        setListings(await listingsAPI.list({ status: 'open', limit: 100 }));
      } catch {}
      setActiveBidListingIds(new Set());
      setActiveBidByListingId(new Map());
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = listings.filter(l => {
    const matchSearch = (l.hotel_name || '').toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search);
    const matchType = typeFilter === 'all' || l.waste_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSubmitBid = async () => {
    if (!selectedListing || !bidAmount) return;
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) return;
    setBidFormMessage(null);
    try {
      await listingsAPI.placeBid(selectedListing.id, { amount, note: '' });
      setBidFormMessageType('success');
      setBidFormMessage(`Bid of RWF ${amount.toLocaleString()} submitted successfully.`);
      setTimeout(() => {
        setShowBidModal(false);
        setBidFormMessage(null);
      }, 1200);
      await load();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to submit bid. Please try again.';
      setBidFormMessageType('error');
      if (msg.toLowerCase().includes('already have an active bid')) {
        setBidFormMessage('You already placed a bid on this listing. Open My Bids to increase or withdraw it.');
      } else {
        setBidFormMessage(msg);
      }
    }
  };

  const handleWithdrawBid = async (listingId: number) => {
    const bidId = activeBidByListingId.get(listingId);
    if (!bidId) return;
    setWithdrawingListingId(listingId);
    setPageMessage(null);
    try {
      await bidsAPI.withdraw(bidId);
      setPageMessageType('success');
      setPageMessage('Bid withdrawn successfully.');
      await load();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to withdraw bid.';
      setPageMessageType('error');
      setPageMessage(msg);
    } finally {
      setWithdrawingListingId(null);
    }
  };

  const displayData = filtered.map(l => ({
    id: l.id, hotel: l.hotel_name, type: l.waste_type,
    quantity: `${l.volume} ${l.unit}`,
    askPrice: `RWF ${(l.min_bid ?? 0).toLocaleString()}`,
    distance: 'Kigali', bids: l.bid_count || 0,
    pickupDate: new Date(l.created_at).toLocaleDateString(), _raw: l,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Waste</h1>
        <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">{listings.length} listings available</span>
      </div>
      {pageMessage && (
        <div className={`px-4 py-2 rounded-lg border text-sm ${
          pageMessageType === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {pageMessage}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All Types</option><option value="UCO">UCO</option><option value="Glass">Glass</option><option value="Paper/Cardboard">Paper/Cardboard</option><option value="Mixed">Mixed</option></select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Listing', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'hotel', label: 'Hotel' },
            { key: 'type', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'quantity', label: 'Volume' },
            { key: 'askPrice', label: 'Min Bid', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'distance', label: 'Location', render: (v: string) => <span className="text-sm">📍 {v}</span> },
            { key: 'bids', label: 'Bids', render: (v: number) => <span className={`font-semibold ${v > 0 ? 'text-cyan-600' : 'text-gray-400 dark:text-gray-500'}`}>{v}</span> },
            { key: 'pickupDate', label: 'Expires' },
            { key: 'id', label: 'Action', render: (_v: string, r: typeof displayData[0]) => (
              activeBidListingIds.has(r._raw.id)
                ? <button
                    onClick={() => handleWithdrawBid(r._raw.id)}
                    disabled={withdrawingListingId === r._raw.id}
                    className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/35 font-medium disabled:opacity-60"
                  >
                    {withdrawingListingId === r._raw.id ? 'Withdrawing…' : 'Withdraw Bid'}
                  </button>
                : <button onClick={() => { setSelectedListing(r._raw); setBidAmount(''); setBidFormMessage(null); setShowBidModal(true); }} className="px-3 py-1.5 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 font-medium">Place Bid</button>
            )},
          ]}
          data={displayData}
          pageSize={6}
        />
        {listings.length === 0 && <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">No open listings available.</p>}
      </div>
      {showBidModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowBidModal(false); setBidFormMessage(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Place Bid</h2><button onClick={() => { setShowBidModal(false); setBidFormMessage(null); }} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button></div>
            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Hotel</p><p className="font-medium text-gray-900 dark:text-white">{selectedListing.hotel_name}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Type</p><p className="font-medium text-gray-900 dark:text-white">{selectedListing.waste_type}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Volume</p><p className="font-medium text-gray-900 dark:text-white">{selectedListing.volume} {selectedListing.unit}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Min Bid</p><p className="font-semibold text-cyan-600">RWF {(selectedListing.min_bid ?? 0).toLocaleString()}</p></div>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Bid Amount (RWF)</label><input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} min={selectedListing.min_bid ?? 0} placeholder={`Min: ${(selectedListing.min_bid ?? 0).toLocaleString()}`} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" /></div>
              {bidFormMessage && (
                <div className={`text-sm px-3 py-2 rounded-lg border ${
                  bidFormMessageType === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}>
                  {bidFormMessage}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowBidModal(false)} className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSubmitBid} disabled={!bidAmount} className="flex-1 px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">Submit Bid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
