import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Calendar, DollarSign, Activity, Lock, Unlock, ShieldAlert } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin dashboard details:', error);
      addToast('Failed to load admin dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [addToast]);

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoadingId(targetUser._id);
      addToast(`Setting user status to ${newStatus}...`, 'info');
      
      await axios.patch(`/admin/users/${targetUser._id}/status`, { status: newStatus });
      
      addToast(`Account set to ${newStatus} successfully!`, 'success');
      
      // Update local state directly
      setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, status: newStatus } : u));
      
      // Refresh statistics (as total count might change or to keep in sync)
      const statsRes = await axios.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error toggling user status:', error);
      addToast(error || 'Failed to update user status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const { metrics, statusBreakdown } = stats || {
    metrics: { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0 },
    statusBreakdown: { pending: 0, accepted: 0, completed: 0, rejected: 0 }
  };

  // Calculate percentage of status counts
  const totalAppts = metrics.totalAppointments || 1; // avoid divide by zero
  const getPct = (val) => Math.round((val / totalAppts) * 100);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">System Administration</h2>
        <p className="text-xs text-slate-400 font-medium">Global statistics oversight, member user access control controls</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Patients</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{metrics.totalPatients}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-550/10 text-teal-650 dark:text-teal-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Active Providers</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{metrics.totalDoctors}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-550/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
            <Activity size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Bookings</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{metrics.totalAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-550/10 text-amber-650 dark:text-amber-400 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Clinic Earnings</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">${metrics.totalRevenue}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-550/10 text-emerald-650 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Status breakdown bars (Left/Bottom) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Booking Status Ratios</h3>

          <div className="space-y-4 text-xs font-semibold">
            {/* Completed */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Completed consultations</span>
                <span className="text-slate-800 dark:text-slate-200">{statusBreakdown.completed} ({getPct(statusBreakdown.completed)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${getPct(statusBreakdown.completed)}%` }}></div>
              </div>
            </div>

            {/* Accepted */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Accepted slots</span>
                <span className="text-slate-800 dark:text-slate-200">{statusBreakdown.accepted} ({getPct(statusBreakdown.accepted)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${getPct(statusBreakdown.accepted)}%` }}></div>
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Pending reviews</span>
                <span className="text-slate-800 dark:text-slate-200">{statusBreakdown.pending} ({getPct(statusBreakdown.pending)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${getPct(statusBreakdown.pending)}%` }}></div>
              </div>
            </div>

            {/* Rejected */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Rejected slots</span>
                <span className="text-slate-800 dark:text-slate-200">{statusBreakdown.rejected} ({getPct(statusBreakdown.rejected)}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${getPct(statusBreakdown.rejected)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* User database table (Right/Top) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">User Accounts Database</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3">
                      <div className="font-bold text-slate-850 dark:text-slate-200">{u.name}</div>
                      <span className="text-[9px] text-slate-400 block font-medium">ID: {u._id}</span>
                    </td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-150 text-indigo-600 dark:text-indigo-400'
                          : u.role === 'doctor'
                          ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-150 text-teal-600 dark:text-teal-400'
                          : 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200 text-slate-600 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{u.phone || 'No Phone'}</div>
                    </td>
                    <td className="py-3 capitalize">
                      <span className={`font-bold ${u.status === 'active' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {u._id === user._id ? (
                        <span className="text-[10px] text-slate-400 italic">Self</span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoadingId === u._id}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border-rose-100/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-455'
                              : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 border-teal-100/50 dark:border-teal-900/30 text-teal-600 dark:text-teal-455'
                          }`}
                          title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {actionLoadingId === u._id ? (
                            <Spinner size="sm" color="gray" />
                          ) : u.status === 'active' ? (
                            <Lock size={13} />
                          ) : (
                            <Unlock size={13} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
