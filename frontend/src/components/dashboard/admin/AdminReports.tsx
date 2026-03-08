// pages/dashboard/admin/Reports.tsx
import { useState, useEffect } from 'react';
import { FileText, Download, BarChart2, Users, Leaf, DollarSign } from 'lucide-react';
import { downloadCSV, downloadPDF } from '../../../utils/dataStore';
import { usersAPI, listingsAPI, transactionsAPI, collectionsAPI,
  type APIUser, type WasteListing, type Transaction, type Collection } from '../../../services/api';

const REPORT_TYPES = [
  { 
    id: 'users', 
    label: 'User Report', 
    icon: <Users size={18}/>, 
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' 
  },
  { 
    id: 'listings', 
    label: 'Listings Report', 
    icon: <FileText size={18}/>, 
    color: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400' 
  },
  { 
    id: 'transactions', 
    label: 'Financial Report', 
    icon: <DollarSign size={18}/>, 
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
  },
  { 
    id: 'environmental', 
    label: 'Environmental Impact', 
    icon: <Leaf size={18}/>, 
    color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400' 
  },
  { 
    id: 'collections', 
    label: 'Collections Report', 
    icon: <BarChart2 size={18}/>, 
    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' 
  },
];

export default function AdminReports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [users, setUsers]             = useState<APIUser[]>([]);
  const [listings, setListings]       = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    Promise.all([
      usersAPI.list({ limit: 500 }).catch(() => [] as APIUser[]),
      listingsAPI.list({ limit: 500 }).catch(() => [] as WasteListing[]),
      transactionsAPI.list({ limit: 500 }).catch(() => [] as Transaction[]),
      collectionsAPI.list({ limit: 500 }).catch(() => [] as Collection[]),
    ]).then(([us, ls, ts, cs]) => {
      setUsers(us); setListings(ls); setTransactions(ts); setCollections(cs);
    });
  }, []);

  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const stats = {
    totalUsers: users.length,
    activeListings: listings.filter(l => l.status === 'open').length,
    totalRevenue: completedTransactions.reduce((s, t) => s + (t.amount || 0), 0),
    co2Saved: collections.reduce((s, c) => s + (c.volume || 0) * 0.5, 0),
  };

  const generateReport = (type: string) => {
    setGenerating(type);
    setTimeout(() => {
      if (format === 'pdf') {
        const reportTitle = (REPORT_TYPES.find(r => r.id === type)?.label || type) + ' Report';
        downloadPDF(reportTitle, `
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
            .meta { color: #666; margin: 20px 0; }
          </style>
          <h1>${reportTitle}</h1>
          <div class="meta">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Period: ${dateFrom} to ${dateTo}</p>
          </div>
          <p>Report generated from EcoTrade Rwanda platform data.</p>
        `);
        setGenerating(null);
        return;
      }

      switch (type) {
        case 'users':
          downloadCSV('users_report',
            ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined'],
            users.map(u => [
              String(u.id), u.full_name || '', u.email || '', u.role, u.status,
              u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
            ])
          );
          break;
        case 'listings':
          downloadCSV('listings_report',
            ['ID', 'Hotel', 'Waste Type', 'Volume', 'Unit', 'Min Bid', 'Status', 'Date'],
            listings.map(l => [
              String(l.id), l.hotel_name || 'N/A', l.waste_type, String(l.volume),
              l.unit, String(l.min_bid ?? 0), l.status,
              l.created_at ? new Date(l.created_at).toLocaleDateString() : ''
            ])
          );
          break;
        case 'transactions':
          downloadCSV('financial_report',
            ['ID', 'Listing', 'From', 'To', 'Amount', 'Fee', 'Status', 'Date'],
            transactions.map(t => [
              String(t.id), String(t.listing_id || ''), t.from_user || '', t.to_user || '',
              String(t.amount ?? 0), String(t.fee || 0), t.status,
              t.created_at ? new Date(t.created_at).toLocaleDateString() : ''
            ])
          );
          break;
        case 'environmental':
          downloadCSV('environmental_report',
            ['ID', 'Hotel', 'Driver', 'Waste Type', 'Volume (kg/L)', 'Date'],
            collections.map(c => [
              String(c.id), c.hotel_name || 'N/A', c.driver_name || '', c.waste_type || '',
              String(c.volume), c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : ''
            ])
          );
          break;
        case 'collections':
          downloadCSV('collections_report',
            ['ID', 'Hotel', 'Recycler', 'Driver', 'Volume', 'Status', 'Date'],
            collections.map(c => [
              String(c.id), c.hotel_name || 'N/A', c.recycler_name || '', c.driver_name || '',
              String(c.volume), c.status,
              c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : ''
            ])
          );
          break;
      }
      setGenerating(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <FileText size={20} className="text-cyan-600" />
          Generate Reports
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total Users', stats.totalUsers, 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'],
          ['Active Listings', stats.activeListings, 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800'],
          ['Revenue (RWF)', `${(stats.totalRevenue / 1000).toFixed(0)}K`, 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'],
          ['CO₂ Saved (kg)', stats.co2Saved.toFixed(0), 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800']
        ].map(([label, value, bgColor]) => (
          <div key={label as string} className={`${bgColor} rounded-xl p-4 border`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
          </div>
        ))}
      </div>

      {/* Report Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Report Settings</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Format</label>
            <div className="flex gap-2">
              {(['csv', 'pdf'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    format === f 
                      ? 'bg-cyan-600 text-white border-cyan-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date From</label>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => setDateFrom(e.target.value)} 
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date To</label>
            <input 
              type="date" 
              value={dateTo} 
              onChange={e => setDateTo(e.target.value)} 
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(rt => (
          <div 
            key={rt.id} 
            className={`border rounded-xl p-5 ${rt.color} flex flex-col gap-4`}
          >
            <div className="flex items-center gap-3">
              {rt.icon}
              <div>
                <h3 className="font-semibold">{rt.label}</h3>
                <p className="text-xs opacity-75">Full export as {format.toUpperCase()}</p>
              </div>
            </div>
            <button 
              onClick={() => generateReport(rt.id)} 
              disabled={generating === rt.id} 
              className="mt-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800/70 border border-current rounded-lg py-2 text-sm font-medium hover:bg-white dark:hover:bg-gray-800/90 disabled:opacity-50 transition-colors"
            >
              <Download size={15} /> 
              {generating === rt.id ? 'Generating...' : `Download ${format.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}