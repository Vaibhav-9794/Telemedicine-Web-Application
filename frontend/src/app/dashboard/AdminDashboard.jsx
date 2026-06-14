'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/Spinner';
import { useAPI } from '@/hooks/useAPI';
import {
  Calendar, Users, ShieldCheck, DollarSign, Lock, Unlock, ShieldAlert
} from 'lucide-react';

export default React.memo(function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // SWR cached fetching — instant on revisit
  const { data: stats, isLoading: statsLoading, mutate: mutateStats } = useAPI('/admin/stats');
  const { data: usersList, isLoading: usersLoading, mutate: mutateUsers } = useAPI('/admin/users');

  const loading = statsLoading || usersLoading;

  const handleToggleStatus = useCallback(async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoadingId(targetUser._id);

      // Optimistic UI update — change status instantly in the UI
      if (usersList) {
        mutateUsers(
          usersList.map(u => u._id === targetUser._id ? { ...u, status: newStatus } : u),
          false // Don't revalidate yet
        );
      }

      await axios.patch(`/admin/users/${targetUser._id}/status`, { status: newStatus });
      addToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');

      // Revalidate both caches in background
      mutateStats();
      mutateUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user status', 'error');
      mutateUsers(); // Revert optimistic update on error
    } finally {
      setActionLoadingId(null);
    }
  }, [usersList, mutateUsers, mutateStats, addToast]);

  if (loading && !stats) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;

  const totalPatients = stats?.metrics?.totalPatients || 0;
  const totalDoctors = stats?.metrics?.totalDoctors || 0;
  const totalAppointments = stats?.metrics?.totalAppointments || 0;
  const totalRevenue = stats?.metrics?.totalRevenue || 0;

  const breakdown = stats?.statusBreakdown || { pending: 0, accepted: 0, completed: 0, rejected: 0 };
  const totalBreakdown = breakdown.pending + breakdown.accepted + breakdown.completed + breakdown.rejected || 1;

  const pct = (val) => `${Math.round((val / totalBreakdown) * 100)}%`;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Admin Control Panel</h2>
        <p className="text-xs text-slate-400 font-medium">Platform-wide statistics, monitoring, and member profiles control</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Patients</p>
            <p className="text-2xl font-black text-slate-805 dark:text-slate-100">{totalPatients}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-primary-500 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Doctors</p>
            <p className="text-2xl font-black text-slate-805 dark:text-slate-100">{totalDoctors}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-primary-500 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Appointments</p>
            <p className="text-2xl font-black text-slate-805 dark:text-slate-100">{totalAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-primary-500 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Total Revenue</p>
            <p className="text-2xl font-black text-slate-805 dark:text-slate-100">${totalRevenue}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User management list */}
        <div className="lg:col-span-8 glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Registered Platform Users</h3>
            <Link href="/users" className="text-xs text-primary-500 font-bold hover:underline">
              Manage All User Access
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Toggle Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {(usersList || []).slice(0, 6).map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-xs uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-850 dark:text-slate-200">{u.name}</div>
                          <span className="text-[10px] text-slate-400 font-medium block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30'
                          : u.role === 'doctor'
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 border border-teal-100/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold text-xs capitalize ${u.status === 'active' ? 'text-primary-500' : 'text-rose-500'}`}>
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

        {/* Appointment status chart / breakdown */}
        <div className="lg:col-span-4 glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Appointments Breakdown</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Pending</span>
                  <span>{breakdown.pending} ({pct(breakdown.pending)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: pct(breakdown.pending) }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Accepted</span>
                  <span>{breakdown.accepted} ({pct(breakdown.accepted)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: pct(breakdown.accepted) }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Completed</span>
                  <span>{breakdown.completed} ({pct(breakdown.completed)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: pct(breakdown.completed) }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Rejected</span>
                  <span>{breakdown.rejected} ({pct(breakdown.rejected)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: pct(breakdown.rejected) }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex gap-2 text-[10px] text-slate-400 leading-normal mt-6">
            <ShieldAlert className="shrink-0 text-primary-500" size={16} />
            <span>Platform status statistics are aggregated from the mock json database engines in real time.</span>
          </div>
        </div>
      </div>
    </div>
  );
});
