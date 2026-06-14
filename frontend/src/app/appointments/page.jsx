'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import Spinner from '@/components/Spinner';
import { Calendar, Clock, Check, X, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';

const statusColors = {
  pending:   'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
  accepted:  'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30',
  completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
  rejected:  'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 border-rose-100/50 dark:border-rose-900/30',
};

export default function AppointmentsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      setListLoading(true);
      const url = user.role === 'doctor'
        ? '/appointments/doctor'
        : user.role === 'admin'
        ? '/admin/appointments'
        : '/appointments/patient';
      const res = await axios.get(url);
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      addToast('Failed to load appointments history list', 'error');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchAppointments();
    }
  }, [loading, isAuthenticated, user, router]);

  const handleStatusChange = async (apptId, status) => {
    try {
      addToast(`Updating appointment status to ${status}...`, 'info');
      await axios.patch(`/appointments/${apptId}/status`, { status });
      addToast(`Appointment status updated to ${status}!`, 'success');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Failed to change appointment status', 'error');
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  return (
    <Sidebar>
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Consultations & Bookings</h2>
            <p className="text-xs text-slate-400 font-medium">Review and manage clinical consultation schedules and timelines</p>
          </div>
          {user.role === 'patient' && (
            <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-sm text-xs transition-all">
              Book Appointment <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === f
                  ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-205 dark:border-slate-755 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span className="capitalize">{f}</span>
            </button>
          ))}
        </div>

        {/* List Table */}
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {listLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                    <th className="pb-3">{user.role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Time Slot</th>
                    <th className="pb-3">Status</th>
                    {user.role !== 'admin' && <th className="pb-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredAppointments.map((appt) => {
                    const targetUser = user.role === 'doctor' ? appt.patientId : appt.doctorId?.userId;
                    const specialty = user.role !== 'doctor' ? appt.doctorId?.specialization : null;

                    return (
                      <tr key={appt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-xs uppercase shrink-0">
                              {targetUser?.name ? targetUser.name.charAt(0) : '?'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {user.role === 'doctor' ? '' : 'Dr. '}{targetUser?.name || 'N/A'}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {specialty ? `${specialty} | ` : ''}{targetUser?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-slate-655 dark:text-slate-350">
                          {new Date(appt.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-semibold text-slate-655 dark:text-slate-350">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {appt.time}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusColors[appt.status] || 'bg-slate-50 text-slate-600'}`}>
                            {appt.status}
                          </span>
                        </td>
                        {user.role !== 'admin' && (
                          <td className="py-4 text-center">
                            <div className="flex justify-center gap-2">
                              {user.role === 'doctor' && appt.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(appt._id, 'accepted')}
                                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-600 dark:text-teal-400 border border-teal-100/30 dark:border-teal-900/20 transition-colors"
                                    title="Accept Appointment"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(appt._id, 'rejected')}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-455 border border-rose-100/30 dark:border-rose-900/20 transition-colors"
                                    title="Reject Appointment"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}

                              {appt.status === 'accepted' && (
                                <Link
                                  href="/chat"
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-750/30 transition-colors"
                                  title="Send Message / Video Call"
                                >
                                  <MessageSquare size={14} />
                                </Link>
                              )}

                              {appt.status === 'completed' && (
                                <span className="text-[10px] text-slate-400 italic">Consulted</span>
                              )}

                              {appt.status === 'rejected' && (
                                <span className="text-[10px] text-rose-500 font-semibold italic">Cancelled</span>
                              )}

                              {user.role === 'patient' && appt.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(appt._id, 'rejected')}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100/30 dark:border-rose-900/20 text-[10px] font-bold transition-all"
                                  title="Cancel Appointment"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-450 dark:text-slate-500">
              <Calendar className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={36} />
              No appointments found matching this status filter.
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
