import { useState } from 'react';
import { getAll, downloadCSV, downloadPDF } from '../../../utils/dataStore';
import type { Collection, Transaction } from '../../../utils/dataStore';
import { Download } from 'lucide-react';
import DataTable from '../DataTable';
import { companyProfile } from './_shared';

export default function RecyclerReports() {
  const [generating, setGenerating] = useState<number | null>(null);
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const generateReport = (type: string, id: number) => {
    setGenerating(id);
    const collections = getAll<Collection>('collections');
    const transactions = getAll<Transaction>('transactions');
    setTimeout(() => {
      if (type === 'Collections') {
        downloadCSV(`collections_${month.replace(/ /g, '_')}`, ['ID', 'Hotel', 'Driver', 'Type', 'Volume', 'Status', 'Date', 'Earnings'],
          collections.map(c => [c.id, c.hotelName, c.driverName, c.wasteType, String(c.volume), c.status, c.scheduledDate, String(c.earnings)]));
      } else if (type === 'Revenue') {
        downloadCSV(`revenue_${month.replace(/ /g, '_')}`, ['ID', 'Date', 'Hotel', 'Type', 'Amount', 'Fee', 'Net', 'Status'],
          transactions.map(t => [t.id, new Date(t.date).toLocaleDateString(), t.from, t.wasteType, String(t.amount), String(t.fee), String(t.amount - t.fee), t.status]));
      } else {
        const totalVol = collections.reduce((s, c) => s + c.volume, 0);
        downloadPDF(`${type} Report — ${companyProfile.name}`,
          `${type.toUpperCase()} REPORT\n${companyProfile.name} — ${month}\n\nTotal Collections: ${collections.length}\nTotal Volume: ${totalVol.toLocaleString()} units\nEarnings: RWF ${transactions.reduce((s, t) => s + t.amount, 0).toLocaleString()}\n\nEcoTrade Rwanda | Kigali, Rwanda`);
      }
      setGenerating(null);
    }, 600);
  };

  const reports = [
    { id: 1, name: `Monthly Collection Report — ${month}`, type: 'Collections', date: now.toLocaleDateString() },
    { id: 2, name: `Revenue Summary — ${month}`, type: 'Revenue', date: now.toLocaleDateString() },
    { id: 3, name: `Fleet Performance Report — ${month}`, type: 'Fleet', date: now.toLocaleDateString() },
    { id: 4, name: `Environmental Impact Certificate — ${month}`, type: 'Impact', date: now.toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Report', render: (v: string) => <span className="font-medium">{v}</span> },
            { key: 'type', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'id', label: 'Download', render: (v: number, r: typeof reports[0]) => (
              <button onClick={() => generateReport(r.type, v)} disabled={generating === v} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded hover:bg-cyan-100 font-medium disabled:opacity-50">
                {generating === v ? 'Generating...' : <><Download size={14} /> {r.type === 'Impact' || r.type === 'Fleet' ? 'PDF' : 'CSV'}</>}
              </button>
            )},
          ]}
          data={reports}
        />
      </div>
    </div>
  );
}
