// pages/dashboard/admin/GreenScores.tsx
import { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Edit2, X, Check, Medal, Star } from 'lucide-react';
import { hotelsAPI, recyclersAPI } from '../../../services/api';

type ScoreUser = { id: string; name: string; role: string; email: string; location: string; greenScore: number; };

export default function AdminGreenScores() {
  const [users, setUsers] = useState<ScoreUser[]>([]);
  const [editing, setEditing] = useState<ScoreUser | null>(null);
  const [newScore, setNewScore] = useState(0);
  const [flash, setFlash] = useState(false);
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

  const handleSave = () => {
    if (!editing) return;
    const clamped = Math.min(100, Math.max(0, newScore));
    setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, greenScore: clamped } : u));
    setEditing(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

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

      {/* Success Flash */}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Check size={15} />
          Score updated successfully
        </div>
      )}

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
                {['Rank', 'User', 'Role', 'Location', 'Green Score', 'Progress', ''].map(h => (
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
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => { 
                        setEditing(u); 
                        setNewScore(u.greenScore || 0); 
                      }} 
                      className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Edit Score"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Edit Green Score
              </h3>
              <button 
                onClick={() => setEditing(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Updating score for <strong>{editing.name}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Green Score (0–100)
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={newScore} 
                  onChange={e => setNewScore(Number(e.target.value))} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${scoreColor(newScore)}`} 
                  style={{ width: `${Math.min(100, Math.max(0, newScore))}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button 
                onClick={() => setEditing(null)} 
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <TrendingUp size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}