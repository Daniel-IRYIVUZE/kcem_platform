import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, BarChart3, Package, Trophy, Activity, Star, Download, Award } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { recyclersAPI, collectionsAPI, transactionsAPI } from '../../../services/api';
import { computeGreenScore } from './_shared';
import type { RecyclerProfile, Collection, Transaction } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// kg CO2 saved per kg of each waste type (mirrors backend factors)
const CO2_FACTORS: Record<string, number> = {
  UCO: 2.85, Glass: 0.26, 'Paper/Cardboard': 0.91, Plastic: 1.53,
  Metal: 1.80, Organic: 0.50, Electronic: 2.00, Textile: 3.60, Mixed: 0.80, Other: 0.50,
};

export default function RecyclerGreenImpact() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<RecyclerProfile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    recyclersAPI.me().then(setProfile).catch(() => {});
    collectionsAPI.list({ limit: 500 }).then(setCollections).catch(() => {});
    transactionsAPI.mine({ limit: 500 }).then(setTransactions).catch(() => {});
  }, []);

  const completed = useMemo(() => collections.filter(c => c.status === 'completed'), [collections]);

  // Total kg collected from completed collections
  const totalCollectedKg = useMemo(
    () => completed.reduce((sum, c) => sum + (c.actual_volume ?? c.volume ?? 0), 0),
    [completed],
  );

  // Use DB field if non-zero, else computed
  const totalKg = (profile?.total_collected && profile.total_collected > 0)
    ? profile.total_collected
    : totalCollectedKg;

  // CO2 saved by waste type
  const co2SavedKg = useMemo(() => {
    return completed.reduce((sum, c) => {
      const factor = CO2_FACTORS[c.waste_type ?? 'Other'] ?? 0.5;
      const vol = c.actual_volume ?? c.volume ?? 0;
      return sum + factor * vol;
    }, 0);
  }, [completed]);

  // Trees equivalent: 1 tree absorbs ~21.8 kg CO2/year → trees = co2/21.8
  const treesEquivalent = Math.round(co2SavedKg / 21.8);

  const greenScore = computeGreenScore(profile?.green_score, totalCollectedKg, completed.length);

  const displayName = profile?.company_name || authUser?.name || 'Your Company';

  // Revenue trend for chart (last 6 months)
  const impactTrend = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    const co2vals: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
      const kg = completed
        .filter(c => {
          const cd = new Date(c.completed_at || c.created_at);
          return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
        })
        .reduce((s, c) => {
          const factor = CO2_FACTORS[c.waste_type ?? 'Other'] ?? 0.5;
          return s + factor * (c.actual_volume ?? c.volume ?? 0);
        }, 0);
      co2vals.push(Math.round(kg));
    }
    return {
      labels: months,
      datasets: [{ data: co2vals, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.15)', fill: true }],
    };
  }, [completed]);

  // Collections by waste type (for breakdown)
  const byType = useMemo(() => {
    const map: Record<string, { volume: number; co2: number }> = {};
    completed.forEach(c => {
      const t = c.waste_type ?? 'Other';
      const vol = c.actual_volume ?? c.volume ?? 0;
      const co2 = (CO2_FACTORS[t] ?? 0.5) * vol;
      if (!map[t]) map[t] = { volume: 0, co2: 0 };
      map[t].volume += vol;
      map[t].co2 += co2;
    });
    return map;
  }, [completed]);

  const typeColors: Record<string, string> = {
    UCO: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    Glass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'Paper/Cardboard': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    Organic: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Plastic: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    Metal: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    Electronic: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    Textile: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    Other: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    Mixed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  };

  // Total revenue from completed transactions
  const totalRevenue = useMemo(
    () => transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.net_amount ?? 0), 0),
    [transactions],
  );

  const handleDownloadCertificate = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const year  = new Date().getFullYear();
    const certNo = `REMA/EcoTrade/${year}/${String(profile?.id ?? '000').padStart(4, '0')}`;
    const wasteRows = Object.entries(byType).map(([t, { volume, co2 }]) =>
      `<tr><td>${t}</td><td>${volume >= 1000 ? (volume/1000).toFixed(2) + ' t' : Math.round(volume) + ' kg'}</td><td>${Math.round(co2)} kg</td></tr>`
    ).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>Green Recycler Certificate</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Source Sans Pro',Arial,sans-serif;background:#f4f4f4;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:30px}
  .page{width:794px;min-height:1123px;background:#fff;position:relative;padding:0}
  /* Outer decorative border */
  .outer-border{position:absolute;inset:16px;border:3px solid #1a5c2a;pointer-events:none}
  .inner-border{position:absolute;inset:22px;border:1px solid #1a5c2a;pointer-events:none}
  .corner{position:absolute;width:28px;height:28px;border-color:#1a5c2a}
  .corner.tl{top:12px;left:12px;border-top:4px solid;border-left:4px solid}
  .corner.tr{top:12px;right:12px;border-top:4px solid;border-right:4px solid}
  .corner.bl{bottom:12px;left:12px;border-bottom:4px solid;border-left:4px solid}
  .corner.br{bottom:12px;right:12px;border-bottom:4px solid;border-right:4px solid}
  .content{padding:52px 64px}
  /* Header */
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1a5c2a;padding-bottom:20px;margin-bottom:24px}
  .flag-stripe{width:8px;height:80px;background:linear-gradient(to bottom,#20603d 33%,#ffd700 33% 66%,#1a9ddc 66%);border-radius:2px;flex-shrink:0}
  .header-center{flex:1;text-align:center;padding:0 20px}
  .rema-title{font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;margin-bottom:4px}
  .rema-name{font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700;color:#1a5c2a;line-height:1.2}
  .rema-sub{font-size:10px;color:#888;margin-top:3px;letter-spacing:1px;text-transform:uppercase}
  .seal{width:72px;height:72px;border-radius:50%;border:3px solid #1a5c2a;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0faf2;flex-shrink:0}
  .seal-inner{font-size:9px;text-align:center;color:#1a5c2a;font-weight:700;letter-spacing:0.5px;line-height:1.4}
  /* Body */
  .cert-label{text-align:center;font-size:11px;letter-spacing:3px;color:#888;text-transform:uppercase;margin-bottom:10px}
  .cert-title{font-family:'Playfair Display',Georgia,serif;text-align:center;font-size:30px;color:#1a5c2a;font-weight:700;margin-bottom:6px}
  .cert-subtitle{text-align:center;font-size:11px;letter-spacing:2px;color:#aaa;text-transform:uppercase;margin-bottom:28px}
  .divider{height:1px;background:linear-gradient(to right,transparent,#1a5c2a 30%,#1a5c2a 70%,transparent);margin:18px 0}
  .presented-to{text-align:center;font-size:13px;color:#555;margin-bottom:8px}
  .company-name{font-family:'Playfair Display',Georgia,serif;text-align:center;font-size:28px;color:#1c3a26;font-weight:700;margin-bottom:18px;border-bottom:2px dotted #1a5c2a;padding-bottom:12px;display:inline-block;width:100%}
  .body-text{text-align:center;font-size:13px;color:#444;line-height:1.8;margin-bottom:20px;padding:0 20px}
  /* Score highlight */
  .score-box{display:flex;justify-content:center;margin:20px 0}
  .score-inner{display:inline-flex;align-items:center;gap:20px;background:#f0faf2;border:1px solid #1a5c2a;border-radius:8px;padding:14px 36px}
  .score-value{font-family:'Playfair Display',Georgia,serif;font-size:48px;font-weight:700;color:#1a5c2a;line-height:1}
  .score-meta{text-align:left}
  .score-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}
  .score-rating{font-size:14px;font-weight:700;color:#20603d;margin-top:2px}
  /* Stats table */
  .stats-table{width:100%;border-collapse:collapse;font-size:12px;margin:16px 0}
  .stats-table th{background:#1a5c2a;color:#fff;padding:8px 12px;text-align:left;letter-spacing:0.5px}
  .stats-table td{padding:7px 12px;border-bottom:1px solid #e8f5e9}
  .stats-table tr:nth-child(even) td{background:#f9fefb}
  /* Signature section */
  .sig-section{display:flex;justify-content:space-between;margin-top:32px;padding-top:24px;border-top:1px solid #cde8d2}
  .sig-block{text-align:center;width:40%}
  .sig-line{border-top:1px solid #333;margin-bottom:6px;margin-top:32px}
  .sig-name{font-size:12px;font-weight:600;color:#1c3a26}
  .sig-title{font-size:10px;color:#888;margin-top:2px}
  /* Footer */
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-size:10px;color:#aaa}
  .cert-no{font-size:10px;color:#aaa;font-style:italic}
  @media print{
    body{background:#fff;padding:0}
    .page{width:100%;box-shadow:none}
  }
</style></head><body>
<div class="page">
  <div class="outer-border"></div><div class="inner-border"></div>
  <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="flag-stripe"></div>
      <div class="header-center">
        <div class="rema-title">Republic of Rwanda</div>
        <div class="rema-name">Rwanda Environment Management Authority</div>
        <div class="rema-sub">In partnership with EcoTrade Rwanda</div>
      </div>
      <div class="seal">
        <div class="seal-inner">OFFICIAL<br>SEAL<br>REMA<br>2026</div>
      </div>
    </div>
    <!-- Certificate title -->
    <div class="cert-label">This is to certify that</div>
    <div class="cert-title">Certificate of Excellence</div>
    <div class="cert-subtitle">Green Recycler Award — Environmental Performance</div>
    <div class="divider"></div>
    <div class="presented-to">This certificate is presented to</div>
    <div class="company-name">${displayName}</div>
    <div class="body-text">
      In recognition of outstanding commitment to sustainable waste management, responsible recycling practices,
      and measurable contribution to environmental preservation in Rwanda.
      This organization has demonstrated exemplary performance on the EcoTrade Rwanda digital marketplace
      for reverse logistics and circular economy.
    </div>
    <!-- Score -->
    <div class="score-box">
      <div class="score-inner">
        <div class="score-value">${greenScore}<span style="font-size:20px">/100</span></div>
        <div class="score-meta">
          <div class="score-label">Green Score</div>
          <div class="score-rating">${greenScore >= 90 ? 'Platinum Level' : greenScore >= 75 ? 'Gold Level' : greenScore >= 60 ? 'Silver Level' : 'Bronze Level'}</div>
        </div>
      </div>
    </div>
    <!-- Metrics table -->
    <table class="stats-table">
      <thead><tr><th>Performance Metric</th><th>Recorded Value</th></tr></thead>
      <tbody>
        <tr><td>Total Waste Recycled</td><td>${totalKg >= 1000 ? (totalKg/1000).toFixed(2) + ' tonnes' : Math.round(totalKg) + ' kg'}</td></tr>
        <tr><td>Completed Collections</td><td>${completed.length}</td></tr>
        <tr><td>Estimated CO&#8322; Saved</td><td>${co2SavedKg >= 1000 ? (co2SavedKg/1000).toFixed(2) + ' tonnes' : Math.round(co2SavedKg) + ' kg'}</td></tr>
        <tr><td>Trees Equivalent Saved</td><td>${treesEquivalent} trees</td></tr>
        ${wasteRows ? '<tr><td colspan="2" style="background:#f0faf2;font-weight:600;color:#1a5c2a;letter-spacing:0.5px;font-size:11px">WASTE TYPE BREAKDOWN</td></tr>' + wasteRows : ''}
      </tbody>
    </table>
    <!-- Signatures -->
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
    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">Issued: ${today}<br>Valid for the calendar year ${year}</div>
      <div class="cert-no">Certificate No: ${certNo}</div>
    </div>
  </div>
</div>
</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Green Impact</h1>

      {greenScore >= 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Award size={32} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">Perfect Green Score Achieved</p>
              <p className="text-green-100 text-sm">{displayName} has reached 100/100 — download your certification.</p>
            </div>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors flex-shrink-0"
          >
            <Download size={16} /> Download Certificate
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Green Score"
          value={Math.round(greenScore)}
          icon={<Trophy size={22} />}
          color="cyan"
          progress={Math.min(Math.round(greenScore), 100)}
        />
        <StatCard
          title="Waste Recycled"
          value={totalKg >= 1000 ? `${(totalKg / 1000).toFixed(2)}t` : `${Math.round(totalKg)} kg`}
          icon={<Package size={22} />}
          color="blue"
          subtitle={`${completed.length} collections`}
        />
        <StatCard
          title="CO₂ Saved"
          value={co2SavedKg >= 1000 ? `${(co2SavedKg / 1000).toFixed(2)}t` : `${Math.round(co2SavedKg)} kg`}
          icon={<Activity size={22} />}
          color="purple"
        />
        <StatCard
          title="Trees Equivalent"
          value={treesEquivalent}
          icon={<Star size={22} />}
          color="orange"
        />
      </div>
      <Widget title="CO₂ Saved Over Time (kg)" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}>
        <ChartComponent type="area" data={impactTrend} height={280} />
      </Widget>
      <Widget title="Impact Breakdown by Waste Type" icon={<BarChart3 size={20} className="text-cyan-600" />}>
        {Object.keys(byType).length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No completed collections yet. Complete collections to see your breakdown.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(byType).map(([type, { volume, co2 }]) => (
              <div key={type} className={`p-4 rounded-lg ${typeColors[type] ?? typeColors.Other}`}>
                <p className="text-sm font-medium">{type}</p>
                <p className="text-xl font-bold mt-1">
                  {volume >= 1000 ? `${(volume / 1000).toFixed(2)} t` : `${Math.round(volume)} kg`}
                </p>
                <p className="text-xs mt-1 opacity-80">{Math.round(co2)} kg CO₂ saved</p>
              </div>
            ))}
          </div>
        )}
      </Widget>
      {totalRevenue > 0 && (
        <Widget title="Revenue Summary" icon={<TrendingUp size={20} className="text-cyan-600" />}>
          <p className="text-3xl font-bold text-cyan-600">RWF {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total net revenue from completed transactions</p>
        </Widget>
      )}
    </div>
  );
}
