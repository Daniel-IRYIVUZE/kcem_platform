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
        const totalVol = listings.reduce((s, l) => s + l.volume, 0);
        const year = now.getFullYear();
        const today = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const certNo = `REMA/EcoTrade/${year}/${String(hotel?.id ?? '000').padStart(4, '0')}`;
        const numScore = Number(score);
        const level = numScore >= 90 ? 'Platinum Level' : numScore >= 75 ? 'Gold Level' : numScore >= 60 ? 'Silver Level' : 'Bronze Level';
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>Green Score Certificate</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Source Sans Pro',Arial,sans-serif;background:#f4f4f4;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:30px}
  .page{width:794px;min-height:1123px;background:#fff;position:relative;padding:0}
  .outer-border{position:absolute;inset:16px;border:3px solid #1a5c2a;pointer-events:none}
  .inner-border{position:absolute;inset:22px;border:1px solid #1a5c2a;pointer-events:none}
  .corner{position:absolute;width:28px;height:28px;border-color:#1a5c2a}
  .corner.tl{top:12px;left:12px;border-top:4px solid;border-left:4px solid}
  .corner.tr{top:12px;right:12px;border-top:4px solid;border-right:4px solid}
  .corner.bl{bottom:12px;left:12px;border-bottom:4px solid;border-left:4px solid}
  .corner.br{bottom:12px;right:12px;border-bottom:4px solid;border-right:4px solid}
  .content{padding:52px 64px}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1a5c2a;padding-bottom:20px;margin-bottom:24px}
  .flag-stripe{width:8px;height:80px;background:linear-gradient(to bottom,#20603d 33%,#ffd700 33% 66%,#1a9ddc 66%);border-radius:2px;flex-shrink:0}
  .header-center{flex:1;text-align:center;padding:0 20px}
  .rema-title{font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;margin-bottom:4px}
  .rema-name{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700;color:#1a5c2a;line-height:1.2}
  .rema-sub{font-size:10px;color:#888;margin-top:3px;letter-spacing:1px;text-transform:uppercase}
  .seal{width:72px;height:72px;border-radius:50%;border:3px solid #1a5c2a;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0faf2;flex-shrink:0}
  .seal-inner{font-size:9px;text-align:center;color:#1a5c2a;font-weight:700;letter-spacing:0.5px;line-height:1.4}
  .cert-label{text-align:center;font-size:11px;letter-spacing:3px;color:#888;text-transform:uppercase;margin-bottom:10px}
  .cert-title{font-family:'Playfair Display',Georgia,serif;text-align:center;font-size:30px;color:#1a5c2a;font-weight:700;margin-bottom:6px}
  .cert-subtitle{text-align:center;font-size:11px;letter-spacing:2px;color:#aaa;text-transform:uppercase;margin-bottom:28px}
  .divider{height:1px;background:linear-gradient(to right,transparent,#1a5c2a 30%,#1a5c2a 70%,transparent);margin:18px 0}
  .presented-to{text-align:center;font-size:13px;color:#555;margin-bottom:8px}
  .company-name{font-family:'Playfair Display',Georgia,serif;text-align:center;font-size:28px;color:#1c3a26;font-weight:700;margin-bottom:18px;border-bottom:2px dotted #1a5c2a;padding-bottom:12px;display:inline-block;width:100%}
  .body-text{text-align:center;font-size:13px;color:#444;line-height:1.8;margin-bottom:20px;padding:0 20px}
  .score-box{display:flex;justify-content:center;margin:20px 0}
  .score-inner{display:inline-flex;align-items:center;gap:20px;background:#f0faf2;border:1px solid #1a5c2a;border-radius:8px;padding:14px 36px}
  .score-value{font-family:'Playfair Display',Georgia,serif;font-size:48px;font-weight:700;color:#1a5c2a;line-height:1}
  .score-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}
  .score-rating{font-size:14px;font-weight:700;color:#20603d;margin-top:2px}
  .stats-table{width:100%;border-collapse:collapse;font-size:12px;margin:16px 0}
  .stats-table th{background:#1a5c2a;color:#fff;padding:8px 12px;text-align:left;letter-spacing:0.5px}
  .stats-table td{padding:7px 12px;border-bottom:1px solid #e8f5e9}
  .stats-table tr:nth-child(even) td{background:#f9fefb}
  .sig-section{display:flex;justify-content:space-between;margin-top:32px;padding-top:24px;border-top:1px solid #cde8d2}
  .sig-block{text-align:center;width:40%}
  .sig-line{border-top:1px solid #333;margin-bottom:6px;margin-top:32px}
  .sig-name{font-size:12px;font-weight:600;color:#1c3a26}
  .sig-title{font-size:10px;color:#888;margin-top:2px}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-size:10px;color:#aaa}
  .cert-no{font-size:10px;color:#aaa;font-style:italic}
  @media print{body{background:#fff;padding:0}.page{width:100%;box-shadow:none}}
</style></head><body>
<div class="page">
  <div class="outer-border"></div><div class="inner-border"></div>
  <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
  <div class="content">
    <div class="header">
      <div class="flag-stripe"></div>
      <div class="header-center">
        <div class="rema-title">Republic of Rwanda</div>
        <div class="rema-name">Rwanda Environment Management Authority</div>
        <div class="rema-sub">In partnership with EcoTrade Rwanda</div>
      </div>
      <div class="seal"><div class="seal-inner">OFFICIAL<br>SEAL<br>REMA<br>${year}</div></div>
    </div>
    <div class="cert-label">This is to certify that</div>
    <div class="cert-title">Certificate of Excellence</div>
    <div class="cert-subtitle">Green Business Award &mdash; Sustainable Waste Management</div>
    <div class="divider"></div>
    <div class="presented-to">This certificate is presented to</div>
    <div class="company-name">${hotelName}</div>
    <div class="body-text">
      In recognition of outstanding commitment to sustainable waste management, responsible listing of recyclable materials,
      and measurable contribution to environmental preservation in Rwanda.
      This establishment has demonstrated exemplary environmental performance on the EcoTrade Rwanda digital marketplace
      for reverse logistics and circular economy.
    </div>
    <div class="score-box">
      <div class="score-inner">
        <div class="score-value">${score}<span style="font-size:20px">/100</span></div>
        <div>
          <div class="score-label">Green Score</div>
          <div class="score-rating">${level}</div>
        </div>
      </div>
    </div>
    <table class="stats-table">
      <thead><tr><th>Performance Metric</th><th>Recorded Value</th></tr></thead>
      <tbody>
        <tr><td>Total Waste Listings</td><td>${listings.length}</td></tr>
        <tr><td>Open Listings</td><td>${listings.filter(l => l.status === 'open').length}</td></tr>
        <tr><td>Completed Listings</td><td>${listings.filter(l => l.status === 'completed').length}</td></tr>
        <tr><td>Total Volume Listed</td><td>${totalVol.toLocaleString()} units</td></tr>
        <tr><td>Completed Collections</td><td>${collections.filter(c => c.status === 'completed').length}</td></tr>
        <tr><td>Completed Transactions</td><td>${transactions.filter(t => t.status === 'completed').length}</td></tr>
      </tbody>
    </table>
    <div class="sig-section">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Director General</div>
        <div class="sig-title">Rwanda Environment Management Authority (REMA)</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Chief Executive Officer</div>
        <div class="sig-title">EcoTrade Rwanda Ltd</div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-left">Issued: ${today}<br>Valid for the calendar year ${year}</div>
      <div class="cert-no">Certificate No: ${certNo}</div>
    </div>
  </div>
</div>
</body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 600);
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
