// pages/dashboard/admin/Listings.tsx
import { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, XCircle, Trash2, X, 
  Package, Edit2, Download,
} from 'lucide-react';
import { getAll, update, remove, downloadCSV } from '../../../utils/dataStore';
import type { WasteListing } from '../../../utils/dataStore';

const ALL_STATUSES = ['open', 'draft', 'assigned', 'collected', 'completed', 'cancelled', 'expired'] as const;

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  assigned: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  completed: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  expired: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  collected: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export default function AdminListings() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wasteFilter, setWasteFilter] = useState('all');
  const [modal, setModal] = useState<'view' | 'delete' | 'status' | null>(null);
  const [selected, setSelected] = useState<WasteListing | null>(null);
  const [newStatus, setNewStatus] = useState<WasteListing['status']>('open');

  const load = () => setListings(getAll<WasteListing>('listings'));
  useEffect(() => { 
    load(); 
    window.addEventListener('ecotrade_data_change', load); 
    return () => window.removeEventListener('ecotrade_data_change', load); 
  }, []);

  const wasteTypes = [...new Set(listings.map(l => l.wasteType))];
  
  const filtered = listings.filter(l =>
    (statusFilter === 'all' || l.status === statusFilter) &&
    (wasteFilter === 'all' || l.wasteType === wasteFilter) &&
    (l.hotelName.toLowerCase().includes(search.toLowerCase()) || 
     l.wasteType.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApprove = (l: WasteListing) => { 
    update<WasteListing>('listings', l.id, { status: 'open' }); 
    load(); 
  };

  const handleReject = (l: WasteListing) => { 
    update<WasteListing>('listings', l.id, { status: 'cancelled' }); 
    load(); 
  };

  const handleStatusChange = () => { 
    if (selected) { 
      update<WasteListing>('listings', selected.id, { status: newStatus }); 
      setModal(null); 
      load(); 
    } 
  };

  const handleDelete = () => { 
    if (selected) { 
      remove('listings', selected.id); 
      setModal(null); 
      load(); 
    } 
  };

  const handleExport = () => {
    downloadCSV('listings', 
      ['ID', 'Hotel', 'Waste Type', 'Volume', 'Unit', 'Min Bid', 'Status', 'Date'],
      filtered.map(l => [
        l.id, 
        l.hotelName, 
        l.wasteType, 
        String(l.volume), 
        l.unit, 
        String(l.minBid), 
        l.status, 
        new Date(l.createdAt).toLocaleDateString()
      ])
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Package size={20} className="text-cyan-600" />
          Listings Management
        </h2>
        <button 
          onClick={handleExport} 
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search hotel, waste type..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          {['open', 'draft', 'assigned', 'completed', 'cancelled', 'expired'].map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select 
          value={wasteFilter} 
          onChange={e => setWasteFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Types</option>
          {wasteTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['ID', 'Hotel', 'Waste Type', 'Volume', 'Min Bid', 'Bids', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No listings found
                  </td>
                </tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {l.id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {l.hotelName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {l.wasteType}
                  </td>
                  <td className="px-4 py-3">
                    {l.volume} {l.unit}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                    RWF {l.minBid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      {l.bids.length} bids
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelected(l); setModal('view'); }} 
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => { setSelected(l); setNewStatus(l.status); setModal('status'); }} 
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Change Status"
                      >
                        <Edit2 size={14} />
                      </button>
                      {l.status === 'draft' && (
                        <>
                          <button 
                            onClick={() => handleApprove(l)} 
                            className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            onClick={() => handleReject(l)} 
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { setSelected(l); setModal('delete'); }} 
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Listing Details
              </h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['ID', selected.id.substring(0, 8) + '...'],
                  ['Hotel', selected.hotelName],
                  ['Waste Type', selected.wasteType],
                  ['Volume', `${selected.volume} ${selected.unit}`],
                  ['Min Bid', `RWF ${selected.minBid.toLocaleString()}`],
                  ['Status', selected.status],
                  ['Total Bids', selected.bids.length],
                  ['Created', new Date(selected.createdAt).toLocaleDateString()],
                  ['Expires', new Date(selected.expiresAt).toLocaleDateString()]
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{String(k)}:</span>{' '}
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{String(v)}</span>
                  </div>
                ))}
              </div>
              
              {selected.specialInstructions && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <strong className="block mb-1">Instructions:</strong>
                  {selected.specialInstructions}
                </div>
              )}
              
              {selected.bids.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bids</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selected.bids.map((b, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{b.recyclerName}</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          RWF {b.amount.toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === 'won' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              {selected.status === 'draft' && (
                <>
                  <button 
                    onClick={() => { handleApprove(selected); setModal(null); }} 
                    className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => { handleReject(selected); setModal(null); }} 
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Delete Listing?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Delete listing from <strong>{selected.hotelName}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {modal === 'status' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                Override Status
              </h3>
              <button 
                onClick={() => setModal(null)} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Listing <strong>{selected.id.substring(0, 8)}...</strong> — <strong>{selected.hotelName}</strong>
            </p>
            <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              Current status:{' '}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-1 ${STATUS_COLORS[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <div className="mt-3 mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Set new status
              </label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as WasteListing['status'])} 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusChange} 
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}