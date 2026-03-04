// components/dashboard/business/BusinessGreenScore.tsx
import { Trophy, TrendingUp } from 'lucide-react';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { hotelProfile } from './_shared';

export default function BusinessGreenScore() {
  const scoreHistory = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], datasets: [{ data: [72, 76, 80, 83, 86, 89, 92], borderColor: '#059669', backgroundColor: '#059669' }] };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Green Score</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center col-span-1">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray={`${hotelProfile.greenScore}, 100`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-green-600 dark:text-green-400">{hotelProfile.greenScore}</span></div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Excellent</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Top 10% of hotels on EcoTrade</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <Widget title="Score History" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}><ChartComponent type="line" data={scoreHistory} height={230} /></Widget>
        </div>
      </div>
      <Widget title="Score Breakdown" icon={<Trophy size={20} className="text-yellow-700 dark:text-yellow-700" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Waste Sorting Quality', score: 95, max: 25 },
            { label: 'Collection Frequency', score: 88, max: 25 },
            { label: 'Platform Engagement', score: 92, max: 25 },
            { label: 'Environmental Impact', score: 90, max: 25 },
          ].map(item => (
            <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{item.score}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2"><div className="h-full bg-green-500 rounded-full" style={{ width: `${item.score}%` }} /></div>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
