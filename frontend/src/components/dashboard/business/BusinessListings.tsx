// components/dashboard/business/BusinessListings.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, type WasteListing, type Bid } from '../../../services/api';
import { downloadCSV } from '../../../utils/dataStore';
import { Package, CheckCircle, Clock, Eye, PlusCircle, Download, Search, Trash2, X } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function BusinessListings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewListing, setViewListing] = useState<WasteListing | null>(null);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [selectedBids, setSelectedBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const loadListings = () => listingsAPI.mine().then(setListings).catch(() => {});
  useEffect(() => { loadListings(); }, []);

  const filtered = listings.filter(l => {
    const matchSearch = l.waste_type.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openBidsModal = (listing: WasteListing) => {
    setSelectedListing(listing);
    setSelectedBids([]);
    setShowBidModal(true);
    setBidsLoading(true);
    listingsAPI.getBids(listing.id).then(bids => { setSelectedBids(bids); setBidsLoading(false); }).catch(() => setBidsLoading(false));
  };

  const handleAcceptBid = async (listingId: number, bidId: number) => {
    try {
      await listingsAPI.acceptBid(listingId, bidId);
      setFlash('Bid accepted!'); setTimeout(() => setFlash(null), 2000);
      setShowBidModal(false); loadListings();
    } catch { setFlash('Failed to accept bid.'); setTimeout(() => setFlash(null), 2000); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this listing?')) {
      try { await listingsAPI.delete(id); loadListings(); } catch {}
    }
  };

  const handleExport = () => {
    downloadCSV('my_listings', ['ID','Type','Volume','Unit','Min Bid','Status','Bids','Posted'],
      filtered.map(l => [String(l.id), l.waste_type, String(l.volume), l.unit, String(l.min_bid), l.status, String(l.bid_count || 0), new Date(l.created_at).toLocaleDateString()]));
  };

  return (
    <div className="space-y-6">
      {flash && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 px-4 py-2 rounded-lg text-sm">{flash}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Waste Listings</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16}/> CSV</button>
          <button onClick={() => navigate('new-listing')} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><PlusCircle size={16} /> Add New Listing</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="All Listings" value={listings.length} icon={<Package size={22} />} color="cyan" />
        <StatCard title="Active" value={listings.filter(l => l.status === 'open').length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="Assigned" value={listings.filter(l => l.status === 'assigned').length} icon={<Clock size={22} />} color="purple" />
        <StatCard title="Total Bids" value={listings.reduce((a, l) => a + (l.bid_count || 0), 0)} icon={<Eye size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All Status</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="completed">Completed</option></select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: number) => <span className="font-mono text-sm">#{v}</span> },
            { key: 'waste_type', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'volume', label: 'Volume', render: (v: number, r: WasteListing) => <span>{v} {r.unit}</span> },
            { key: 'min_bid', label: 'Min Bid', render: (v: number) => <span>RWF {v.toLocaleString()}</span> },
            { key: 'bid_count', label: 'Bids', render: (v: number, r: WasteListing) => (
              <button onClick={() => openBidsModal(r)} className={`font-semibold ${(v || 0) > 0 ? 'text-cyan-600 hover:underline cursor-pointer' : 'text-gray-400 dark:text-gray-500'}`}>{v || 0} bids</button>
            )},
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'created_at', label: 'Posted', render: (v: string) => <span className="text-sm">{new Date(v).toLocaleDateString()}</span> },
            { key: 'id', label: 'Actions', render: (_v: number, r: WasteListing) => (
              <div className="flex gap-1">
                {r.status === 'open' && <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20 rounded"><Trash2 size={15} /></button>}
                <button onClick={() => { setViewListing(r); setShowViewModal(true); }} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900/20 rounded"><Eye size={15} /></button>
              </div>
            )},
          ]}
          data={filtered}
          pageSize={6}
        />
      </div>
      {showViewModal && viewListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Listing #{viewListing.id}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Waste Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.waste_type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Volume</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.volume} {viewListing.unit}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Min Bid</p>
                  <p className="font-semibold text-cyan-600">RWF {(viewListing.min_bid ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Highest Bid</p>
                  <p className="font-semibold text-green-600">{viewListing.highest_bid > 0 ? `RWF ${viewListing.highest_bid.toLocaleString()}` : '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewListing.status === 'open' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                    viewListing.status === 'assigned' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>{viewListing.status}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Bids</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{viewListing.bid_count || 0}</p>
                </div>
              </div>
              {viewListing.description && (
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-gray-700 dark:text-gray-300">{viewListing.description}</p>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Posted</p>
                <p className="text-gray-700 dark:text-gray-300">{new Date(viewListing.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowViewModal(false); openBidsModal(viewListing); }} className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 font-medium">View Bids ({viewListing.bid_count || 0})</button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
      {showBidModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBidModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-xl font-bold">Bids for #{selectedListing.id}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{selectedListing.waste_type} — {selectedListing.volume} {selectedListing.unit} · Min: RWF {(selectedListing.min_bid ?? 0).toLocaleString()}</p></div>
              <button onClick={() => setShowBidModal(false)} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button>
            </div>
            {bidsLoading ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">Loading bids…</p>
            ) : selectedBids.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No bids yet</p>
            ) : (
              <div className="space-y-3">
                {[...selectedBids].sort((a,b)=>b.amount-a.amount).map((bid, idx) => (
                  <div key={bid.id} className={`p-4 rounded-lg border ${idx === 0 ? 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{bid.recycler_name}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`font-medium ${bid.status === 'accepted' ? 'text-green-600 dark:text-green-400' : ''}`}>{bid.status}</span>
                          <span>{new Date(bid.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-cyan-600">RWF {(bid.amount ?? 0).toLocaleString()}</p>
                        {bid.status === 'active' && <button onClick={() => handleAcceptBid(selectedListing.id, bid.id)} className="mt-1 px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700">Accept Bid</button>}
                        {bid.status === 'accepted' && <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Accepted</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
