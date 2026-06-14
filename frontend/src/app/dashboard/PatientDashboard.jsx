'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/Spinner';
import { useAPI } from '@/hooks/useAPI';
import {
  Calendar, FileText, ShieldCheck, Download, Plus, Heart, Droplets,
  AlertTriangle, Pill, Phone, Activity, CreditCard, Receipt,
  Clock, Stethoscope, ClipboardList, TrendingUp, User, ChevronRight,
  X as XIcon, ChevronDown, ChevronUp
} from 'lucide-react';

export default React.memo(function PatientDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [showAllTimeline, setShowAllTimeline] = useState(false);

  // SWR cached fetching — data persists across navigations (instant on revisit)
  const { data: appointments, isLoading: apptLoading } = useAPI('/appointments/patient');
  const { data: prescriptions, isLoading: presLoading } = useAPI('/prescriptions');
  const { data: reports, isLoading: repLoading } = useAPI('/reports/patient');
  const { data: payments, isLoading: payLoading } = useAPI('/payments/patient');

  const loading = apptLoading || presLoading || repLoading;

  const handleDownload = useCallback(async (presId) => {
    try {
      addToast('Generating PDF prescription download...', 'info');
      const res = await axios.get(`/prescriptions/${presId}/download`, {
        responseType: 'blob'
      });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `prescription_${presId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
      addToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      addToast('Failed to download PDF prescription', 'error');
    }
  }, [addToast]);

  // Show skeleton only on first load — cached data renders instantly
  if (loading && !appointments) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;

  const apptData = appointments || [];
  const presData = prescriptions || [];
  const reportsData = reports || [];
  const paymentsData = payments || [];
  const reportsCount = reportsData.length;

  const upcomingAppointments = useMemo(
    () => apptData.filter(a => a.status === 'accepted' || a.status === 'pending'),
    [apptData]
  );

  const completedAppointments = useMemo(
    () => apptData.filter(a => a.status === 'completed'),
    [apptData]
  );

  // Build medical timeline from all sources
  const timelineItems = useMemo(() => {
    const items = [];

    apptData.forEach(a => items.push({
      type: 'appointment', date: a.date || a.createdAt,
      title: `Appointment with Dr. ${a.doctorId?.userId?.name || 'Physician'}`,
      subtitle: a.doctorId?.specialization || 'General',
      status: a.status, id: a._id,
    }));

    presData.forEach(p => items.push({
      type: 'prescription', date: p.createdAt || p.date,
      title: `Prescription from Dr. ${p.doctorId?.userId?.name || 'Physician'}`,
      subtitle: p.medicineDetails?.map(m => m.name).join(', ') || 'Rx',
      id: p._id,
    }));

    reportsData.forEach(r => items.push({
      type: 'report', date: r.uploadDate || r.createdAt,
      title: r.fileName || 'Medical Report',
      subtitle: 'Lab Report / Medical Record',
      id: r._id,
    }));

    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (timelineFilter !== 'all') {
      return items.filter(i => i.type === timelineFilter);
    }
    return items;
  }, [apptData, presData, reportsData, timelineFilter]);

  const displayedTimeline = showAllTimeline ? timelineItems : timelineItems.slice(0, 6);

  const timelineIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'prescription': return <ClipboardList className="w-4 h-4" />;
      case 'report': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const timelineColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'prescription': return 'bg-emerald-500';
      case 'report': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  // BMI calculation
  const bmi = useMemo(() => {
    const h = parseFloat(user?.height) / 100;
    const w = parseFloat(user?.weight);
    if (!h || !w || h <= 0) return null;
    return (w / (h * h)).toFixed(1);
  }, [user?.height, user?.weight]);

  const bmiColor = bmi ? (bmi < 18.5 ? 'text-blue-500' : bmi < 25 ? 'text-emerald-500' : bmi < 30 ? 'text-amber-500' : 'text-red-500') : '';

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Welcome back, {user.name}</h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-xs text-slate-400 font-medium">Your health dashboard and medical console</p>
          {user.patientId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-[10px] font-bold text-primary-600 dark:text-primary-400">
              ID: {user.patientId}
            </span>
          )}
          {user.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Row 1: Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{upcomingAppointments.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Upcoming</p>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{presData.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Prescriptions</p>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{reportsCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Reports</p>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedAppointments.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Completed</p>
        </div>
      </div>

      {/* Row 2: Health Profile Summary Card */}
      {(user.bloodGroup || user.allergies?.length > 0 || user.currentMedications?.length > 0) && (
        <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Health Profile
            </h3>
            <Link href="/profile" className="text-xs text-primary-500 hover:underline font-semibold flex items-center gap-1">
              Edit <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Blood Group */}
            {user.bloodGroup && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                <Droplets className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Blood Group</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.bloodGroup}</p>
                </div>
              </div>
            )}

            {/* BMI */}
            {bmi && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <TrendingUp className={`w-5 h-5 shrink-0 ${bmiColor}`} />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">BMI</p>
                  <p className={`text-sm font-bold ${bmiColor}`}>{bmi}</p>
                </div>
              </div>
            )}

            {/* Allergies */}
            {user.allergies?.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 col-span-2 sm:col-span-1">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Allergies</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user.allergies.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {user.emergencyContact?.name && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 col-span-2 sm:col-span-1">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Emergency</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user.emergencyContact.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Current Medications */}
          {user.currentMedications?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Current Medications
              </p>
              <div className="flex flex-wrap gap-2">
                {user.currentMedications.map((med, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-[11px] font-medium text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                    {med}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Appointments + Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - schedules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Upcoming Appointments</h3>
              <Link href="/doctors" className="text-xs text-primary-500 hover:underline font-semibold flex items-center gap-1">
                Book New <Plus size={14} />
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {upcomingAppointments.slice(0, 5).map((appt) => (
                  <div key={appt._id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Dr. {appt.doctorId?.userId?.name || 'Physician'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {appt.doctorId?.specialization || 'General Health'} | Date: {new Date(appt.date).toLocaleDateString()} at {appt.time}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      appt.status === 'accepted'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-650 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/30'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-650 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Calendar className="mx-auto mb-2 text-slate-350 dark:text-slate-700" size={32} />
                No upcoming appointments. Need a consultation?
                <Link href="/doctors" className="text-primary-500 hover:underline font-bold block mt-2">Find a Doctor</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column - prescriptions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Prescriptions</h3>

            {presData.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {presData.slice(0, 4).map((pres) => (
                  <div key={pres._id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-805 dark:text-slate-200 truncate">
                        Dr. {pres.doctorId?.userId?.name || 'Physician'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {pres.doctorId?.specialization || 'Health Specialist'} | {new Date(pres.createdAt || pres.date).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {pres.medicineDetails?.map(m => m.name).join(', ') || 'Prescribed Rx'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(pres._id)}
                      className="p-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/60 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 transition-colors border border-primary-100/20 dark:border-primary-900/20 shrink-0"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText className="mx-auto mb-2 text-slate-350 dark:text-slate-700" size={32} />
                No medical prescriptions found in your archives.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Medical Records Timeline */}
      <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" /> Medical Timeline
          </h3>
          <div className="flex gap-1.5">
            {['all', 'appointment', 'prescription', 'report'].map(f => (
              <button
                key={f}
                onClick={() => setTimelineFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                  timelineFilter === f
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        {timelineItems.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-4">
              {displayedTimeline.map((item, i) => (
                <div key={`${item.type}-${item.id}`} className="flex gap-4 relative">
                  {/* Timeline dot */}
                  <div className={`w-6 h-6 rounded-full ${timelineColor(item.type)} flex items-center justify-center shrink-0 text-white z-10 shadow-sm`}>
                    {timelineIcon(item.type)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {item.status && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.status === 'accepted' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          item.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {timelineItems.length > 6 && (
              <button
                onClick={() => setShowAllTimeline(!showAllTimeline)}
                className="mt-4 text-xs text-primary-500 hover:underline font-semibold flex items-center gap-1 ml-10"
              >
                {showAllTimeline ? 'Show Less' : `View All (${timelineItems.length})`}
                {showAllTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            <Activity className="mx-auto mb-2 text-slate-350 dark:text-slate-700" size={32} />
            No medical events recorded yet.
          </div>
        )}
      </div>

      {/* Row 5: Payment History */}
      <div className="glass-card p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-500" /> Payment History
          </h3>
        </div>

        {paymentsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-2 pr-4">Invoice</th>
                  <th className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-2 pr-4">Date</th>
                  <th className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-2 pr-4">Description</th>
                  <th className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-2 pr-4">Amount</th>
                  <th className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentsData.slice(0, 5).map((pay) => (
                  <tr key={pay._id}>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{pay.invoiceNumber}</td>
                    <td className="py-2.5 pr-4 text-[11px] text-slate-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4 text-[11px] text-slate-500">{pay.description || 'Consultation'}</td>
                    <td className="py-2.5 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200">${pay.amount}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        pay.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : pay.status === 'refunded'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            <Receipt className="mx-auto mb-2 text-slate-350 dark:text-slate-700" size={32} />
            No payment records found.
          </div>
        )}
      </div>
    </div>
  );
});
