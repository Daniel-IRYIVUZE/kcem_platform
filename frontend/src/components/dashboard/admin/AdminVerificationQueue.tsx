// pages/dashboard/admin/VerificationQueue.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, X, UserCheck } from 'lucide-react';
import { getAll, update } from '../../../utils/dataStore';
import type { PlatformUser } from '../../../utils/dataStore';

export default function AdminVerificationQueue() {
  const [pending, setPending] = useState<PlatformUser[]>([]);
  const [selected, setSelected] = useState<PlatformUser | null>(null);
  const [note, setNote] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const load = () => {
    const allUsers = getAll<PlatformUser>('users');
    setPending(allUsers.filter(u => !u.verified || u.status === 'pending'));
  };

  useEffect(() => { 
    load(); 
    window.addEventListener('ecotrade_data_change', load); 
    return () => window.removeEventListener('ecotrade_data_change', load); 
  }, []);

  const toast = (msg: string) => { 
    setFlash(msg); 
    setTimeout(() => setFlash(null), 2500); 
  };

  const handleApprove = (u: PlatformUser) => {
    update<PlatformUser>('users', u.id, { status: 'active', verified: true });
    toast(`✓ ${u.name} approved`); 
    setSelected(null); 
    load();
  };

  const handleReject = (u: PlatformUser) => {
    update<PlatformUser>('users', u.id, { status: 'suspended', verified: false });
    toast(`✗ ${u.name} rejected`); 
    setSelected(null); 
    load();
  };

  const roleColors: Record<string, string> = {
    business: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    recycler: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    driver: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    individual: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <UserCheck size={20} className="text-cyan-600" />
          Verification Queue
        </h2>
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
          {pending.length} pending
        </span>
      </div>

      {/* Flash Message */}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm">
          {flash}
        </div>
      )}

      {/* Empty State */}
      {pending.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            All clear!
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No pending verifications at this time.
          </p>
        </div>
      ) : (
        /* Verification Cards */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map(u => (
            <div 
              key={u.id} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{u.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className={`px-1.5 py-0.5 rounded-full font-medium ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{u.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>{u.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                    {u.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Submitted:</span>
                  <span>{new Date(u.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setSelected(u)} 
                  className="col-span-1 flex items-center justify-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-400"
                >
                  <Eye size={12} /> View
                </button>
                <button 
                  onClick={() => handleApprove(u)} 
                  className="col-span-1 flex items-center justify-center gap-1 bg-green-600 text-white rounded-lg py-1.5 text-xs hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={12} /> OK
                </button>
                <button 
                  onClick={() => handleReject(u)} 
                  className="col-span-1 flex items-center justify-center gap-1 bg-red-600 text-white rounded-lg py-1.5 text-xs hover:bg-red-700 transition-colors"
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Verify: {selected.name}
              </h3>
              <button 
                onClick={() => setSelected(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Name', selected.name],
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['Role', selected.role],
                  ['Location', selected.location],
                  ['Status', selected.status],
                  ['Joined', new Date(selected.joinDate).toLocaleDateString()]
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <span className="text-gray-500 dark:text-gray-400">{String(k)}:</span>{' '}
                    <span className="font-medium text-gray-800 dark:text-gray-200">{String(v)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Admin note (optional)
                </label>
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  rows={2} 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                  placeholder="Note for internal record..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => { handleReject(selected); setNote(''); }} 
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => { handleApprove(selected); setNote(''); }} 
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}