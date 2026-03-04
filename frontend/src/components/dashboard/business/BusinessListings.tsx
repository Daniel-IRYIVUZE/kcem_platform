// components/dashboard/business/BusinessListings.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, update as dsUpdate, remove, downloadCSV } from '../../../utils/dataStore';
import type { WasteListing } from '../../../utils/dataStore';
import { Package, CheckCircle, Clock, Eye, PlusCircle, Download, Search, Trash2, X } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function BusinessListings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const loadListings = () => setListings(getAll<WasteListing>('listings'));
  useEffect(() => { loadListings(); window.addEventListener('ecotrade_data_change', loadListings); return () => window.removeEventListener('ecotrade_data_change', loadListings); }, []);

  const filtered = listings.filter(l => {
    const matchSearch = l.wasteType.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAcceptBid = (listingId: string, bidIdx: number) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    const updatedBids = listing.bids.map((b, i) => ({ ...b, status: (i === bidIdx ? 'won' : 'lost') as 'active' | 'won' | 'lost' | 'withdrawn' }));
    dsUpdate<WasteListing>('listings', listingId, { bids: updatedBids, status: 'assigned' });
    setFlash('Bid accepted!'); setTimeout(() => setFlash(null), 2000);
    setShowBidModal(false); loadListings();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this listing?')) { remove('listings', id); loadListings(); }
  };

  const handleExport = () => {
    downloadCSV('my_listings', ['ID','Type','Volume','Unit','Min Bid','Status','Bids','Posted'],
      filtered.map(l => [l.id, l.wasteType, String(l.volume), l.unit, String(l.minBid), l.status, String(l.bids.length), new Date(l.createdAt).toLocaleDateString()]));
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
        <StatCard title="Total Bids" value={listings.reduce((a, l) => a + l.bids.length, 0)} icon={<Eye size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All Status</option><option value="active">Active</option><option value="collecting">Collecting</option><option value="bid_accepted">Bid Accepted</option><option value="completed">Completed</option></select>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'wasteType', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'volume', label: 'Volume', render: (v: number, r: WasteListing) => <span>{v} {r.unit}</span> },
            { key: 'minBid', label: 'Min Bid', render: (v: number) => <span>RWF {v.toLocaleString()}</span> },
            { key: 'bids', label: 'Bids', render: (v: any[], r: WasteListing) => (
              <button onClick={() => { setSelectedListing(r); setShowBidModal(true); }} className={`font-semibold ${v.length > 0 ? 'text-cyan-600 hover:underline cursor-pointer' : 'text-gray-400 dark:text-gray-500'}`}>{v.length} bids</button>
            )},
            { key: 'bids', label: 'Top Bid', render: (v: any[]) => { const top = v.sort((a,b)=>b.amount-a.amount)[0]; return <span className="font-semibold text-green-600 dark:text-green-400">{top ? `RWF ${top.amount.toLocaleString()}` : '—'}</span>; } },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'expiresAt', label: 'Expires', render: (v: string) => <span className="text-sm">{new Date(v).toLocaleDateString()}</span> },
            { key: 'id', label: 'Actions', render: (_v: string, r: WasteListing) => (
              <div className="flex gap-1">
                {r.status === 'open' && <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20 rounded"><Trash2 size={15} /></button>}
                <button className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900/20 rounded"><Eye size={15} /></button>
              </div>
            )},
          ]}
          data={filtered}
          pageSize={6}
        />
      </div>
      {showBidModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBidModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-xl font-bold">Bids for {selectedListing.id}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{selectedListing.wasteType} — {selectedListing.volume} {selectedListing.unit} · Min: RWF {selectedListing.minBid.toLocaleString()}</p></div>
              <button onClick={() => setShowBidModal(false)} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded"><X size={20} /></button>
            </div>
            {selectedListing.bids.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No bids yet</p>
            ) : (
              <div className="space-y-3">
                {[...selectedListing.bids].sort((a,b)=>b.amount-a.amount).map((bid, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${idx === 0 ? 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{bid.recyclerName}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`font-medium ${bid.status === 'won' ? 'text-green-600 dark:text-green-400' : ''}`}>{bid.status}</span>
                          <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-cyan-600">RWF {bid.amount.toLocaleString()}</p>
                        {bid.status === 'active' && <button onClick={() => handleAcceptBid(selectedListing.id, idx)} className="mt-1 px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700">Accept Bid</button>}
                        {bid.status === 'won' && <span className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Accepted</span>}
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
