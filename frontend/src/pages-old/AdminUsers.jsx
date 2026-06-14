import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Lock, Unlock, Search } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminUsers = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (target) => {
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    try {
      setActionId(target._id);
      await axios.patch(`/admin/users/${target._id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === target._id ? { ...u, status: newStatus } : u));
      addToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    admin:   'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    doctor:  'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    patient: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">User Management</h2>
        <p className="text-xs text-slate-400 font-medium">Search, review, and control access for all registered platform members</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Specialty</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-xs uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{u.phone || '—'}</td>
                    <td className="py-3.5 text-slate-500">
                      {u.doctorProfile?.specialization || '—'}
                    </td>
                    <td className="py-3.5">
                      <span className={`font-bold text-xs ${u.status === 'active' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      {u._id === user._id ? (
                        <span className="text-[10px] text-slate-400 italic">You</span>
                      ) : (
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={actionId === u._id}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border-rose-100/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400'
                              : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 border-teal-100/50 dark:border-teal-900/30 text-teal-600 dark:text-teal-400'
                          }`}
                        >
                          {actionId === u._id
                            ? <Spinner size="sm" color="gray" />
                            : u.status === 'active' ? <Lock size={13} /> : <Unlock size={13} />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
