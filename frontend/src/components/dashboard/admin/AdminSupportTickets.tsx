// pages/dashboard/admin/SupportTickets.tsx
import { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye, Send, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { downloadCSV } from '../../../utils/dataStore';
import { supportAPI, type SupportTicket } from '../../../services/api';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'in-progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  closed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200',
  high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  low: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');

  const load = () => supportAPI.list().then(data =>
    setTickets([...data].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  ).catch(() => {});

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (priorityFilter === 'all' || t.priority === priorityFilter) &&
    ((t.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
     String(t.user_id).toLowerCase().includes(search.toLowerCase()) ||
     t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleReply = () => {
    if (!selected || !reply.trim()) return;
    supportAPI.respond(selected.id, { from_name: 'Admin', message: reply.trim() }).then(newResp => {
      const updated = { ...selected, responses: [...(selected.responses || []), newResp], status: 'in-progress' as const };
      setSelected(updated);
      setTickets(prev => prev.map(x => x.id === selected.id ? updated : x));
    }).catch(() => {});
    setReply('');
  };

  const handleResolve = (t: SupportTicket) => {
    supportAPI.update(t.id, { status: 'resolved' }).catch(() => {});
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: 'resolved' } : x));
    setSelected(prev => prev?.id === t.id ? { ...prev, status: 'resolved' } : prev);
  };

  const handleClose = (t: SupportTicket) => {
    supportAPI.update(t.id, { status: 'closed' }).catch(() => {});
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: 'closed' } : x));
    setSelected(prev => prev?.id === t.id ? { ...prev, status: 'closed' } : prev);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageSquare size={20} className="text-cyan-600" />
          Support Tickets
        </h2>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
            {tickets.filter(t => t.status === 'open').length} open
          </span>
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
            {tickets.filter(t => t.status === 'in-progress').length} in-progress
          </span>
          <button 
            onClick={() => downloadCSV('support_tickets', 
              ['ID', 'User', 'Subject', 'Status', 'Priority', 'Created'],
              filtered.map(t => [
                String(t.id), t.user_name || String(t.user_id), t.subject, t.status,
                t.priority || 'low', new Date(t.created_at).toLocaleDateString()
              ])
            )}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search subject, user..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          {['open', 'in-progress', 'resolved', 'closed'].map(s => (
            <option key={s} value={s}>
              {s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select 
          value={priorityFilter} 
          onChange={e => setPriorityFilter(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Priority</option>
          {['urgent', 'high', 'medium', 'low'].map(p => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['ID', 'User', 'Subject', 'Status', 'Priority', 'Created', 'Replies', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No tickets found
                  </td>
                </tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    #{t.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                      {t.user_name || String(t.user_id)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      #{t.user_id}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                    {t.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status]}`}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority || 'low']}`}>
                      {t.priority || 'low'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                    {(t.responses || []).length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setSelected(t)} 
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {t.status !== 'resolved' && t.status !== 'closed' && (
                        <button 
                          onClick={() => handleResolve(t)} 
                          className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                          title="Resolve"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {t.status !== 'closed' && (
                        <button 
                          onClick={() => handleClose(t)} 
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          title="Close"
                        >
                          <XCircle size={14} />
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

      {/* Ticket Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {selected.subject}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {String(selected.id)} — <strong>{selected.user_name || String(selected.user_id)}</strong> · 
                  <span className={`ml-1 px-1.5 rounded ${PRIORITY_COLORS[selected.priority || 'low']}`}>
                    {selected.priority}
                  </span>
                </p>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {selected.message}
              </div>
              
              {(selected.responses || []).map((r, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-3 text-sm ${
                    r.from_name === 'Admin' 
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 ml-8 border border-cyan-200 dark:border-cyan-800' 
                      : 'bg-gray-50 dark:bg-gray-900 mr-8 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {r.from_name}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{r.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex gap-2">
                <textarea 
                  value={reply} 
                  onChange={e => setReply(e.target.value)} 
                  placeholder="Type your reply..." 
                  rows={2} 
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button 
                  onClick={handleReply} 
                  disabled={!reply.trim()} 
                  className="px-4 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  <Send size={14} /> Send
                </button>
              </div>
              
              <div className="flex gap-2">
                {selected.status !== 'resolved' && selected.status !== 'closed' && (
                  <button 
                    onClick={() => handleResolve(selected)} 
                    className="flex-1 flex items-center justify-center gap-2 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <CheckCircle size={15} /> Resolve
                  </button>
                )}
                {selected.status !== 'closed' && (
                  <button 
                    onClick={() => handleClose(selected)} 
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <AlertCircle size={15} /> Close Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}