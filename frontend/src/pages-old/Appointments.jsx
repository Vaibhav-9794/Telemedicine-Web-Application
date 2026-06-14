import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Clock, Check, X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const statusColors = {
  pending:   'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
  accepted:  'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30',
  completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
  rejected:  'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
};

const Appointments = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = user.role === 'doctor'
        ? '/appointments/doctor'
        : user.role === 'admin'
        ? '/admin/appointments'
        : '/appointments/patient';
      const res = await axios.get(url);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      addToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [user.role]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/appointments/${id}/status`, { status });
      addToast(`Appointment ${status}!`, 'success');
      fetchAppointments();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const tabs = ['all', 'pending', 'accepted', 'completed', 'rejected'];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          {user.role === 'admin' ? 'All System Appointments' : 'My Appointments'}
        </h2>
        <p className="text-xs text-slate-400 font-medium">View and manage scheduled consultation slots</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border transition-all ${
              filter === tab
                ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'all' ? `All (${appointments.length})` : tab}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={36} />
            <p className="text-sm font-semibold">No appointments found</p>
            {user.role === 'patient' && (
              <Link to="/doctors" className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-2 inline-block hover:underline">
                Search & Book a Doctor →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 text-slate-400 font-bold">
                  {user.role !== 'patient' && <th className="pb-3">Patient</th>}
                  {user.role !== 'doctor' && <th className="pb-3">Doctor</th>}
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                  {(user.role === 'doctor') && <th className="pb-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(appt => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    {user.role !== 'patient' && (
                      <td className="py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {appt.patientId?.name || 'Patient'}
                        </p>
                        <p className="text-[10px] text-slate-400">{appt.patientId?.email}</p>
                      </td>
                    )}
                    {user.role !== 'doctor' && (
                      <td className="py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Dr. {appt.doctorId?.userId?.name || 'Physician'}
                        </p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400">
                          {appt.doctorId?.specialization}
                        </p>
                      </td>
                    )}
                    <td className="py-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(appt.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        {appt.time}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                    {user.role === 'doctor' && (
                      <td className="py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {appt.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(appt._id, 'accepted')}
                                className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/30 transition-colors">
                                <Check size={14} />
                              </button>
                              <button onClick={() => handleStatusChange(appt._id, 'rejected')}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30 transition-colors">
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {appt.status === 'accepted' && (
                            <Link to="/chat" className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">
                              <MessageSquare size={14} />
                            </Link>
                          )}
                          {(appt.status === 'completed' || appt.status === 'rejected') && (
                            <span className="text-[10px] text-slate-400 italic capitalize">{appt.status}</span>
                          )}
                        </div>
                      </td>
                    )}
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

export default Appointments;
