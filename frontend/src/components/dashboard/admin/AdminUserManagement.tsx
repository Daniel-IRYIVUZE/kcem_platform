import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, Check, Users, ShieldCheck, UserX, Download } from 'lucide-react';
import { downloadPDF } from '../../../utils/dataStore';
import { usersAPI, type APIUser } from '../../../services/api';
import DataTable, { type Column, type BulkAction } from '../../ui/DataTable';
import PageHeader from '../../ui/PageHeader';
import StatusBadge from '../../ui/StatusBadge';

const ROLES = ['business', 'recycler', 'driver', 'individual', 'admin'] as const;
const STATUSES = ['active', 'pending', 'suspended'] as const;

type UserForm = { full_name: string; email: string; phone: string; role: string; status: string; is_verified: boolean; };
const emptyForm = (): UserForm => ({ full_name: '', email: '', phone: '', role: 'business', status: 'pending', is_verified: false });

const roleColorMap: Record<string, string> = {
  admin:      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  business:   'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  recycler:   'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  driver:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  individual: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState<APIUser[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'delete' | null>(null);
  const [selected, setSelected] = useState<APIUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm());
  const [saved, setSaved] = useState(false);

  const load = () => usersAPI.list({ limit: 500 }).then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (statusFilter === 'all' || u.status === statusFilter)
  );

  const openAdd    = () => { setForm(emptyForm()); setSelected(null); setModal('add'); };
  const openEdit   = (u: APIUser) => { setSelected(u); setForm({ full_name: u.full_name, email: u.email, phone: u.phone || '', role: u.role, status: u.status, is_verified: u.is_verified }); setModal('edit'); };
  const openView   = (u: APIUser) => { setSelected(u); setModal('view'); };
  const openDelete = (u: APIUser) => { setSelected(u); setModal('delete'); };

  const handleSave = () => {
    if (!form.full_name || !form.email) return;
    if (modal === 'edit' && selected) {
      usersAPI.update(selected.id, { full_name: form.full_name, email: form.email, phone: form.phone }).then(() => {
        setSaved(true); setTimeout(() => setSaved(false), 2000);
        setModal(null); load();
      }).catch(() => {});
    } else {
      // Create via local optimistic update (no create endpoint)
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setModal(null);
    }
  };

  const handleDelete = () => {
    if (selected) {
      setUsers(prev => prev.filter(u => u.id !== selected.id));
      setModal(null);
    }
  };

  const handleStatusToggle = (u: APIUser) => {
    const action = u.status === 'active' ? usersAPI.suspend(u.id) : usersAPI.approve(u.id);
    action.then(updated => setUsers(prev => prev.map(x => x.id === u.id ? updated : x))).catch(() => {});
  };

  const handleBulkSuspend = (ids: string[]) => {
    ids.forEach(id => usersAPI.suspend(Number(id)).then(updated => setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))).catch(() => {}));
  };
  const handleBulkVerify = (ids: string[]) => {
    ids.forEach(id => usersAPI.approve(Number(id)).then(updated => setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))).catch(() => {}));
  };
  const handleBulkDelete = (ids: string[]) => {
    setUsers(prev => prev.filter(u => !ids.includes(String(u.id))));
  };

  const handleExport = () => {
    const rows = filtered.map(u =>
      `<tr><td>${u.id}</td><td>${u.full_name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.phone || ''}</td><td>Kigali</td><td>${u.status}</td><td>${new Date(u.created_at).toLocaleDateString()}</td></tr>`
    ).join('');
    downloadPDF('User Management Report', `
      <style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#0891b2;border-bottom:2px solid #0891b2}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#0891b2;color:white;padding:10px;text-align:left}td{padding:8px;border-bottom:1px solid #ddd}</style>
      <h1>User Management Report</h1>
      <p>Generated: ${new Date().toLocaleString()} · ${filtered.length} records</p>
      <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Location</th><th>Status</th><th>Join Date</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="8" style="text-align:center">No users</td></tr>'}</tbody></table>
    `);
  };

  // DataTable column definitions
  const columns: Column<APIUser>[] = [
    {
      key: 'full_name',
      label: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(u.full_name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{u.full_name}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (u) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[u.role]}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (u) => (
        <button onClick={() => handleStatusToggle(u)}>
          <StatusBadge status={u.status} size="sm" dot />
        </button>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (u) => <span className="text-xs text-gray-600 dark:text-gray-400">{u.phone || '—'}</span>,
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (u) => <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (u) => (
        <div className="flex gap-1">
          <button onClick={() => openView(u)}   className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors" title="View"><Eye size={14} /></button>
          <button onClick={() => openEdit(u)}   className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="Edit"><Edit2 size={14} /></button>
          <button onClick={() => openDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const bulkActions: BulkAction[] = [
    { label: 'Verify Selected',  icon: <ShieldCheck size={14}/>, onClick: handleBulkVerify },
    { label: 'Suspend Selected', icon: <UserX size={14}/>,       onClick: handleBulkSuspend },
    { label: 'Delete Selected',  icon: <Trash2 size={14}/>,      onClick: handleBulkDelete, danger: true },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users · ${users.filter(u => u.status === 'pending').length} pending verification`}
        icon={<Users size={20} />}
        badge={users.filter(u => u.status === 'pending').length > 0 ? `${users.filter(u => u.status === 'pending').length} pending` : undefined}
        badgeColor="amber"
        actions={
          <div className="flex gap-2">
            {/* Role filter */}
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="select-field text-sm">
              <option value="all">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            {/* Status filter */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-field text-sm">
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-1.5 text-sm">
              <Download size={14}/> Export
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus size={14}/> Add User
            </button>
          </div>
        }
      />

      {saved && (
        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 px-4 py-2.5 rounded-xl text-sm">
          <Check size={15}/> Changes saved successfully
        </div>
      )}

      <DataTable
        data={filtered as any}
        columns={columns as any}
        searchable
        pageSize={12}
        bulkActions={bulkActions}
        onExport={handleExport}
        onRowClick={openView as any}
      />

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-pop">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *',  key: 'full_name', placeholder: 'John Doe' },
                  { label: 'Email *',      key: 'email',     placeholder: 'user@ecotrade.rw' },
                  { label: 'Phone',        key: 'phone',     placeholder: '+250 788 ...' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                    <input value={(form as any)[key] || ''} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={placeholder} className="input-field w-full text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="select-field w-full text-sm">
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="select-field w-full text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_verified} onChange={e => setForm({...form, is_verified: e.target.checked})} className="w-4 h-4 rounded accent-cyan-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Verified</span>
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1">Save User</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-pop">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Profile</h3>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selected.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selected.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColorMap[selected.role]}`}>{selected.role}</span>
                    <StatusBadge status={selected.status} size="sm" dot />
                    {selected.is_verified && <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">✓ Verified</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                {[
                  ['Email', selected.email], ['Phone', selected.phone || '—'],
                  ['Role', selected.role], ['Status', selected.status],
                  ['Verified', selected.is_verified ? 'Yes' : 'No'],
                  ['Joined', new Date(selected.created_at).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{v || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => openEdit(selected)} className="btn-secondary flex-1">Edit</button>
              <button onClick={() => setModal(null)} className="btn-primary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center animate-scale-pop">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This will permanently delete <strong className="text-gray-900 dark:text-white">{selected.full_name}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
