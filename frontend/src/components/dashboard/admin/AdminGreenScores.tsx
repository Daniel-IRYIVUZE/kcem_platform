// pages/dashboard/admin/GreenScores.tsx
import { useState, useEffect } from 'react';
import { Leaf, Medal, Star, Info } from 'lucide-react';
import { hotelsAPI, recyclersAPI } from '../../../services/api';

type ScoreUser = { id: string; name: string; role: string; email: string; location: string; greenScore: number; };

export default function AdminGreenScores() {
  const [users, setUsers] = useState<ScoreUser[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');

  const load = () => {
    Promise.all([hotelsAPI.list({ limit: 100 }), recyclersAPI.list({ limit: 100 })]).then(([hotels, recyclers]) => {
      const combined: ScoreUser[] = [
        ...hotels.map(h => ({ id: `hotel-${h.id}`, name: h.hotel_name, role: 'business', email: '', location: h.city || '', greenScore: h.green_score || 0 })),
        ...recyclers.map(r => ({ id: `recycler-${r.id}`, name: r.company_name, role: 'recycler', email: '', location: r.city || '', greenScore: r.green_score || 0 })),
      ];
      setUsers(combined.sort((a, b) => b.greenScore - a.greenScore));
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(u => u.role === filterRole);

  const getMedalIcon = (idx: number) => {
    if (idx === 0) return <Medal size={20} className="text-yellow-500" />;
    if (idx === 1) return <Medal size={20} className="text-gray-400" />;
    if (idx === 2) return <Medal size={20} className="text-amber-600" />;
    return <Star size={16} className="text-gray-300 dark:text-gray-600" />;
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-cyan-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-gray-400 dark:bg-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Leaf size={20} className="text-green-600 dark:text-green-400" />
          Green Score Leaderboard
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Score 0–100 · Updated in real time
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm">
        <Info size={15} className="flex-shrink-0 mt-0.5" />
        Green scores are automatically calculated by the platform when waste collections are completed. Each kg of waste recycled and each completed collection increases the score.
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-2">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Roles</option>
          <option value="business">Hotels</option>
          <option value="recycler">Recyclers</option>
          <option value="individual">Individuals</option>
        </select>
      </div>

      {/* Top 3 Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-2">
        {filteredUsers.slice(0, 3).map((u, i) => (
          <div 
            key={u.id} 
            className="bg-white dark:bg-gray-800 border-2 rounded-xl p-5 text-center shadow-sm"
            style={{
              borderColor: i === 0 ? '#eab308' : i === 1 ? '#9ca3af' : '#f97316'
            }}
          >
            <div className="flex justify-center mb-2">
              {getMedalIcon(i)}
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
              {(u.name ?? '?').charAt(0)}
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{u.name}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 capitalize">
              {u.role} · {u.location}
            </p>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {u.greenScore || 0}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">/ 100</div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Rank', 'User', 'Role', 'Location', 'Green Score', 'Progress'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getMedalIcon(i)}
                      <span className="font-bold text-gray-700 dark:text-gray-300">#{i + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 dark:text-gray-200">{u.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{u.email || u.role}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {u.location}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                    {u.greenScore || 0}
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${scoreColor(u.greenScore || 0)}`} 
                        style={{ width: `${u.greenScore || 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}