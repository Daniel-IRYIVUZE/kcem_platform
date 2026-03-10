// components/dashboard/business/BusinessReports.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  listingsAPI, collectionsAPI, transactionsAPI, hotelsAPI,
  type WasteListing, type Transaction, type Collection, type HotelProfile
} from '../../../services/api';
import { downloadPDF } from '../../../utils/dataStore';
import { Download, Package, DollarSign } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function BusinessReports() {
  const { user: authUser } = useAuth();
  const [generating, setGenerating] = useState<number | null>(null);
  const [counts, setCounts] = useState({ listings: 0, transactions: 0 });
  const [hotel, setHotel] = useState<HotelProfile | null>(null);
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    hotelsAPI.me().then(setHotel).catch(() => {});
    Promise.all([
      listingsAPI.mine().catch(() => []),
      transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0]).catch(() => []),
    ]).then(([l, t]) => setCounts({ listings: (l as WasteListing[]).length, transactions: (t as Transaction[]).length }));
  }, []);

  const generateReport = async (type: string, id: number) => {
    setGenerating(id);
    try {
      const [listings, transactions, collections] = await Promise.all([
        listingsAPI.mine().catch(() => []) as Promise<WasteListing[]>,
        transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0]).catch(() => []) as Promise<Transaction[]>,
        collectionsAPI.list({ limit: 200 } as Parameters<typeof collectionsAPI.list>[0]).catch(() => []) as Promise<Collection[]>,
      ]);
      const hotelName = hotel?.hotel_name || authUser?.name || 'Hotel';

      if (type === 'Waste Report') {
        const rows = listings.map(l => `<tr><td>${l.id}</td><td>${l.waste_type}</td><td>${l.volume}</td><td>${l.unit}</td><td>${l.status}</td><td>${l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}</td><td>${l.bid_count || 0}</td></tr>`).join('');
        downloadPDF(`Monthly Waste Report — ${hotelName}`, `
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Total Listings</div></div>
            <div class="stat-card"><div class="stat-value">${listings.filter(l=>l.status==='open').length}</div><div class="stat-label">Open</div></div>
            <div class="stat-card"><div class="stat-value">${listings.filter(l=>l.status==='completed').length}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-value">${listings.reduce((s,l)=>s+l.volume,0)}</div><div class="stat-label">Total Volume</div></div>
          </div>
          <h2>Waste Listings — ${month}</h2>
          <table><thead><tr><th>ID</th><th>Waste Type</th><th>Volume</th><th>Unit</th><th>Status</th><th>Posted</th><th>Bids</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="7">No listings found.</td></tr>'}</tbody></table>`);
      } else if (type === 'Revenue Report') {
        const completedTxns = transactions.filter(t => t.status === 'completed');
        const netRev = completedTxns.reduce((s, t) => s + (t.net_amount || 0), 0);
        const rows = transactions.map(t => `<tr><td>${t.id}</td><td>${t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</td><td>${t.hotel_name||''}</td><td>${t.recycler_name||''}</td><td>${t.description||''}</td><td>RWF ${(t.gross_amount||0).toLocaleString()}</td><td>RWF ${(t.platform_fee||0).toLocaleString()}</td><td>RWF ${(t.net_amount||0).toLocaleString()}</td><td>${t.status}</td></tr>`).join('');
        downloadPDF(`Revenue Report — ${hotelName}`, `
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${transactions.length}</div><div class="stat-label">Total Transactions</div></div>
            <div class="stat-card"><div class="stat-value">${completedTxns.length}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-value">RWF ${(netRev/1000).toFixed(0)}K</div><div class="stat-label">Net Revenue</div></div>
            <div class="stat-card"><div class="stat-value">${transactions.filter(t=>t.status==='pending').length}</div><div class="stat-label">Pending</div></div>
          </div>
          <h2>Transactions — ${month}</h2>
          <table><thead><tr><th>ID</th><th>Date</th><th>From</th><th>To</th><th>Type</th><th>Amount</th><th>Fee</th><th>Net</th><th>Status</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="9">No transactions found.</td></tr>'}</tbody></table>`);
      } else if (type === 'Collection Report') {
        const rows = collections.map(c => `<tr><td>${c.id}</td><td>${c.hotel_name||''}</td><td>${c.recycler_name||''}</td><td>${c.driver_name||''}</td><td>${c.waste_type||''}</td><td>${c.volume||0}</td><td>${c.status}</td><td>${c.scheduled_date||''}</td><td>RWF ${(c.earnings||0).toLocaleString()}</td></tr>`).join('');
        const totalEarnings = collections.reduce((s,c)=>s+(c.earnings||0),0);
        downloadPDF(`Collection Report — ${hotelName}`, `
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${collections.length}</div><div class="stat-label">Total Collections</div></div>
            <div class="stat-card"><div class="stat-value">${collections.filter(c=>c.status==='completed').length}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-value">${collections.filter(c=>c.status==='scheduled').length}</div><div class="stat-label">Scheduled</div></div>
            <div class="stat-card"><div class="stat-value">RWF ${totalEarnings.toLocaleString()}</div><div class="stat-label">Total Earnings</div></div>
          </div>
          <h2>Collections — ${month}</h2>
          <table><thead><tr><th>ID</th><th>Hotel</th><th>Recycler</th><th>Driver</th><th>Type</th><th>Volume</th><th>Status</th><th>Date</th><th>Earnings</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="9">No collections found.</td></tr>'}</tbody></table>`);
      } else if (type === 'Green Certificate') {
        const score = hotel?.green_score ?? (authUser as Record<string, unknown>)?.green_score ?? 'N/A';
        const totalWaste = listings.reduce((s, l) => s + l.volume, 0);
        downloadPDF(`Green Score Certificate — ${hotelName}`, `
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${score}</div><div class="stat-label">Green Score / 100</div></div>
            <div class="stat-card"><div class="stat-value">${collections.filter(c => c.status === 'completed').length}</div><div class="stat-label">Completed Collections</div></div>
            <div class="stat-card"><div class="stat-value">${listings.length}</div><div class="stat-label">Waste Listings</div></div>
            <div class="stat-card"><div class="stat-value">${totalWaste.toLocaleString()}</div><div class="stat-label">Total Volume Listed</div></div>
          </div>
          <h2>Certificate Details</h2>
          <p><b>Issued to:</b> ${hotelName}</p>
          <p><b>Issue Date:</b> ${now.toDateString()}</p>
          <p><b>Green Score:</b> ${score} / 100</p>
          <p><b>Rating:</b> ${Number(score) >= 80 ? 'Excellent ⭐⭐⭐⭐⭐' : Number(score) >= 60 ? 'Good ⭐⭐⭐⭐' : 'Developing ⭐⭐⭐'}</p>
          <br>
          <p>This certifies that <b>${hotelName}</b> has achieved a Green Score of <b>${score}</b> through responsible waste management practices on the EcoTrade Rwanda platform.</p>
          <h2>Performance Breakdown</h2>
          <table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>
            <tr><td>Total Listings Posted</td><td>${listings.length}</td></tr>
            <tr><td>Open Listings</td><td>${listings.filter(l => l.status === 'open').length}</td></tr>
            <tr><td>Completed Collections</td><td>${collections.filter(c => c.status === 'completed').length}</td></tr>
            <tr><td>Total Waste Volume</td><td>${totalWaste.toLocaleString()} units</td></tr>
            <tr><td>Completed Transactions</td><td>${transactions.filter(t => t.status === 'completed').length}</td></tr>
          </tbody></table>`);
      } else if (type === 'Impact Report') {
        const totalVol = collections.reduce((s, c) => s + (c.volume || 0), 0);
        const wasteTypes = [...new Set(listings.map(l => l.waste_type))];
        const wasteRows = wasteTypes.map(wt => {
          const wListings = listings.filter(l => l.waste_type === wt);
          return `<tr><td>${wt}</td><td>${wListings.length}</td><td>${wListings.reduce((s,l)=>s+l.volume,0).toLocaleString()}</td><td>${wListings.filter(l=>l.status==='completed').length}</td></tr>`;
        }).join('') || '<tr><td colspan="4">No data</td></tr>';
        downloadPDF(`Environmental Impact Report — ${hotelName}`, `
          <div class="stat-grid">
            <div class="stat-card"><div class="stat-value">${totalVol.toLocaleString()}</div><div class="stat-label">Total Waste Diverted</div></div>
            <div class="stat-card"><div class="stat-value">${collections.length}</div><div class="stat-label">Total Collections</div></div>
            <div class="stat-card"><div class="stat-value">${(totalVol * 0.5).toFixed(0)} kg</div><div class="stat-label">CO₂ Saved (est.)</div></div>
            <div class="stat-card"><div class="stat-value">${transactions.filter(t => t.status === 'completed').length}</div><div class="stat-label">Completed Transactions</div></div>
          </div>
          <h2>Waste Type Breakdown</h2>
          <table><thead><tr><th>Waste Type</th><th>Listings</th><th>Total Volume</th><th>Completed</th></tr></thead>
          <tbody>${wasteRows}</tbody></table>
          <h2>Collection Summary</h2>
          <table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>
            <tr><td>Active Listings</td><td>${listings.filter(l => l.status === 'open').length}</td></tr>
            <tr><td>Completed Collections</td><td>${collections.filter(c => c.status === 'completed').length}</td></tr>
            <tr><td>Pending Collections</td><td>${collections.filter(c => c.status === 'scheduled').length}</td></tr>
            <tr><td>Total Revenue Generated</td><td>RWF ${transactions.filter(t=>t.status==='completed').reduce((s,t)=>s+(t.gross_amount||0),0).toLocaleString()}</td></tr>
          </tbody></table>`);
      }
    } finally {
      setGenerating(null);
    }
  };

  const reports = [
    { id: 1, name: `Monthly Waste Report — ${month}`, type: 'Waste Report', date: now.toLocaleDateString(), status: 'ready' },
    { id: 2, name: `Revenue Summary — ${month}`, type: 'Revenue Report', date: now.toLocaleDateString(), status: 'ready' },
    { id: 3, name: `Collection Report — ${month}`, type: 'Collection Report', date: now.toLocaleDateString(), status: 'ready' },
    { id: 4, name: `Green Score Certificate — ${month}`, type: 'Green Certificate', date: now.toLocaleDateString(), status: 'ready' },
    { id: 5, name: `Environmental Impact Report — ${month}`, type: 'Impact Report', date: now.toLocaleDateString(), status: 'ready' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Certificates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Reports are generated from live platform data</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Report', render: (v: string) => <span className="font-medium">{v}</span> },
            { key: 'type', label: 'Type', render: (v: string) => <span className={`px-2 py-1 rounded text-xs font-medium ${v === 'Green Certificate' ? 'bg-yellow-100 text-yellow-700' : v === 'Impact Report' ? 'bg-green-100 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="completed" /> },
            { key: 'id', label: 'Download', render: (v: number, r: typeof reports[0]) => (
              <button onClick={() => generateReport(r.type, v)} disabled={generating === v} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded hover:bg-cyan-100 font-medium disabled:opacity-50">
                {generating === v ? 'Generating...' : <><Download size={14} /> PDF</>}
              </button>
            )},
          ]}
          data={reports}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Reports Ready"  value={reports.length}           icon={<Download   size={22} />} color="cyan" />
        <StatCard title="Total Listings" value={counts.listings}          icon={<Package    size={22} />} color="blue" />
        <StatCard title="Transactions"   value={counts.transactions}      icon={<DollarSign size={22} />} color="purple" />
      </div>
    </div>
  );
}
