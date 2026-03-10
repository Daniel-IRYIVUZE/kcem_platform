import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI, type Transaction } from '../../../services/api';
import { Package, CheckCircle, Clock, DollarSign } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    refunded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function UserOrders() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(() => {
    transactionsAPI.mine({ limit: 200 }).then(setTransactions).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter(t => statusFilter === 'all' || t.status === statusFilter);
  const totalSpent = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.gross_amount || 0), 0);

  const tableData = filtered.map(t => ({
    id: `TXN-${t.id}`,
    date: t.created_at?.split('T')[0] || '—',
    items: t.description || `${t.hotel_name ? t.hotel_name + ' — ' : ''}Waste transaction`,
    seller: t.recycler_name || t.hotel_name || 'EcoTrade',
    amount: `RWF ${(t.gross_amount || 0).toLocaleString()}`,
    status: t.status || 'pending',
    reference: t.reference || '—',
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Transactions" value={transactions.length} icon={<Package size={22} />} color="cyan" />
        <StatCard title="Completed" value={transactions.filter(t => t.status === 'completed').length} icon={<CheckCircle size={22} />} color="blue" />
        <StatCard title="Pending" value={transactions.filter(t => t.status === 'pending').length} icon={<Clock size={22} />} color="purple" />
        <StatCard title="Total Spent" value={`RWF ${(totalSpent / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3 mb-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        {tableData.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">No transactions yet</p>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'Reference', render: (v: string) => <span className="font-mono text-xs text-cyan-600">{v}</span> },
              { key: 'date', label: 'Date' },
              { key: 'items', label: 'Description', render: (v: string) => <span className="font-medium">{v}</span> },
              { key: 'seller', label: 'Party' },
              { key: 'amount', label: 'Amount', render: (v: string) => <span className="font-semibold">{v}</span> },
              { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'reference', label: 'Ref No.', render: (v: string) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{v}</span> },
            ]}
            data={tableData}
            pageSize={8}
          />
        )}
      </div>
    </div>
  );
}


