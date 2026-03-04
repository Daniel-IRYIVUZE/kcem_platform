// components/dashboard/business/BusinessReports.tsx
import { useState } from 'react';
import { getAll, downloadPDF } from '../../../utils/dataStore';
import type { WasteListing, Transaction, Collection, PlatformUser } from '../../../utils/dataStore';
import { Download, Package, DollarSign } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function BusinessReports() {
  const [generating, setGenerating] = useState<number | null>(null);
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const generateReport = (type: string, id: number) => {
    setGenerating(id);
    const listings = getAll<WasteListing>('listings');
    const transactions = getAll<Transaction>('transactions');
    const collections = getAll<Collection>('collections');
    const user = getAll<PlatformUser>('users').find(u => u.role === 'business');
    const hotelName = user?.name || 'Hotel';

    setTimeout(() => {
      if (type === 'Waste Report') {
        const rows = listings.map(l => `<tr><td>${l.id}</td><td>${l.wasteType}</td><td>${l.volume}</td><td>${l.unit}</td><td>${l.status}</td><td>${new Date(l.createdAt).toLocaleDateString()}</td><td>${l.bids.length}</td></tr>`).join('');
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
        const netRev = completedTxns.reduce((s, t) => s + t.amount - t.fee, 0);
        const rows = transactions.map(t => `<tr><td>${t.id}</td><td>${new Date(t.date).toLocaleDateString()}</td><td>${t.from}</td><td>${t.to}</td><td>${t.wasteType}</td><td>RWF ${t.amount.toLocaleString()}</td><td>RWF ${t.fee.toLocaleString()}</td><td>RWF ${(t.amount-t.fee).toLocaleString()}</td><td>${t.status}</td></tr>`).join('');
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
        const rows = collections.map(c => `<tr><td>${c.id}</td><td>${c.hotelName}</td><td>${c.recyclerName}</td><td>${c.driverName}</td><td>${c.wasteType}</td><td>${c.volume}</td><td>${c.status}</td><td>${c.scheduledDate}</td><td>RWF ${c.earnings.toLocaleString()}</td></tr>`).join('');
        const totalEarnings = collections.reduce((s,c)=>s+c.earnings,0);
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
        const score = user?.greenScore || 92;
        downloadPDF(`Green Score Certificate — ${hotelName}`,
          `ECOTRADE RWANDA — GREEN SCORE CERTIFICATE\n\nIssued to: ${hotelName}\nDate: ${now.toDateString()}\nGreen Score: ${score}/100\n\nThis certifies that ${hotelName} has achieved a Green Score of ${score} through responsible waste management practices on the EcoTrade Rwanda platform.\n\nBreakdown:\n- Waste Sorting Quality: Excellent\n- Collection Frequency: ${collections.filter(c => c.hotelName === hotelName || true).length} collections\n- Platform Engagement: Active\n- Total Listings: ${listings.length}\n\nEcoTrade Rwanda | Kigali, Rwanda | www.ecotrade.rw`);
      } else if (type === 'Impact Report') {
        const totalVol = collections.reduce((s, c) => s + c.volume, 0);
        downloadPDF(`Environmental Impact Report — ${hotelName}`,
          `ENVIRONMENTAL IMPACT REPORT\n\n${hotelName} — ${month}\n\nSUMMARY\nTotal Waste Diverted: ${totalVol.toLocaleString()} kg/L\nTotal Collections: ${collections.length}\nActive Listings: ${listings.filter(l => l.status === 'open').length}\nCompleted Transactions: ${transactions.filter(t => t.status === 'completed').length}\n\nWASTE BREAKDOWN\n${['UCO','Glass','Paper/Cardboard','Mixed'].map(t => `${t}: ${listings.filter(l => l.wasteType === t).length} listings`).join('\n')}\n\nECO METRICS\nEstimated CO2 Saved: ${(totalVol * 0.5).toFixed(0)} kg\nLandfill Diverted: ${totalVol.toLocaleString()} units\n\nEcoTrade Rwanda | Kigali, Rwanda`);
      }
      setGenerating(null);
    }, 800);
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
        <StatCard title="Reports Ready" value={reports.length} icon={<Download size={22} />} color="cyan" />
        <StatCard title="Total Listings" value={getAll<WasteListing>('listings').length} icon={<Package size={22} />} color="blue" />
        <StatCard title="Transactions" value={getAll<Transaction>('transactions').length} icon={<DollarSign size={22} />} color="purple" />
      </div>
    </div>
  );
}
