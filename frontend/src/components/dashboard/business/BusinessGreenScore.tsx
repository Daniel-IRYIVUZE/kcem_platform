// components/dashboard/business/BusinessGreenScore.tsx
import { useState, useEffect } from 'react';
import { collectionsAPI, listingsAPI, hotelsAPI } from '../../../services/api';
import type { Collection, WasteListing } from '../../../services/api';
import { Trophy, TrendingUp, Download, Award } from 'lucide-react';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { useAuth } from '../../../context/AuthContext';
import { getDashboardDisplayName } from '../../../utils/userDisplayName';

export default function BusinessGreenScore() {
  const { user: authUser } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [apiScore, setApiScore] = useState<number | null>(null);
  const [hotelName, setHotelName] = useState('');

  useEffect(() => {
    collectionsAPI.list({ limit: 500 }).then(setCollections).catch(() => {});
    listingsAPI.mine().then(setListings).catch(() => {});
  }, []);

  useEffect(() => {
    hotelsAPI.me()
      .then(h => { setApiScore(h.green_score); setHotelName(h.hotel_name); })
      .catch(() => {});
  }, []);

  // Fallback calculation when API score is not loaded
  const completedCollections = collections.filter(c => c.status === 'completed');
  const totalWaste = completedCollections.reduce((s, c) => s + (c.volume ?? 0), 0);
  const totalCollections = collections.length;
  const totalListings = listings.length;

  const wasteScore = Math.min(totalWaste / 100, 25);
  const participationScore = Math.min((completedCollections.length / Math.max(totalListings, 1)) * 25, 25);
  const consistencyScore = Math.min(totalCollections / 10, 25);
  const qualityScore = 25;
  const calculatedScore = Math.round(wasteScore + participationScore + consistencyScore + qualityScore);

  // Prefer API score
  const greenScore = apiScore !== null ? apiScore : calculatedScore;
  const displayName = hotelName || getDashboardDisplayName(authUser, 'Your Hotel');

  const handleDownloadCertificate = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const certText = [
      'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•',
      '         ECOTRADE RWANDA â€” GREEN EXCELLENCE CERTIFICATE',
      'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•',
      '',
      `This certifies that`,
      '',
      `  ${displayName}`,
      '',
      `has achieved a GREEN SCORE OF ${greenScore}/100`,
      `demonstrating outstanding commitment to sustainable`,
      `waste management on the EcoTrade Rwanda platform.`,
      '',
      `  Issued on: ${today}`,
      `  Platform : EcoTrade Rwanda`,
      '',
      'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•',
    ].join('\n');

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoTrade_GreenCertificate_${displayName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreHistory = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      data: Array(7).fill(0).map((_, i) => Math.max(0, Math.round(greenScore - (6 - i) * 6))),
      borderColor: '#059669',
      backgroundColor: '#059669',
    }],
  };

  const scoreBreakdown = [
    { label: 'Waste Sorting Quality', score: Math.round(qualityScore * 4), max: 100 },
    { label: 'Collection Frequency',  score: Math.round(participationScore * 4), max: 100 },
    { label: 'Platform Engagement',   score: Math.round(consistencyScore * 4), max: 100 },
    { label: 'Environmental Impact',  score: Math.round(wasteScore * 4), max: 100 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Green Score</h1>

      {/* Download banner at 100 */}
      {greenScore >= 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Award size={32} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">ðŸŽ‰ Perfect Green Score Achieved!</p>
              <p className="text-green-100 text-sm">{displayName} has reached 100/100 â€” download your certification now.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center col-span-1">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray={`${Math.min(greenScore, 100)}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">{greenScore}</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {greenScore >= 100 ? 'ðŸ† Perfect!' : greenScore >= 80 ? 'Excellent' : greenScore >= 60 ? 'Good' : greenScore >= 40 ? 'Fair' : 'Needs Improvement'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Based on {completedCollections.length} completed collections</p>
          {greenScore >= 100 && (
            <button
              onClick={handleDownloadCertificate}
              className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Download size={14} /> Certificate
            </button>
          )}
        </div>
        <div className="col-span-1 md:col-span-2">
          <Widget title="Score History" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}>
            <ChartComponent type="line" data={scoreHistory} height={230} />
          </Widget>
        </div>
      </div>
      <Widget title="Score Breakdown" icon={<Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreBreakdown.map(item => (
            <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{Math.min(item.score, 100)}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(item.score, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );}