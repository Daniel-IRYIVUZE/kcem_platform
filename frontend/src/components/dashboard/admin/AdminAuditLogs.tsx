// pages/dashboard/admin/AuditLogs.tsx
import { useState, useEffect } from 'react';
import { Search, Activity, Eye, X, Download } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import { downloadCSV } from '../../../utils/dataStore';

interface AuditLogEntry {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  notes: string | null;
  ip_address: string | null;
  created_at: string;
  user?: { full_name: string; email: string } | null;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    adminAPI.getAuditLogs(500).then(setLogs).catch(() => {});
  }, []);

  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    const adminUser = l.user?.full_name ?? `User #${l.user_id ?? 'Guest'}`;
    const target = l.entity_type ? `${l.entity_type} #${l.entity_id ?? ''}` : '—';
    const matchesSearch =
      adminUser.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      target.toLowerCase().includes(search.toLowerCase()) ||
      (l.notes ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'all' || l.action === actionFilter;

    const logDate = new Date(l.created_at);
    const now = new Date();
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = logDate.toDateString() === now.toDateString();
    } else if (dateRange === 'week') {
      matchesDate = logDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      matchesDate = logDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  const actionColors: Record<string, string> = {
    USER_SUSPEND: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    USER_APPROVE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    BID_ACCEPT:   'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    BID_REJECT:   'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    LOGIN:        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    LOGOUT:       'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  const handleExport = () => {
    downloadCSV('audit_logs',
      ['ID', 'Timestamp', 'User', 'Action', 'Entity', 'Notes', 'IP'],
      filtered.map(l => [
        String(l.id),
        new Date(l.created_at).toLocaleString(),
        l.user?.full_name ?? `User #${l.user_id ?? 'Guest'}`,
        l.action,
        l.entity_type ? `${l.entity_type} #${l.entity_id ?? ''}` : '—',
        l.notes ?? '',
        l.ip_address ?? '',
      ])
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Activity size={20} className="text-cyan-600" />
          Audit Logs
          <span className="text-sm font-normal text-gray-400 ml-2">{logs.length} entries</span>
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
            placeholder="Search user, action, resource..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Timestamp', 'User', 'Action', 'Entity', 'Notes', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
              {filtered.slice(0, 100).map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-xs">
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">
                    {l.user?.full_name ?? `User #${l.user_id ?? 'Guest'}`}
                    {l.ip_address && <span className="block text-gray-400 text-[10px]">{l.ip_address}</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${actionColors[l.action] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                    {l.entity_type ? `${l.entity_type} #${l.entity_id ?? ''}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {l.notes ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => setSelected(l)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            Showing 100 of {filtered.length} records
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Audit Log Detail</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[
                ['ID', selected.id],
                ['Timestamp', new Date(selected.created_at).toLocaleString()],
                ['User', selected.user?.full_name ?? `User #${selected.user_id ?? 'Guest'}`],
                ['Email', selected.user?.email ?? '—'],
                ['Action', selected.action],
                ['Entity', selected.entity_type ? `${selected.entity_type} #${selected.entity_id ?? ''}` : '—'],
                ['IP Address', selected.ip_address ?? '—'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{String(k)}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{String(v)}</span>
                </div>
              ))}
              {selected.notes && (
                <div className="mt-3">
                  <span className="text-gray-500 dark:text-gray-400 block mb-2">Notes</span>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 font-mono text-xs overflow-auto max-h-32 border border-gray-200 dark:border-gray-700">
                    {selected.notes}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelected(null)}
                className="w-full bg-cyan-600 text-white rounded-lg py-2 text-sm hover:bg-cyan-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
