// pages/dashboard/admin/Transactions.tsx
import { useState, useEffect } from 'react';
import { Search, Eye, X, DollarSign, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { downloadCSV } from '../../../utils/dataStore';
import { transactionsAPI, type Transaction } from '../../../services/api';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  disputed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  refunded: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const load = () => transactionsAPI.list({ limit: 500 }).then(setTransactions).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = transactions.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    ((t.hotel_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (t.recycler_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (t.reference || '').toLowerCase().includes(search.toLowerCase()) ||
     (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
     String(t.listing_id || '').includes(search))
  );

  const totalRevenue = filtered.filter(t => t.status === 'completed').reduce((s, t) => s + (t.gross_amount ?? 0), 0);
  const totalFees = filtered.filter(t => t.status === 'completed').reduce((s, t) => s + (t.platform_fee ?? 0), 0);

  const handleStatusChange = (t: Transaction, newStatus: Transaction['status']) => {
    // Optimistic UI update
    setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    setSelected(prev => prev?.id === t.id ? { ...prev, status: newStatus } : prev);
    // Persist to backend
    transactionsAPI.update(t.id, { status: newStatus }).catch(() => {
      // Revert on failure
      setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, status: t.status } : x));
      setSelected(prev => prev?.id === t.id ? { ...prev, status: t.status } : prev);
    });
  };

  const handleExport = () => {
    downloadCSV('transactions',
      ['ID', 'Reference', 'Hotel', 'Recycler', 'Gross Amount', 'Platform Fee', 'Net Amount', 'Payment Method', 'Status', 'Description', 'Date'],
      filtered.map(t => [
        String(t.id), t.reference || '', t.hotel_name || '', t.recycler_name || '',
        String(t.gross_amount ?? 0), String(t.platform_fee ?? 0), String(t.net_amount ?? 0),
        t.payment_method || '', t.status, t.description || '',
        t.created_at ? new Date(t.created_at).toLocaleDateString() : ''
      ])
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <DollarSign size={20} className="text-cyan-600" />
          Transaction Records
        </h2>
        <button 
          onClick={handleExport} 
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `RWF ${totalRevenue.toLocaleString()}`, color: 'border-l-green-500' },
          { label: 'Platform Fees', value: `RWF ${totalFees.toLocaleString()}`, color: 'border-l-blue-500' },
          { label: 'Transactions', value: filtered.length, color: 'border-l-cyan-500' },
        ].map(s => (
          <div 
            key={s.label} 
            className={`bg-white dark:bg-gray-800 border-l-4 ${s.color} border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search buyer, seller, listing..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          {['completed', 'pending', 'failed', 'disputed', 'refunded'].map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['ID', 'Reference', 'Hotel', 'Recycler', 'Gross Amount', 'Fee', 'Net', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">#{t.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {(t.reference || '—').substring(0, 16)}{t.reference && t.reference.length > 16 ? '…' : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 dark:text-gray-200 font-medium">{t.hotel_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{t.recycler_name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                    RWF {(t.gross_amount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400 text-xs">
                    +RWF {(t.platform_fee ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                    RWF {(t.net_amount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setSelected(t)} 
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {t.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusChange(t, 'completed')} 
                          className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                          title="Mark Completed"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {(t.status === 'pending' || t.status === 'completed') && (
                        <button 
                          onClick={() => handleStatusChange(t, 'disputed')} 
                          className="p-1.5 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 transition-colors"
                          title="Mark Disputed"
                        >
                          <AlertTriangle size={14} />
                        </button>
                      )}
                      {(t.status === 'disputed' || t.status === 'completed') && (
                        <button 
                          onClick={() => handleStatusChange(t, 'refunded')} 
                          className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors"
                          title="Refund"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Transaction Details
              </h3>
              <button 
                onClick={() => setSelected(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-3 text-sm">
              {[
                ['Transaction ID', `#${selected.id}`],
                ['Reference', selected.reference || '—'],
                ['Hotel (Seller)', selected.hotel_name || '—'],
                ['Recycler (Buyer)', selected.recycler_name || '—'],
                ['Listing ID', selected.listing_id ? `#${selected.listing_id}` : '—'],
                ['Collection ID', selected.collection_id ? `#${selected.collection_id}` : '—'],
                ['Gross Amount', `RWF ${(selected.gross_amount ?? 0).toLocaleString()}`],
                ['Platform Fee (5%)', `RWF ${(selected.platform_fee ?? 0).toLocaleString()}`],
                ['Net to Hotel', `RWF ${(selected.net_amount ?? 0).toLocaleString()}`],
                ['Payment Method', selected.payment_method?.replace('_', ' ') || '—'],
                ['Description', selected.description || '—'],
                ['Status', selected.status],
                ['Completed', selected.completed_at ? new Date(selected.completed_at).toLocaleString() : '—'],
                ['Created', selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{String(k)}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {selected.status !== 'completed' && (
                  <button 
                    onClick={() => handleStatusChange(selected, 'completed')} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
                {selected.status !== 'disputed' && (
                  <button 
                    onClick={() => handleStatusChange(selected, 'disputed')} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                  >
                    <AlertTriangle size={14} /> Dispute
                  </button>
                )}
                {selected.status !== 'refunded' && (
                  <button 
                    onClick={() => handleStatusChange(selected, 'refunded')} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                  >
                    <RotateCcw size={14} /> Refund
                  </button>
                )}
                <button 
                  onClick={() => setSelected(null)} 
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}